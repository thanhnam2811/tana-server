import mailConfig from '@configs/mail-config';
import mailHelper from '@helpers/mail-helper';

const sendWelcomeMail = async (email: string, name: string): Promise<void> => {
	const subject = 'Đăng ký thành công!';
	const template = 'welcome';
	const data = { helpMail: mailConfig.HELP, name };

	await mailHelper.sendMailFromTemplate(email, { subject, template, data });
};

export default sendWelcomeMail;
