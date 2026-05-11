#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env};

#[contracttype]
#[derive(Clone)]
pub struct VestingSchedule {
    pub beneficiary: Address,
    pub total_amount: i128,
    pub claimed: i128,
    pub start_time: u64,
    pub cliff_secs: u64,
    pub duration_secs: u64,
}

#[contracttype]
pub enum DataKey {
    Schedule(Address),
    Admin,
}

#[contract]
pub struct TokenVesting;

#[contractimpl]
impl TokenVesting {
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    pub fn create_schedule(
        env: Env,
        beneficiary: Address,
        total_amount: i128,
        cliff_secs: u64,
        duration_secs: u64,
    ) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        assert!(duration_secs > 0 && total_amount > 0);

        let schedule = VestingSchedule {
            beneficiary: beneficiary.clone(),
            total_amount,
            claimed: 0,
            start_time: env.ledger().timestamp(),
            cliff_secs,
            duration_secs,
        };
        env.storage().persistent().set(&DataKey::Schedule(beneficiary.clone()), &schedule);

        env.events().publish(
            (symbol_short!("vest_crt"), symbol_short!("vesting")),
            (beneficiary, total_amount, cliff_secs, duration_secs),
        );
    }

    pub fn claim(env: Env, beneficiary: Address) -> i128 {
        beneficiary.require_auth();
        let mut schedule: VestingSchedule = env
            .storage().persistent()
            .get(&DataKey::Schedule(beneficiary.clone()))
            .expect("no schedule");

        let now = env.ledger().timestamp();
        let elapsed = now.saturating_sub(schedule.start_time);
        assert!(elapsed >= schedule.cliff_secs, "cliff not reached");

        let vested = if elapsed >= schedule.duration_secs {
            schedule.total_amount
        } else {
            (schedule.total_amount * elapsed as i128) / schedule.duration_secs as i128
        };

        let claimable = vested - schedule.claimed;
        assert!(claimable > 0, "nothing to claim");

        schedule.claimed += claimable;
        env.storage().persistent().set(&DataKey::Schedule(beneficiary.clone()), &schedule);

        env.events().publish(
            (symbol_short!("vest_clm"), symbol_short!("vesting")),
            (beneficiary, claimable),
        );
        claimable
    }

    pub fn vested_amount(env: Env, beneficiary: Address) -> i128 {
        let schedule: VestingSchedule = env
            .storage().persistent()
            .get(&DataKey::Schedule(beneficiary))
            .unwrap_or(VestingSchedule {
                beneficiary: env.current_contract_address(),
                total_amount: 0,
                claimed: 0,
                start_time: 0,
                cliff_secs: 0,
                duration_secs: 1,
            });
        let elapsed = env.ledger().timestamp().saturating_sub(schedule.start_time);
        if elapsed >= schedule.duration_secs {
            schedule.total_amount
        } else {
            (schedule.total_amount * elapsed as i128) / schedule.duration_secs as i128
        }
    }
}
