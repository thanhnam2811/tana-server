import 'dotenv/config';

const redisConfig = {
	HOST: process.env.REDIS_HOST,
	PORT: parseInt(process.env.REDIS_PORT),
	PASS: process.env.REDIS_PASS,
};

export default redisConfig;
