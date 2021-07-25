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
	mapping (uint => Plan) public plans;
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
		emit planCreated(msg.sender, nextPlanId, block.timestamp);
		
		nextPlanId++;
	}

	// EG: 	mapping (msg.sender => mapping(planId => Subscription)) public subscriptions;
	// 0x077... => (p1 => {subscriber:0x077..., start:date, nextPayment: date})
	// Find subscription by subcriber and planId;
	function subscribe(uint planId) external {
		IERC20 token = IERC20(plans[planId].token);
		Plan storage plan = plans[planId];
		require(plan.merchant != address(0),'Plan does not exist');

		token.transferFrom(msg.sender, plan.merchant, plan.amount);
		emit paymentSent(msg.sender, plan.merchant, plan.amount, planId, block.timestamp);

		subscriptions[msg.sender][planId] = Subscription(msg.sender, block.timestamp, block.timestamp + plan.frequency);
		emit subscriptionCreated(msg.sender, planId, block.timestamp);
	}

	function cancelPlan(uint planId) external {
		Subscription storage subscription = subscriptions[msg.sender][planId];
		require(subscription.subscriber != address(0), 'Subscription does not exist');

		delete subscriptions[msg.sender][planId];
		emit subscriptionCancelled(msg.sender, planId, block.timestamp);
	}

	function pay(address subscriber, uint planId) external {
		Subscription storage subscription = subscriptions[subscriber][planId];
		Plan storage plan = plans[planId];
		IERC20 token = IERC20(plan.token);
		require(subscription.subscriber != address(0), 'Subscriber does not exist');
		require(block.timestamp > subscription.nextPayment, 'Not due yet');

		token.transferFrom(subscriber, plan.merchant, plan.amount);
		emit paymentSent(subscriber, plan.merchant, plan.amount, planId, block.timestamp);
		subscription.nextPayment = subscription.nextPayment + plan.frequency;
	}
}
