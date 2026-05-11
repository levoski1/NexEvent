#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Counter,
    Owner,
}

#[contract]
pub struct BoilerplateContract;

#[contractimpl]
impl BoilerplateContract {
    pub fn initialize(env: Env, owner: Address) {
        owner.require_auth();
        env.storage().instance().set(&DataKey::Owner, &owner);
        env.storage().instance().set(&DataKey::Counter, &0u64);
        env.events().publish(
            (symbol_short!("init"), symbol_short!("owner")),
            owner,
        );
    }

    pub fn increment(env: Env, caller: Address) -> u64 {
        caller.require_auth();
        let count: u64 = env.storage().instance().get(&DataKey::Counter).unwrap_or(0);
        let new_count = count + 1;
        env.storage().instance().set(&DataKey::Counter, &new_count);
        env.events().publish(
            (symbol_short!("increment"), symbol_short!("count")),
            new_count,
        );
        new_count
    }

    pub fn get_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::Counter).unwrap_or(0)
    }
}
