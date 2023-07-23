import appConfig, { EnvEnum } from '@configs/app-config';
import loggerHelper from '@helpers/logger-helper';
import express, { Application } from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import routerManager from '@managers/router-manager';
import errorHandlerMiddleware from '@middlewares/error-handler-middleware';
import loggerMiddleware from '@middlewares/logger-middleware';
import mongoDB from '@databases/mongo-db';

export class App {
	// Singleton
	private static _instance: App;
	public static get instance(): App {
		if (!App._instance) {
			App._instance = new App();
		}
		return App._instance;
	}

	// Properties
	private _PORT: number;
	private _ENV: EnvEnum;
	private _server: Application;

	// Constructor
	private constructor() {
		this._PORT = appConfig.PORT;
		this._ENV = appConfig.ENV;
		this._server = express();
	}

	// Methods
	public async start(): Promise<void> {
		const line = ''.padStart(50, '=');

		loggerHelper.info('⏳ Starting server...');
		loggerHelper.info(line);

		this._initExpress();
		this._initMiddlewares();
		this._initRoutes();
		this._initErrorHandlers();
		await this._initDatabase();

		loggerHelper.info(line);

		this._server.listen(this._PORT, () => {
			loggerHelper.info(`🌐 Environment: ${this._ENV}`);
			loggerHelper.info(`🚀 Server started on port ${this._PORT}!`);
			loggerHelper.info(line);
		});
	}

	private _initExpress(): void {
		this._server.use(express.json());
		this._server.use(express.urlencoded({ extended: true }));

		this._server.use(compression());
		this._server.use(helmet());
		this._server.use(cors({ origin: '*' }));

		loggerHelper.info('✅ Express initialized!');
	}

	private _initMiddlewares(): void {
		this._server.use(loggerMiddleware);

		loggerHelper.info('✅ Middlewares initialized!');
	}

	private _initRoutes(): void {
		this._server.get('/', (req, res) => {
			res.send('Hello world! From TANA with love!');
		});

		routerManager.initRoutes(this._server);

		loggerHelper.info('✅ Routes initialized!');
	}

	private _initErrorHandlers(): void {
		this._server.use(errorHandlerMiddleware);

		loggerHelper.info('✅ Error handlers initialized!');
	}

	private async _initDatabase(): Promise<void> {
		await mongoDB.connect();

		loggerHelper.info('✅ Database initialized!');
	}

	// Getters
	public get PORT(): number {
		return this._PORT;
	}
}

const app = App.instance;
export default app;
