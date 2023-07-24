import 'dotenv/config';

const mongoConfig = {
	USER: process.env.MONGO_USER,
	PASS: process.env.MONGO_PASS,
	HOST: process.env.MONGO_HOST,
	NAME: process.env.MONGO_NAME,
	MAX_CONNECTION_PER_CORE: parseInt(process.env.MONGO_MAX_CONNECTION_PER_CORE),
};

export default mongoConfig;
