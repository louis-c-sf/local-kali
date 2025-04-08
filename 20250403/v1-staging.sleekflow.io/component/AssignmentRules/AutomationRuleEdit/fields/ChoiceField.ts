import { AbstractConditionField } from "./AbstractConditionField";
import { getAllConditionValues, getFirstConditionValue } from "./helpers";
import { CustomFieldTypeDict } from "../../../../types/ContactType";
import { DropdownOptionType } from "../../../Chat/ChannelFilterDropdown";
import { uniq } from "ramda";
import {
  CompoundConditionType,
  HasChoices,
} from "../../../../types/AssignmentRuleType";
import { TFunction } from "i18next";

export class ChoiceField extends AbstractConditionField implements HasChoices {
  protected values: string[] = [];

  constructor(
    fieldType: CustomFieldTypeDict | string,
    fieldName: string,
    fieldDisplayName: string,
    choices: DropdownOptionType[]
  ) {
    super(fieldType, fieldName, fieldDisplayName, { choices });
  }

  protected allowsExtraChoices() {
    return false;
  }

  protected allowsAnyValue() {
    return false;
  }

  getFormConditionOperator(): string {
    if (this.fieldType.toLowerCase() === "options") {
      if (this.conditionOperator === "Contains") {
        return "ContainsExactly";
      }
      if (this.conditionOperator === "IsNotContains") {
        return "IsNotContainsExactly";
      }
    }
    return this.conditionOperator;
  }

  toConditionType(): CompoundConditionType {
    return {
      fieldName: this.fieldName,
      nextOperator: "And",
      conditionOperator: this.getFormConditionOperator(),
      values: this.isMultiple() ? this.values : this.values.slice(0, 1),
    };
  }

  toInputValueType(): string[] | string | undefined {
    return this.isMultiple() ? (this.values as string[]) : this.values[0];
  }

  isMultiple(): boolean {
    return [
      "Contains",
      "IsNotContains",
      "ContainsExactly",
      "IsNotContainsExactly",
    ].includes(this.getFormConditionOperator());
  }

  validate(t: TFunction) {
    if (!this.isRequireInput()) {
      return;
    }
    if (this.values.length === 0) {
      return t("automation.field.choices.error.required");
    }
  }

  protected parseConditionToValue(
    condition: CompoundConditionType
  ): string[] | string | undefined {
    if (this.isMultiple()) {
      return getAllConditionValues(condition);
    } else {
      return getFirstConditionValue(condition);
    }
  }

  protected updateValue(newValue: string | string[]): void {
    let values: string[] = [newValue].flat(2);
    if (this.allowsExtraChoices() || this.allowsAnyValue()) {
      this.values = uniq(values);
      return;
    }
    const choices = this.getChoices();
    this.values = uniq(
      values.filter((val) => choices.some((ch) => ch.value === val))
    );
  }

  getChoices(): DropdownOptionType[] {
    return this.options?.choices ?? [];
  }
}
