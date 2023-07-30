import { HttpException } from '@exceptions/http-exception';
import randomUtil from '@utils/random-util';
import { IHandler } from '@interfaces/controller-interface';
import UserModel from '@modules/user/user-model';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { StatusCodes } from 'http-status-codes';
import otpUtil, { OtpTypeEnums } from '../utils/otp-util';
import sendRegisterMail from '../mails/send-register-mail';

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

	// Get OTP
	const otp = await otpUtil.getOtp(dto.email, OtpTypeEnums.REGISTER);
	if (otp) {
		throw new HttpException(
			StatusCodes.BAD_REQUEST,
			'Mã OTP trước đó vẫn còn hiệu lực! Vui lòng kiểm tra email của bạn!',
		);
	}

	// Create OTP
	const otpStr = randomUtil.getRandomString(6, { numbers: true });

	// Save OTP to Redis
	await otpUtil.saveOtp(dto.email, otpStr, OtpTypeEnums.REGISTER);

	// Send email
	await sendRegisterMail(dto.email, otpStr);

	// Response
	res.status(StatusCodes.OK).json({
		message: 'Mã OTP đã được gửi đến email của bạn!',
	});
};

export default sendRegisterOtpHandler;
