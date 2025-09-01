// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ConfidentialFundPad is SepoliaConfig, Ownable, ReentrancyGuard {
    struct Project {
        uint256 id;
        address creator;
        string name;
        string description;
        uint256 targetAmount;
        uint256 deadline;
        euint64 encryptedRaised;
        uint64 decryptedRaised;
        bool isActive;
        bool isDecrypted;
        ProjectStatus status;
    }
    
    enum ProjectStatus {
        Active,
        DecryptionRequested,
        Completed,
        Failed
    }
    
    mapping(uint256 => Project) public projects;
    mapping(uint256 => mapping(address => euint64)) private userContributions;
    mapping(uint256 => mapping(address => uint64)) public decryptedContributions;
    mapping(address => uint256[]) public userProjects;
    
    uint256 private nextProjectId = 1;
    uint256 public totalProjects;
    
    event ProjectCreated(
        uint256 indexed projectId,
        address indexed creator,
        string name,
        uint256 targetAmount,
        uint256 deadline
    );
    
    event ContributionMade(
        uint256 indexed projectId,
        address indexed contributor,
        uint256 amount
    );
    
    event ProjectStatusUpdated(uint256 indexed projectId, ProjectStatus status);
    
    event DecryptionRequested(uint256 indexed projectId);
    event DecryptionCompleted(uint256 indexed projectId, uint64 finalAmount);
    
    constructor() Ownable(msg.sender) {
    }
    
    function createProject(
        string memory _name,
        string memory _description,
        uint256 _targetAmount,
        uint256 _duration
    ) external returns (uint256) {
        require(_targetAmount > 0, "Target amount must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        
        uint256 projectId = nextProjectId++;
        uint256 deadline = block.timestamp + _duration;
        
        euint64 initialRaised = FHE.asEuint64(0);
        FHE.allowThis(initialRaised);
        
        projects[projectId] = Project({
            id: projectId,
            creator: msg.sender,
            name: _name,
            description: _description,
            targetAmount: _targetAmount,
            deadline: deadline,
            encryptedRaised: initialRaised,
            decryptedRaised: 0,
            isActive: true,
            isDecrypted: false,
            status: ProjectStatus.Active
        });
        
        userProjects[msg.sender].push(projectId);
        totalProjects++;
        
        emit ProjectCreated(projectId, msg.sender, _name, _targetAmount, deadline);
        return projectId;
    }
    
    function contribute(
        uint256 _projectId,
        externalEuint64 _encryptedAmount,
        bytes memory _inputProof
    ) external payable nonReentrant {
        Project storage project = projects[_projectId];
        require(project.isActive, "Project is not active");
        require(block.timestamp <= project.deadline, "Project deadline has passed");
        require(msg.value > 0, "Must send ETH to contribute");
        
        euint64 encryptedAmount = FHE.fromExternal(_encryptedAmount, _inputProof);
        
        // Verify encrypted amount matches msg.value
        require(FHE.decrypt(encryptedAmount) == uint64(msg.value), "Encrypted amount mismatch");
        
        // Update user contribution
        if (FHE.isZero(userContributions[_projectId][msg.sender])) {
            userContributions[_projectId][msg.sender] = encryptedAmount;
        } else {
            userContributions[_projectId][msg.sender] = FHE.add(
                userContributions[_projectId][msg.sender],
                encryptedAmount
            );
        }
        
        // Update project total
        project.encryptedRaised = FHE.add(project.encryptedRaised, encryptedAmount);
        
        // Set permissions
        FHE.allowThis(userContributions[_projectId][msg.sender]);
        FHE.allowThis(project.encryptedRaised);
        
        emit ContributionMade(_projectId, msg.sender, msg.value);
    }
    
    function requestDecryption(uint256 _projectId) external {
        Project storage project = projects[_projectId];
        require(project.isActive, "Project is not active");
        require(
            block.timestamp > project.deadline || msg.sender == project.creator,
            "Can only decrypt after deadline or by creator"
        );
        require(!project.isDecrypted, "Already decrypted");
        
        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(project.encryptedRaised);
        
        uint256 requestId = FHE.requestDecryption(
            cts,
            this.callbackDecryptProject.selector
        );
        
        project.status = ProjectStatus.DecryptionRequested;
        
        emit DecryptionRequested(_projectId);
        emit ProjectStatusUpdated(_projectId, ProjectStatus.DecryptionRequested);
    }
    
    function callbackDecryptProject(
        uint256 requestId,
        uint64 decryptedAmount,
        bytes[] memory signatures
    ) public {
        FHE.checkSignatures(requestId, signatures);
        
        // Find the project (in practice, you'd store the mapping)
        for (uint256 i = 1; i < nextProjectId; i++) {
            if (projects[i].status == ProjectStatus.DecryptionRequested) {
                Project storage project = projects[i];
                project.decryptedRaised = decryptedAmount;
                project.isDecrypted = true;
                
                if (decryptedAmount >= project.targetAmount) {
                    project.status = ProjectStatus.Completed;
                } else {
                    project.status = ProjectStatus.Failed;
                }
                
                emit DecryptionCompleted(i, decryptedAmount);
                emit ProjectStatusUpdated(i, project.status);
                break;
            }
        }
    }
    
    function withdrawFunds(uint256 _projectId) external nonReentrant {
        Project storage project = projects[_projectId];
        require(project.creator == msg.sender, "Only project creator can withdraw");
        require(project.isDecrypted, "Project funds not yet decrypted");
        require(project.status == ProjectStatus.Completed, "Project not completed");
        
        uint256 amount = project.decryptedRaised;
        project.decryptedRaised = 0;
        
        payable(msg.sender).transfer(amount);
    }
    
    function refund(uint256 _projectId) external nonReentrant {
        Project storage project = projects[_projectId];
        require(project.isDecrypted, "Project not yet decrypted");
        require(project.status == ProjectStatus.Failed, "Project not failed");
        
        uint64 contribution = decryptedContributions[_projectId][msg.sender];
        require(contribution > 0, "No contribution to refund");
        
        decryptedContributions[_projectId][msg.sender] = 0;
        payable(msg.sender).transfer(contribution);
    }
    
    function getProject(uint256 _projectId) external view returns (Project memory) {
        return projects[_projectId];
    }
    
    function getUserProjects(address _user) external view returns (uint256[] memory) {
        return userProjects[_user];
    }
    
    function getAllActiveProjects() external view returns (uint256[] memory) {
        uint256[] memory activeProjects = new uint256[](totalProjects);
        uint256 count = 0;
        
        for (uint256 i = 1; i < nextProjectId; i++) {
            if (projects[i].isActive) {
                activeProjects[count] = i;
                count++;
            }
        }
        
        // Resize array
        uint256[] memory result = new uint256[](count);
        for (uint256 j = 0; j < count; j++) {
            result[j] = activeProjects[j];
        }
        
        return result;
    }
}