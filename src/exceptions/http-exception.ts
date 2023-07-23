import { ValidationError } from 'class-validator';
import { getReasonPhrase } from 'http-status-codes';

export interface HttpExceptionOptions {
	validationErrors?: ValidationError[];
	error?: string;
}

export class HttpException extends Error {
	public status: number;
	public message: string;
	public options: HttpExceptionOptions;

	constructor(status: number, message: string, options?: HttpExceptionOptions) {
		super(message);
		this.status = status;
		this.message = message;
		this.options = {
			error: getReasonPhrase(status),
			...options,
		};
	}
}
