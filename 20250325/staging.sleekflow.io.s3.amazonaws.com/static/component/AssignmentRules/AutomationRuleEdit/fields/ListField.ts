import { AbstractConditionField } from "./AbstractConditionField";
import { DropdownOptionType } from "../../../Chat/ChannelFilterDropdown";
import {
  AutomationConditionType,
  CompoundConditionType,
  flattenCondition,
  HasChoices,
  LogicType,
} from "../../../../types/AssignmentRuleType";
import { TFunction } from "i18next";
import { ConditionNameType } from "../../../../config/ProfileFieldMapping";

const legacyOperatorMap = {
  Contains: "ContainsAll",
  IsNotContains: "IsNotContainsAll",
};

export class ListField extends AbstractConditionField implements HasChoices {
  private listIds: string[] = [];
  private readonly choices: DropdownOptionType[] = [];
  protected conditionOperator: ConditionNameType = "ContainsAll";

  constructor(fieldDisplayName: string, choices: DropdownOptionType[]) {
    super("importfrom", "importfrom", fieldDisplayName);
    this.choices = choices;
  }

  isMultiple(): boolean {
    return true;
  }

  toInputValueType(): string[] {
    return this.listIds;
  }

  toConditionType() {
    return {
      fieldName: this.fieldName,
      values: [...this.listIds],
      nextOperator: this.conditionLogic,
      conditionOperator: this.conditionOperator,
    } as AutomationConditionType;
  }

  validate(t: TFunction) {
    if (!this.isRequireInput()) {
      return;
    }
    if (this.listIds.length === 0) {
      return t("automation.field.userGroup.error.required");
    }
  }

  protected updateValue(newValue: string[]): void {
    this.listIds = [...newValue];
  }

  protected parseConditionOperators(
    condition: CompoundConditionType
  ): [string, LogicType] {
    const [{ conditionOperator }] = flattenCondition(condition);

    return [legacyOperatorMap[conditionOperator] ?? conditionOperator, "And"];
  }

  protected parseConditionToValue(condition: CompoundConditionType): any {
    const [values] = flattenCondition(condition);

    return [...(values?.values ?? [])];
  }

  getChoices(): DropdownOptionType[] {
    return this.choices;
  }

  withValue(value: string[]): this {
    return super.withValue(value);
  }
}
