import Joi from 'joi';
import { FileTypesEnum } from "./file-types.enum.js";

export interface TermsConfiguration {
	type: FileTypesEnum,
	terms: string,
	tag: string,
}

export interface OutputLocale {
	tms: string,
	output: string,
}

export interface OutputConfiguration {
	type: FileTypesEnum,
	destination: string,
	sourceLocale: OutputLocale,
	targetLocale: OutputLocale,
	tag: string,
	useSourceOnEmpty?: boolean,
}

export interface Configuration {
	terms: TermsConfiguration[],
	snapshots: {
		tag: string,
		importInLocales: string[],
	}[],
	outputs: OutputConfiguration[],
	lokalise: {
		platforms: ('web')[],
		obsoleteKeyTag?: string,
	},
	errorOnMissingSnapshot: boolean,
}

export const configValidator = Joi.object({
	terms: Joi.array().items(
		Joi.object({
			terms: Joi.string(),
			type: Joi.string().valid(FileTypesEnum.XLIFF2, FileTypesEnum.JSON),
			tag: Joi.string(),
		}),
	),
	snapshots: Joi.array().items(
		Joi.object({
			tag: Joi.string(),
			importInLocales: Joi.array().items(Joi.string()),
		}),
	),
	outputs: Joi.array().items(
		Joi.object({
			destination: Joi.string(),
			type: Joi.string().valid(FileTypesEnum.XLIFF2, FileTypesEnum.JSON),
			sourceLocale: Joi.object({
				tms: Joi.string(),
				output: Joi.string(),
			}),
			targetLocale: Joi.object({
				tms: Joi.string(),
				output: Joi.string(),
			}),
			tag: Joi.string(),
			useSourceOnEmpty: Joi.boolean().optional(),
		}),
	),
	lokalise: Joi.object({
		platforms: Joi.array().items(Joi.string()),
		obsoleteKeyTag: Joi.string().optional(),
	}),
	errorOnMissingSnapshot: Joi.boolean(),
});
