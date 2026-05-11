#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env};

#[contracttype]
pub enum DataKey {
    PoolBalance,
    Reward(Address),
    Admin,
}

#[contract]
pub struct RewardPool;

#[contractimpl]
impl RewardPool {
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::PoolBalance, &0i128);
    }

    pub fn fund(env: Env, funder: Address, amount: i128) {
        funder.require_auth();
        assert!(amount > 0);
        let balance: i128 = env.storage().instance().get(&DataKey::PoolBalance).unwrap_or(0);
        env.storage().instance().set(&DataKey::PoolBalance, &(balance + amount));

        env.events().publish(
            (symbol_short!("pool_fund"), symbol_short!("reward")),
            (funder, amount),
        );
    }

    pub fn allocate(env: Env, recipient: Address, amount: i128) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let pool: i128 = env.storage().instance().get(&DataKey::PoolBalance).unwrap_or(0);
        assert!(pool >= amount, "insufficient pool balance");

        let current: i128 = env.storage().persistent().get(&DataKey::Reward(recipient.clone())).unwrap_or(0);
        env.storage().persistent().set(&DataKey::Reward(recipient.clone()), &(current + amount));
        env.storage().instance().set(&DataKey::PoolBalance, &(pool - amount));

        env.events().publish(
            (symbol_short!("allocated"), symbol_short!("reward")),
            (recipient, amount),
        );
    }

    pub fn claim(env: Env, recipient: Address) -> i128 {
        recipient.require_auth();
        let amount: i128 = env.storage().persistent().get(&DataKey::Reward(recipient.clone())).unwrap_or(0);
        assert!(amount > 0, "no rewards");

        env.storage().persistent().set(&DataKey::Reward(recipient.clone()), &0i128);

        env.events().publish(
            (symbol_short!("rwd_claim"), symbol_short!("reward")),
            (recipient, amount),
        );
        amount
    }

    pub fn pool_balance(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::PoolBalance).unwrap_or(0)
    }

    pub fn pending_reward(env: Env, recipient: Address) -> i128 {
        env.storage().persistent().get(&DataKey::Reward(recipient)).unwrap_or(0)
    }
}
