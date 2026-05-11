#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_mint_and_transfer() {
    let env = Env::default();
    env.mock_all_auths();
    let id = env.register_contract(None, NftRoyaltyEmitter);
    let client = NftRoyaltyEmitterClient::new(&env, &id);

    let creator = Address::generate(&env);
    let buyer = Address::generate(&env);

    let token_id = client.mint(&creator, &500); // 5% royalty
    assert_eq!(client.owner_of(&token_id), creator);

    client.transfer_with_royalty(&creator, &buyer, &token_id, &10_000);
    assert_eq!(client.owner_of(&token_id), buyer);
}
