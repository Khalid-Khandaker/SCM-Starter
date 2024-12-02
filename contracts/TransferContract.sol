// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract TransferContract {
    address payable public owner;

    event Deposit(address indexed from, uint256 amount);
    event Withdraw(address indexed to, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 amount);

    // Initialize contract with the deployer's address as the owner
    constructor() payable {
        owner = payable(msg.sender);
    }

    // Get the current balance of the contract
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // Get the balance of any account
    function getAccountBalance(address account) public view returns (uint256) {
        return account.balance;
    }

    // Deposit ETH into the contract
    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        emit Deposit(msg.sender, msg.value);
    }

    // Withdraw ETH from the contract
    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "Only the owner can withdraw");
        require(address(this).balance >= _withdrawAmount, "Insufficient balance");

        // Transfer the requested ETH to the owner
        (bool success, ) = owner.call{value: _withdrawAmount}("");
        require(success, "Transfer failed");

        emit Withdraw(owner, _withdrawAmount);
    }

    // Transfer ETH to another address
    function transfer(address payable recipient, uint256 _amount) public {
        require(msg.sender == owner, "Only the owner can transfer");
        require(recipient != address(0), "Invalid recipient address");
        require(address(this).balance >= _amount, "Insufficient balance");

        // Transfer ETH to the recipient
        (bool success, ) = recipient.call{value: _amount}("");
        require(success, "Transfer failed");

        emit Transfer(msg.sender, recipient, _amount);
    }
}