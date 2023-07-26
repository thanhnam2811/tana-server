import { HttpException } from '@exceptions/http-exception';
import { plainToInstance } from 'class-transformer';
import { ValidationError, validateOrReject } from 'class-validator';
import { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

interface IValidatorOptions {
	skipMissingProperties?: boolean;
	whitelist?: boolean;
	forbidNonWhitelisted?: boolean;
}

const validatorMiddleware =
	(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		type: any,
		{ skipMissingProperties = false, whitelist = true, forbidNonWhitelisted = false }: IValidatorOptions = {},
	): RequestHandler =>
	(req, res, next) => {
		const dto = plainToInstance(type, req.body);

		validateOrReject(dto, {
			skipMissingProperties,
			whitelist,
			forbidNonWhitelisted,
		})
			.then(() => {
				req.body = dto;
				next();
			})
			.catch((errors: ValidationError[]) => {
				errors = flattenErrors(errors);

				const message = errors
					.map((error: ValidationError) => Object.values(error.constraints).join(', '))
					.join(', ');

				const exception = new HttpException(StatusCodes.BAD_REQUEST, message, {
					validationErrors: errors,
					error: 'Validation Error',
				});

				next(exception);
			});
	};

// format errors (flatten nested errors)
const flattenErrors = (errors: ValidationError[], parentKey = ''): ValidationError[] => {
	const result: ValidationError[] = [];

	errors.forEach((error: ValidationError) => {
		const property = parentKey ? `${parentKey}.${error.property}` : error.property;
		if (error.children?.length) {
			result.push(...flattenErrors(error.children, property));
		} else {
			result.push({ ...error, property });
		}
	});

	return result;
};

export default validatorMiddleware;
