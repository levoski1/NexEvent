#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_mint_transfer_burn() {
    let env = Env::default();
    env.mock_all_auths();
    let id = env.register_contract(None, StablecoinEmitter);
    let client = StablecoinEmitterClient::new(&env, &id);

    let admin = Address::generate(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    client.initialize(&admin);
    client.mint(&alice, &1000);
    assert_eq!(client.balance(&alice), 1000);
    assert_eq!(client.total_supply(), 1000);

    client.transfer(&alice, &bob, &400);
    assert_eq!(client.balance(&alice), 600);
    assert_eq!(client.balance(&bob), 400);

    client.burn(&bob, &100);
    assert_eq!(client.balance(&bob), 300);
    assert_eq!(client.total_supply(), 900);
}
