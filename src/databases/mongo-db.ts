import appConfig, { EnvEnum } from '@configs/app-config';
import mongoConfig from '@configs/mongo-config';
import logUtil from '@utils/log-util';
import formatBytes from '@utils/format-bytes';
import mongoose from 'mongoose';
import os from 'os';

export class MongoDB {
	// Singleton
	private static instance: MongoDB;
	public static getInstance(): MongoDB {
		if (!MongoDB.instance) {
			MongoDB.instance = new MongoDB();
		}

		return MongoDB.instance;
	}

	// Properties
	private connectionString: string;
	private logUsageInterval: NodeJS.Timeout;
	private logUsageIntervalTime: number = 1000 * 60 * 5; // 10s

	// Constructor
	private constructor() {
		const { HOST, NAME, USER, PASS } = mongoConfig;

		this.connectionString = `mongodb+srv://${USER}:${PASS}@${HOST}/${NAME}?retryWrites=true&w=majority`;
	}

	// Methods
	public async connect() {
		const isProd = appConfig.ENV === EnvEnum.PRODUCTION;

		if (!isProd) {
			mongoose.set('debug', {
				color: true,
			});
		}

		await mongoose.connect(this.connectionString);

		logUtil.info('✅ MongoDB connected!');

		this.logUsageInterval = setInterval(() => {
			this.logUsage();
		}, this.logUsageIntervalTime);
	}

	public async disconnect() {
		await mongoose.disconnect();

		logUtil.info('❌ MongoDB disconnected!');

		clearInterval(this.logUsageInterval);
	}

	private logUsage() {
		const numConn = mongoose.connections.length;
		const numCore = os.cpus().length;
		const maxConn = numCore * mongoConfig.MAXCONNECTIONPERCORE;

		const memUsage = formatBytes(process.memoryUsage().rss);

		logUtil.info(`[MongoDB] 🔗 Connections: ${numConn}/${maxConn} - 📊 Memory usage: ${memUsage}`);
		if (numConn >= maxConn) {
			this.overloadHandler();
		}
	}

	private overloadHandler() {
		logUtil.warn('[MongoDB] 🔥 Overloaded!');
	}
}

const mongoDB = MongoDB.getInstance();
export default mongoDB;
