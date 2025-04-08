import { ScalarFieldNormalizedType } from "../fetchObjectFieldTypes";

export class FieldIterator {
  constructor(private fieldTypes: ScalarFieldNormalizedType[]) {}

  iterate() {
    const fieldsDenormalized = this.fieldTypes
      .map((fld) => {
        return fld.name.match(/^(unified|expanded):(.+)/)?.[2] ?? "";
      })
      .filter((name) => name !== "");

    return fieldsDenormalized;
  }
}
