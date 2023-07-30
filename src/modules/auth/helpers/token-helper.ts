import { redisClient } from '@databases/redis-db';
import jwtHelper, { ITokenPayload } from '@helpers/jwt-helper';
import IUser from '@modules/user/user-interface';
import UserModel from '@modules/user/user-model';

export class TokenHelper {
	private _user: IUser;
	private _payload: ITokenPayload;

	constructor(user: IUser) {
		this._user = user;

		this._payload = {
			_id: user._id,
			name: user.name,
			email: user.email.value,
		};
	}

	public getPayload() {
		return this._payload;
	}

	static async fromAccessToken(accessToken: string) {
		const payload = await jwtHelper.decodeToken(accessToken);

		const user = await UserModel.findById(payload._id).exec();

		if (!user) {
			return null;
		}

		return new TokenHelper(user);
	}

	static isExist(userId: string, refreshToken: string) {
		const rfTokenKey = TokenHelper._getRFTokenKey(userId, refreshToken);
		return redisClient.exists(rfTokenKey);
	}

	public getToken() {
		const { accessToken, refreshToken } = jwtHelper.generateToken(this._payload);

		// Save refresh token (later)
		this._saveRefreshToken(refreshToken);

		return { accessToken, refreshToken };
	}

	public getAccessToken() {
		const accessToken = jwtHelper.generateAccessToken(this._payload);
		return accessToken;
	}

	private async _saveRefreshToken(refreshToken: string) {
		const rfTokenKey = TokenHelper._getRFTokenKey(this._user._id, refreshToken);
		const refreshTokens = [...this._user.refreshTokens, refreshToken];

		return Promise.all([
			// Save refresh token to redis
			redisClient.set(rfTokenKey, refreshToken),
			// Save refresh token to user
			UserModel.findByIdAndUpdate(this._user._id, { refreshTokens }).exec(),
		]);
	}

	public async deleteRefreshToken(refreshToken: string) {
		const rfTokenKey = TokenHelper._getRFTokenKey(this._user._id, refreshToken);
		const refreshTokens = this._user.refreshTokens.filter((token) => token !== refreshToken);

		return Promise.all([
			// Delete refresh token from redis
			redisClient.del(rfTokenKey),
			// Delete refresh token from user
			UserModel.findByIdAndUpdate(this._user._id, { refreshTokens }).exec(),
		]);
	}

	public async deleteAllRefreshTokens() {
		const refreshTokens = this._user.refreshTokens;
		const rfTokenKeys = refreshTokens.map((token) => TokenHelper._getRFTokenKey(this._user._id, token));

		return Promise.all([
			// Delete refresh tokens from redis
			...rfTokenKeys.map((rfTokenKey) => redisClient.del(rfTokenKey)),
			// Delete refresh tokens from user
			UserModel.findByIdAndUpdate(this._user._id, { refreshTokens: [] }).exec(),
		]);
	}

	private static _getRFTokenKey(userId: string, refreshToken: string) {
		return `refresh-token:${userId}:${refreshToken}`;
	}
}
