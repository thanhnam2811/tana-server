import { HttpException } from '@exceptions/http-exception';
import randomHelper from '@helpers/random-helper';
import UserModel from '@modules/user/user-model';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { StatusCodes } from 'http-status-codes';
import sendRegisterMail from '../utils/send-register-mail';
import otpHelper, { OtpTypeEnums } from '../helpers/otp-helper';
import { RequestHandler } from 'express';

export class SendRegisterOtpDto {
	@IsNotEmpty({ message: 'Email không được để trống!' })
	@IsEmail({}, { message: 'Email không hợp lệ!' })
	email: string;
}

const sendRegisterOtpHandler: RequestHandler = async (req, res, next) => {
	try {
		const getRegisterOtpDto: SendRegisterOtpDto = req.body;

		// Check if email is already registered
		const existed = await UserModel.findOne({ email: getRegisterOtpDto.email }).exec();
		if (existed) {
			throw new HttpException(StatusCodes.CONFLICT, 'Email đã được đăng ký! Vui lòng sử dụng email khác!');
		}

		// Create OTP
		const otpStr = randomHelper.getRandomString(6, { numbers: true });
		const otp = parseInt(otpStr);

		// Save OTP to Redis
		await otpHelper.saveOtp(getRegisterOtpDto.email, otpStr, OtpTypeEnums.REGISTER);

		// Send email
		await sendRegisterMail(getRegisterOtpDto.email, otp);

		// Response
		res.status(StatusCodes.OK).json({
			message: 'Mã OTP đã được gửi đến email của bạn!',
		});
	} catch (error) {
		next(error);
	}
};

export default sendRegisterOtpHandler;
