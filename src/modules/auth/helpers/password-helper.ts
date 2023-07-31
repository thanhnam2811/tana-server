import authConfig from '@configs/auth-config';
import bcrypt from 'bcrypt';

export class PasswordHelper {
	// Properties
	private saltRounds: number;
	private additionalStr: string;

	// Constructor
	constructor() {
		this.saltRounds = authConfig.PASS_SALT;
		this.additionalStr = authConfig.PASS_EXT;
	}

	private prepare(plain: string): string {
		// Add additional string to password
		const password = plain + this.additionalStr;

		return password;
	}

	// Methods
	public async hash(plain: string): Promise<string> {
		const password = this.prepare(plain);

		// Hash password
		const salt = await bcrypt.genSalt(this.saltRounds);

		return bcrypt.hash(password, salt);
	}

	public compare(plain: string, hash: string): Promise<boolean> {
		const password = this.prepare(plain);

		return bcrypt.compare(password, hash);
	}
}
