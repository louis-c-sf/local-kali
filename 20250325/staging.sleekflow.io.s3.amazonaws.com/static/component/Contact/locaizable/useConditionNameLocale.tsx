import { useTranslation } from "react-i18next";
import {
  ACTIVE_CONDITION_OPERATOR,
  AWAY_CONDITION_OPERATOR,
  AWAY_STATUS_TYPE,
  LIST_FIELD_NAME,
  HASHTAG_FIELD_NAME,
  ConditionNameType,
} from "../../../config/ProfileFieldMapping";
import { useMemo } from "react";

export type ConditionNameDisplayMapType = {
  [k in ConditionNameType]?: string;
};

export type ConditionNameMapType = {
  [k: string /* lowercased */]: {
    [j in ConditionNameType]?: string;
  };
};

export function useConditionNameLocale() {
  const { t, i18n } = useTranslation();
  const conditionNameDisplayMap: ConditionNameDisplayMapType = useMemo(
    () => ({
      IsNotContainsExactly: t("profile.condition.option.IsNotContains"),
      ContainsExactly: t("profile.condition.option.Contains"),
      Equals: t("profile.conditionDisplay.Equals"),
      HigherThan: t("profile.conditionDisplay.HigherThan"),
      LesserThan: t("profile.conditionDisplay.LessThan"),
      LessThan: t("profile.conditionDisplay.LessThan"),
      Contains: t("profile.conditionDisplay.Contains"),
      IsNotContains: t("profile.conditionDisplay.IsNotContains"),
      IsNull: t("profile.conditionDisplay.IsNull"),
      IsNotNull: t("profile.conditionDisplay.IsNotNull"),
      IsChanged: t("profile.conditionDisplay.IsChanged"),
      IsBetween: t("profile.conditionDisplay.IsBetween"),
      IsNotBetween: t("profile.conditionDisplay.IsNotBetween"),
      TimeBefore: t("profile.conditionDisplay.TimeBefore"),
      TimeAfter: t("profile.conditionDisplay.TimeAfter"),
      DateBeforeDayAgo: t("profile.conditionDisplay.DateBeforeDayAgo"),
      DateAfterDayAgo: t("profile.conditionDisplay.DateAfterDayAgo"),
      IsExactlyDaysBefore: t("profile.conditionDisplay.IsExactlyDaysBefore"),
      IsExactlyDaysAfter: t("profile.conditionDisplay.IsExactlyDaysAfter"),
      IsToday: t("profile.conditionDisplay.IsToday"),
      DayOfWeek: t("profile.conditionDisplay.DayOfWeek"),
      [ACTIVE_CONDITION_OPERATOR]: t("profile.conditionDisplay.away.active"),
      [AWAY_CONDITION_OPERATOR]: t("profile.conditionDisplay.away.away"),
      ContainsAll: t("profile.conditionDisplay.ContainsAll"),
      ContainsAny: t("profile.conditionDisplay.ContainsAny"),
      IsNotContainsAll: t("profile.conditionDisplay.IsNotContainsAll"),
      IsNotContainsAny: t("profile.conditionDisplay.IsNotContainsAny"),
      Contains_And: t("profile.conditionDisplay.Contains_And"),
      Contains_Or: t("profile.conditionDisplay.Contains_Or"),
      IsNotContains_And: t("profile.conditionDisplay.IsNotContains_And"),
      IsNotContains_Or: t("profile.conditionDisplay.IsNotContains_Or"),
      RegexMatched: t("profile.conditionDisplay.RegexMatched"),
    }),
    [i18n.language]
  );
  const automationNameMap: ConditionNameMapType = useMemo(
    () => ({
      date: {
        Equals: t("automation.form.condition.Equals"),
        IsNotNull: t("automation.form.condition.IsNotNull"),
        IsNull: t("automation.form.condition.IsNull"),
        IsChanged: t("automation.form.condition.IsChanged"),
        DateBeforeDayAgo: t("automation.form.condition.DateBeforeDayAgo"),
        DateAfterDayAgo: t("automation.form.condition.DateAfterDayAgo"),
        IsExactlyDaysBefore: t("automation.form.condition.IsExactlyDaysBefore"),
        IsExactlyDaysAfter: t("automation.form.condition.IsExactlyDaysAfter"),
        IsBetween: t("automation.form.condition.IsBetween"),
        IsNotBetween: t("automation.form.condition.IsNotBetween"),
        LessThan: t("automation.form.condition.TimeBefore"),
        HigherThan: t("automation.form.condition.TimeAfter"),
        IsToday: t("automation.form.condition.IsToday"),
        DayOfWeek: t("automation.form.condition.DayOfWeek"),
      },
      datetime: {
        Equals: t("automation.form.condition.Equals"),
        IsNotNull: t("automation.form.condition.IsNotNull"),
        IsNull: t("automation.form.condition.IsNull"),
        IsChanged: t("automation.form.condition.IsChanged"),
        DateBeforeDayAgo: t("automation.form.condition.DateBeforeDayAgo"),
        DateAfterDayAgo: t("automation.form.condition.DateAfterDayAgo"),
        IsExactlyDaysBefore: t("automation.form.condition.IsExactlyDaysBefore"),
        IsExactlyDaysAfter: t("automation.form.condition.IsExactlyDaysAfter"),
        IsBetween: t("automation.form.condition.IsBetween"),
        IsNotBetween: t("automation.form.condition.IsNotBetween"),
        LessThan: t("automation.form.condition.TimeBefore"),
        HigherThan: t("automation.form.condition.TimeAfter"),
        IsToday: t("automation.form.condition.IsToday"),
        DayOfWeek: t("automation.form.condition.DayOfWeek"),
      },
      boolean: {
        Equals: t("automation.form.condition.Equals"),
        IsNotNull: t("profile.condition.IsNotNull"),
        IsNull: t("profile.condition.IsNull"),
        IsChanged: t("profile.condition.IsChanged"),
      },
      channel: {
        Contains: t("profile.condition.channel.Contains"),
        IsNotContains: t("profile.condition.channel.IsNotContains"),
        IsNotNull: t("profile.condition.IsNotNull"),
        IsNull: t("profile.condition.IsNull"),
        IsChanged: t("profile.condition.IsChanged"),
      },
    }),
    [i18n.language]
  );

  const conditionNameMap: ConditionNameMapType = useMemo(
    () => ({
      multilinetext: {
        Contains: t("profile.condition.Contains"),
        IsNotContains: t("profile.condition.IsNotContains"),
        IsNotNull: t("profile.condition.IsNotNull"),
        IsNull: t("profile.condition.IsNull"),
        IsChanged: t("profile.condition.IsChanged"),
      },
      singlelinetext: {
        Contains: t("profile.condition.Contains"),
        IsNotContains: t("profile.condition.IsNotContains"),
        IsNotNull: t("profile.condition.IsNotNull"),
        IsNull: t("profile.condition.IsNull"),
        IsChanged: t("profile.condition.IsChanged"),
      },
      email: {
        Contains: t("profile.condition.Contains"),
        IsNotContains: t("profile.condition.IsNotContains"),
        IsNotNull: t("profile.condition.IsNotNull"),
        IsNull: t("profile.condition.IsNull"),
        IsChanged: t("profile.condition.IsChanged"),
      },
      phonenumber: {
        Contains: t("profile.condition.Contains"),
        IsNotContains: t("profile.condition.IsNotContains"),
        IsNotNull: t("profile.condition.IsNotNull"),
        IsNull: t("profile.condition.IsNull"),
        IsChanged: t("profile.condition.IsChanged"),
      },
      boolean: {
        Equals: t("profile.condition.boolean.Equals"),
        Contains: t("profile.condition.boolean.Contains"),
        IsNotNull: t("profile.condition.IsNotNull"),
        IsNull: t("profile.condition.IsNull"),
        IsChanged: t("profile.condition.IsChanged"),
      },
      date: {
        Equals: t("profile.condition.date.Equals"),
        LessThan: t("profile.condition.date.LessThan"),
        HigherThan: t("profile.condition.HigherThan"),
        IsNotNull: t("profile.condition.IsNotNull"),
        IsNull: t("profile.condition.IsNull"),
        IsChanged: t("profile.condition.IsChanged"),
      },
      datetime: {
        Equals: t("profile.condition.date.Equals"),
        LessThan: t("profile.condition.date.LessThan"),
        HigherThan: t("profile.condition.date.HigherThan"),
        IsNotNull: t("profile.condition.IsNotNull"),
        IsNull: t("profile.condition.IsNull"),
        IsChanged: t("profile.condition.IsChanged"),
      },
      number: {
        Equals: t("profile.condition.Equals"),
        HigherThan: t("profile.condition.HigherThan"),
        LessThan: t("profile.condition.LessThan"),
        IsNotNull: t("profile.condition.IsNotNull"),
        IsNull: t("profile.condition.IsNull"),
        IsChanged: t("profile.condition.IsChanged"),
      },
      options: {
        ContainsExactly: t("profile.condition.option.Contains"),
        IsNotContainsExactly: t("profile.condition.option.IsNotContains"),
        IsNotNull: t("profile.condition.IsNotNull"),
        IsNull: t("profile.condition.IsNull"),
        IsChanged: t("profile.condition.IsChanged"),
      },
      contactownerfield: {
        ContainsExactly: t("profile.condition.option.Contains"),
        IsNotContainsExactly: t("profile.condition.option.IsNotContains"),
        IsNotNull: t("profile.condition.IsNotNull"),
        IsNull: t("profile.condition.IsNull"),
      },
      conversationstatus: {
        Equals: t("profile.condition.option.is"),
        Contains: t("profile.condition.option.oneOf"),
        IsNotContains: t("profile.condition.option.isNot"),
      },
      collaborators: {
        ContainsAll: t("profile.condition.list.ContainsAllAnd"),
        ContainsAny: t("profile.condition.list.ContainsAnyOr"),
      },
      channel: {
        Contains: t("profile.condition.channel.Contains"),
        IsNotNull: t("profile.condition.IsNotNull"),
        IsNull: t("profile.condition.IsNull"),
        IsChanged: t("profile.condition.IsChanged"),
      },
      channelcondition: {
        Contains: t("profile.condition.channel.Contains"),
        IsNotNull: t("profile.condition.IsNotNull"),
        IsNull: t("profile.condition.IsNull"),
        IsChanged: t("profile.condition.IsChanged"),
      },
      travisuser: {
        Contains: t("profile.condition.option.Contains"),
        IsNotContains: t("profile.condition.option.IsNotContains"),
        IsNotNull: t("profile.condition.IsNotNull"),
        IsNull: t("profile.condition.IsNull"),
        IsChanged: t("profile.condition.IsChanged"),
      },
      [LIST_FIELD_NAME]: {
        ContainsAll: t("profile.condition.list.ContainsAll"),
        ContainsAny: t("profile.condition.list.ContainsAny"),
        IsNotContainsAll: t("profile.condition.list.IsNotContainsAll"),
        IsNotContainsAny: t("profile.condition.list.IsNotContainsAny"),
      },
      keywords: {
        Equals: t("profile.condition.keywords.Equals"),
        Contains: t("profile.condition.keywords.Contains"),
      },
      regex: {
        RegexMatched: t("profile.condition.keywords.Contains"),
        // RegexNotMatched: t("profile.condition.list.IsNotContainsAny"),
      },
      language: {
        Contains: t("profile.condition.Contains"),
      },
      userlanguage: {
        Contains: t("profile.condition.Contains"),
        IsNotContains: t("profile.condition.IsNotContains"),
        IsNotNull: t("profile.condition.IsNotNull"),
        IsNull: t("profile.condition.IsNull"),
        IsChanged: t("profile.condition.IsChanged"),
      },
      [AWAY_STATUS_TYPE]: {
        [AWAY_CONDITION_OPERATOR]: t("profile.condition.away.away"),
        [ACTIVE_CONDITION_OPERATOR]: t("profile.condition.away.active"),
      },
      [HASHTAG_FIELD_NAME]: {
        ContainsAll: t("profile.condition.hashtag.ContainsAll"),
        ContainsAny: t("profile.condition.hashtag.ContainsAny"),
        IsNotContainsAll: t("profile.condition.hashtag.IsNotContainsAll"),
        IsNotContainsAny: t("profile.condition.hashtag.IsNotContainsAny"),
      },
    }),
    [i18n.language]
  );

  return {
    automationNameMap,
    conditionNameMap,
    conditionNameDisplayMap,
  };
}
