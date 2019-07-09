import NTKSocket from '../../net';
import NTKClient from '..';

export default abstract class Handler {
	constructor() {}
	abstract handle(
		packet: Buffer,
		state: Object,
		sequence_token: number,
		incToken: NTKClient['incToken'],
		send: NTKClient['send'],
		extra?: NTKUser
	): string | Buffer;

	setState(state_cur: NTKState, state_new: string): void {
		state_cur.current = state_new;
	}

	sendPacket(packet: Buffer, send: NTKSocket['send']): void {
		send(packet);
	}
}
