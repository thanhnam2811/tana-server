import mailConfig from '@configs/mail-config';
import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';

export class MailHelper {
	// Singleton
	private static _instance: MailHelper;
	public static get instance(): MailHelper {
		if (!MailHelper._instance) {
			MailHelper._instance = new MailHelper();
		}

		return MailHelper._instance;
	}

	// Properties
	private _transporter: nodemailer.Transporter;
	private _from: string;

	// Constructor
	private constructor() {
		this._from = `${mailConfig.NAME} <${mailConfig.FROM}>`;

		this._transporter = nodemailer.createTransport({
			host: mailConfig.HOST,
			port: mailConfig.PORT,
			secure: mailConfig.SECURE,
			auth: {
				user: mailConfig.USER,
				pass: mailConfig.PASS,
			},
		});

		const templatesDir = path.resolve(__dirname, '..', 'templates', 'mails');
		this._transporter.use(
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
		const { subject, html, from = this._from } = options;

		return this._transporter.sendMail({ from, to, subject, html });
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
		const { subject, template, data, from = this._from } = options;

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return this._transporter.sendMail({ from, to, subject, template, context: data });
	}
}

const mailHelper = MailHelper.instance;
export default mailHelper;
