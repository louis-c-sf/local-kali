export type RuleOptionsValues =
  (typeof RULE_OPTIONS)[keyof typeof RULE_OPTIONS]['value'];
export const RULE_OPTIONS_ARRAY = [
  'Contains',
  'ContainsAny',
  'IsNotContainsAll',
  'ContainsAll',
  'IsNotContains',
  'IsNotContainsAny',
  'IsNull',
  'ContainsExactly',
  'IsNotNull',
  'IsNotContainsExactly',
  'Equals',
  'HigherThan',
  'LessThan',
  'DateBeforeDayAgo',
  'DateAfterDayAgo',
  'IsExactlyDaysBefore',
  'IsToday',
  'TimeBefore',
  'TimeAfter',
  'IsBetween',
  'IsNotBetween',
] as const;
export const RULE_OPTIONS = {
  contains: {
    // t('filter-rules.contains')
    displayName: 'filter-rules.contains',
    value: 'Contains',
    // Add conflicting conditions here to exclude this option when any of the options are active with matching fieldName
    excludeWhenExists: [],
  },
  containsAny: {
    // t('filter-rules.contains-any')
    displayName: 'filter-rules.contains-any',
    value: 'ContainsAny',
    excludeWhenExists: [],
  },
  isNotContainsAll: {
    // t('filter-rules.is-not-contains-all')
    displayName: 'filter-rules.is-not-contains-all',
    value: 'IsNotContainsAll',
    excludeWhenExists: [],
  },
  containsAll: {
    // t('filter-rules.contains-all')
    displayName: 'filter-rules.contains-all',
    value: 'ContainsAll',
    excludeWhenExists: [],
  },
  isNotContains: {
    // t('filter-rules.is-not-contains')
    displayName: (options: { isChoice: boolean }) =>
      options.isChoice
        ? 'filter-rules.is-not-contains-any'
        : 'filter-rules.is-not-contains',
    value: 'IsNotContains',
    excludeWhenExists: [],
  },
  isNotContainsAny: {
    // t('filter-rules.is-not-contains-any')
    displayName: 'filter-rules.is-not-contains-any',
    value: 'IsNotContainsAny',
    excludeWhenExists: [],
  },
  isNull: {
    // t('filter-rules.is-null')
    displayName: 'filter-rules.is-null',
    value: 'IsNull',
    excludeWhenExists: ['IsNotNull'],
  },
  containsExactly: {
    // t('filter-rules.contains-exactly')
    displayName: 'filter-rules.contains-exactly',
    value: 'ContainsExactly',
    excludeWhenExists: [],
  },
  isNotNull: {
    // t('filter-rules.is-not-null')
    displayName: 'filter-rules.is-not-null',
    value: 'IsNotNull',
    excludeWhenExists: ['IsNull'],
  },
  isNotContainsExactly: {
    // t('filter-rules.is-not-contains-exactly')
    displayName: 'filter-rules.is-not-contains-exactly',
    value: 'IsNotContainsExactly',
    excludeWhenExists: [],
  },
  equals: {
    // t('filter-rules.equals')
    displayName: 'filter-rules.equals',
    value: 'Equals',
    excludeWhenExists: [],
  },
  lessThanNumber: {
    // t('filter-rules.less-than-number')
    displayName: 'filter-rules.less-than-number',
    value: 'LessThan',
    excludeWhenExists: [],
  },
  greaterThanNumber: {
    // t('filter-rules.greater-than-number')
    displayName: 'filter-rules.greater-than-number',
    value: 'HigherThan',
    excludeWhenExists: [],
  },
  afterDate: {
    // t('filter-rules.after-date')
    displayName: 'filter-rules.after-date',
    value: 'HigherThan',
    excludeWhenExists: [],
  },
  beforeDate: {
    // t('filter-rules.before-date')
    displayName: 'filter-rules.before-date',
    value: 'LessThan',
    excludeWhenExists: [],
  },
  dateBeforeDayAgo: {
    // t('filter-rules.date-before-day-ago')
    displayName: 'filter-rules.date-before-day-ago',
    value: 'DateBeforeDayAgo',
    excludeWhenExists: [],
  },
  dateAfterDayAgo: {
    // t('filter-rules.date-after-day-ago')
    displayName: 'filter-rules.date-after-day-ago',
    value: 'DateAfterDayAgo',
    excludeWhenExists: [],
  },
  isExactlyDaysBefore: {
    // t('filter-rules.is-exactly-days-before')
    displayName: 'filter-rules.is-exactly-days-before',
    value: 'IsExactlyDaysBefore',
    excludeWhenExists: [],
  },
  isExactlyDaysAfter: {
    // t('filter-rules.is-exactly-days-after')
    displayName: 'filter-rules.is-exactly-days-after',
    value: 'IsExactlyDaysAfter',
    excludeWhenExists: [],
  },
  isToday: {
    // t('filter-rules.is-today')
    displayName: 'filter-rules.is-today',
    value: 'IsToday',
    excludeWhenExists: [],
  },
  timeBefore: {
    // t('filter-rules.time-before')
    displayName: 'filter-rules.time-before',
    value: 'TimeBefore',
    excludeWhenExists: [],
  },
  timeAfter: {
    // t('filter-rules.time-after')
    displayName: 'filter-rules.time-after',
    value: 'TimeAfter',
    excludeWhenExists: [],
  },
  isBetween: {
    // t('filter-rules.is-between')
    displayName: 'filter-rules.is-between',
    value: 'IsBetween',
    excludeWhenExists: [],
  },
  isNotBetween: {
    // t('filter-rules.is-not-between')
    displayName: 'filter-rules.is-not-between',
    value: 'IsNotBetween',
    excludeWhenExists: [],
  },
} as const;
export type FilterRulesConfig = typeof FILTER_RULES_CONFIG;
export const FILTER_RULES_CONFIG = {
  Lists: [
    RULE_OPTIONS.containsAny,
    RULE_OPTIONS.containsAll,
    RULE_OPTIONS.isNotContainsAny,
  ],
  Labels: [
    RULE_OPTIONS.containsAny,
    RULE_OPTIONS.containsAll,
    RULE_OPTIONS.isNotContainsAny,
  ],
  TravisUser: [
    RULE_OPTIONS.contains,
    RULE_OPTIONS.isNotContains,
    RULE_OPTIONS.isNull,
    RULE_OPTIONS.isNotNull,
  ],
  Date: [
    RULE_OPTIONS.equals,
    RULE_OPTIONS.beforeDate,
    RULE_OPTIONS.afterDate,
    RULE_OPTIONS.isNull,
    RULE_OPTIONS.isNotNull,
  ],
  DateTime: [
    RULE_OPTIONS.equals,
    RULE_OPTIONS.beforeDate,
    RULE_OPTIONS.afterDate,
    RULE_OPTIONS.isNull,
    RULE_OPTIONS.isNotNull,
  ],
  Options: [
    RULE_OPTIONS.isNull,
    RULE_OPTIONS.isNotNull,
    RULE_OPTIONS.isNotContainsExactly,
    RULE_OPTIONS.isNotContains,
    RULE_OPTIONS.containsExactly,
  ],
  PhoneNumber: [
    RULE_OPTIONS.contains,
    RULE_OPTIONS.isNotContains,
    RULE_OPTIONS.isNull,
    RULE_OPTIONS.isNotNull,
  ],
  Channel: [
    RULE_OPTIONS.isNull,
    RULE_OPTIONS.contains,
    //todo implement isNotContains
    // RULE_OPTIONS.isNotContains,
    RULE_OPTIONS.isNotNull,
  ],
  SingleLineText: [
    RULE_OPTIONS.contains,
    RULE_OPTIONS.isNotContains,
    RULE_OPTIONS.isNotNull,
    RULE_OPTIONS.isNull,
  ],
  MultiLineText: [
    RULE_OPTIONS.contains,
    RULE_OPTIONS.isNotContains,
    RULE_OPTIONS.isNotNull,
    RULE_OPTIONS.isNull,
  ],
  Number: [
    RULE_OPTIONS.equals,
    RULE_OPTIONS.lessThanNumber,
    RULE_OPTIONS.greaterThanNumber,
    RULE_OPTIONS.isNull,
    RULE_OPTIONS.isNotNull,
  ],
  Email: [
    RULE_OPTIONS.contains,
    RULE_OPTIONS.isNotContains,
    RULE_OPTIONS.isNotNull,
    RULE_OPTIONS.isNull,
  ],
  Boolean: [
    RULE_OPTIONS.equals,
    RULE_OPTIONS.contains,
    RULE_OPTIONS.isNotNull,
    RULE_OPTIONS.isNull,
  ],
  FirstName: [
    RULE_OPTIONS.contains,
    RULE_OPTIONS.isNotContains,
    RULE_OPTIONS.isNotNull,
    RULE_OPTIONS.isNull,
  ],
  LastName: [
    RULE_OPTIONS.contains,
    RULE_OPTIONS.isNotContains,
    RULE_OPTIONS.isNotNull,
    RULE_OPTIONS.isNull,
  ],
  CreatedAt: [
    RULE_OPTIONS.equals,
    RULE_OPTIONS.beforeDate,
    RULE_OPTIONS.afterDate,
  ],
  Collaborators: [
    RULE_OPTIONS.containsAny,
    RULE_OPTIONS.containsAll,
    //todo implement isNotContains
    // RULE_OPTIONS.isNotContains,
  ],
  UserLanguage: [
    RULE_OPTIONS.contains,
    RULE_OPTIONS.isNotContains,
    RULE_OPTIONS.isNull,
    RULE_OPTIONS.isNotNull,
  ],
  ConversationAssignee: [
    RULE_OPTIONS.containsAny,
    RULE_OPTIONS.isNotContainsAny,
  ],
  ConversationChannel: [
    RULE_OPTIONS.containsAny,
    RULE_OPTIONS.isNotContainsAny,
  ],
  ConversationChannelType: [
    RULE_OPTIONS.containsAny,
    RULE_OPTIONS.isNotContainsAny,
  ],
  ContactOwnerField: [], // only used for automations
  BlogURLs: [], // Not used
  Json: [], // Not used
  URL: [], // Not used
  Team: [], // Not used
} as const;
export type ContactFieldTypeFilterRules<T extends keyof FilterRulesConfig> =
  FilterRulesConfig[T][number]['value'];
