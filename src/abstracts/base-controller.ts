import { Router } from 'express';
import BaseHandler from './base-handler';
import loggerHelper from '@helpers/logger-helper';

abstract class BaseController {
	public handlers: BaseHandler[] = [];

	public initHandlers(router: Router): void {
		this.handlers.forEach((handler) => {
			const { method, relativePath, requestHandler, middlewares } =
				handler;
			const routeHandler = router[method];
			console.log('router', router);

			routeHandler(relativePath, ...middlewares, requestHandler);
		});
	}

	protected _registerHandler(handler: BaseHandler): void {
		this.handlers.push(handler);
	}
}

export default BaseController;
