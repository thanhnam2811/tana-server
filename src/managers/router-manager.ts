import BaseRouter from '@abstracts/base-router';
import loggerHelper from '@helpers/logger-helper';
import postRouter from '@modules/post/post-router';
import { Application, Router } from 'express';

export class RouterManager {
	// Singleton
	private static _instance: RouterManager;
	public static get instance(): RouterManager {
		if (!RouterManager._instance) {
			RouterManager._instance = new RouterManager();
		}

		return RouterManager._instance;
	}

	// Properties
	private _routes: BaseRouter[] = [];

	// Constructor
	private constructor() {
		// Register routes
		this._registerRoute(postRouter);
	}

	// Methods
	private _registerRoute(baseRouter: BaseRouter): void {
		baseRouter.initRoutes();
		this._routes.push(baseRouter);

		loggerHelper.info(`🔗 Route "${baseRouter.path}" registered!`);
	}

	public initRoutes(app: Application): void {
		this._routes.forEach((route) => {
			const { path, router, middlewares } = route;

			app.use(path, ...middlewares, router);
		});
	}
}

const routerManager = RouterManager.instance;
export default routerManager;
