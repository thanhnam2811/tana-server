import mailHelper from '@helpers/mail-helper';

const sendWelcomeMail = async (email: string, name: string): Promise<void> => {
	const subject = 'Đăng ký thành công!';
	const template = 'welcome';
	const data = { name };

	await mailHelper.sendMailFromTemplate(email, { subject, template, data });
};

export default sendWelcomeMail;
