import authConfig from '@configs/auth-config';
import jwt from 'jsonwebtoken';

export class JwtHelper {
	// Singleton
	private static _instance: JwtHelper;
	public static get instance(): JwtHelper {
		if (!JwtHelper._instance) {
			JwtHelper._instance = new JwtHelper();
		}

		return JwtHelper._instance;
	}

	// Properties
	private _secret: string;
	private _atExpiresIn: string;
	private _rtExpiresIn: string;

	// Constructor
	private constructor() {
		this._secret = authConfig.JWT_SECRET;
		this._atExpiresIn = authConfig.AT_EXPIRES_IN;
		this._rtExpiresIn = authConfig.RT_EXPIRES_IN;
	}

	// Methods
	public generateAccessToken(payload: object): string {
		return jwt.sign(payload, this._secret, { expiresIn: this._atExpiresIn });
	}

	public generateRefreshToken(payload: object): string {
		return jwt.sign(payload, this._secret, { expiresIn: this._rtExpiresIn });
	}

	public decodeToken(token: string): Promise<unknown> {
		return new Promise((resolve, reject) => {
			jwt.verify(token, this._secret, (err, decoded) => {
				if (err) {
					return reject(err);
				}

				return resolve(decoded);
			});
		});
	}
}

const jwtHelper = JwtHelper.instance;
export default jwtHelper;
