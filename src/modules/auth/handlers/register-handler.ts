import { HttpException } from '@exceptions/http-exception';
import loggerHelper from '@helpers/logger-helper';
import randomHelper from '@helpers/random-helper';
import UserModel from '@modules/user/user-model';
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';
import { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import otpHelper, { OtpTypeEnums } from '../helpers/otp-helper';
import passwordHelper from '../helpers/password-helper';
import sendRegisterMail from '../utils/send-register-mail';

export class RegisterDto {
	@IsNotEmpty({ message: 'Tên không được để trống!' })
	@IsString({ message: 'Tên không hợp lệ!' })
	name: string;

	@IsNotEmpty({ message: 'Email không được để trống!' })
	@IsEmail({}, { message: 'Email không hợp lệ!' })
	email: string;

	@IsNotEmpty({ message: 'Mật khẩu không được để trống!' })
	@IsString({ message: 'Mật khẩu không hợp lệ!' })
	@IsStrongPassword(
		{
			minLength: 8,
			minLowercase: 1,
			minUppercase: 1,
			minNumbers: 1,
			minSymbols: 1,
		},
		{ message: 'Mật khẩu phải có ít nhất 8 ký tự, 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt!' },
	)
	password: string;
}

const registerHandler: RequestHandler = async (req, res, next) => {
	try {
		const registerDto: RegisterDto = req.body;

		// Check if email is already registered
		const existed = await UserModel.findOne({ email: registerDto.email }).exec();
		if (existed) {
			throw new HttpException(StatusCodes.CONFLICT, 'Email đã được đăng ký! Vui lòng sử dụng email khác!');
		}

		// Hash password
		const hashedPassword = await passwordHelper.hash(registerDto.password);
		registerDto.password = hashedPassword;

		// Create user
		const user = await UserModel.create(registerDto);

		// Log
		loggerHelper.info(`User ${user.email} registered! ID: ${user._id}`);

		// Create OTP
		const otpStr = randomHelper.getRandomString(6, { numbers: true });
		const otp = parseInt(otpStr);

		// Save OTP to Redis
		const userId = user._id.toString();
		otpHelper.saveOtp(userId, otpStr, OtpTypeEnums.REGISTER);

		// Send email
		sendRegisterMail(user.email, user.name, otp);

		// Response
		res.status(StatusCodes.CREATED).json({
			message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản!',
		});
	} catch (error) {
		next(error);
	}
};

export default registerHandler;
