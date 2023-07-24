import { redisClient } from '@databases/redis-db';

export enum OtpTypeEnums {
	REGISTER = 'register',
	RESET_PASSWORD = 'reset-password',
}

const otpHelper = {
	saveOtp: async (userId: string, otp: string, otpType: OtpTypeEnums) => {
		await redisClient.set(`otp:${userId}:${otpType}`, otp, {
			EX: 60 * 5, // 5 minutes
		});
	},

	getOtp: async (userId: string, otpType: OtpTypeEnums) => {
		const otp = await redisClient.get(`otp:${userId}:${otpType}`);
		return otp;
	},
};

export default otpHelper;
