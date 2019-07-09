import Packets from '../../src/net/packets';

describe('packets', () => {
	it('kru', function() {
		let result = Packets.getKru(0);
		expect(result).toHaveLength(17);
		expect(result).toContainEqual(0xaa);
	});
});
