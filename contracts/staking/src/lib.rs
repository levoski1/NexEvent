#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env};

#[contracttype]
pub enum DataKey {
    Stake(Address),
    StakedAt(Address),
    TotalStaked,
    Admin,
    RewardRate, // tokens per second per staked token (scaled 1e9)
}

#[contract]
pub struct Staking;

#[contractimpl]
impl Staking {
    pub fn initialize(env: Env, admin: Address, reward_rate: i128) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::RewardRate, &reward_rate);
        env.storage().instance().set(&DataKey::TotalStaked, &0i128);
    }

    pub fn stake(env: Env, staker: Address, amount: i128) {
        staker.require_auth();
        assert!(amount > 0);

        let current: i128 = env.storage().persistent().get(&DataKey::Stake(staker.clone())).unwrap_or(0);
        env.storage().persistent().set(&DataKey::Stake(staker.clone()), &(current + amount));
        env.storage().persistent().set(&DataKey::StakedAt(staker.clone()), &env.ledger().timestamp());

        let total: i128 = env.storage().instance().get(&DataKey::TotalStaked).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalStaked, &(total + amount));

        env.events().publish(
            (symbol_short!("staked"), symbol_short!("staking")),
            (staker, amount),
        );
    }

    pub fn unstake(env: Env, staker: Address) -> i128 {
        staker.require_auth();
        let amount: i128 = env.storage().persistent().get(&DataKey::Stake(staker.clone())).unwrap_or(0);
        assert!(amount > 0, "nothing staked");

        env.storage().persistent().set(&DataKey::Stake(staker.clone()), &0i128);
        let total: i128 = env.storage().instance().get(&DataKey::TotalStaked).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalStaked, &(total - amount));

        env.events().publish(
            (symbol_short!("unstaked"), symbol_short!("staking")),
            (staker, amount),
        );
        amount
    }

    pub fn get_stake(env: Env, staker: Address) -> i128 {
        env.storage().persistent().get(&DataKey::Stake(staker)).unwrap_or(0)
    }

    pub fn total_staked(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::TotalStaked).unwrap_or(0)
    }
}
