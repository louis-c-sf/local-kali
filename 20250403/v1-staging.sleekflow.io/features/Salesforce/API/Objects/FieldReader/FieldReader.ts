import { ChoiceFieldNormalizedType } from "../fetchObjectFieldVendorChoices";
import { ObjectNormalizedType, ExpandType, ExpandTypeV2 } from "../contracts";
import { ScalarFieldNormalizedType } from "../fetchObjectFieldTypes";
import { anyPass } from "ramda";

const FIELDS_STRING_SPECIAL = [
  "id",
  "sys_sleekflow_company_id",
  "ctx_phone_number",
  "ctx_email",
];

export class FieldReader {
  constructor(
    private fieldTypes: ScalarFieldNormalizedType[],
    private choiceFieldTypes: ChoiceFieldNormalizedType[],
    private options?: { expansions?: (ExpandType | ExpandTypeV2)[] }
  ) {}

  getValue(object: ObjectNormalizedType, field: string) {
    if (field === "Name") {
      if (object["unified:Name"] && String(object["unified:Name"]).trim()) {
        return object["unified:Name"];
      }

      const parts: string[] = [
        this.getValue(object, "FirstName"),
        this.getValue(object, "LastName"),
      ].filter((s) => Boolean(s && String(s).trim()));

      return parts.join(" ");
    }

    if (FIELDS_STRING_SPECIAL.includes(field)) {
      return object[field];
    }

    const expansionConfig = this.options?.expansions?.find(
      (e) => e.as_field_name === field
    );

    // if (expansionConfig) {
    const key = `expanded:${field}`;
    if (object[key] !== undefined) {
      return object[key] ?? null;
    }
    // }

    if (field.startsWith("unified:") && object[field] !== undefined) {
      return object[field];
    }

    const [scalarFieldMatch, choiceFieldMatch] = this.getFieldsMatch(field);

    if (scalarFieldMatch || choiceFieldMatch) {
      return object[`unified:${field}`] ?? object[field] ?? null;
    }

    return null;
  }

  isString(field: string) {
    if (FIELDS_STRING_SPECIAL.includes(field)) {
      return true;
    }

    const [fieldMatch] = this.getFieldsMatch(field);
    return fieldMatch?.types.includes("string");
  }

  isDate(field: string) {
    const [fieldMatch] = this.getFieldsMatch(field);
    if (fieldMatch) {
      return fieldMatch.types.some((t) => ["datetime", "date"].includes(t));
    }
    return false;
  }

  isBoolean(field: string) {
    const [fieldMatch] = this.getFieldsMatch(field);
    if (fieldMatch) {
      return fieldMatch.types.some((t) => ["boolean"].includes(t));
    }
    return false;
  }

  isChoice(field: string) {
    const [_, choiceMatches] = this.getFieldsMatch(field);
    return !!choiceMatches;
  }

  isValid(lead: ObjectNormalizedType, field: string) {
    const fieldsMatch = this.getFieldsMatch(field);
    const exists = fieldsMatch.some(Boolean);
    const [scalar, choices] = fieldsMatch;
    if (scalar) {
      return scalar.types.filter((type) => type !== "null").length > 0;
    } else if (choices) {
      return choices.type !== "null";
    }
    return false;
  }

  private getFieldsMatch(
    name: string
  ): [
    ScalarFieldNormalizedType | undefined,
    ChoiceFieldNormalizedType | undefined
  ] {
    const fieldMatch = this.fieldTypes.find(matchesUnifiedName(name));
    const choiceFieldMatch = this.choiceFieldTypes.find(matchesName(name));

    return [fieldMatch, choiceFieldMatch];
  }

  getLabel(fieldName: string) {
    const choiceFieldMatch = this.choiceFieldTypes.find(matchesName(fieldName));
    return choiceFieldMatch?.label ?? null;
  }
}

function matchesUnifiedName(name: string) {
  return (f: { name: string }) => f.name === `unified:${name}`;
}

function matchesName(name: string) {
  return (f: { name: string }) => f.name === name;
}
