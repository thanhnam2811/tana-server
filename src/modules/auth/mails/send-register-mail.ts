import { mailHelper } from '@helpers/mail-helper';

const sendRegisterMail = async (email: string, otpStr: string): Promise<void> => {
	const subject = 'Xác thực tài khoản';
	const template = 'register';
	const data = { otp: otpStr };

	await mailHelper.sendMailFromTemplate(email, { subject, template, data });
};

export default sendRegisterMail;
