// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract LockWithReward is Ownable, AccessControl {
    IERC20Metadata public underlying;
    IERC20Metadata public rewardToken;
    uint public startTime;
    uint public endTime;
    uint256 public lockIdCounter = 0;

    uint256 public level1AmountThreshold = 500 * mantissa();
    uint256 public level2AmountThreshold = 2000 * mantissa();

    uint256 public level1LockTime = 10 days;
    uint256 public level2LockTime = 20 days;

    enum LockLevel {
        Level1,
        Level2,
        Level3
    }

    struct Lock {
        uint256 amount;
        uint lockTime;
    }

    mapping(address => mapping(uint256 => Lock)) public balances;

    // event Withdrawal(uint amount, uint when);

    // Allow to start in the past (i.e. can lock right away and no configs can be changed)
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

    function mantissa() public pure returns (uint256) {
        return 1e18;
    }

    modifier onlyValidTime(uint start, uint end) {
        require(start < end, 'Start Time should be earlier than end time');
        _;
    }

    modifier onlyChangeConfigBeforeStartTime() {
        require(
            startTime < block.timestamp,
            'Configuartion cannot be changed after starting'
        );
        _;
    }

    modifier onlyWithinLockTime() {
        require(block.timestamp > startTime, 'Lock time not started');
        require(block.timestamp < endTime, 'Lock time has passed');
        _;
    }

    modifier onlyBeforeEndTime() {
        require(
            block.timestamp < endTime,
            'Function can only be called before end time'
        );
        _;
    }

    modifier onlyAfterEndTime() {
        require(
            block.timestamp >= endTime,
            'Function can only be called after end time'
        );
        _;
    }

    function lock(uint256 _amount) public onlyWithinLockTime {
        require(_amount > 0, 'Amount must be greater than zero');
        require(
            underlying.transferFrom(msg.sender, address(this), _amount),
            'Transfer failed'
        );

        balances[msg.sender][lockIdCounter++] = Lock({
            amount: _amount,
            lockTime: block.timestamp
        });
    }

    function withdraw() public onlyAfterEndTime {
        // require(msg.sender == owner, "You aren't the owner");
        // owner.transfer(address(this).balance);
    }

    // Admin Functions
    // TODO: Should avoid using DEFAULT_ADMIN_ROLE for safety
    function setTime(
        uint _startTime,
        uint _endTime
    )
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyChangeConfigBeforeStartTime
        onlyValidTime(_startTime, _endTime)
    {
        require(block.timestamp < _endTime, 'End time should be in the future');
        startTime = _startTime;
        endTime = _endTime;
    }

    function setLevelAmountThreshold(
        uint256 _level1AmountThreshold,
        uint256 _level2AmountThreshold
    ) external onlyRole(DEFAULT_ADMIN_ROLE) onlyChangeConfigBeforeStartTime {
        require(
            _level1AmountThreshold < _level2AmountThreshold,
            'Level 1 threshold must be less than level 2 threshold'
        );
        level1AmountThreshold = _level1AmountThreshold;
        level2AmountThreshold = _level2AmountThreshold;
    }

    function setLevelLockTime(
        uint256 _level1LockTime,
        uint256 _level2LockTime
    ) external onlyRole(DEFAULT_ADMIN_ROLE) onlyChangeConfigBeforeStartTime {
        require(
            _level1LockTime < _level2LockTime,
            'Level 1 lock time must be less than level 2 lock days'
        );
        level1LockTime = _level1LockTime;
        level2LockTime = _level2LockTime;
    }
}
