import { FormikHelpers, FormikState } from "formik";
import { AbstractConditionField } from "./fields/AbstractConditionField";
import { Dropdown, Grid, GridColumn, GridRow } from "semantic-ui-react";
import {
  ConditionNameType,
  STATIC_FIELDS,
} from "../../../config/ProfileFieldMapping";
import { FieldError } from "../../shared/form/FieldError";
import produce from "immer";
import React, { useEffect, useRef, useState } from "react";
import { ConditionValueInput } from "./ConditionsValueInput";
import { useCustomProfileFields } from "../../../container/Contact/hooks/useCustomProfileFields";
import {
  AssignmentRuleFormType,
  AssignmentRuleType,
  AutomationConditionType,
  isHashTagCondition,
  LogicType,
} from "../../../types/AssignmentRuleType";
import { AutomationRuleGuard } from "./AutomationRuleGuard";
import { useCurrentUtcOffset } from "../../Chat/hooks/useCurrentUtcOffset";
import { equals, update } from "ramda";
import { SearchableDialog } from "../../shared/popup/SearchableDialog/SearchableDialog";
import { DropdownOptionType } from "../../Chat/ChannelFilterDropdown";
import { getQueryMatcher } from "../../../container/Settings/filters/getQueryMatcher";
import { DropdownMenuList } from "../../shared/DropdownMenuList";
import { flatErrors } from "../../../utility/yup/flatErrors";
import { Trans, useTranslation } from "react-i18next";
import { useConditionNameLocale } from "../../Contact/locaizable/useConditionNameLocale";
import { InfoTooltip } from "../../shared/popup/InfoTooltip";
import { ConditionFieldDropdown } from "./ConditionForm/ConditionFieldDropdown";
import { CrossRoundedIcon } from "../../../assets/tsx/icons/CrossRoundedIcon";
import { NewFieldFactoryType } from "./contracts/FieldFactoryType";
import { fetchCountContacts } from "api/Contacts/fetchCountContacts";
import BadgeTag from "component/shared/BadgeTag/BadgeTag";
import styles from "./ConditionsForm.module.css";
import useRouteConfig from "config/useRouteConfig";
import {
  FILTERS_LAST_CONTACT_FILTER_DATETIME,
  FILTERS_LISTS_OPERATOR_STORAGE_KEY,
  FILTERS_LISTS_STORAGE_KEY,
  FILTERS_STORAGE_KEY,
  FILTERS_TAGS_OPERATOR_STORAGE_KEY,
  FILTERS_TAGS_STORAGE_KEY,
} from "container/Contact";
import { useAppSelector } from "AppRootContext";

const CRM_CUSTOM_FIELD_TYPE = ["CrmSourceProviderName", "CrmSourceObjectId"];

export function ConditionsForm(props: {
  form: FormikState<AssignmentRuleFormType> & FormikHelpers<AssignmentRuleType>;
  newFieldFactory: NewFieldFactoryType;
}) {
  const { form, newFieldFactory } = props;
  const guard = new AutomationRuleGuard(form.values);
  const { conditionNameMap, automationNameMap } = useConditionNameLocale();
  const { t } = useTranslation();
  const { fields: customFields } = useCustomProfileFields({
    excludeLabels: true,
    excludeLists: true,
    excludeCollabors: true,
    includeNonVisibleFields: true,
  });
  const utcOffset = useCurrentUtcOffset();
  const allConditionFields: AbstractConditionField[] = customFields
    .filter((c) => !CRM_CUSTOM_FIELD_TYPE.includes(c.type))
    .map((customField) => {
      return newFieldFactory(customField.fieldName);
    })
    .concat(
      STATIC_FIELDS.map((fld) => {
        return newFieldFactory(fld.fieldName);
      })
    );
  const [conditionTargetTotal, setConditionTargetTotal] = useState<number>(0);
  const { routeTo } = useRouteConfig();
  const companyHashtags = useAppSelector(
    (s) => s.company?.companyHashtags,
    equals
  );

  const availableTypeChoices = allConditionFields
    .reduce<AbstractConditionField[]>((acc, field) => {
      if (guard.canAddConditionField(field)) {
        acc.push(field);
      }
      return acc;
    }, [])
    .map((f, i) => {
      return {
        key: i,
        text: f.displayName,
        value: f.fieldName,
      };
    });

  // todo add Contact Lists

  function handleAddField(fieldName: string) {
    try {
      const field = newFieldFactory(fieldName);
      const conditionsUpdated = produce(
        form.values.conditionFields,
        (draft) => {
          draft.push(field);
        }
      );
      form.setFieldValue("conditionFields", conditionsUpdated);
    } catch (e) {
      console.error("#automations-redesign ", e);
    }
  }

  function viewTargetList() {
    try {
      const conditions = form.values.conditionFields
        .filter((fld) => !fld.validate(t))
        .map((fld) => fld.toConditionType() as AutomationConditionType);
      if (conditions.length) {
        localStorage.setItem(
          FILTERS_LAST_CONTACT_FILTER_DATETIME,
          new Date().getTime().toString()
        );
        localStorage.removeItem(FILTERS_STORAGE_KEY);
        localStorage.removeItem(FILTERS_TAGS_STORAGE_KEY);
        localStorage.removeItem(FILTERS_LISTS_STORAGE_KEY);
        localStorage.removeItem(FILTERS_TAGS_OPERATOR_STORAGE_KEY);
        localStorage.removeItem(FILTERS_LISTS_OPERATOR_STORAGE_KEY);
      }

      const filters = conditions.filter(
        (con) => con?.fieldName !== "importfrom" && !isHashTagCondition(con)
      );
      if (filters.length) {
        localStorage.setItem(
          FILTERS_STORAGE_KEY,
          JSON.stringify(
            filters.map((filter) => ({
              fieldName: filter.fieldName,
              fieldType: "customField",
              filterCondition: filter.conditionOperator,
              filterValue: filter.values,
              nextOperator: filter.nextOperator,
            }))
          )
        );
      }

      const tagFilter = conditions.find((con) => isHashTagCondition(con));
      if (tagFilter) {
        localStorage.setItem(
          FILTERS_TAGS_STORAGE_KEY,
          JSON.stringify(
            tagFilter.values?.map((item) =>
              companyHashtags?.find((tag) => tag.hashtag === item)
            )
          )
        );
        localStorage.setItem(
          FILTERS_TAGS_OPERATOR_STORAGE_KEY,
          JSON.stringify(tagFilter.conditionOperator)
        );
      }

      const listFilter = conditions.find(
        (con) => con?.fieldName === "importfrom"
      );
      if (listFilter) {
        localStorage.setItem(
          FILTERS_LISTS_STORAGE_KEY,
          JSON.stringify(listFilter.values)
        );
        localStorage.setItem(
          FILTERS_LISTS_OPERATOR_STORAGE_KEY,
          JSON.stringify(listFilter.conditionOperator)
        );
      }

      window.open(routeTo("/contacts"));
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    async function handleGetConditionTargetNumber(conditionFields: any[]) {
      try {
        const validatePass = conditionFields.every((fld) => !fld.validate(t));
        if (!validatePass) {
          return;
        }
        const condition = conditionFields.map((fld) => fld.toConditionType());
        const result = await fetchCountContacts(condition);
        setConditionTargetTotal(result.totalResult);
      } catch (error) {
        console.error(error);
      }
    }
    if (form.values.automationType === "RecurringJob") {
      handleGetConditionTargetNumber(form.values.conditionFields);
    }
  }, [form.values.automationType, JSON.stringify(form.values.conditionFields)]);

  return (
    <Grid className={"conditions-form"}>
      {props.form.values.conditionFields.map((field, index) => {
        const error = Array.isArray(form.errors?.conditionFields)
          ? flatErrors(form.errors.conditionFields[index])[0]
          : undefined;

        return (
          <GridRow
            key={`${
              field.fieldName
            }_${field.getFormConditionOperator()}_${index}`}
            className={"condition-field"}
          >
            <GridColumn width={"4"} className={"control-item condition-type"}>
              <ConditionFieldDropdown
                field={field}
                availableTypeChoices={availableTypeChoices}
                onChange={(fieldName: string) => {
                  try {
                    const fieldUpdated = newFieldFactory(fieldName);
                    form.setFieldValue(
                      "conditionFields",
                      update(index, fieldUpdated, form.values.conditionFields)
                    );
                  } catch (e) {
                    console.error("#automations-redesign update", e);
                  }
                }}
              />
            </GridColumn>

            <GridColumn
              width={"4"}
              className={"control-item condition-operator"}
            >
              <Dropdown
                options={field.getConditionTypeChoices(
                  props.form.values.automationType,
                  { ...conditionNameMap, ...automationNameMap },
                  t
                )}
                value={field.getFormConditionOperator()}
                selection
                closeOnBlur
                upward={false}
                onChange={(_, data) => {
                  try {
                    const [condition, logic = "And"] = (
                      data.value as string
                    ).split("_") as [ConditionNameType, LogicType];
                    form.setFieldValue(
                      "conditionFields",
                      update(
                        index,
                        field.withConditionOperator(condition, logic),
                        form.values.conditionFields
                      )
                    );
                  } catch (e) {
                    console.error("#automations-redesign update condition", e);
                  }
                }}
              />
            </GridColumn>

            <ConditionValueInput
              field={field}
              utcOffset={utcOffset}
              onChange={(value) => {
                const fieldUpdated = field.withValue(value);
                form.setFieldValue(
                  "conditionFields",
                  produce(form.values.conditionFields, (draft) => {
                    draft[index] = fieldUpdated;
                  })
                );
              }}
            />
            <span
              className="close-button"
              onClick={() => {
                form.setFieldValue(
                  "conditionFields",
                  produce(form.values.conditionFields, (draft) => {
                    draft.splice(index, 1);
                  })
                );
              }}
            >
              <CrossRoundedIcon />
            </span>

            {error && (
              <GridColumn width={"16"} className={"error-column"}>
                <FieldError text={error} />
              </GridColumn>
            )}
          </GridRow>
        );
      })}
      <GridRow className="add-row">
        <GridColumn width={"4"}>
          <AddCondition
            availableTypeChoices={availableTypeChoices}
            onAdd={handleAddField}
          />
        </GridColumn>
      </GridRow>
      {form.values.automationType === "RecurringJob" && (
        <GridRow>
          <GridColumn>
            <div className={styles.targetTotalWrapper}>
              <BadgeTag
                className={styles.totalTag}
                compact
                text={`${t(
                  "automation.rule.form.condition.targetAudienceSize"
                )} ${conditionTargetTotal}`}
              />
              <div
                className={styles.viewTargetListLink}
                onClick={viewTargetList}
              >
                {t("automation.rule.form.condition.viewTargetList")}
              </div>
            </div>
          </GridColumn>
        </GridRow>
      )}
    </Grid>
  );
}

function AddCondition(props: {
  availableTypeChoices: DropdownOptionType[];
  onAdd: (fieldName: string) => void;
}) {
  const { availableTypeChoices, onAdd } = props;
  const [visibleChoices, setVisibleChoices] = useState<DropdownOptionType[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [opened, setOpened] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    if (searchQuery) {
      handleSearch(searchQuery);
    } else {
      handleSearchClear();
    }
  }, [availableTypeChoices.length]);

  const optionMatcher = getQueryMatcher((option: DropdownOptionType) => {
    return option.text;
  });
  const triggerRef = useRef<HTMLSpanElement>(null);

  function handleSearchClear() {
    setVisibleChoices(availableTypeChoices);
    setSearchQuery("");
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setVisibleChoices(availableTypeChoices.filter(optionMatcher(query)));
  };

  return (
    <>
      <InfoTooltip
        placement={"right"}
        children={<Trans i18nKey={"automation.tooltip.form.addCondition"} />}
        trigger={
          <span
            className={"ui button button-small"}
            ref={triggerRef}
            onClick={() => setOpened(!opened)}
          >
            <i className={"ui app icon chevron down"} />
            {t("automation.rule.form.condition.add")}
          </span>
        }
      />
      {opened && (
        <SearchableDialog
          onSearch={handleSearch}
          onSearchClear={handleSearchClear}
          close={() => {
            setOpened(false);
            setSearchQuery("");
            setVisibleChoices(availableTypeChoices);
          }}
          triggerRef={triggerRef}
          popperPlacement={"bottom-start"}
          offset={[-17, 0]}
        >
          {() => (
            <DropdownMenuList className={"scrolling"}>
              {visibleChoices.map((choice, k) => (
                <Dropdown.Item
                  key={k}
                  text={choice.text}
                  onClick={() => {
                    onAdd(choice.value);
                    setOpened(false);
                    setSearchQuery("");
                    setVisibleChoices(availableTypeChoices);
                  }}
                />
              ))}
            </DropdownMenuList>
          )}
        </SearchableDialog>
      )}
    </>
  );
}
