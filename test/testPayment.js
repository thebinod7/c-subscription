const { assert, AssertionError } = require('chai');

const Payment = artifacts.require('Payment');
const Token = artifacts.require('MyToken');

const SECONDS_IN_DAY = 86400;
const getSeconds = days => {
	return days * SECONDS_IN_DAY;
};

const THIRTY_DAYS = getSeconds(30);
const SIXTY_DAYS = getSeconds(60);
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

require('chai').use(require('chai-as-promised')).should();

contract('Payment', addresses => {
	const [admin, merchant, subscriber, _] = addresses;

	let payment, token;
	console.log('merchant==>', merchant);
	console.log('subscriber==>', subscriber);

	before(async () => {
		payment = await Payment.new();
		token = await Token.new();
		await token.transfer(subscriber, 1000);
		await token.approve(payment.address, 1000, { from: subscriber });
	});
	// Test Deployment
	describe('deployment', async () => {
		it('deploys successfully', async () => {
			const address = await payment.address;
			assert.notEqual(address, 0x0);
			assert.notEqual(address, '');
			assert.notEqual(address, null);
			assert.notEqual(address, undefined);
		});

		it('should create a plan', async () => {
			// Plan executable in THIRTY_DAYS
			await payment.createPlan(token.address, 100, THIRTY_DAYS, { from: merchant });
			const plan1 = await payment.plans(0);
			assert(plan1.token === token.address);
			assert(plan1.amount.toString() === '100');
			assert(plan1.frequency.toString() === THIRTY_DAYS.toString());

			// Plan executable in SIXTY_DAYS
			await payment.createPlan(token.address, 200, SIXTY_DAYS, { from: merchant });
			const plan2 = await payment.plans(1);
			assert(plan2.token === token.address);
			assert(plan2.amount.toString() === '200');
			assert(plan2.frequency.toString() === SIXTY_DAYS.toString());
		});

		// it('should NOT create a plan', async () => {
		// 	await assert(payment.createPlan(ZERO_ADDRESS, 100, THIRTY_DAYS, { from: merchant }), 'Address cannot be null');
		// 	await assert(
		// 		payment.createPlan(token.address, 0, THIRTY_DAYS, { from: merchant }),
		// 		'Amount must be greater than zero'
		// 	);
		// 	await assert(
		// 		payment.createPlan(token.address, 100, 0, { from: merchant }),
		// 		'Frequencry must be greater than zero'
		// 	);
		// });

		it('should create a subscription', async () => {
			await payment.createPlan(token.address, 100, THIRTY_DAYS, { from: merchant });
			await payment.subscribe(0, { from: subscriber });
			const block = await web3.eth.getBlock('latest');
			const subscription = await payment.subscriptions(subscriber, 0);
			assert(subscription.subscriber === subscriber);
			assert(subscription.start.toString() === block.timestamp.toString());
			//assert(subscription.nextPayment.toString() === (block.timestamp + SECONDS_IN_DAY * THIRTY_DAYS).toString());
		});

		it('should subscribe and pay', async () => {
			let balanceMerchant, balanceSubscriber;
			await payment.createPlan(token.address, 100, THIRTY_DAYS, { from: merchant });

			await payment.subscribe(0, { from: subscriber });
			balanceMerchant = await token.balanceOf(merchant);
			balanceSubscriber = await token.balanceOf(subscriber);
			assert(balanceMerchant.toString() === '200');
			assert(balanceSubscriber.toString() === '800');

			// await time.increase(THIRTY_DAYS + 1);
			// await payment.pay(subscriber, 0);
			// balanceMerchant = await token.balanceOf(merchant);
			// balanceSubscriber = await token.balanceOf(subscriber);
			// assert(balanceMerchant.toString() === '200');
			// assert(balanceSubscriber.toString() === '800');

			// await time.increase(THIRTY_DAYS + 1);
			// await payment.pay(subscriber, 0);
			// balanceMerchant = await token.balanceOf(merchant);
			// balanceSubscriber = await token.balanceOf(subscriber);
			// assert(balanceMerchant.toString() === '300');
			// assert(balanceSubscriber.toString() === '700');
		});

		it('should cancel subscription', async () => {
			await payment.createPlan(token.address, 100, THIRTY_DAYS, { from: merchant });
			await payment.subscribe(0, { from: subscriber });
			await payment.cancelPlan(0, { from: subscriber });
			const subscription = await payment.subscriptions(subscriber, 0);
			assert(subscription.subscriber === ZERO_ADDRESS);
		});

		it('should NOT cancel subscription', async () => {
			await AssertionError(payment.cancelPlan(0, { from: subscriber }), 'Subscription does not exist');
		});
	});
});
