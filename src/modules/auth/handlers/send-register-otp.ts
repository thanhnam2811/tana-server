import { HttpException } from '@exceptions/http-exception';
import randomHelper from '@helpers/random-helper';
import { IHandler } from '@interfaces/controller-interface';
import UserModel from '@modules/user/user-model';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { StatusCodes } from 'http-status-codes';
import otpHelper, { OtpTypeEnums } from '../helpers/otp-helper';
import sendRegisterMail from '../utils/send-register-mail';

export class SendRegisterOtpDto {
	@IsNotEmpty({ message: 'Email không được để trống!' })
	@IsEmail({}, { message: 'Email không hợp lệ!' })
	email: string;
}

const sendRegisterOtpHandler: IHandler<SendRegisterOtpDto> = async (dto, res) => {
	// Check if email is already registered
	const existed = await UserModel.findByEmail(dto.email);
	if (existed) {
		throw new HttpException(StatusCodes.CONFLICT, 'Email đã được đăng ký! Vui lòng sử dụng email khác!');
	}

	// Create OTP
	const otpStr = randomHelper.getRandomString(6, { numbers: true });

	// Save OTP to Redis
	await otpHelper.saveOtp(dto.email, otpStr, OtpTypeEnums.REGISTER);

	// Send email
	await sendRegisterMail(dto.email, otpStr);

	// Response
	res.status(StatusCodes.OK).json({
		message: 'Mã OTP đã được gửi đến email của bạn!',
	});
};

export default sendRegisterOtpHandler;
