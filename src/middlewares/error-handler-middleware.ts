import { HttpException } from '@exceptions/http-exception';
import loggerHelper from '@helpers/logger-helper';
import { NextFunction, Request, Response } from 'express';

interface ErrorResponseBody {
	statusCode: number;
	message: string;
	error?: string;
	validationErrors?: { value: unknown; property: string; errors: string[] }[];
}

const errorHandlerMiddleware = (e: HttpException, req: Request, res: Response, next: NextFunction) => {
	try {
		const eResponse: ErrorResponseBody = {
			statusCode: e.status || 500,
			message: e.message || 'Lỗi không xác định!',
			error: e.options?.error,
			validationErrors: e.options?.validationErrors?.map((error) => ({
				value: error.value,
				property: error.property,
				errors: Object.values(error?.constraints || {}),
			})),
		};
		const { statusCode, message } = eResponse;

		loggerHelper.error(`[${req.method}] ${req.path} >> StatusCode:: ${statusCode}, Message:: ${message}`);

		// Log error stack if status code is 500 (Internal Server Error)
		if (statusCode === 500) {
			loggerHelper.error(e.stack);
		}

		res.status(statusCode).json(eResponse);
	} catch (error) {
		next(error);
	}
};

export default errorHandlerMiddleware;
