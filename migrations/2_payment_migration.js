const Contract = artifacts.require('Payment');

module.exports = function (deployer) {
	deployer.deploy(Contract);
};
