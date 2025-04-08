import { TargetedChannelType } from "../../../../types/BroadcastCampaignType";
import { AbstractConditionField } from "./AbstractConditionField";
import { getAllConditionValues, getFirstConditionValue } from "./helpers";
import {
  AssignmentRuleRequestType,
  AssignmentRuleType,
  AutomationConditionType,
  CompoundConditionType,
} from "../../../../types/AssignmentRuleType";
import { TFunction } from "i18next";

export class ChannelField extends AbstractConditionField {
  private channels: TargetedChannelType[] = [];

  toInputValueType(): TargetedChannelType[] {
    return this.channels;
  }

  isMultiple(): boolean {
    return true;
  }

  toConditionType(): AutomationConditionType {
    // todo Extract transformations responsibility from BaseConditionField
    return {
      fieldName: this.fieldName,
      values: [],
      conditionOperator: this.getFormConditionOperator(),
      nextOperator: "And",
    };
  }

  validate(t: TFunction) {
    if (!this.isRequireInput()) {
      return;
    }
    if (this.channels.length === 0) {
      return t("automation.field.channels.error.required");
    }
  }

  protected parseConditionToValue(condition: CompoundConditionType): any {
    if (this.isMultiple()) {
      return getAllConditionValues(condition);
    } else {
      return getFirstConditionValue(condition);
    }
  }

  protected updateValue(newValue: TargetedChannelType[]): void {
    this.channels = newValue;
  }

  withValue(value: TargetedChannelType[]): this {
    return super.withValue(value);
  }

  protected constructFilled(
    instance: this,
    condition: CompoundConditionType,
    rule: AssignmentRuleType
  ): this {
    return super
      .constructFilled(instance, condition, rule)
      .withValue(rule.channelsWithIds);
  }

  applyToRequest(draftRequest: AssignmentRuleRequestType, index: number) {
    super.applyToRequest(draftRequest, index);
    const foundTwilioIndex = this.channels.findIndex(
      (channel) => channel.channel === "twilio_whatsapp"
    );
    if (foundTwilioIndex > -1) {
      const foundTwilio = this.channels.splice(foundTwilioIndex, 1);
      const foundWhatsappIndex = this.channels.findIndex(
        (channel) => channel.channel === "whatsapp"
      );
      if (foundWhatsappIndex > -1) {
        this.channels[foundWhatsappIndex].ids = [
          ...(this.channels[foundWhatsappIndex].ids ?? []),
          ...foundTwilio.map((channel) => channel.ids ?? []).flat(),
        ];
      } else {
        this.channels = [
          ...this.channels,
          {
            channel: "whatsapp",
            ids: foundTwilio.map((channel) => channel.ids ?? []).flat(),
          },
        ];
      }
    }
    draftRequest.targetedChannelWithIds = this.channels;
  }
}
