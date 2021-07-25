const { assert } = require('chai');

const Payment = artifacts.require('Payment');

require('chai').use(require('chai-as-promised')).should();

contract('Payment', ([deployer, secondAcc]) => {
	let payment;
	console.log('deployer==>', deployer);
	console.log('2nd acc==>', secondAcc);

	before(async () => {
		payment = await Payment.deployed();
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
	});
});
