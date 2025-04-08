import { ChoiceField } from "./ChoiceField";
import { DropdownOptionType } from "../../../Chat/ChannelFilterDropdown";
import {
  HASHTAG_FIELD_DISPLAY_NAME,
  HASHTAG_FIELD_NAME,
} from "../../../../config/ProfileFieldMapping";
import {
  AssignmentRuleRequestType,
  CompoundConditionType,
  FilterHashtagAutomationConditionType,
  flattenCondition,
  LogicType,
  isHashTagCondition,
} from "../../../../types/AssignmentRuleType";

type ConditionOperatorType =
  FilterHashtagAutomationConditionType["conditionOperator"];
const legacyOperatorMap = {
  Contains: "ContainsAll",
  IsNotContains: "IsNotContainsAll",
} as const;

export class HashTagField extends ChoiceField {
  protected conditionOperator: ConditionOperatorType = "ContainsAll";

  constructor(choices: DropdownOptionType[], fieldDisplayName?: string) {
    super(
      HASHTAG_FIELD_NAME,
      HASHTAG_FIELD_NAME,
      fieldDisplayName ?? HASHTAG_FIELD_DISPLAY_NAME,
      choices
    );
  }

  isMultiple(): boolean {
    return true;
  }

  applyToRequest(draftRequest: AssignmentRuleRequestType, index: number) {
    draftRequest.conditions = draftRequest.conditions?.concat(
      this.toConditionType()
    );
  }

  toConditionType(): FilterHashtagAutomationConditionType {
    return {
      containHashTag: "hashtags",
      values: [...this.values],
      conditionOperator: this.conditionOperator,
      nextOperator: this.conditionLogic,
    };
  }

  withConditionOperator(
    conditionOperator: ConditionOperatorType,
    logic: LogicType = "And"
  ): this {
    return super.withConditionOperator(conditionOperator, logic);
  }

  canJoinCondition(condition: CompoundConditionType): boolean {
    const firstCurrentCond = this.toConditionType();
    const [firstJoinCond] = flattenCondition(condition);

    const [currentCondOperatorNormalized] =
      this.parseConditionOperators(firstCurrentCond);
    const [joinCondOperatorNormalized] =
      this.parseConditionOperators(firstJoinCond);

    return (
      isHashTagCondition(firstJoinCond) &&
      joinCondOperatorNormalized === currentCondOperatorNormalized
    );
  }

  joinedWithCondition(condition: CompoundConditionType): this {
    return this.withValue([...this.values, ...condition.values]);
  }

  protected parseConditionOperators(
    condition: CompoundConditionType
  ): [string, LogicType] {
    const [{ conditionOperator }] = flattenCondition(condition);

    return [legacyOperatorMap[conditionOperator] ?? conditionOperator, "And"];
  }

  protected allowsExtraChoices(): boolean {
    return true;
  }
}
