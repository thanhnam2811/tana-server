import 'dotenv/config';

const authConfig = {
	// JWT
	JWT_SECRET: process.env.JWT_SCRET,
	AT_EXPIRES_IN: process.env.AT_EXPIRES_IN,
	RT_EXPIRES_IN: process.env.RT_EXPIRES_IN,

	// PASSWORD
	PASS_SALT: 10,
	PASS_EXT: process.env.PASS_EXT,
};

export default authConfig;
