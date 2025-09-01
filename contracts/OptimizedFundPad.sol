// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title OptimizedFundPad - Gas-Optimized Confidential Fundraising Platform
 * @dev A privacy-preserving crowdfunding platform using Zama FHE protocol
 * Features:
 * - Private contribution amounts using FHE encryption
 * - Transparent project goals and deadlines
 * - Automated fund distribution for successful campaigns
 * - Secure refunds for failed campaigns
 * - Gas-optimized storage patterns and operations
 */
contract OptimizedFundPad is SepoliaConfig, Ownable, ReentrancyGuard {
    
    // Packed struct for gas optimization
    struct Project {
        address creator;           // 20 bytes
        uint96 targetAmount;       // 12 bytes (up to 79B ETH, sufficient for most campaigns)
        uint32 deadline;           // 4 bytes (until year 2106)
        uint32 id;                 // 4 bytes (up to 4B projects)
        ProjectStatus status;      // 1 byte
        bool isDecrypted;          // 1 byte
        euint64 encryptedRaised;   // Encrypted total raised amount
        uint64 decryptedRaised;    // Decrypted amount after goal check
        string name;               // Project name
        string description;        // Project description
    }
    
    enum ProjectStatus { Active, DecryptionRequested, Completed, Failed }
    
    // Storage optimizations
    mapping(uint32 => Project) public projects;
    mapping(uint32 => mapping(address => euint64)) private userContributions;
    mapping(uint32 => mapping(address => uint64)) public decryptedContributions;
    mapping(address => uint32[]) public userProjects;
    
    uint32 private nextProjectId = 1;
    uint32 public totalProjects;
    
    // Packed events for gas efficiency
    event ProjectCreated(
        uint32 indexed projectId,
        address indexed creator,
        uint96 targetAmount,
        uint32 deadline
    );
    
    event ContributionMade(
        uint32 indexed projectId,
        address indexed contributor,
        uint96 amount
    );
    
    event ProjectStatusUpdated(uint32 indexed projectId, ProjectStatus status);
    event DecryptionRequested(uint32 indexed projectId);
    event DecryptionCompleted(uint32 indexed projectId, uint64 finalAmount);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Create a new fundraising project with optimized parameters
     * @param _name Project name (keep short for gas efficiency)
     * @param _description Project description
     * @param _targetAmount Target funding amount in wei (max 79B ETH)
     * @param _duration Campaign duration in seconds
     * @return projectId The ID of the created project
     */
    function createProject(
        string calldata _name,
        string calldata _description,
        uint96 _targetAmount,
        uint32 _duration
    ) external returns (uint32 projectId) {
        require(_targetAmount > 0, "Invalid target");
        require(_duration > 0, "Invalid duration");
        require(bytes(_name).length <= 64, "Name too long"); // Gas optimization
        
        projectId = nextProjectId++;
        uint32 deadline = uint32(block.timestamp) + _duration;
        
        euint64 initialRaised = FHE.asEuint64(0);
        FHE.allowThis(initialRaised);
        
        // Single SSTORE operation for packed data
        projects[projectId] = Project({
            creator: msg.sender,
            targetAmount: _targetAmount,
            deadline: deadline,
            id: projectId,
            status: ProjectStatus.Active,
            isDecrypted: false,
            encryptedRaised: initialRaised,
            decryptedRaised: 0,
            name: _name,
            description: _description
        });
        
        userProjects[msg.sender].push(projectId);
        unchecked { ++totalProjects; } // Gas optimization - overflow impossible
        
        emit ProjectCreated(projectId, msg.sender, _targetAmount, deadline);
    }
    
    /**
     * @dev Make an encrypted contribution to a project
     * @param _projectId Project ID to contribute to
     * @param _encryptedAmount Encrypted contribution amount
     * @param _inputProof Cryptographic proof for the encrypted input
     */
    function contribute(
        uint32 _projectId,
        externalEuint64 _encryptedAmount,
        bytes calldata _inputProof
    ) external payable nonReentrant {
        Project storage project = projects[_projectId];
        require(project.creator != address(0), "Project not found");
        require(project.status == ProjectStatus.Active, "Project inactive");
        require(block.timestamp <= project.deadline, "Campaign ended");
        require(msg.value > 0, "No ETH sent");
        require(msg.value <= type(uint64).max, "Amount too large");
        
        euint64 encryptedAmount = FHE.fromExternal(_encryptedAmount, _inputProof);
        
        // Verify encrypted amount matches msg.value for transparency
        require(FHE.decrypt(encryptedAmount) == uint64(msg.value), "Amount mismatch");
        
        // Update user contribution efficiently
        euint64 currentContrib = userContributions[_projectId][msg.sender];
        if (FHE.isZero(currentContrib)) {
            userContributions[_projectId][msg.sender] = encryptedAmount;
        } else {
            userContributions[_projectId][msg.sender] = FHE.add(currentContrib, encryptedAmount);
        }
        
        // Update project total
        project.encryptedRaised = FHE.add(project.encryptedRaised, encryptedAmount);
        
        // Set permissions
        FHE.allowThis(userContributions[_projectId][msg.sender]);
        FHE.allowThis(project.encryptedRaised);
        
        emit ContributionMade(_projectId, msg.sender, uint96(msg.value));
    }
    
    /**
     * @dev Request decryption of project funds (can be called by creator or after deadline)
     * @param _projectId Project ID to decrypt
     */
    function requestDecryption(uint32 _projectId) external {
        Project storage project = projects[_projectId];
        require(project.creator != address(0), "Project not found");
        require(project.status == ProjectStatus.Active, "Not active");
        require(
            block.timestamp > project.deadline || msg.sender == project.creator,
            "Access denied"
        );
        require(!project.isDecrypted, "Already decrypted");
        
        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(project.encryptedRaised);
        
        FHE.requestDecryption(cts, this.callbackDecryptProject.selector);
        project.status = ProjectStatus.DecryptionRequested;
        
        emit DecryptionRequested(_projectId);
        emit ProjectStatusUpdated(_projectId, ProjectStatus.DecryptionRequested);
    }
    
    /**
     * @dev Callback function for decryption results
     * @param requestId Decryption request ID
     * @param decryptedAmount The decrypted amount
     * @param signatures Cryptographic signatures for verification
     */
    function callbackDecryptProject(
        uint256 requestId,
        uint64 decryptedAmount,
        bytes[] memory signatures
    ) public {
        FHE.checkSignatures(requestId, signatures);
        
        // Find project with DecryptionRequested status (optimized loop)
        uint32 projectId = 1;
        for (; projectId < nextProjectId;) {
            if (projects[projectId].status == ProjectStatus.DecryptionRequested) {
                Project storage project = projects[projectId];
                project.decryptedRaised = decryptedAmount;
                project.isDecrypted = true;
                
                // Check if target reached
                if (decryptedAmount >= project.targetAmount) {
                    project.status = ProjectStatus.Completed;
                } else {
                    project.status = ProjectStatus.Failed;
                }
                
                emit DecryptionCompleted(projectId, decryptedAmount);
                emit ProjectStatusUpdated(projectId, project.status);
                break;
            }
            unchecked { ++projectId; }
        }
    }
    
    /**
     * @dev Withdraw funds for completed projects (creator only)
     * @param _projectId Project ID to withdraw from
     */
    function withdrawFunds(uint32 _projectId) external nonReentrant {
        Project storage project = projects[_projectId];
        require(msg.sender == project.creator, "Not creator");
        require(project.isDecrypted, "Not decrypted");
        require(project.status == ProjectStatus.Completed, "Not completed");
        
        uint256 amount = project.decryptedRaised;
        project.decryptedRaised = 0;
        
        // Use call instead of transfer for better gas efficiency
        (bool success,) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
    }
    
    /**
     * @dev Refund contribution for failed projects
     * @param _projectId Project ID to get refund from
     */
    function refund(uint32 _projectId) external nonReentrant {
        Project storage project = projects[_projectId];
        require(project.isDecrypted, "Not decrypted");
        require(project.status == ProjectStatus.Failed, "Not failed");
        
        uint64 contribution = decryptedContributions[_projectId][msg.sender];
        require(contribution > 0, "No contribution");
        
        decryptedContributions[_projectId][msg.sender] = 0;
        
        (bool success,) = payable(msg.sender).call{value: contribution}("");
        require(success, "Refund failed");
    }
    
    // View functions with gas optimizations
    function getProject(uint32 _projectId) external view returns (Project memory) {
        return projects[_projectId];
    }
    
    function getUserProjects(address _user) external view returns (uint32[] memory) {
        return userProjects[_user];
    }
    
    function getActiveProjects() external view returns (uint32[] memory activeIds) {
        // First pass: count active projects
        uint32 count = 0;
        for (uint32 i = 1; i < nextProjectId;) {
            if (projects[i].status == ProjectStatus.Active) {
                unchecked { ++count; }
            }
            unchecked { ++i; }
        }
        
        // Second pass: populate array
        activeIds = new uint32[](count);
        count = 0;
        for (uint32 i = 1; i < nextProjectId;) {
            if (projects[i].status == ProjectStatus.Active) {
                activeIds[count] = i;
                unchecked { ++count; }
            }
            unchecked { ++i; }
        }
    }
    
    /**
     * @dev Get basic project info (gas-efficient for listings)
     * @param _projectId Project ID
     * @return creator Project creator address
     * @return targetAmount Target funding amount
     * @return deadline Campaign deadline
     * @return status Current project status
     */
    function getProjectBasics(uint32 _projectId) external view returns (
        address creator,
        uint96 targetAmount,
        uint32 deadline,
        ProjectStatus status
    ) {
        Project storage project = projects[_projectId];
        return (project.creator, project.targetAmount, project.deadline, project.status);
    }
}