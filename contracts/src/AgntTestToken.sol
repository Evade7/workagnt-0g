// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "openzeppelin-contracts/token/ERC20/ERC20.sol";

/// @title AgntTestToken
/// @notice Demo ERC20 for WorkAgnt 0G testnet. Public mint for hackathon judging.
contract AgntTestToken is ERC20 {
    uint256 public constant FAUCET_AMOUNT = 1_000 ether;

    constructor() ERC20("WorkAgnt Test Token", "AGNT-TEST") {}

    /// @notice Anyone can mint 1,000 AGNT-TEST for testing. Rate-limited by cooldown.
    mapping(address => uint256) public lastMint;
    uint256 public constant MINT_COOLDOWN = 1 hours;

    function faucet() external {
        require(block.timestamp >= lastMint[msg.sender] + MINT_COOLDOWN, "Cooldown active");
        lastMint[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
    }
}
