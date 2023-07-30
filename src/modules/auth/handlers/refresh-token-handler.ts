import { IHandler } from '@interfaces/controller-interface';
import { IsNotEmpty, IsString } from 'class-validator';
import { StatusCodes } from 'http-status-codes';
import { TokenHelper } from '../helpers/token-helper';
import { HttpException } from '@exceptions/http-exception';
import jwtHelper, { ITokenPayload } from '@helpers/jwt-helper';
import UserModel from '@modules/user/user-model';

export class RefreshTokenDto {
	@IsNotEmpty({ message: 'Refresh token không được để trống!' })
	@IsString({ message: 'Refresh token không hợp lệ!' })
	refreshToken: string;
}

const refreshTokenHandler: IHandler<RefreshTokenDto> = async (dto, res) => {
	const { refreshToken } = dto;

	let payload: ITokenPayload = null;
	try {
		payload = await jwtHelper.decodeToken(refreshToken);
	} catch (err) {
		throw new HttpException(StatusCodes.UNAUTHORIZED, 'Refresh token không hợp lệ hoặc đã hết hạn!');
	}

	const userId = payload._id;
	const existed = await TokenHelper.isExist(userId, refreshToken);

	// Check if refresh token is exist
	if (!existed) {
		throw new HttpException(StatusCodes.UNAUTHORIZED, 'Refresh token không tồn tại!');
	}

	// Check if user is exist
	const user = await UserModel.findById(userId).exec();

	if (!user) {
		throw new HttpException(StatusCodes.NOT_FOUND, 'Tài khoản không tồn tại!');
	}

	// Generate new token
	const tokenHelper = new TokenHelper(user);
	const accessToken = tokenHelper.getAccessToken();

	// Response
	res.status(StatusCodes.OK).json({
		message: 'Refresh token thành công!',
		accessToken,
	});
};

export default refreshTokenHandler;
