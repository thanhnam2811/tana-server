import 'dotenv/config';

const mailConfig = {
	HOST: process.env.MAIL_HOST,
	PORT: parseInt(process.env.MAIL_PORT),
	USER: process.env.MAIL_USER,
	PASS: process.env.MAIL_PASS,
	SECURE: process.env.MAIL_SECURE !== 'false',
	FROM: process.env.MAIL_FROM,
	NAME: process.env.MAIL_NAME,
};

export default mailConfig;
