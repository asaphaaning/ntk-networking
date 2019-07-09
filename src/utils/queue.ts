export default class Queue {
	data: number[];

	constructor() {
		this.data = [];
	}

	public isEmpty() {
		return this.data.length == 0;
	}

	public enqueue(object: any) {
		this.data.push(object);
	}

	public dequeue(): any {
		return this.data.shift();
	}

	public peek() {
		return this.data[0];
	}

	public clear() {
		this.data = [];
	}
}
