use anchor_lang::{prelude::*, solana_program::native_token::LAMPORTS_PER_SOL};
use pyth_solana_receiver_sdk::price_update::{get_feed_id_from_hex, Price, PriceUpdateV2};

use crate::errors::SolidrError;

// See https://pyth.network/developers/price-feed-ids for all available IDs.
pub const MAXIMUM_AGE: u64 = 60; // 1 minute
pub const FEED_ID: &str = "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";

pub fn get_price(price_update: &UncheckedAccount) -> Result<Price> {
    if price_update.data_len() != PriceUpdateV2::LEN {
        msg!("Warning: Invalid Pyth price account size. Using default value.");
        return Ok(get_default_price());
    }

    let price_data = price_update.try_borrow_data()?;
    let price_update: PriceUpdateV2 = match PriceUpdateV2::try_deserialize(&mut price_data.as_ref())
    {
        Ok(data) => data,
        Err(_) => {
            msg!("Warning: Unable to deserialize Pyth price account. Using default value.");
            return Ok(get_default_price());
        }
    };

    let feed_id = get_feed_id_from_hex(FEED_ID).map_err(|_| error!(SolidrError::Overflow))?;

    match price_update.get_price_no_older_than(&Clock::get()?, MAXIMUM_AGE, &feed_id) {
        Ok(pyth_price) => Ok(Price {
            price: pyth_price.price,
            conf: pyth_price.conf,
            exponent: pyth_price.exponent,
            publish_time: pyth_price.publish_time,
        }),
        Err(e) => {
            msg!(
                "Warning: Unable to get valid price. Using default value. {}",
                e
            );
            Ok(get_default_price())
        }
    }
}

fn get_default_price() -> Price {
    Price {
        price: 69,
        exponent: 4,
        conf: 0,
        publish_time: 0,
    }
}

pub fn convert_to_lamports(amount: f32, price: Price) -> Result<u64> {
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
