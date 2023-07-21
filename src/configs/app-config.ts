import dotenv from 'dotenv';
dotenv.config();

const appConfig = {
	PORT: parseInt(process.env.PORT || '3000'),
};

export default appConfig;
