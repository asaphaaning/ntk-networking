import { STATE } from '../../../utils/constants.json';
import Handler from '../';
import NTKClient from '../../index.js';
import ipInt from 'ip-to-int';
import NTKSocket from '../../../net';

import Packet from '../../../net/packets';

export default class GameServerHandler extends Handler {
	closeConnection: NTKClient['closeConnection'];
	resetToken: NTKClient['resetToken'];
	changeConnection: NTKClient['changeConnection'];

	constructor(
		closeConnection: NTKClient['closeConnection'],
		resetToken: NTKClient['resetToken'],
		changeConnection: NTKClient['changeConnection']
	) {
		super();
		this.resetToken = resetToken;
		this.changeConnection = changeConnection;
		this.closeConnection = closeConnection;
	}
	public handle(
		packet: Buffer,
		state: NTKState,
		sequence_token: number,
		incToken: NTKClient['incToken'],
		send: NTKClient['send'],
		extra: NTKUser
	) {
		let ip = packet.readUInt32LE(4); // Little endian?
		let port = packet.readUInt16BE(8);

		let key_length = packet.readUInt16BE(0x0b);
		let key = packet.toString('ascii', 0x0d, 0x0d + key_length);

		let username_length = packet.readUInt8(key_length + 0x0d);
		let username = packet.toString('ascii', key_length + 0x0e, key_length + 0x0e + username_length);

		let session_ip = packet.readUInt32BE(key_length + 0x0e + username_length);

		let packet_new = Packet.getGameServerHandshake(key_length, key, username_length, username, session_ip);

		this.resetToken();
		this.setState(state, STATE.SESSION);

		this.changeConnection(ipInt(ip).toIP(), port);

		this.sendPacket(packet_new, send);

		return 'HandshakeHandler';
	}
}
