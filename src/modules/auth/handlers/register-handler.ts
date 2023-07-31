import { HttpException } from '@exceptions/http-exception';
import logUtil from '@utils/log-util';
import { IHandler } from '@interfaces/controller-interface';
import UserModel from '@modules/user/user-model';
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, Length } from 'class-validator';
import { StatusCodes } from 'http-status-codes';
import otpUtil, { OtpTypeEnums } from '../utils/otp-util';
import sendWelcomeMail from '../mails/send-welcome-mail';
import { JwtHelper } from '@helpers/jwt-helper';
import { PasswordHelper } from '../helpers/password-helper';

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

const registerHandler: IHandler<RegisterDto> = async (dto, res) => {
	// Check if email is already registered
	const existed = await UserModel.findByEmail(dto.email);
	if (existed) {
		throw new HttpException(StatusCodes.CONFLICT, 'Email đã được đăng ký! Vui lòng sử dụng email khác!');
	}

	// Check OTP
	const otp = await otpUtil.getOtp(dto.email, OtpTypeEnums.REGISTER);
	if (!otp) {
		throw new HttpException(StatusCodes.BAD_REQUEST, 'Mã OTP không tồn tại hoặc đã hết hạn!');
	}

	if (otp !== dto.otp) {
		throw new HttpException(StatusCodes.BAD_REQUEST, 'Mã OTP không đúng!');
	}

	// Hash password
	const passwordHelper = new PasswordHelper();
	const hashedPassword = await passwordHelper.hash(dto.password);
	dto.password = hashedPassword;

	// Create user
	const user = await UserModel.create({
		...dto,
		email: {
			value: dto.email, // Save email value to email.value
		},
	});

	// Log
	logUtil.info(`🙋‍♂️ User "${dto.email}" registered! ID: ${user.id}`);

	// Token
	const jwtHelper = new JwtHelper(user);

	const { accessToken, refreshToken } = jwtHelper.generateToken();

	// Send welcome email
	sendWelcomeMail(user.email.value, user.name);

	// Response
	res.status(StatusCodes.CREATED).json({
		message: 'Đăng ký thành công!',
		accessToken,
		refreshToken,
	});
};

export default registerHandler;
