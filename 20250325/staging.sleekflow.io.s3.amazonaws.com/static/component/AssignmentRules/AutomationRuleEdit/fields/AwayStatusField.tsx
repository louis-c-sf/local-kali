import {
  AbstractConditionField,
  ConditionChoiceType,
} from "./AbstractConditionField";
import {
  AutomationTypeEnum,
  CompoundConditionType,
} from "../../../../types/AssignmentRuleType";
import { ConditionNameMapType } from "../../../Contact/locaizable/useConditionNameLocale";
import { TFunction } from "i18next";
import {
  ACTIVE_CONDITION_OPERATOR,
  AWAY_CONDITION_OPERATOR,
  AWAY_STATUS_FIELD_NAME,
  AWAY_STATUS_FIELD_NAME_DENORMALIZED,
  AWAY_STATUS_TYPE,
  AWAY_SUPPORTED_CONDITIONS,
} from "../../../../config/ProfileFieldMapping";

export class AwayStatusField extends AbstractConditionField {
  constructor(displayName: string) {
    super(AWAY_STATUS_TYPE, AWAY_STATUS_FIELD_NAME_DENORMALIZED, displayName);
  }

  isMultiple(): boolean {
    return false;
  }

  protected buildDefaultCondition(): CompoundConditionType {
    return {
      conditionOperator: AWAY_CONDITION_OPERATOR,
      values: [],
      fieldName: AWAY_STATUS_FIELD_NAME,
      nextOperator: "And",
    };
  }

  protected parseConditionToValue(condition: CompoundConditionType): any {
    return null;
  }

  toConditionType(): CompoundConditionType {
    return {
      conditionOperator: this.conditionOperator,
      values: [],
      fieldName: AWAY_STATUS_FIELD_NAME,
      nextOperator: "And",
    };
  }

  isRequireInput(): boolean {
    return false;
  }

  toInputValueType(): any {
    return;
  }

  protected updateValue(newValue: unknown): void {
    return;
  }

  validate(t: TFunction): string | undefined {
    if (!AWAY_SUPPORTED_CONDITIONS.includes(this.conditionOperator as any)) {
      return t("automation.field.awayStatus.error.required");
    }
  }

  getConditionTypeChoices(
    automationType: AutomationTypeEnum,
    map: ConditionNameMapType
  ): ConditionChoiceType[] {
    return [
      {
        value: AWAY_CONDITION_OPERATOR,
        text: map[AWAY_STATUS_TYPE]![AWAY_CONDITION_OPERATOR]!,
        key: 0,
      },
      {
        value: ACTIVE_CONDITION_OPERATOR,
        text: map[AWAY_STATUS_TYPE]![ACTIVE_CONDITION_OPERATOR]!,
        key: 1,
      },
    ];
  }
}
