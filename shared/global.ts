import { ethers } from 'hardhat';

export const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
export const ONE_GWEI = 1_000_000_000;

export const ONE_TRILLION = BigInt(1e27);
export const ONE_MILLION = BigInt(1e24);
export const ONE_HUNDRED_THOUSAND = BigInt(1e23);
export const ONE_THOUSAND = BigInt(1e21);
export const TWO_THOUSAND = BigInt(2e21);

export const UNIX_TIME_IN_SECOND = Math.floor(Date.now() / 1000);

export const ONE_DAY = 1 * 24 * 60 * 60;

export const deployLockWithRewardContractsWithDefaultTokens = async () => {
  const [erc20Owner, contractOwner, contractAdmin, user] =
    await ethers.getSigners();

  const cap = ONE_TRILLION;
  const underlyingTokenFactory = await ethers.getContractFactory(
    'AirdropToken',
    erc20Owner,
  );
  const rewardTokenFactory = await ethers.getContractFactory(
    'AirdropToken',
    erc20Owner,
  );
  const underlying = await underlyingTokenFactory
    .connect(erc20Owner)
    .deploy('Underlying Token', 'USDX', cap);
  const rewardToken = await rewardTokenFactory
    .connect(erc20Owner)
    .deploy('Reward Token', 'BONUS', cap);

  await underlying.mint(erc20Owner.address, ONE_MILLION);
  await underlying.approve(erc20Owner.address, ONE_MILLION);
  await underlying.transferFrom(
    erc20Owner.address,
    contractOwner.address,
    ONE_HUNDRED_THOUSAND,
  );
  await underlying.transferFrom(
    erc20Owner.address,
    contractAdmin.address,
    ONE_HUNDRED_THOUSAND,
  );
  await underlying.transferFrom(
    erc20Owner.address,
    user.address,
    ONE_HUNDRED_THOUSAND,
  );

  const contractFactory = await ethers.getContractFactory(
    'LockWithReward',
    contractOwner,
  );

  const contract = await contractFactory
    .connect(contractOwner)
    .deploy(
      await underlying.getAddress(),
      await rewardToken.getAddress(),
      BigInt(UNIX_TIME_IN_SECOND + 10000),
      BigInt(UNIX_TIME_IN_SECOND + 100000),
    );

  await rewardToken.mint(erc20Owner.address, ONE_MILLION);
  await rewardToken.approve(erc20Owner.address, ONE_MILLION);
  await rewardToken.transferFrom(
    erc20Owner.address,
    await contract.getAddress(),
    ONE_MILLION,
  );

  const ADMIN_ROLE = await contract.ADMIN_ROLE();
  await contract
    .connect(contractOwner)
    .grantRole(ADMIN_ROLE, contractAdmin.address);

  return [
    contract,
    underlying,
    rewardToken,
    contractOwner,
    contractAdmin,
    user,
  ];
};
