#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_fund_allocate_claim() {
    let env = Env::default();
    env.mock_all_auths();
    let id = env.register_contract(None, RewardPool);
    let client = RewardPoolClient::new(&env, &id);

    let admin = Address::generate(&env);
    let funder = Address::generate(&env);
    let user = Address::generate(&env);

    client.initialize(&admin);
    client.fund(&funder, &1000);
    assert_eq!(client.pool_balance(), 1000);

    client.allocate(&user, &300);
    assert_eq!(client.pending_reward(&user), 300);
    assert_eq!(client.pool_balance(), 700);

    let claimed = client.claim(&user);
    assert_eq!(claimed, 300);
    assert_eq!(client.pending_reward(&user), 0);
}
