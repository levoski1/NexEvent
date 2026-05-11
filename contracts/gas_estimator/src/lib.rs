#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String};

#[contracttype]
pub enum DataKey {
    TotalFees,
    TxCount,
    HighFeeThreshold,
    Admin,
}

#[contract]
pub struct GasEstimator;

#[contractimpl]
impl GasEstimator {
    pub fn initialize(env: Env, admin: Address, high_fee_threshold: i128) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::HighFeeThreshold, &high_fee_threshold);
        env.storage().instance().set(&DataKey::TotalFees, &0i128);
        env.storage().instance().set(&DataKey::TxCount, &0u64);
    }

    /// Record a transaction fee. Emits HighFee event if above threshold.
    pub fn record_fee(env: Env, caller: Address, fee: i128, operation: String) {
        caller.require_auth();
        assert!(fee > 0);

        let total: i128 = env.storage().instance().get(&DataKey::TotalFees).unwrap_or(0);
        let count: u64 = env.storage().instance().get(&DataKey::TxCount).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalFees, &(total + fee));
        env.storage().instance().set(&DataKey::TxCount, &(count + 1));

        let threshold: i128 = env.storage().instance().get(&DataKey::HighFeeThreshold).unwrap_or(i128::MAX);
        if fee > threshold {
            env.events().publish(
                (symbol_short!("high_fee"), symbol_short!("gas")),
                (caller.clone(), fee, operation.clone()),
            );
        }

        env.events().publish(
            (symbol_short!("fee_rec"), symbol_short!("gas")),
            (caller, fee, operation),
        );
    }

    pub fn average_fee(env: Env) -> i128 {
        let total: i128 = env.storage().instance().get(&DataKey::TotalFees).unwrap_or(0);
        let count: u64 = env.storage().instance().get(&DataKey::TxCount).unwrap_or(0);
        if count == 0 { 0 } else { total / count as i128 }
    }
}
