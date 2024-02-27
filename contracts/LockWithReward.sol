// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract LockWithReward is Ownable, AccessControl {
    IERC20Metadata public underlying;
    IERC20Metadata public rewardToken;
    uint public startTime;
    uint public endTime;

    //ROLE
    // bytes32 public constant ADMIN_ROLE = keccak256('ADMIN_ROLE');

    mapping(address => uint256) private _balances;
    mapping(uint256 => uint256) public amountlevels;
    mapping(uint256 => uint256) public dayLevels;

    event Withdrawal(uint amount, uint when);

    // Allow to start in the past (i.e. can lock right away)
    constructor(
        address _underlying,
        address _rewardToken,
        uint _startTime,
        uint _endTime
    ) payable Ownable(msg.sender) {
        require(msg.sender != address(0), 'Sender address cannot be zero');
        require(_underlying != address(0), 'Underlying address cannot be zero');
        require(
            _rewardToken != address(0),
            'Reward Token address cannot be zero'
        );
        require(
            _underlying != _rewardToken,
            'Underlying and Reward Token cannot be the same'
        );
        require(
            _startTime < _endTime,
            'Start Time should be earlier than end time'
        );
        require(block.timestamp < _endTime, 'End time should be in the future');

        underlying = IERC20Metadata(_underlying);
        rewardToken = IERC20Metadata(_rewardToken);
        startTime = _startTime;
        endTime = _endTime;
        
        //TODO: setup levels for amount and days 
        
    }

    //external to call only from outside, else public to be also able to call inside
    function setStartTime(
        uint _startTime
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            startTime < block.timestamp,
            'Configuartion cannot be changed after starting'
        );
        require(
            _startTime < endTime,
            'Start Time should be earlier than end time'
        );
        startTime = _startTime;
    }

    function setEndTime(uint _endTime) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            startTime < block.timestamp,
            'Configuartion cannot be changed after starting'
        );
        require(
            startTime < _endTime,
            'Start Time should be earlier than end time'
        );
        require(block.timestamp < _endTime, 'End time should be in the future');
        endTime = _endTime;
    }

    function setTime(
        uint _startTime,
        uint _endTime
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            startTime < block.timestamp,
            'Configuartion cannot be changed after starting'
        );
        require(
            _startTime < _endTime,
            'Start Time should be earlier than end time'
        );
        require(block.timestamp < _endTime, 'End time should be in the future');
        startTime = _startTime;
        endTime = _endTime;
    }

    function withdraw() public {
        // Uncomment this line, and the import of "hardhat/console.sol", to print a log in your terminal
        // console.log("Unlock time is %o and block timestamp is %o", unlockTime, block.timestamp);
        // require(block.timestamp >= unlockTime, "You can't withdraw yet");
        // require(msg.sender == owner, "You aren't the owner");
        // emit Withdrawal(address(this).balance, block.timestamp);
        // owner.transfer(address(this).balance);
    }

    function lock() public {}
}
