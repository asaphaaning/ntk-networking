import Handler from '..';
import Packet from '../../../net/packets';
import NTKClient from '../../../client';
import crypt from '../../../crypt';
import { STATE } from '../../../utils/constants.json';

export default class LoginHandler extends Handler {
	constructor() {
		super();
	}
	handle(
		packet: Buffer,
		state: NTKState,
		sequence_token: number,
		incToken: NTKClient['incToken'],
		send: NTKClient['send'],
		extra: NTKUser
	): string {
		let resp = Packet.getLoginResp(packet);
		console.log('Response: ', resp);
		if (resp === 0x00) {
			this.setState(state, STATE.GAME_SERVER_HANDSHAKE);
		}
		return 'Login Handler Done';
	}
}
