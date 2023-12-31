import appConfig, { EnvEnum } from '@configs/app-config';
import winston from 'winston';
import 'winston-daily-rotate-file';

export const createLogger = (level?: string) => {
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

	const isProd = appConfig.ENV === EnvEnum.PRODUCTION;
	level ??= isProd ? 'info' : 'debug';

	return winston.createLogger({
		level,
		transports: [
			new winston.transports.Console({
				format: combine(upperCaseLevel(), colorize({ all: true }), ...formats),
			}),
			new winston.transports.DailyRotateFile({
				filename: `./logs/%DATE%.log`,
				datePattern: 'YYYY-MM-DD-[[]HH[]]',
				frequency: '1h',
				format: combine(upperCaseLevel(), ...formats),
			}),
			new winston.transports.DailyRotateFile({
				level: 'error',
				filename: `./logs/%DATE%.error.log`,
				datePattern: 'YYYY-MM-DD-[[]HH[]]',
				frequency: '1h',
				format: combine(upperCaseLevel(), ...formats),
			}),
		],
	});
};

interface LoggerUtil extends winston.Logger {
	line: () => void;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const logUtil: LoggerUtil = createLogger();
logUtil.line = (length = 50, char = '=') => {
	logUtil.info(char.repeat(length));
};

export default logUtil;
