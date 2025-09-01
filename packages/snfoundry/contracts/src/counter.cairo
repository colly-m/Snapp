#[starknet::interface]
trait ICounter<T> {
    fn get_counter(self: @T) -> u32;
    fn increase_counter(ref self: T);
    fn decrease_counter(ref self: T);
    fn set_counter(ref self: T, new_value: u32);
    fn reset_counter(ref self: T);
}

#[starknet::contract]
mod CounterContract {
    use OwnableComponent::InternalTrait;
use super::ICounter;
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
    use starknet::{ContractAddress, get_caller_address, get_contract_address};
    use openzeppelin_access::ownable::OwnableComponent;
    use openzeppelin_token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    impl internalImpl = OwnableComponent::InternalImpl<ContractState>;

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
	CounterChanged: CounterChanged,
	#[flat]
	OwnableEvent: OwnableComponent::Event,
    }

    #[derive(Drop, starknet::Event)]
    struct CounterChanged {
	#[key]
	caller: ContractAddress,
	old_value: u32,
	new_value: u32,
	reason: ChangeReason,
    }

    #[derive(Drop, Copy, Serde)]
    enum ChangeReason {
	Increase,
	Decrease,
	Reset,
	Set,
    }

    #[storage]
    struct Storage {
	counter: u32,
	// owner: ContractAddress,
	#[substorage(v0)]
	ownable: OwnableComponent::Storage,
    }

    #[constructor]
    fn constructor(ref self: ContractState, init_value: u32, owner: ContractAddress) {
	self.counter.write(init_value);
	self.ownable.initializer(owner);
    }

    #[abi(embed_v0)]
    impl CounterImpl of ICounter<ContractState> {
	fn get_counter(self: @ContractState) -> u32 {
	    self.counter.read()
	}
	fn increase_counter(ref self: ContractState) {
	    let current_counter = self.counter.read();
	    let new_counter = current_counter + 1;
	    self.counter.write(new_counter);
	    let event: CounterChanged = CounterChanged {
		old_value: current_counter,
		new_value: new_counter,
		caller: get_caller_address(),
		reason: ChangeReason::Increase,
	    };
	    self.emit(event);
	}
        fn decrease_counter(ref self: ContractState) {
	    let current_counter = self.counter.read();
	    assert!(current_counter > 0, "The counter can't be negative");
            let new_counter = current_counter - 1;
            self.counter.write(new_counter);
	    let event: CounterChanged = CounterChanged {
                old_value: current_counter,
                new_value: new_counter,
                caller: get_caller_address(),
                reason: ChangeReason::Decrease,
            };
            self.emit(event);
	}

	fn set_counter(ref self: ContractState, new_value: u32) {
	    self.ownable.assert_only_owner();
	    let current_counter = self.counter.read();
	    self.counter.write(new_value);
	    let event: CounterChanged = CounterChanged {
		old_value: current_counter,
		new_value: new_value,
		caller: get_caller_address(),
		reason: ChangeReason:: Set,
	    };
	    self.emit(event);
	}

	fn reset_counter(ref self: ContractState) {
	    let payment_amount: u256 = 1000000000000000000;
	    let strk_token: ContractAddress = 0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d.try_into().unwrap();
	    let caller = get_caller_address();
	    let contract = get_contract_address();

	    let dispatcher = IERC20Dispatcher { contract_address: strk_token };

	    let balance = IERC20Dispatcher { contract_address: strk_token }.balance_of(caller);
	    assert!(balance >= payment_amount, "User doesn't have enough balance");

	    let allowance = dispatcher.allowance(caller, contract);
	    assert!(allowance >= payment_amount, "Contract is not allowed to spend anough STRK");

	    let owner = self.ownable.owner();
	    let success = dispatcher.transfer_from(caller, owner, payment_amount);
	    assert!(success, "Transfering STRK failed");

	    let current_counter = self.counter.read();
	    self.counter.write(0);

	    let event: CounterChanged = CounterChanged {
		old_value: current_counter,
		new_value: 0,
		caller: caller,
		reason: ChangeReason::Reset,
	    };
	    self.emit(event);
	}
    }
}
