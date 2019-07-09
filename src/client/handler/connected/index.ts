import { STATE } from '../../../utils/constants.json';
import Handler from '../';
import NTKClient from '../../index.js';

import Packet from '../../../net/packets';

export default class ConnectedHandler extends Handler {
	constructor() {
		super();
	}
	handle(
		packet: Buffer,
		state: NTKState,
		sequence_token: number,
		incToken: NTKClient['incToken'],
		send: NTKClient['send']
	): string {
		// Decode this packet and determine what to send
		this.sendPacket(Packet.getKru(sequence_token), send);
		incToken();
		this.sendPacket(Packet.getVersion(), send);
		incToken();

		this.setState(state, STATE.LOGGING_IN);

		return 'ConnectedHandler';
	}
}
