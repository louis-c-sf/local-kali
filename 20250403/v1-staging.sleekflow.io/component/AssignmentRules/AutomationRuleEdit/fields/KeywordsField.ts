import { DynamicChoiceField } from "./DynamicChoiceField";

export class KeywordsField extends DynamicChoiceField {
  constructor(fieldName: string, fieldDisplayName: string) {
    super("Keywords", fieldName, fieldDisplayName);
  }
}
