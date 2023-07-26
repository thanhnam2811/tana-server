import { RequestHandler, Response } from 'express';

export interface IControllerHandler {
	method: 'get' | 'post' | 'put' | 'patch' | 'delete';
	path: string;
	middlewares: RequestHandler[];
	handler: RequestHandler;
}

export interface IHandler<T = object> {
	(dto: T, res: Response): Promise<void>;
}

export default interface IController {
	[key: string]: IControllerHandler;
}
