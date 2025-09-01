// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC20Extended is IERC20 {
    function decimals() external view returns (uint8);
}

contract ConfidentialDEX is SepoliaConfig, ReentrancyGuard, Ownable {
    struct TradingPair {
        address tokenA;
        address tokenB;
        bool isActive;
        euint64 reserveA;
        euint64 reserveB;
        uint64 decryptedReserveA;
        uint64 decryptedReserveB;
        bool isDecrypted;
    }
    
    struct Order {
        uint256 id;
        address trader;
        address tokenIn;
        address tokenOut;
        euint64 encryptedAmountIn;
        euint64 encryptedAmountOut;
        uint64 decryptedAmountIn;
        uint64 decryptedAmountOut;
        bool isActive;
        bool isDecrypted;
        OrderType orderType;
        OrderStatus status;
    }
    
    enum OrderType {
        Buy,
        Sell
    }
    
    enum OrderStatus {
        Pending,
        DecryptionRequested,
        Filled,
        Cancelled
    }
    
    mapping(bytes32 => TradingPair) public tradingPairs;
    mapping(uint256 => Order) public orders;
    mapping(address => mapping(address => euint64)) private userBalances;
    mapping(address => mapping(address => uint64)) public decryptedUserBalances;
    mapping(address => uint256[]) public userOrders;
    
    bytes32[] public allPairs;
    uint256 private nextOrderId = 1;
    uint256 public totalOrders;
    
    // Supported tokens
    mapping(address => bool) public supportedTokens;
    address[] public tokenList;
    
    event PairCreated(address indexed tokenA, address indexed tokenB, bytes32 pairId);
    event OrderCreated(uint256 indexed orderId, address indexed trader, OrderType orderType);
    event OrderFilled(uint256 indexed orderId, uint64 amountIn, uint64 amountOut);
    event OrderCancelled(uint256 indexed orderId);
    event LiquidityAdded(bytes32 indexed pairId, uint64 amountA, uint64 amountB);
    event DecryptionRequested(uint256 indexed orderId);
    
    constructor() Ownable(msg.sender) {
        // Add ETH as a supported "token" (address 0)
        supportedTokens[address(0)] = true;
        tokenList.push(address(0));
    }
    
    function addSupportedToken(address _token) external onlyOwner {
        require(!supportedTokens[_token], "Token already supported");
        supportedTokens[_token] = true;
        tokenList.push(_token);
    }
    
    function createTradingPair(address _tokenA, address _tokenB) external onlyOwner returns (bytes32) {
        require(_tokenA != _tokenB, "Tokens must be different");
        require(supportedTokens[_tokenA] && supportedTokens[_tokenB], "Unsupported tokens");
        
        bytes32 pairId = keccak256(abi.encodePacked(_tokenA, _tokenB));
        require(!tradingPairs[pairId].isActive, "Pair already exists");
        
        euint64 initialReserveA = FHE.asEuint64(0);
        euint64 initialReserveB = FHE.asEuint64(0);
        
        FHE.allowThis(initialReserveA);
        FHE.allowThis(initialReserveB);
        
        tradingPairs[pairId] = TradingPair({
            tokenA: _tokenA,
            tokenB: _tokenB,
            isActive: true,
            reserveA: initialReserveA,
            reserveB: initialReserveB,
            decryptedReserveA: 0,
            decryptedReserveB: 0,
            isDecrypted: false
        });
        
        allPairs.push(pairId);
        
        emit PairCreated(_tokenA, _tokenB, pairId);
        return pairId;
    }
    
    function depositETH(
        externalEuint64 _encryptedAmount,
        bytes memory _inputProof
    ) external payable {
        require(msg.value > 0, "Must send ETH");
        
        euint64 encryptedAmount = FHE.fromExternal(_encryptedAmount, _inputProof);
        require(FHE.decrypt(encryptedAmount) == uint64(msg.value), "Encrypted amount mismatch");
        
        if (FHE.isZero(userBalances[msg.sender][address(0)])) {
            userBalances[msg.sender][address(0)] = encryptedAmount;
        } else {
            userBalances[msg.sender][address(0)] = FHE.add(
                userBalances[msg.sender][address(0)],
                encryptedAmount
            );
        }
        
        FHE.allowThis(userBalances[msg.sender][address(0)]);
    }
    
    function depositToken(
        address _token,
        uint256 _amount,
        externalEuint64 _encryptedAmount,
        bytes memory _inputProof
    ) external {
        require(supportedTokens[_token], "Unsupported token");
        require(_token != address(0), "Use depositETH for ETH");
        require(_amount > 0, "Amount must be greater than 0");
        
        euint64 encryptedAmount = FHE.fromExternal(_encryptedAmount, _inputProof);
        require(FHE.decrypt(encryptedAmount) == uint64(_amount), "Encrypted amount mismatch");
        
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        
        if (FHE.isZero(userBalances[msg.sender][_token])) {
            userBalances[msg.sender][_token] = encryptedAmount;
        } else {
            userBalances[msg.sender][_token] = FHE.add(
                userBalances[msg.sender][_token],
                encryptedAmount
            );
        }
        
        FHE.allowThis(userBalances[msg.sender][_token]);
    }
    
    function createOrder(
        address _tokenIn,
        address _tokenOut,
        externalEuint64 _encryptedAmountIn,
        externalEuint64 _encryptedAmountOut,
        bytes memory _inputProofIn,
        bytes memory _inputProofOut,
        OrderType _orderType
    ) external returns (uint256) {
        require(supportedTokens[_tokenIn] && supportedTokens[_tokenOut], "Unsupported tokens");
        require(_tokenIn != _tokenOut, "Tokens must be different");
        
        euint64 encryptedAmountIn = FHE.fromExternal(_encryptedAmountIn, _inputProofIn);
        euint64 encryptedAmountOut = FHE.fromExternal(_encryptedAmountOut, _inputProofOut);
        
        // Check user has sufficient balance
        ebool hasSufficientBalance = FHE.gte(userBalances[msg.sender][_tokenIn], encryptedAmountIn);
        require(FHE.decrypt(hasSufficientBalance), "Insufficient balance");
        
        uint256 orderId = nextOrderId++;
        
        orders[orderId] = Order({
            id: orderId,
            trader: msg.sender,
            tokenIn: _tokenIn,
            tokenOut: _tokenOut,
            encryptedAmountIn: encryptedAmountIn,
            encryptedAmountOut: encryptedAmountOut,
            decryptedAmountIn: 0,
            decryptedAmountOut: 0,
            isActive: true,
            isDecrypted: false,
            orderType: _orderType,
            status: OrderStatus.Pending
        });
        
        // Lock user's tokens
        userBalances[msg.sender][_tokenIn] = FHE.sub(
            userBalances[msg.sender][_tokenIn],
            encryptedAmountIn
        );
        
        FHE.allowThis(encryptedAmountIn);
        FHE.allowThis(encryptedAmountOut);
        FHE.allowThis(userBalances[msg.sender][_tokenIn]);
        
        userOrders[msg.sender].push(orderId);
        totalOrders++;
        
        emit OrderCreated(orderId, msg.sender, _orderType);
        return orderId;
    }
    
    function requestOrderDecryption(uint256 _orderId) external {
        Order storage order = orders[_orderId];
        require(order.isActive, "Order is not active");
        require(order.trader == msg.sender, "Not order owner");
        require(!order.isDecrypted, "Order already decrypted");
        
        bytes32[] memory cts = new bytes32[](2);
        cts[0] = FHE.toBytes32(order.encryptedAmountIn);
        cts[1] = FHE.toBytes32(order.encryptedAmountOut);
        
        uint256 requestId = FHE.requestDecryption(
            cts,
            this.callbackDecryptOrder.selector
        );
        
        order.status = OrderStatus.DecryptionRequested;
        
        emit DecryptionRequested(_orderId);
    }
    
    function callbackDecryptOrder(
        uint256 requestId,
        uint64 amountIn,
        uint64 amountOut,
        bytes[] memory signatures
    ) public {
        FHE.checkSignatures(requestId, signatures);
        
        // Find the order (in practice, you'd store the mapping)
        for (uint256 i = 1; i < nextOrderId; i++) {
            if (orders[i].status == OrderStatus.DecryptionRequested) {
                Order storage order = orders[i];
                order.decryptedAmountIn = amountIn;
                order.decryptedAmountOut = amountOut;
                order.isDecrypted = true;
                order.status = OrderStatus.Filled;
                
                // Execute the trade
                _executeTrade(i);
                
                emit OrderFilled(i, amountIn, amountOut);
                break;
            }
        }
    }
    
    function _executeTrade(uint256 _orderId) internal {
        Order storage order = orders[_orderId];
        
        // Credit user with output tokens
        if (FHE.isZero(userBalances[order.trader][order.tokenOut])) {
            userBalances[order.trader][order.tokenOut] = FHE.asEuint64(order.decryptedAmountOut);
        } else {
            userBalances[order.trader][order.tokenOut] = FHE.add(
                userBalances[order.trader][order.tokenOut],
                FHE.asEuint64(order.decryptedAmountOut)
            );
        }
        
        FHE.allowThis(userBalances[order.trader][order.tokenOut]);
        
        order.isActive = false;
    }
    
    function cancelOrder(uint256 _orderId) external {
        Order storage order = orders[_orderId];
        require(order.isActive, "Order is not active");
        require(order.trader == msg.sender, "Not order owner");
        
        // Return locked tokens to user
        userBalances[msg.sender][order.tokenIn] = FHE.add(
            userBalances[msg.sender][order.tokenIn],
            order.encryptedAmountIn
        );
        
        order.isActive = false;
        order.status = OrderStatus.Cancelled;
        
        FHE.allowThis(userBalances[msg.sender][order.tokenIn]);
        
        emit OrderCancelled(_orderId);
    }
    
    function withdrawETH(uint64 _amount) external nonReentrant {
        uint64 balance = decryptedUserBalances[msg.sender][address(0)];
        require(balance >= _amount, "Insufficient balance");
        
        decryptedUserBalances[msg.sender][address(0)] -= _amount;
        payable(msg.sender).transfer(_amount);
    }
    
    function withdrawToken(address _token, uint64 _amount) external nonReentrant {
        require(_token != address(0), "Use withdrawETH for ETH");
        uint64 balance = decryptedUserBalances[msg.sender][_token];
        require(balance >= _amount, "Insufficient balance");
        
        decryptedUserBalances[msg.sender][_token] -= _amount;
        IERC20(_token).transfer(msg.sender, _amount);
    }
    
    function getAllTradingPairs() external view returns (bytes32[] memory) {
        return allPairs;
    }
    
    function getUserOrders(address _user) external view returns (uint256[] memory) {
        return userOrders[_user];
    }
    
    function getSupportedTokens() external view returns (address[] memory) {
        return tokenList;
    }
    
    function getOrder(uint256 _orderId) external view returns (Order memory) {
        return orders[_orderId];
    }
    
    function getTradingPair(bytes32 _pairId) external view returns (TradingPair memory) {
        return tradingPairs[_pairId];
    }
}