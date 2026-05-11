#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String, Vec};

#[contracttype]
pub enum DataKey {
    Price(String),      // asset -> latest price (scaled by 1e7)
    LastUpdated(String),
    Admin,
    Oracles,
}

#[contract]
pub struct OracleAggregator;

#[contractimpl]
impl OracleAggregator {
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Oracles, &Vec::<Address>::new(&env));
    }

    pub fn add_oracle(env: Env, oracle: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        let mut oracles: Vec<Address> = env.storage().instance().get(&DataKey::Oracles).unwrap();
        oracles.push_back(oracle);
        env.storage().instance().set(&DataKey::Oracles, &oracles);
    }

    /// Submit a price update. Emits PriceUpdated event.
    pub fn submit_price(env: Env, oracle: Address, asset: String, price: i128) {
        oracle.require_auth();
        assert!(price > 0, "price must be positive");

        let prev_price: i128 = env.storage().persistent()
            .get(&DataKey::Price(asset.clone()))
            .unwrap_or(0);

        env.storage().persistent().set(&DataKey::Price(asset.clone()), &price);
        env.storage().persistent().set(&DataKey::LastUpdated(asset.clone()), &env.ledger().timestamp());

        // Emit deviation alert if price moved > 5%
        if prev_price > 0 {
            let deviation = ((price - prev_price).abs() * 10_000) / prev_price;
            if deviation > 500 {
                env.events().publish(
                    (symbol_short!("price_dev"), symbol_short!("alert")),
                    (asset.clone(), prev_price, price, deviation),
                );
            }
        }

        env.events().publish(
            (symbol_short!("price_upd"), symbol_short!("oracle")),
            (asset, oracle, price),
        );
    }

    pub fn get_price(env: Env, asset: String) -> i128 {
        env.storage().persistent().get(&DataKey::Price(asset)).unwrap_or(0)
    }
}
