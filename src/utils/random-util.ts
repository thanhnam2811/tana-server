const UPPERCASELETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASELETTERS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';

const randomUtil = {
	/**
	 * Get random int between min and max
	 * @param min min value
	 * @param max max value
	 * @returns random number between min and max
	 */
	getRandomInt: (min: number, max: number) => {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},

	/**
	 * Get random string with length
	 * @param length length of string
	 * @param options options
	 * @returns random string with length
	 */
	getRandomString: (
		length: number,
		options?: {
			upperCase?: boolean;
			lowerCase?: boolean;
			numbers?: boolean;
		},
	) => {
		options ??= {
			upperCase: true,
			lowerCase: true,
			numbers: true,
		};

		const charactersArr = [];
		if (options?.upperCase) {
			charactersArr.push(UPPERCASELETTERS);
		}
		if (options?.lowerCase) {
			charactersArr.push(LOWERCASELETTERS);
		}
		if (options?.numbers) {
			charactersArr.push(NUMBERS);
		}

		const characters = charactersArr.join('');
		if (!characters) {
			throw new Error('No characters to generate random string!');
		}

		const charactersLength = characters.length;
		let result = '',
			index = 0;
		for (let i = 0; i < length; i++) {
			index = randomUtil.getRandomInt(0, charactersLength - 1);
			result += characters.charAt(index);
		}

		return result;
	},
};

export default randomUtil;
