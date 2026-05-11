#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String};

#[contracttype]
pub enum DataKey {
    Owner(u64),       // token_id -> owner
    Creator(u64),     // token_id -> creator
    RoyaltyBps(u64),  // token_id -> basis points (e.g. 500 = 5%)
    NextId,
}

#[contract]
pub struct NftRoyaltyEmitter;

#[contractimpl]
impl NftRoyaltyEmitter {
    /// Mint a new NFT with royalty configuration.
    pub fn mint(env: Env, creator: Address, royalty_bps: u32) -> u64 {
        creator.require_auth();
        assert!(royalty_bps <= 10_000, "royalty_bps must be <= 10000");

        let token_id: u64 = env.storage().instance().get(&DataKey::NextId).unwrap_or(0);
        env.storage().persistent().set(&DataKey::Owner(token_id), &creator);
        env.storage().persistent().set(&DataKey::Creator(token_id), &creator);
        env.storage().persistent().set(&DataKey::RoyaltyBps(token_id), &royalty_bps);
        env.storage().instance().set(&DataKey::NextId, &(token_id + 1));

        env.events().publish(
            (symbol_short!("nft_mint"), symbol_short!("royalty")),
            (token_id, creator, royalty_bps),
        );
        token_id
    }

    /// Transfer NFT and distribute royalty payment.
    pub fn transfer_with_royalty(
        env: Env,
        from: Address,
        to: Address,
        token_id: u64,
        sale_price: i128,
    ) {
        from.require_auth();
        let owner: Address = env.storage().persistent().get(&DataKey::Owner(token_id)).unwrap();
        assert!(owner == from, "not owner");

        let creator: Address = env.storage().persistent().get(&DataKey::Creator(token_id)).unwrap();
        let bps: u32 = env.storage().persistent().get(&DataKey::RoyaltyBps(token_id)).unwrap_or(0);
        let royalty_amount = (sale_price * bps as i128) / 10_000;

        env.storage().persistent().set(&DataKey::Owner(token_id), &to);

        env.events().publish(
            (symbol_short!("nft_sale"), symbol_short!("royalty")),
            (token_id, from, to, sale_price, creator, royalty_amount),
        );
    }

    pub fn owner_of(env: Env, token_id: u64) -> Address {
        env.storage().persistent().get(&DataKey::Owner(token_id)).unwrap()
    }
}
