import { RequestHandler, Router } from 'express';
import BaseController from './base-controller';

abstract class BaseRouter {
	public abstract path: string;
	public router: Router = Router();
	public abstract controller: BaseController;
	private _middlewares: RequestHandler[] = []; // middlewares

	public abstract initRoutes(): void;

	public get middlewares(): RequestHandler[] {
		return this._middlewares;
	}
	protected addMiddleware(middleware: RequestHandler): void {
		this._middlewares.push(middleware);
	}
}

export default BaseRouter;
