import { CustomProfileField } from "../../../types/ContactType";
import { UserProfileGroupType } from "../../../container/Contact/Imported/UserProfileGroupType";
import useImportedLists from "../../../container/Contact/Imported/useImportedLists";
import { CustomUserProfileFieldLingualsType } from "../../../types/CompanyType";
import { useCustomProfileFields } from "../../../container/Contact/hooks/useCustomProfileFields";
import {
  AssignmentRuleType,
  CompoundConditionType,
  flattenCondition,
  isHashTagCondition,
} from "../../../types/AssignmentRuleType";
import { propEq } from "ramda";
import { HashTagType } from "../../../types/ConversationType";
import {
  AWAY_STATUS_FIELD_NAME,
  AWAY_STATUS_FIELD_NAME_DENORMALIZED,
  AWAY_SUPPORTED_CONDITIONS,
  HASHTAG_FIELD_NAME,
  StaticFieldMap,
  StaticFieldName,
  STATIC_FIELDS,
  StaticFieldType,
  ConditionNameType,
} from "../../../config/ProfileFieldMapping";
import { useFieldLocales } from "../../Contact/locaizable/useFieldLocales";
import {
  FieldConfigInterpreter,
  FieldBuilderError,
} from "./ConditionField/FieldConfigInterpreter";
import { buildField } from "./ConditionField/buildField";
import { useCompanyHashTags } from "../../Settings/hooks/useCompanyHashTags";
import { useCallback } from "react";
import {
  NewFieldFactoryType,
  FieldFactoryType,
  ConversationStatusMap,
} from "./contracts/FieldFactoryType";

type ConditionBuilderHookReturnType = {
  fieldFactory: FieldFactoryType;
  newFieldFactory: NewFieldFactoryType;
  loading: boolean;
  booted: boolean;
};

export function useConditionFieldBuilder(): ConditionBuilderHookReturnType {
  const { lists, listsBooted } = useImportedLists();
  const { companyTags: hashtags } = useCompanyHashTags();

  const { isBooted: fieldsLoaded, fields: customFields = [] } =
    useCustomProfileFields({ includeNonVisibleFields: true });

  const {
    getFieldDisplayNameLocale,
    staticFieldDisplayNames,
    conversationStatus,
  } = useFieldLocales();

  const factoryDependencies = JSON.stringify([
    customFields,
    lists,
    hashtags,
    getFieldDisplayNameLocale,
    staticFieldDisplayNames,
    conversationStatus,
  ]);

  const fieldFactory = useCallback(
    (condition: CompoundConditionType, rule: AssignmentRuleType) => {
      const fieldPrototype = fieldFactoryWithDependencies(
        condition,
        customFields,
        lists,
        hashtags,
        getFieldDisplayNameLocale,
        staticFieldDisplayNames,
        conversationStatus
      );
      return fieldPrototype.fromRule(rule, condition);
    },
    [factoryDependencies]
  );

  const emptyFieldFactory = useCallback(
    (fieldName: string) =>
      newFieldFactory(
        fieldName,
        customFields,
        lists,
        hashtags,
        getFieldDisplayNameLocale,
        staticFieldDisplayNames,
        conversationStatus
      ),
    [factoryDependencies]
  );

  return {
    loading: !fieldsLoaded || !listsBooted,
    booted: listsBooted && fieldsLoaded,
    newFieldFactory: emptyFieldFactory,
    fieldFactory: fieldFactory,
  };
}

export function newFieldFactory(
  fieldName: string,
  customFields: CustomProfileField[],
  lists: UserProfileGroupType[],
  hashtags: HashTagType[],
  getFieldDisplayNameLocale: (
    dict: CustomUserProfileFieldLingualsType[],
    defaultName: string
  ) => string,
  staticFieldDisplayNames: StaticFieldMap,
  conversationStatus: ConversationStatusMap
) {
  const staticField = STATIC_FIELDS.find(propEq("fieldName", fieldName));
  if (staticField) {
    const interpreter = FieldConfigInterpreter(
      staticField.fieldType,
      [],
      lists,
      hashtags,
      getFieldDisplayNameLocale,
      conversationStatus
    );
    const displayName = staticFieldDisplayNames[fieldName];
    if (displayName === undefined) {
      throw `Missing translation for ${fieldName}`;
    }
    return buildField(interpreter, fieldName, displayName);
  } else {
    const customField = customFields.find((f) => f.fieldName === fieldName);
    if (!customField) {
      throw { message: `No field with name ${fieldName}` };
    }
    const interpreter = FieldConfigInterpreter(
      customField.type,
      customField.options ?? [],
      lists,
      hashtags,
      getFieldDisplayNameLocale,
      conversationStatus
    );

    const displayName = getFieldDisplayNameLocale(
      customField.linguals,
      customField.displayName
    );
    if (displayName === undefined) {
      throw `Missing translation for ${fieldName}`;
    }
    return buildField(interpreter, fieldName, displayName);
  }
}

export function fieldFactoryWithDependencies(
  condition: CompoundConditionType,
  customFields: CustomProfileField[],
  lists: UserProfileGroupType[],
  hashtags: HashTagType[],
  getFieldDisplayNameLocale: (
    dict: CustomUserProfileFieldLingualsType[],
    defaultName: string
  ) => string,
  staticFieldDisplayNames: { [k in StaticFieldName]: string },
  conversationStatus: ConversationStatusMap
) {
  const { options, fieldType, fieldName, fieldDisplayName } =
    guessFieldFromCondition(
      condition,
      customFields,
      getFieldDisplayNameLocale,
      staticFieldDisplayNames
    );
  const interpreter = FieldConfigInterpreter(
    fieldType,
    options ?? [],
    lists,
    hashtags,
    getFieldDisplayNameLocale,
    conversationStatus
  );

  return buildField(interpreter, fieldName, fieldDisplayName);
}

function guessFieldFromCondition(
  condition: CompoundConditionType,
  customFields: CustomProfileField[],
  getFieldDisplayNameLocale: (
    dict: CustomUserProfileFieldLingualsType[],
    defaultName: string
  ) => string,
  staticFieldDisplayNames: { [k in StaticFieldName]: string }
) {
  const [firstCondition] = flattenCondition(condition);

  if (firstCondition === undefined) {
    throw { message: "No condition content", condition };
  }
  if (isHashTagCondition(firstCondition)) {
    return {
      fieldName: HASHTAG_FIELD_NAME,
      fieldType: HASHTAG_FIELD_NAME,
      options: [],
      fieldDisplayName: staticFieldDisplayNames[HASHTAG_FIELD_NAME],
    };
  }

  const fieldName = denormalizeStaticFieldName(condition);
  const matchOperator = firstCondition.conditionOperator as ConditionNameType;

  if (fieldName === undefined) {
    throw { message: "Cannot detect the field name and type", condition };
  }

  const getWeight = (x: StaticFieldType) => {
    let weight = 0;
    const nameToCompare = x.fieldApiAlias ?? x.fieldName;
    if (fieldName === nameToCompare) {
      weight += 1;
      if (x.fieldApiAlias) {
        weight += 1;
      }
      if (x.operatorsInclude && x.operatorsInclude.includes(matchOperator)) {
        weight += 1;
      }
      if (x.operatorsExclude && !x.operatorsExclude.includes(matchOperator)) {
        weight += 1;
      }
    }
    return weight;
  };

  const staticField = STATIC_FIELDS.filter((fld) => getWeight(fld) > 0)
    .sort((a, b) => {
      return getWeight(b) - getWeight(a);
    })
    .shift();

  if (staticField) {
    return {
      ...staticField,
      fieldDisplayName: staticFieldDisplayNames[fieldName],
    };
  }

  const condFieldName = firstCondition.fieldName;
  const customField = customFields.find((f) => f.fieldName === condFieldName);
  if (!customField) {
    throw new FieldBuilderError(`No field found for ${condFieldName}`);
  }
  return {
    fieldName: fieldName,
    fieldType: customField.type,
    options: customField.options ?? [],
    fieldDisplayName: getFieldDisplayNameLocale(
      customField.linguals,
      fieldName
    ),
  };
}

function denormalizeStaticFieldName(
  condition: CompoundConditionType
): string | undefined {
  const [headCondition] = flattenCondition(condition);
  const nameNormalized = headCondition?.fieldName;
  switch (nameNormalized) {
    case AWAY_STATUS_FIELD_NAME:
      if (
        AWAY_SUPPORTED_CONDITIONS.includes(
          headCondition?.conditionOperator as any
        )
      ) {
        return AWAY_STATUS_FIELD_NAME_DENORMALIZED;
      }
      break;
  }
  return nameNormalized;
}
