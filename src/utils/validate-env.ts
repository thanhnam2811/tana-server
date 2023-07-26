import { EnvEnum } from '@configs/app-config';
import { cleanEnv, str, port, bool, num } from 'envalid';

const validateEnv = () => {
	cleanEnv(process.env, {
		// App config
		PORT: port({
			desc: 'The port to run the server on',
		}),
		NODE_ENV: str({
			choices: [...Object.values(EnvEnum)],
			desc: 'The environment to run the server on',
		}),

		// Auth config
		JWT_SECRET: str({
			desc: 'The secret to sign the JWT with',
		}),
		AT_EXPIRES_IN: str({
			desc: 'The access token expiration time',
		}),
		RT_EXPIRES_IN: str({
			desc: 'The refresh token expiration time',
		}),
		PASS_EXT: str({
			desc: 'The password extension',
		}),

		// Mongo config
		MONGO_USER: str({
			desc: 'The username to connect to the database with',
		}),
		MONGO_PASS: str({
			desc: 'The password to connect to the database with',
		}),
		MONGO_HOST: str({
			desc: 'The host to connect to the database with',
		}),
		MONGO_NAME: str({
			desc: 'The name of the database to connect to',
		}),
		MONGO_MAX_CONN_PER_CORE: num({
			desc: 'The maximum number of connections per core',
		}),

		// Redis config
		REDIS_HOST: str({
			desc: 'The host to connect to the redis server with',
		}),
		REDIS_PORT: port({
			desc: 'The port to connect to the redis server with',
		}),
		REDIS_PASS: str({
			desc: 'The password to connect to the redis server with',
		}),

		// Mail config
		MAIL_HOST: str({
			desc: 'The host to connect to the mail server with',
		}),
		MAIL_PORT: port({
			desc: 'The port to connect to the mail server with',
		}),
		MAIL_USER: str({
			desc: 'The username to connect to the mail server with',
		}),
		MAIL_PASS: str({
			desc: 'The password to connect to the mail server with',
		}),
		MAIL_SECURE: bool({
			desc: 'Whether or not to use TLS',
		}),
		MAIL_FROM: str({
			desc: 'The email address to send emails from',
		}),
		MAIL_NAME: str({
			desc: 'The name to send emails from',
		}),
		MAIL_HELP: str({
			desc: 'The email address to send help emails to',
		}),
	});
};

export default validateEnv;
