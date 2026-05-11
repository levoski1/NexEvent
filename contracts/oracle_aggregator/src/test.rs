#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_price_submission() {
    let env = Env::default();
    env.mock_all_auths();
    let id = env.register_contract(None, OracleAggregator);
    let client = OracleAggregatorClient::new(&env, &id);

    let admin = Address::generate(&env);
    let oracle = Address::generate(&env);
    client.initialize(&admin);
    client.add_oracle(&oracle);

    let asset = String::from_str(&env, "XLM/USD");
    client.submit_price(&oracle, &asset, &1_100_0000); // $1.10 scaled by 1e7
    assert_eq!(client.get_price(&asset), 1_100_0000);
}
