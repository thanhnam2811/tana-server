import appConfig, { EnvEnum } from '@configs/app-config';
import mongoConfig from '@configs/mongo-config';
import loggerHelper from '@helpers/logger-helper';
import mongoose from 'mongoose';
import os from 'os';
import prettyBytes from 'pretty-bytes';

export class MongoDB {
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
	private _logUsageInterval: NodeJS.Timeout;
	private _logUsageIntervalTime: number = 1000 * 10; // 10s

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

		this._logUsageInterval = setInterval(() => {
			this._logUsage();
		}, this._logUsageIntervalTime);
	}

	public async disconnect() {
		await mongoose.disconnect();

		loggerHelper.info('❌ MongoDB disconnected!');

		clearInterval(this._logUsageInterval);
	}

	private _logUsage() {
		const numConn = mongoose.connections.length;
		const numCore = os.cpus().length;
		const maxConn = numCore * mongoConfig.MAX_CONNECTION_PER_CORE;

		const memUsage = prettyBytes(process.memoryUsage().rss);

		loggerHelper.info(`🔗 Connections: ${numConn}/${maxConn} - 📊 Memory usage: ${memUsage}`);
		if (numConn >= maxConn) {
			this._overloadHandler();
		}
	}

	private _overloadHandler() {
		loggerHelper.warn('🔥 MongoDB is overloaded!');
	}
}

const mongoDB = MongoDB.instance;
export default mongoDB;
