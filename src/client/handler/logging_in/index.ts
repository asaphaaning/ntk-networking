import Handler from '../';
import NTKClient from '../../../client';
import crypt from '../../../crypt';
import { ENCRYPTION_KEY, ACTIONS, STATE } from '../../../utils/constants.json';
import Packets from '../../../net/packets';

export default class LoggingInHandler extends Handler {
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
		this.sendPacket(Packets.getLogin(extra.username, extra.password, sequence_token), send);
		incToken();
		this.setState(state, STATE.LOGIN_RESP);

		return 'LoggingInHandler';
	}
}
