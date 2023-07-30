import { IHandler } from '@interfaces/controller-interface';
import { IsNotEmpty, IsString } from 'class-validator';
import { StatusCodes } from 'http-status-codes';
import { HttpException } from '@exceptions/http-exception';
import UserModel from '@modules/user/user-model';
import { ITokenPayload, JwtHelper } from '@helpers/jwt-helper';

export class RefreshTokenDto {
	@IsNotEmpty({ message: 'Refresh token không được để trống!' })
	@IsString({ message: 'Refresh token không hợp lệ!' })
	refreshToken: string;
}

const refreshTokenHandler: IHandler<RefreshTokenDto> = async (dto, res) => {
	const { refreshToken } = dto;

	let payload: ITokenPayload = null;
	try {
		payload = await JwtHelper.decodeToken(refreshToken);
	} catch (err) {
		throw new HttpException(StatusCodes.UNAUTHORIZED, 'Refresh token không hợp lệ hoặc đã hết hạn!');
	}

	const userId = payload._id;
	const existed = await JwtHelper.isRFTokenExist(userId, refreshToken);

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
	const jwtHelper = new JwtHelper(user);
	const accessToken = jwtHelper.generateAccessToken();

	// Response
	res.status(StatusCodes.OK).json({
		message: 'Refresh token thành công!',
		accessToken,
	});
};

export default refreshTokenHandler;
