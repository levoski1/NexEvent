#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Map};

#[contracttype]
pub enum DataKey {
    Balance(Address),
    TotalSupply,
    Admin,
}

#[contract]
pub struct StablecoinEmitter;

#[contractimpl]
impl StablecoinEmitter {
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TotalSupply, &0i128);
    }

    pub fn mint(env: Env, to: Address, amount: i128) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        assert!(amount > 0, "amount must be positive");

        let balance: i128 = env.storage().persistent().get(&DataKey::Balance(to.clone())).unwrap_or(0);
        env.storage().persistent().set(&DataKey::Balance(to.clone()), &(balance + amount));

        let supply: i128 = env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalSupply, &(supply + amount));

        env.events().publish(
            (symbol_short!("mint"), symbol_short!("stbl")),
            (to, amount),
        );
    }

    pub fn burn(env: Env, from: Address, amount: i128) {
        from.require_auth();
        let balance: i128 = env.storage().persistent().get(&DataKey::Balance(from.clone())).unwrap_or(0);
        assert!(balance >= amount, "insufficient balance");

        env.storage().persistent().set(&DataKey::Balance(from.clone()), &(balance - amount));
        let supply: i128 = env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalSupply, &(supply - amount));

        env.events().publish(
            (symbol_short!("burn"), symbol_short!("stbl")),
            (from, amount),
        );
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        let from_bal: i128 = env.storage().persistent().get(&DataKey::Balance(from.clone())).unwrap_or(0);
        assert!(from_bal >= amount, "insufficient balance");

        let to_bal: i128 = env.storage().persistent().get(&DataKey::Balance(to.clone())).unwrap_or(0);
        env.storage().persistent().set(&DataKey::Balance(from.clone()), &(from_bal - amount));
        env.storage().persistent().set(&DataKey::Balance(to.clone()), &(to_bal + amount));

        env.events().publish(
            (symbol_short!("transfer"), symbol_short!("stbl")),
            (from, to, amount),
        );
    }

    pub fn balance(env: Env, addr: Address) -> i128 {
        env.storage().persistent().get(&DataKey::Balance(addr)).unwrap_or(0)
    }

    pub fn total_supply(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0)
    }
}
