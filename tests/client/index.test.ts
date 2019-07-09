import NTKClient from '../../src/client';
describe('client ', () => {
	it('increment sequence token', () => {
		let client = new NTKClient('testuser');
		let seq_tok_old = client.sequence_token;
		client.incToken();
		let seq_tok_new = client.sequence_token;
		expect(seq_tok_new).toEqual(++seq_tok_old);
	});
});
