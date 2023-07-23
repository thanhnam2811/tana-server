import { Schema } from 'mongoose';

const mongoHelper = {
	/**
	 * Hide fields from schema when converting to JSON (e.g. when returning a document)
	 * @param schema schema to hide fields
	 * @param fields fields to hide
	 */
	hideFields: (schema: Schema, fields: string[]) => {
		schema.set('toJSON', {
			transform: (_, ret) => {
				fields.forEach((field) => delete ret[field]);
			},
		});
	},
};

export default mongoHelper;
