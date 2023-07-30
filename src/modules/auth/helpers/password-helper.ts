import authConfig from '@configs/auth-config';
import bcrypt from 'bcrypt';

export class PasswordHelper {
	// Singleton
	private static _instance: PasswordHelper;
	public static get instance(): PasswordHelper {
		if (!PasswordHelper._instance) {
			PasswordHelper._instance = new PasswordHelper();
		}

		return PasswordHelper._instance;
	}

	// Properties
	private _saltRounds: number;
	private _additionalStr: string;

	// Constructor
	private constructor() {
		this._saltRounds = authConfig.PASS_SALT;
		this._additionalStr = authConfig.PASS_EXT;
	}

	private _prepare(plain: string): string {
		// Add additional string to password
		const password = plain + this._additionalStr;

		return password;
	}

	// Methods
	public async hash(plain: string): Promise<string> {
		const password = this._prepare(plain);

		// Hash password
		const salt = await bcrypt.genSalt(this._saltRounds);

		return bcrypt.hash(password, salt);
	}

	public compare(plain: string, hash: string): Promise<boolean> {
		const password = this._prepare(plain);

		return bcrypt.compare(password, hash);
	}
}

const passwordHelper = PasswordHelper.instance;
export default passwordHelper;
