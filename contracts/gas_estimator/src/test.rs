#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_fee_recording() {
    let env = Env::default();
    env.mock_all_auths();
    let id = env.register_contract(None, GasEstimator);
    let client = GasEstimatorClient::new(&env, &id);

    let admin = Address::generate(&env);
    let caller = Address::generate(&env);
    client.initialize(&admin, &1000);

    let op = String::from_str(&env, "swap");
    client.record_fee(&caller, &500, &op);
    client.record_fee(&caller, &300, &op);
    assert_eq!(client.average_fee(), 400);
}
