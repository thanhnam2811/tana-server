import mailConfig from '@configs/mail-config';
import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';

export class MailHelper {
	// Singleton
	private static instance: MailHelper;
	public static getInstance(): MailHelper {
		if (!MailHelper.instance) {
			MailHelper.instance = new MailHelper();
		}
		return MailHelper.instance;
	}

	// Properties
	private transporter: nodemailer.Transporter;
	private from: string;

	// Constructor
	private constructor() {
		this.from = `${mailConfig.NAME} <${mailConfig.FROM}>`;

		this.transporter = nodemailer.createTransport({
			host: mailConfig.HOST,
			port: mailConfig.PORT,
			secure: mailConfig.SECURE,
			auth: {
				user: mailConfig.USER,
				pass: mailConfig.PASS,
			},
		});

		const templatesDir = path.resolve(__dirname, '..', 'templates', 'mails');
		this.transporter.use(
			'compile',
			hbs({
				viewPath: templatesDir,
				extName: '.hbs',
				viewEngine: {
					extname: '.hbs',
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					defaultLayout: false,
				},
			}),
		);
	}

	// Methods
	public async sendMail(
		to: string,
		options: {
			subject: string;
			html: string;
			from?: string;
		},
	): Promise<void> {
		const { subject, html, from = this.from } = options;

		return this.transporter.sendMail({ from, to, subject, html });
	}

	public async sendMailFromTemplate(
		to: string,
		options: {
			subject: string;
			template: string;
			data: object;
			from?: string;
		},
	): Promise<void> {
		const { subject, template, data, from = this.from } = options;

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return this.transporter.sendMail({ from, to, subject, template, context: data });
	}
}

export const mailHelper = MailHelper.getInstance();
