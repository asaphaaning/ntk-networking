export default class NTKUtils {
	constructor() {}
	public random(): number {
		return this.rand_aux(0, Math.pow(2, 32) - 1); // Random number in the 32-bit unsigned range.
	}
	private rand_aux(low: number, high: number): number {
		return Math.floor(Math.random() * (high - low + 1)) + low;
	}
	public randomInt(low: number, high: number) {
		return Math.floor(Math.random() * (high - low) + low);
	}
}
