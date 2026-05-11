#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_stake_unstake() {
    let env = Env::default();
    env.mock_all_auths();
    let id = env.register_contract(None, Staking);
    let client = StakingClient::new(&env, &id);

    let admin = Address::generate(&env);
    let staker = Address::generate(&env);

    client.initialize(&admin, &1000);
    client.stake(&staker, &500);
    assert_eq!(client.get_stake(&staker), 500);
    assert_eq!(client.total_staked(), 500);

    let returned = client.unstake(&staker);
    assert_eq!(returned, 500);
    assert_eq!(client.total_staked(), 0);
}
