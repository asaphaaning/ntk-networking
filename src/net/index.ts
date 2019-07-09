import * as net from 'net';
import constants from '../utils/constants.json';
import { EventEmitter } from 'events';

interface NTKSocket {
	on(event: 'connected', listener: () => void): this;
	on(event: 'data', listener: (data: Buffer) => void): this;
	send(data: Buffer): void;
}

class NTKSocket extends EventEmitter {
	private socket: net.Socket;

	constructor() {
		super();
		this.socket = new net.Socket();
	}

	init() {
		this.socket.connect(constants.NTK_PORT, constants.NTK_IP, () => {
			console.log('Connecting to server..');
		});

		this.socket.on('data', (data) => {
			this.emit('data', data);
		});

		this.socket.on('connect', () => {
			this.emit('connected');
		});

		this.socket.on('error', (e) => {
			console.log(e);
		});
	}

	send(data?: Buffer): void {
		this.socket.write(data, 'binary');
	}

	close() {
		this.socket.removeAllListeners();
		this.socket.end();
	}

	async connect(ip: string, port: number) {
		this.socket.connect(port, ip);

		this.socket.on('data', (data) => {
			this.emit('data', data);
		});

		this.socket.on('connect', () => {
			this.emit('connected');
		});

		this.socket.on('error', (e) => {
			console.log(e);
		});
	}
}

export default NTKSocket;
