import redisConfig from '@configs/redis-config';
import loggerHelper from '@helpers/logger-helper';
import { createClient, RedisClientType } from 'redis';

export class RedisDB {
	// Singleton
	private static _instance: RedisDB;
	public static get instance(): RedisDB {
		if (!RedisDB._instance) {
			RedisDB._instance = new RedisDB();
		}

		return RedisDB._instance;
	}

	// Properties
	private _client: RedisClientType;

	// Constructor
	private constructor() {
		const { HOST, PORT, PASS } = redisConfig;

		this._client = createClient({
			socket: {
				port: PORT,
				host: HOST,
			},
			password: PASS,
		});
	}

	// Methods
	public async connect() {
		await this._client.connect();

		loggerHelper.info('✅ RedisDB connected!');
	}

	public async disconnect() {
		await this._client.disconnect();

		loggerHelper.info('❌ RedisDB disconnected!');
	}

	public get client() {
		return this._client;
	}
}

const redisDB = RedisDB.instance;
export default redisDB;

export const redisClient = redisDB.client;
