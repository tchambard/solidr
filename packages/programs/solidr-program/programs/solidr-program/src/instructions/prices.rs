use anchor_lang::{prelude::*, solana_program::native_token::LAMPORTS_PER_SOL};

use crate::errors::SolidrError;
// use pyth_solana_receiver_sdk::price_update::{get_feed_id_from_hex, Price, PriceUpdateV2};

// See https://pyth.network/developers/price-feed-ids for all available IDs.
pub const MAXIMUM_AGE: u64 = 60; // 1 minute
pub const FEED_ID: &str = "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";

pub struct Price {
    pub price: i64,
    pub conf: u64,
    pub exponent: i32,
    pub publish_time: i64,
}

pub fn get_price(// price_update: &mut Account<PriceUpdateV2>
) -> Price {
    // TODO: WAIT FOR FIX: https://github.com/pyth-network/pyth-crosschain/issues/1759
    // let price = price_update.get_price_no_older_than(
    //     &Clock::get()?,
    //     MAXIMUM_AGE,
    //     &get_feed_id_from_hex(FEED_ID)?,
    // )?;
    let price = Price {
        price: 69,
        exponent: 4,
        conf: 0,
        publish_time: 0,
    };
    return price;
}

pub fn convert_to_lamports(amount: f64, price: Price) -> Result<u64> {
    let amount_in_cents = (amount * 100.0).round() as u64;
    let exp = 10_u64.pow(
        price
            .exponent
            .abs()
            .try_into()
            .map_err(|_| SolidrError::Overflow)?,
    );

    let scaled_price = if price.exponent < 0 {
        price
            .price
            .checked_div(exp as i64)
            .ok_or(SolidrError::Overflow)?
    } else {
        price
            .price
            .checked_mul(exp as i64)
            .ok_or(SolidrError::Overflow)?
    };

    let amount_in_lamports = LAMPORTS_PER_SOL
        .checked_mul(amount_in_cents)
        .ok_or(SolidrError::Overflow)?
        .checked_div(scaled_price as u64)
        .ok_or(SolidrError::DivisionByZero)?;

    Ok(amount_in_lamports / 100)
}
