// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    uint8 private _decimals;
    
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _tokenDecimals,
        uint256 _initialSupply
    ) ERC20(_name, _symbol) {
        _decimals = _tokenDecimals;
        _mint(msg.sender, _initialSupply);
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
    
    function faucet() external {
        _mint(msg.sender, 1000 * 10**_decimals);
    }
}