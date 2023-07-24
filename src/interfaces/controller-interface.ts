import { RequestHandler } from 'express';

export default interface IController {
	[key: string]: RequestHandler[];
}
