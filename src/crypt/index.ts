import crypto, { Hash } from 'crypto';
import NTKUtils from '../utils';

//type NTKPacket = { [key: number]: number | Buffer | string };
class NTKCrypt {
	_utils: NTKUtils;

	constructor() {
		this._utils = new NTKUtils();
	}

	public username_hash(username: string): string {
		let temp = crypto.createHash('md5').update(username).digest('hex');
		let res = crypto.createHash('md5').update(temp).digest('hex');

		for (let i = 0; i < 31; ++i) {
			res += crypto.createHash('md5').update(res).digest('hex');
		}

		return res;
	}

	public temp_key(nonce_8: number, nonce_16: number, username_hash: string): string {
		let res = '';
		for (let i = 0; i < 9; ++i) {
			res += String.fromCharCode(username_hash.charCodeAt((i * (3 * i + nonce_8 * nonce_8) + nonce_16) % 1024));
		}
		return res;
	}

	public crypt(key: string, sequence_token: number, plaintext: number[]): number[] {
		let cipher = [];

		for (var i = 0; i < plaintext.length; ++i) {
			var c = key.charCodeAt(i % 9);
			cipher[i] = plaintext[i] ^ c;
		}

		for (var i = 0; i < plaintext.length; ++i) {
			var quotient = Math.floor(i / 9);

			if (quotient !== sequence_token) {
				cipher[i] = cipher[i] ^ quotient;
			}
		}

		for (var i = 0; i < plaintext.length; ++i) {
			cipher[i] = cipher[i] ^ sequence_token;
		}

		return cipher;
	}

	public nonce_16(): number {
		return this._utils.random() % 0xfefd + 0x100;
	}

	public nonce_8(): number {
		return ((this._utils.random() & 0xff0000) >> 16) % 0x9b + 0x64;
	}

	public md5Digest(input: crypto.BinaryLike): string | Buffer {
		let md5 = crypto.createHash('md5').update(input);
		md5.end();
		let res = md5.read();
		return res;
	}

	public preparePacket(
		action: number,
		sequence_token: number,
		cipher: number[],
		nonce_8: number,
		nonce_16: number
	): number[] {
		let packet = Buffer.concat([ new Buffer([ action, sequence_token ]), Buffer.from(cipher) ]);
		let packet_digest = this.md5Digest(packet);
		let res = [];

		res[0] = <number>packet_digest[0x0d];
		res[1] = <number>packet_digest[0x03];
		res[2] = <number>packet_digest[0x0b];
		res[3] = <number>packet_digest[0x07];
		res[4] = (nonce_16 & 0x800000ff) ^ 0x61;
		res[5] = (nonce_8 & 0x800000ff) ^ 0x025;
		res[6] = ((nonce_16 >> 8) & 0x800000ff) ^ 0x23;

		return res;
	}

	private signature(length: number, action: number, sequence_token: number): Buffer {
		return new Buffer([ 0xaa, length >> 8, length & 0xff, action, sequence_token ]);
	}

	public createPacket(cipher: number[], action: number, sequence_token: number, prep?: number[]): Buffer {
		let len = 2 + cipher.length;
		if (prep) {
			len = len += prep.length;
		}
		let sig = this.signature(len, action, sequence_token);

		if (prep) {
			return Buffer.concat([ sig, Buffer.from(cipher), Buffer.from(prep) ]);
		} else {
			return Buffer.concat([ sig, Buffer.from(cipher) ]);
		}
	}
}

let exp = new NTKCrypt();
export default exp;
