import { RequestHandler } from 'express';

export enum ReqMethod {
	GET = 'get',
	POST = 'post',
	PUT = 'put',
	DELETE = 'delete',
	PATCH = 'patch',
}

abstract class BaseHandler {
	public abstract relativePath: string; // relative to controller path
	public abstract method: ReqMethod; // request method

	protected abstract _handler: RequestHandler; // request handler
	private _requestHandler: RequestHandler = (req, res, next) => {
		try {
			this._handler(req, res, next);
		} catch (err) {
			next(err);
		}
	};
	public get requestHandler(): RequestHandler {
		return this._requestHandler;
	}

	private _middlewares: RequestHandler[] = []; // middlewares

	public get middlewares(): RequestHandler[] {
		return this._middlewares;
	}
	protected addMiddleware(middleware: RequestHandler): void {
		this._middlewares.push(middleware);
	}
}

export default BaseHandler;
