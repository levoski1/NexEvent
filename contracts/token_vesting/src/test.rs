#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::{Address as _, Ledger}, Address, Env};

#[test]
fn test_vesting_claim() {
    let env = Env::default();
    env.mock_all_auths();
    let id = env.register_contract(None, TokenVesting);
    let client = TokenVestingClient::new(&env, &id);

    let admin = Address::generate(&env);
    let beneficiary = Address::generate(&env);

    client.initialize(&admin);
    // 1000 tokens, 0 cliff, 100s duration
    client.create_schedule(&beneficiary, &1000, &0, &100);

    // Advance ledger by 50 seconds
    env.ledger().with_mut(|l| l.timestamp = 50);
    let claimed = client.claim(&beneficiary);
    assert_eq!(claimed, 500); // 50% vested
}
