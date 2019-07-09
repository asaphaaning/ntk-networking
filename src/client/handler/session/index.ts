import { STATE } from '../../../utils/constants.json';
import Handler from '../';
import NTKClient from '../../index.js';
import Packet from '../../../net/packets';
import NTKUtils from '../../../utils';

export default class SessionHandler extends Handler {
	utils: NTKUtils;
	constructor() {
		super();
		this.utils = new NTKUtils();
	}
	handle(
		packet: Buffer,
		state: NTKState,
		sequence_token: number,
		incToken: NTKClient['incToken'],
		send: NTKClient['send'],
		extra: NTKUser
	) {
		this.sendPacket(Packet.look(this.utils.randomInt(0, 3), extra.username, sequence_token), send);
		incToken();

		return 'SessionHandler';
	}
}
