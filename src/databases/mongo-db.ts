import appConfig, { EnvEnum } from '@configs/app-config';
import mongoConfig from '@configs/mongo-config';
import loggerHelper from '@helpers/logger-helper';
import mongoose from 'mongoose';

class MongoDB {
	// Singleton
	private static _instance: MongoDB;
	public static get instance(): MongoDB {
		if (!MongoDB._instance) {
			MongoDB._instance = new MongoDB();
		}

		return MongoDB._instance;
	}

	// Properties
	private _connectionString: string;

	// Constructor
	private constructor() {
		const { HOST, NAME, USER, PASS } = mongoConfig;

		this._connectionString = `mongodb+srv://${USER}:${PASS}@${HOST}/${NAME}?retryWrites=true&w=majority`;
	}

	// Methods
	public async connect() {
		const isProd = appConfig.ENV === EnvEnum.PRODUCTION;

		if (!isProd) {
			mongoose.set('debug', {
				color: true,
			});
		}

		await mongoose.connect(this._connectionString);

		loggerHelper.info('✅ MongoDB connected!');
	}
}

const mongoDB = MongoDB.instance;
export default mongoDB;
