import NTKSocket from '../net';
import crypt from '../crypt';
import constants, { STATE } from '../utils/constants.json';
import Queue from '../utils/queue';
import pEvent from 'p-event';
import { Emitter } from 'p-event';

import Handler from './handler';
import ConnectedHandler from './handler/connected';
import LoggingInHandler from './handler/logging_in';
import LoginHandler from './handler/login';
import GameServerHandler from './handler/handshake';
import SessionHandler from './handler/session';

export default class NTKClient {
	username: string;
	password: string;
	username_hash: string;
	socket: NTKSocket;
	session_socket: NTKSocket;
	state: NTKState;
	fifo: Queue;
	handler: Map<Object, Handler>;
	sequence_token: number;

	constructor(username: string, password: string) {
		this.socket = new NTKSocket();
		this.session_socket = new NTKSocket();
		this.state = { current: STATE.INITIAL };
		this.fifo = new Queue();
		this.handler = new Map<Object, Handler>();
		this.sequence_token = 0;
		this.username = username;
		this.password = password;
		this.username_hash = crypt.username_hash(username);

		this.handler.set(STATE.CONNECTED, new ConnectedHandler());
		this.handler.set(STATE.LOGGING_IN, new LoggingInHandler());
		this.handler.set(STATE.LOGIN_RESP, new LoginHandler());
		this.handler.set(
			STATE.GAME_SERVER_HANDSHAKE,
			new GameServerHandler(
				this.closeConnection.bind(this),
				this.resetToken.bind(this),
				this.changeConnection.bind(this)
			)
		);
		this.handler.set(STATE.SESSION, new SessionHandler());
	}

	init() {
		this.socket.init();

		this.socket.on('connected', () => {
			this.state.current = STATE.CONNECTED;
			console.log('Socket connected. State: ' + this.state.current);
		});

		this.socket.on('data', (data) => {
			// console.log(data);
			let i = 0;
			while (i < data.length) {
				let packet_len = data.readUInt16BE(i + 1);
				// console.log('packet_length', packet_len);
				let payload = data.slice(i, i + packet_len + 3);
				// console.log('payload', payload);
				this.fifo.enqueue(payload);
				this.recv();

				i += packet_len + 3;
			}
		});
	}

	recv(): void {
		let packet = <Buffer>this.fifo.dequeue();
		console.log('recv: ', packet);

		this.decode(packet);
	}

	decode(packet: Buffer): void {
		console.log('State: ', this.state);
		let handler = <Handler>this.handler.get(this.state.current);

		console.log(
			handler.handle(packet, this.state, this.sequence_token, this.incToken.bind(this), this.send.bind(this), {
				username: this.username,
				password: this.password
			})
		);
	}

	incToken() {
		this.sequence_token = (this.sequence_token + 1) % Math.pow(2, 8);
	}

	resetToken() {
		this.sequence_token = 0;
	}

	send(packet: Buffer): void {
		this.socket.send(packet);
	}

	changeConnection(ip: string, port: number) {
		this.closeConnection();
		this.socket = this.session_socket;
		this.socket.connect(ip, port);

		this.socket.on('data', (data) => {
			// console.log(data);
			let i = 0;
			while (i < data.length) {
				let packet_len = data.readUInt16BE(i + 1);
				// console.log('packet_length', packet_len);
				let payload = data.slice(i, i + packet_len + 3);
				// console.log('payload', payload);
				this.fifo.enqueue(payload);
				this.recv();

				i += packet_len + 3;
			}
		});
	}

	closeConnection(): void {
		this.socket.removeAllListeners();
		this.socket.close();
	}
}
