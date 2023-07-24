import { redisClient } from '@databases/redis-db';

export enum OtpTypeEnums {
	REGISTER = 'register',
	RESET_PASSWORD = 'reset-password',
}

const getOtpKey = (email: string, otpType: OtpTypeEnums) => `otp:${email}:${otpType}`;

const otpHelper = {
	saveOtp: async (email: string, otp: string, otpType: OtpTypeEnums) => {
		const key = getOtpKey(email, otpType);
		await redisClient.set(key, otp, {
			EX: 60 * 5, // 5 minutes
		});
	},

	getOtp: async (email: string, otpType: OtpTypeEnums) => {
		const key = getOtpKey(email, otpType);
		const otp = await redisClient.get(key);
		return otp;
	},

	deleteOtp: async (email: string, otpType: OtpTypeEnums) => {
		const key = getOtpKey(email, otpType);
		await redisClient.del(key);
	},
};

export default otpHelper;
