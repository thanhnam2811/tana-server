import mailHelper from '@helpers/mail-helper';

const sendRegisterMail = async (email: string, name: string, otp: number): Promise<void> => {
	const subject = 'Xác thực tài khoản';
	const template = 'register';
	const data = { name, otp };

	await mailHelper.sendMailFromTemplate(email, { subject, template, data });
};

export default sendRegisterMail;
