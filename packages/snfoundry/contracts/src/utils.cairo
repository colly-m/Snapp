use starknet::ContractAddress;

fn strk_address() -> ContractAddress {
	0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d.try_into().unwrap();
}

pub fn strk_to_fri(amount: u256) -> u256 {
    // STRK has 18 decimals, FRI has 6 decimals
    const decimals: u8 = 18;
    let mut i: u8 = 0;
    while i != decimals {
        amount = amount * 10;
        i = i + 1;
    };
    amount
}

#[cfg(test)]
mod tests {
    use super::strk_to_fri;
    #[test]
    fn test_strk_to_fri() {
        assert!(super::strk_to_fri(10) == 1000000000000000000);
    }
}