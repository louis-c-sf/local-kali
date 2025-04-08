import { AbstractConditionField } from "./AbstractConditionField";
import { getFirstConditionValue } from "./helpers";
import { CompoundConditionType } from "../../../../types/AssignmentRuleType";
import { TFunction } from "i18next";

export class BooleanField extends AbstractConditionField {
  private value: boolean | undefined;

  constructor(fieldName: string, fieldDisplayName: string) {
    super("boolean", fieldName, fieldDisplayName);
  }

  toInputValueType(): boolean | undefined {
    return this.value;
  }

  isMultiple(): boolean {
    return false;
  }

  toConditionType(): CompoundConditionType {
    return {
      fieldName: this.fieldName,
      conditionOperator: this.getFormConditionOperator(),
      nextOperator: "And",
      values:
        this.getFormConditionOperator() === "Equals"
          ? [this.value ? "true" : "false"]
          : [""],
    };
  }

  validate(t: TFunction) {
    if (!this.isRequireInput()) {
      return;
    }
    if (this.value === undefined) {
      return t("automation.field.boolean.error.required");
    }
  }

  protected parseConditionToValue(
    condition: CompoundConditionType
  ): string | undefined {
    return getFirstConditionValue(condition);
  }

  protected updateValue(newValue: any): void {
    this.value =
      newValue === undefined
        ? undefined
        : String(newValue).toLowerCase() === "true";
  }
}
