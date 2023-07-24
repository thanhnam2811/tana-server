import { HttpException } from '@exceptions/http-exception';
import loggerHelper from '@helpers/logger-helper';
import UserModel from '@modules/user/user-model';
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, Length } from 'class-validator';
import { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import otpHelper, { OtpTypeEnums } from '../helpers/otp-helper';
import passwordHelper from '../helpers/password-helper';
import sendWelcomeMail from '../utils/send-welcome-mail';

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

	@IsNotEmpty({ message: 'Mã OTP không được để trống!' })
	@IsString({ message: 'Mã OTP không hợp lệ!' })
	@Length(6, 6, { message: 'Mã OTP phải có 6 ký tự!' })
	otp: string;
}

const registerHandler: RequestHandler = async (req, res, next) => {
	try {
		const registerDto: RegisterDto = req.body;

		// Check if email is already registered
		const existed = await UserModel.findOne({ email: registerDto.email }).exec();
		if (existed) {
			throw new HttpException(StatusCodes.CONFLICT, 'Email đã được đăng ký! Vui lòng sử dụng email khác!');
		}

		// Check OTP
		const otp = await otpHelper.getOtp(registerDto.email, OtpTypeEnums.REGISTER);
		if (!otp) {
			throw new HttpException(StatusCodes.BAD_REQUEST, 'Mã OTP không tồn tại hoặc đã hết hạn!');
		}

		if (otp !== registerDto.otp) {
			throw new HttpException(StatusCodes.BAD_REQUEST, 'Mã OTP không đúng!');
		}

		// Hash password
		const hashedPassword = await passwordHelper.hash(registerDto.password);
		registerDto.password = hashedPassword;

		// Create user
		const user = await UserModel.create(registerDto);

		// Log
		loggerHelper.info(`User ${user.email} registered! ID: ${user._id}`);

		// Send welcome email
		sendWelcomeMail(user.email, user.name);

		// Response
		res.status(StatusCodes.CREATED).json({
			message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản!',
		});
	} catch (error) {
		next(error);
	}
};

export default registerHandler;
