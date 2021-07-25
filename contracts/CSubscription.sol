// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract Payment {
	uint public nextPlanId;

	struct Plan {
		address merchant;
		address token;
		uint amount;
		uint frequency;
	}

	struct Subscription {
		address subscriber;
		uint start;
		uint nextPayment;
	}
	mapping (uint => Plan) plans;
	mapping (address => mapping(uint => Subscription)) public subscriptions;

	// ===EVENTS===
	event planCreated(
		address merchant,
		uint planId,
		uint date
	);

	event subscriptionCreated(
		address subscriber,
		uint planId,
		uint date
	);

	event subscriptionCancelled(
		address subscriber,
		uint planId,
		uint date
	);

	event paymentSent(
		address from,
		address to,
		uint amount,
		uint planId,
		uint date
	);

	// external functions can only be invoked from outside the contract.
	function createPlan(address token, uint amount, uint frequency) external {
		require(token != address(0), 'Address cannot be null');
		require(amount > 0, 'Amount must be greater than zero');
		require(frequency > 0, 'Frequencry must be greater than zero');
		plans[nextPlanId] = Plan(msg.sender, token, amount, frequency);
		nextPlanId++;
	}

	function subscribe(uint planId) external {

	}
}