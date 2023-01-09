import { FileTypesEnum } from "../file-types.enum.js";
import { TermsContainer } from "../../terms-container.js";

export interface TermsReaderInterface {
	parse(): Promise<TermsContainer>;

	getFileType(): FileTypesEnum;
}
