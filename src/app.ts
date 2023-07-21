import appConfig from '@configs/app-config';
import loggerHelper from '@helpers/logger-helper';
import express, { Application } from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import routerManager from '@managers/router-manager';
import errorHandlerMiddleware from '@middlewares/error-handler-middleware';

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
	private _server: Application;

	// Constructor
	private constructor() {
		this._PORT = appConfig.PORT;
		this._server = express();
	}

	// Methods
	private _initExpress(): void {
		this._server.use(express.json());
		this._server.use(express.urlencoded({ extended: true }));

		this._server.use(compression());
		this._server.use(helmet());
		this._server.use(cors({ origin: '*' }));

		loggerHelper.info('✅ Express initialized!');
	}

	private _initMiddlewares(): void {
		this._server.use(errorHandlerMiddleware);

		loggerHelper.info('✅ Middlewares initialized!');
	}

	private _initRoutes(): void {
		this._server.get('/', (req, res) => {
			res.send('Hello world! From TANA with love!');
		});

		routerManager.initRoutes(this._server);

		loggerHelper.info('✅ Routes initialized!');
	}

	public start(): void {
		this._initExpress();
		this._initMiddlewares();
		this._initRoutes();

		this._server.listen(this._PORT, () => {
			loggerHelper.info(`🚀 Server started on port ${this._PORT}!`);
		});
	}

	// Getters
	public get PORT(): number {
		return this._PORT;
	}
}

const app = App.instance;
export default app;
