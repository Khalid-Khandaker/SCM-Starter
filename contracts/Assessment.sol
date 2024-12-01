// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    // State variables
    address payable public owner;
    uint256 public balance;

    // Events
    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // Constructor to initialize the contract with an owner and initial balance
    constructor(uint256 initBalance) payable {
        owner = payable(msg.sender); // Set the deployer as the initial owner
        balance = initBalance;       // Set the initial balance
    }

    /// @notice Get the current balance of the contract
    /// @return The current balance
    function getBalance() public view returns (uint256) {
        return balance;
    }

    /// @notice Deposit a specified amount into the contract (owner-only)
    /// @param _amount The amount to deposit
    function deposit(uint256 _amount) public payable {
        uint256 _previousBalance = balance;

        // Ensure only the owner can perform this action
        require(msg.sender == owner, "You are not the owner of this account");

        // Perform the deposit
        balance += _amount;

        // Assert the balance is updated correctly
        assert(balance == _previousBalance + _amount);

        // Emit the deposit event
        emit Deposit(_amount);
    }

    // Custom error for insufficient balance during withdrawal
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    /// @notice Withdraw a specified amount from the contract (owner-only)
    /// @param _withdrawAmount The amount to withdraw
    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint256 _previousBalance = balance;

        // Ensure sufficient balance for the withdrawal
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // Perform the withdrawal
        balance -= _withdrawAmount;

        // Assert the balance is updated correctly
        assert(balance == (_previousBalance - _withdrawAmount));

        // Emit the withdrawal event
        emit Withdraw(_withdrawAmount);
    }

    /// @notice Transfer ownership of the contract to a new owner
    /// @param newOwner The address of the new owner
    function transferOwnership(address payable newOwner) public {
        require(msg.sender == owner, "You are not the owner of this account");
        require(newOwner != address(0), "New owner cannot be the zero address");

        // Emit event for ownership transfer
        emit OwnershipTransferred(owner, newOwner);

        // Update the owner
        owner = newOwner;
    }
}
