import 'dotenv/config';

export enum EnvEnum {
	DEVELOPMENT = 'development',
	PRODUCTION = 'production',
	TEST = 'test',
}

interface IAppConfig {
	PORT: number;
	ENV: EnvEnum;
}

const appConfig: IAppConfig = {
	PORT: parseInt(process.env.PORT),
	ENV: process.env.NODE_ENV as EnvEnum,
};

export default appConfig;
