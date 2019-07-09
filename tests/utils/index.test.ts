import NTKUtils from '../../src/utils';

describe('util', function() {
	it('random', function() {
		let util = new NTKUtils();
		let result = util.random();
		expect(result).toBeGreaterThanOrEqual(0);
		expect(result).toBeLessThanOrEqual(Math.pow(2, 32) - 1);
	});
});
