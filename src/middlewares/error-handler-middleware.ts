import { ErrorRequestHandler } from 'express';

const errorHandlerMiddleware: ErrorRequestHandler = (err, req, res, next) => {
	res.status(500).send('Something broke!');
};

export default errorHandlerMiddleware;
