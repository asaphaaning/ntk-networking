import { ENCRYPTION_KEY, ACTIONS, VERSION } from '../../utils/constants.json';

import crypt from '../../crypt';

class NTKPacket {
	constructor() {}
	public getKru(sequence_token: number): Buffer {
		let plaintext = [ 0x61, 0x72, 0x61, 0x6d, 0x00 ];
		let nonce_8 = crypt.nonce_8();
		let nonce_16 = crypt.nonce_16();
		let cipher = crypt.crypt(ENCRYPTION_KEY, sequence_token, plaintext);
		let prep = crypt.preparePacket(ACTIONS.KRU, sequence_token, cipher, nonce_8, nonce_16);
		let packet = crypt.createPacket(cipher, ACTIONS.KRU, sequence_token, prep);
		return packet;
	}
	public getVersion(): Buffer {
		let plaintext = [ VERSION & 0xff, 0xc5, 0x00, 0x00, 0x01, 0x00 ];
		let packet = crypt.createPacket(plaintext, ACTIONS.VERSION, VERSION >> 8);
		return packet;
	}
	public getLogin(username: string, password: string, sequence_token: number): Buffer {
		let username_arr: number[] = [];
		let password_arr: number[] = [];

		let nonce_8 = crypt.nonce_8();
		let nonce_16 = crypt.nonce_16();

		[ ...username ].forEach((l, i) => {
			username_arr[i] = username.charCodeAt(i);
		});
		[ ...password ].forEach((l, i) => {
			password_arr[i] = password.charCodeAt(i);
		});

		let plaintext = [ username.length ];

		plaintext = plaintext.concat(username_arr);
		plaintext.push(password.length);
		plaintext = plaintext.concat(password_arr);
		plaintext = plaintext.concat([ 0xf3, 0x1c, 0x27, 0x56, 0x00 ]);

		let cipher = crypt.crypt(ENCRYPTION_KEY, sequence_token, plaintext);
		let prep = crypt.preparePacket(ACTIONS.LOGIN, sequence_token, cipher, nonce_8, nonce_16);
		let packet = crypt.createPacket(cipher, ACTIONS.LOGIN, sequence_token, prep);

		return packet;
	}
	public getLoginResp(packet: Buffer): number {
		let seq_tok_server = packet.readUInt8(4);
		let cipher = packet.slice(5, packet.length - 3);
		let plaintext = crypt.crypt(ENCRYPTION_KEY, seq_tok_server, [ ...cipher ]);

		return plaintext[0];
	}
	public getGameServerHandshake(
		key_length: number,
		key: string,
		username_length: number,
		username: string,
		session_ip: number
	) {
		let username_arr: number[] = [];
		let key_arr: number[] = [];

		let plaintext = [ key_length & 0xff ];

		[ ...username ].forEach((l, i) => {
			username_arr[i] = username.charCodeAt(i);
		});

		[ ...key ].forEach((l, i) => {
			key_arr[i] = key.charCodeAt(i);
		});

		plaintext = plaintext.concat(key_arr);
		plaintext.push(username_length);
		plaintext = plaintext.concat(username_arr);
		plaintext.push(session_ip >> 24);
		plaintext.push((session_ip >> 16) & 0xff);
		plaintext.push((session_ip >> 8) & 0xff);
		plaintext.push(session_ip & 0xff);
		plaintext.push(1);
		plaintext.push(0);

		return crypt.createPacket(plaintext, ACTIONS.GAME_SERVER_CONNECT, key_length >> 8);
	}

	look(direction: number, username: string, sequence_token: number) {
		let nonce_8 = crypt.nonce_8();
		let nonce_16 = crypt.nonce_16();
		let action = 0x11;

		let plaintext = [ direction, 0x00, 0x00, action ]; // Action signature for a look event

		let key = crypt.temp_key(nonce_8, nonce_16, crypt.username_hash(username));
		let cipher = crypt.crypt(key, sequence_token, plaintext);
		let metadata = crypt.preparePacket(action, sequence_token, cipher, nonce_8, nonce_16);
		return crypt.createPacket(cipher, action, sequence_token, metadata);
	}
}

const Packets = new NTKPacket();
export default Packets;
