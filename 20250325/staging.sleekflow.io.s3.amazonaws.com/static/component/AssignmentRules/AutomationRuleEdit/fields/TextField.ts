import { AbstractConditionField } from "./AbstractConditionField";
import { getFirstConditionValue } from "./helpers";
import { CompoundConditionType } from "../../../../types/AssignmentRuleType";
import { TFunction } from "i18next";

export class TextField extends AbstractConditionField {
  private text: string | undefined;

  toInputValueType(): string | undefined {
    return this.text;
  }

  isMultiple(): boolean {
    return false;
  }

  toConditionType(): CompoundConditionType {
    return {
      fieldName: this.fieldName,
      conditionOperator: this.getFormConditionOperator(),
      nextOperator: "And",
      values: this.text ? [this.text] : [],
    };
  }

  validate(t: TFunction): string | undefined {
    if (!this.isRequireInput()) {
      return;
    }
    if ((this.text?.length ?? 0) === 0) {
      return t("automation.field.text.error.required");
    }
  }

  protected updateValue(newValue: string): void {
    this.text = newValue;
  }

  protected parseConditionToValue(condition: CompoundConditionType) {
    return getFirstConditionValue(condition);
  }
}
