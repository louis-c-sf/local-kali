import { CustomFieldTypeDict } from "../../../../types/ContactType";
import {
  ConditionNameType,
  isFilterConditionType,
} from "../../../../config/ProfileFieldMapping";
import produce, { immerable } from "immer";
import {
  AssignmentRuleRequestType,
  AssignmentRuleType,
  AutomationTypeEnum,
  CompoundConditionType,
  flattenCondition,
  LogicType,
} from "../../../../types/AssignmentRuleType";
import { AssignmentConditionFieldTypeMapping } from "./AssignmentConditionFieldTypeMapping";
import { ConditionNameMapType } from "../../../Contact/locaizable/useConditionNameLocale";
import { TFunction } from "i18next";
import { DropdownOptionType } from "../../../Chat/ChannelFilterDropdown";

export interface ConditionChoiceType {
  text: string;
  value: ConditionNameType;
  key: number;
}

interface ConditionFieldOptionsType {
  choices?: DropdownOptionType[];
}

export abstract class AbstractConditionField {
  [immerable] = true;

  public readonly fieldName: string;
  public readonly displayName: string;
  protected readonly fieldType: CustomFieldTypeDict | string;
  // @ts-ignore
  protected conditionOperator: ConditionNameType;
  protected conditionLogic: LogicType = "And";

  protected options: ConditionFieldOptionsType = {};

  constructor(
    fieldType: CustomFieldTypeDict | string,
    fieldName: string,
    displayName: string,
    options?: ConditionFieldOptionsType
  ) {
    this.displayName = displayName;
    this.fieldType = fieldType;
    this.fieldName = fieldName;
    this.options = options ?? {};
    this.initFromCondition(this.buildDefaultCondition());
  }

  protected buildDefaultCondition(): CompoundConditionType {
    const [defaultConditionOperator] = this.getFieldConditionsAvailable();
    if (!isFilterConditionType(defaultConditionOperator)) {
      throw "Cannot define a default condition";
    }
    return this.getDefaultConditionValue(defaultConditionOperator, "And");
  }

  private initFromCondition(condition: CompoundConditionType) {
    const [conditionOperator, logicOperator] =
      this.parseConditionOperators(condition);
    this.conditionOperator = conditionOperator as ConditionNameType;
    this.conditionLogic = logicOperator;
    const newValue = this.parseConditionToValue(condition);
    this.updateValue(newValue);
  }

  protected parseConditionOperators(
    condition: CompoundConditionType
  ): [string, LogicType] {
    const [firstCondition] = flattenCondition(condition);
    if (firstCondition === undefined) {
      throw { message: "Invalid condition passed", condition };
    }
    return [
      firstCondition.conditionOperator,
      firstCondition.nextOperator ?? "And",
    ];
  }

  protected constructFilled(
    instance: this,
    condition: CompoundConditionType,
    rule: AssignmentRuleType
  ): this {
    return produce(instance, (draft: this) => {
      // rewrite and reinitialize condition and value
      draft.initFromCondition(condition);
    });
  }

  protected getConditionOperatorText(
    automationType: AutomationTypeEnum,
    condition: string,
    defaultText: string,
    t: TFunction
  ) {
    // I am not sure isNotNullAndFieldValueChangeCondition would be reusable, let's keep it here for now
    if (automationType === "FieldValueChanged" && condition === "IsNotNull") {
      // this wording is clear enough, no need to extract a method for check
      return t("profile.fieldValueChanged.isNotNull"); //is changed";
    }
    return defaultText;
  }

  getFormConditionOperator(): string {
    return this.conditionOperator;
  }

  getConditionTypeChoices(
    automationType: AutomationTypeEnum,
    map: ConditionNameMapType,
    t: TFunction
  ): ConditionChoiceType[] {
    const fieldConditionsAvailable = this.getFieldConditionsAvailable();
    const conditionTextTranslations = map[this.fieldType.toLowerCase()] ?? {};
    return fieldConditionsAvailable.map((cond, key) => ({
      value: cond,
      text: this.getConditionOperatorText(
        automationType,
        cond,
        conditionTextTranslations[cond] ?? cond,
        t
      ),
      key,
    }));
  }

  isRequireInput() {
    return !["IsNotNull", "IsNull", "IsChanged", "IsAway"].includes(
      this.getFormConditionOperator()
    );
  }

  protected getDefaultConditionValue(
    condition: ConditionNameType,
    logic: LogicType
  ): CompoundConditionType {
    return {
      fieldName: this.fieldName,
      conditionOperator: condition,
      values: [],
      nextOperator: logic,
    };
  }

  withConditionOperator(
    conditionOperator: ConditionNameType,
    logic: LogicType = "And"
  ): this {
    const condition = this.getDefaultConditionValue(conditionOperator, logic);
    return produce(this, (draft: this) => {
      // rewrite and reinitialize condition and value
      draft.initFromCondition(condition);
    }).withValue(this.toInputValueType());
  }

  fromRule(rule: AssignmentRuleType, condition: CompoundConditionType): this {
    return this.constructFilled(this, condition, rule);
  }

  withValue(value: any): this {
    return produce(this, (draft: this) => {
      draft.updateValue(value);
    });
  }

  abstract toInputValueType(): any;

  abstract isMultiple(): boolean;

  abstract toConditionType(): CompoundConditionType;

  abstract validate(t: TFunction): string | undefined;

  /** @deprecated move to hook using getType() as a key **/
  getFieldConditionsAvailable(): ConditionNameType[] {
    return (
      AssignmentConditionFieldTypeMapping[this.fieldType.toLowerCase()] ?? []
    );
  }

  protected abstract updateValue(newValue: any): void;

  protected abstract parseConditionToValue(
    condition: CompoundConditionType
  ): any;

  applyToRequest(draftRequest: AssignmentRuleRequestType, index: number): void {
    draftRequest.conditions?.push(this.toConditionType());
  }

  joinedWithCondition(cnd: CompoundConditionType): this {
    throw { message: "Cannot join by default" };
  }

  canJoinCondition(condition: CompoundConditionType) {
    return false;
  }
}
