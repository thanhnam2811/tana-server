import authConfig from '@configs/auth-config';
import bcrypt from 'bcrypt';

class PasswordHelper {
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

	// Methods
	public async hash(plain: string): Promise<string> {
		// Add additional string to password
		const password = plain + this._additionalStr;

		// Hash password
		const salt = await bcrypt.genSalt(this._saltRounds);

		return bcrypt.hash(password, salt);
	}

	public async compare(plain: string, hash: string): Promise<boolean> {
		// Add additional string to password
		const password = plain + this._additionalStr;

		return bcrypt.compare(password, hash);
	}
}

const passwordHelper = PasswordHelper.instance;
export default passwordHelper;
