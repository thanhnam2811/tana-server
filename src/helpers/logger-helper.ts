import winston from 'winston';
import 'winston-daily-rotate-file';

export class LoggerHelper {
	// Singleton
	static _instance: winston.Logger;
	static get instance() {
		if (!this._instance) this._instance = LoggerHelper.createLogger();

		return this._instance;
	}

	// Methods
	static createLogger() {
		const { combine, timestamp, printf, colorize, splat } = winston.format;
		const upperCaseLevel = winston.format((info) => {
			info.level = info.level.toUpperCase();
			return info;
		});

		// Common formats for all transports
		const formats = [
			timestamp({ format: 'DD/MM/YYYY [-] HH:mm:ss' }),
			printf(({ level, message, timestamp }) => {
				return `[${timestamp}] [${level}]: ${message}`;
			}),
			splat(),
		];

		return winston.createLogger({
			transports: [
				new winston.transports.Console({
					format: combine(
						upperCaseLevel(),
						colorize({ all: true }),
						...formats
					),
				}),
				new winston.transports.DailyRotateFile({
					filename: `./logs/%DATE%.log`,
					datePattern: 'YYYY-MM-DD-[[]HH[]]',
					frequency: '1h',
					format: combine(upperCaseLevel(), ...formats),
				}),
			],
		});
	}
}

const loggerHelper = LoggerHelper.instance;
export default loggerHelper;
