import crypt from '../../src/crypt';

describe('crypt', () => {
	it('crypt', function() {
		let key = 'frederikh';
		let seq_tok = 0x7b;
		let test = [ 0xaa, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08 ];
		let result = crypt.crypt(key, seq_tok, test);
		expect(result).toEqual([ 183, 8, 28, 28, 26, 12, 20, 23, 27 ]);
	});

	it('prep', () => {
		let result = crypt.preparePacket(0x11, 0xaa, [ 183, 8, 28, 28, 26, 12, 20, 23, 27 ], 0x600, 0x6000);
		expect(result).toEqual([ 0xe1, 0x46, 0x63, 0x38, 0x61, 0x25, 0x43 ]);
	});

	it('nonce_16', () => {
		for (var i = 0; i < 1000; i++) {
			// Is there a better way to test this?
			let result = crypt.nonce_16();
			expect(result).toBeLessThanOrEqual(Math.pow(2, 16) - 1);
		}
	});

	it('nonce_8', () => {
		for (var i = 0; i < 1000; i++) {
			// Is there a better way to test this?
			let result = crypt.nonce_8();
			expect(result).toBeLessThanOrEqual(Math.pow(2, 8) - 1);
		}
	});

	it('username_hash', () => {
		let result = crypt.username_hash('testuser');
		expect(result).toEqual(
			'85f0fb9cc2792a9b87e3b3facccedc404259ad350f0edcc3d466ff24a8a99da5b2f65943c836470701f233e180966d8aa3eff3f4dc6fbd4d9e3ae549c680fa8eb8ef90750fe62d88cb84dd653625f10a1f1b53efa5fde235b4c858227dd8acece4c5b738f0fc769140384d06ca0a04a1dd211cf4a036327dc748c18323530b52260c4f4001d2efa5a9a3fa255a16b38039ce58d39db610801de16f89f0785e6fe13f21c2a62be1208603202f960fb90f83b6a0f06f56982e6c1e8cb163a4d3c24cbb8280b65855bf0f65048120e6f2b4839a3898a6c08954a413ab5ff4d7093f40c12f9acad6d49ec9822e9433744ada1a9caec826f4f5cb93cde5476b19c8fd79668af45553d6df0239d76c3b9c774985a237b4ba241ede12a28326fc93818f77aaaeca75e2f297e5df56dcc1fe34a1e1ada3a20e3ebd1718af5602f074151bd8b9c228b56489a76fb1ca83a061aa6f45509dccdee1f3b13f204bd91b1c3eb4aeb8c4236d2f995388d11af31514f159bea4cc5f16620b4dffe6f5d8d93c34813cb71ec9c2c1ff4d735545c0b8c3ded24736ab0a5d86819d239e630c8350ea953272470f504eb35873eb3a5cdc322fe62d9acd4bf425c98359154595594c5c51f7b08f37364b94939c8ab2998d45aaa2ac069ada69857e772a75d6ce26986b41f17b96b46d6b4e3610035ca101e536ef2254daa1e370b2e17205d5711d8f21d1'
		);
	});

	it('complete_routine', () => {
		let hash = crypt.username_hash('testuser');
		let nonce_8 = 200;
		let nonce_16 = 50000;
		let seq_tok = 0x0e;
		let action = 0x13;

		let packet_pre = [ 0x00, 0x00, 0x00, action ];

		let key = crypt.temp_key(nonce_8, nonce_16, hash);
		let cipher = crypt.crypt(key, seq_tok, packet_pre);
		let tail = crypt.preparePacket(action, seq_tok, cipher, nonce_8, nonce_16);
		let packet = crypt.createPacket(cipher, action, seq_tok, tail);

		let expected = Buffer.from([
			0xaa,
			0x00,
			0x0d,
			0x13,
			0x0e,
			0x39,
			0x6f,
			0x3d,
			0x78,
			0x89,
			0x88,
			0x37,
			0x3c,
			0x31,
			0xed,
			0xe0
		]);

		expect(packet).toEqual(expected);
	});
});
