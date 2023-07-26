import { Schema } from 'mongoose';

const mongoHelper = {
	/**
	 * Hide fields from schema when converting to JSON (e.g. when returning a document)
	 * @param schema schema to hide fields
	 * @param fields fields to hide
	 */
	hideFields: (schema: Schema, fields: string[]) => {
		const hideFieldTransform = {
			transform: (_, ret) => {
				fields.forEach((field) => delete ret[field]);
			},
		};

		schema.set('toJSON', hideFieldTransform);
		schema.set('toObject', hideFieldTransform);
	},
};

export default mongoHelper;
