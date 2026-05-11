#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_increment() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, BoilerplateContract);
    let client = BoilerplateContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    client.initialize(&owner);
    assert_eq!(client.get_count(), 0);

    let caller = Address::generate(&env);
    let count = client.increment(&caller);
    assert_eq!(count, 1);
    assert_eq!(client.get_count(), 1);
}
