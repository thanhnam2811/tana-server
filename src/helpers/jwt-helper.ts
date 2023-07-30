import authConfig from '@configs/auth-config';
import { redisClient } from '@databases/redis-db';
import IUser from '@modules/user/user-interface';
import UserModel from '@modules/user/user-model';
import jwt from 'jsonwebtoken';

export interface ITokenPayload {
	_id: string;
	name: string;
	email: string;
}

export class JwtHelper {
	// Properties
	private user: IUser;
	private payload: ITokenPayload;

	// Constructor
	constructor(user: IUser) {
		this.user = user;

		this.payload = {
			_id: user._id,
			name: user.name,
			email: user.email.value,
		};
	}

	// Static methods
	public static decodeToken(token: string): Promise<ITokenPayload> {
		return new Promise((resolve, reject) => {
			jwt.verify(token, authConfig.JWT_SECRET, (err, decoded) => {
				if (err) {
					return reject(err);
				}

				return resolve(decoded as ITokenPayload);
			});
		});
	}

	private static getRFTokenKey(userId: string, refreshToken: string) {
		return `refresh-token:${userId}:${refreshToken}`;
	}

	public static async isRFTokenExist(userId: string, refreshToken: string): Promise<boolean> {
		const rfTokenKey = JwtHelper.getRFTokenKey(userId, refreshToken);
		const existed = await redisClient.exists(rfTokenKey);

		return existed === 1;
	}

	// Methods
	public generateToken(): { accessToken: string; refreshToken: string } {
		const accessToken = this.generateAccessToken();
		const refreshToken = this.generateRefreshToken();

		return { accessToken, refreshToken };
	}

	public generateAccessToken(): string {
		return jwt.sign(this.payload, authConfig.JWT_SECRET, { expiresIn: authConfig.AT_EXPIRES_IN });
	}

	public generateRefreshToken(save: boolean = true): string {
		const refreshToken = jwt.sign(this.payload, authConfig.JWT_SECRET, { expiresIn: authConfig.RT_EXPIRES_IN });

		// Save refresh token (later)
		if (save) this.saveRefreshToken(refreshToken);

		return refreshToken;
	}

	private async saveRefreshToken(refreshToken: string) {
		const rfTokenKey = JwtHelper.getRFTokenKey(this.user._id, refreshToken);
		const refreshTokens = [...this.user.refreshTokens, refreshToken];

		return Promise.all([
			// Save refresh token to redis
			redisClient.set(rfTokenKey, refreshToken),
			// Save refresh token to user
			UserModel.findByIdAndUpdate(this.user._id, { refreshTokens }).exec(),
		]);
	}

	public async deleteRefreshToken(refreshToken: string) {
		const rfTokenKey = JwtHelper.getRFTokenKey(this.user._id, refreshToken);
		const refreshTokens = this.user.refreshTokens.filter((token) => token !== refreshToken);

		return Promise.all([
			// Delete refresh token from redis
			redisClient.del(rfTokenKey),
			// Delete refresh token from user
			UserModel.findByIdAndUpdate(this.user._id, { refreshTokens }).exec(),
		]);
	}

	public async deleteAllRefreshTokens() {
		const refreshTokens = this.user.refreshTokens;
		const rfTokenKeys = refreshTokens.map((token) => JwtHelper.getRFTokenKey(this.user._id, token));

		return Promise.all([
			// Delete refresh tokens from redis
			...rfTokenKeys.map((rfTokenKey) => redisClient.del(rfTokenKey)),
			// Delete refresh tokens from user
			UserModel.findByIdAndUpdate(this.user._id, { refreshTokens: [] }).exec(),
		]);
	}
}
