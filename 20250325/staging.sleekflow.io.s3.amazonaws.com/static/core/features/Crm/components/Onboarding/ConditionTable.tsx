import React, { useContext, useEffect, useState } from "react";
import onboardingStyles from "./CrmOnboarding.module.css";
import StepHeader from "../../components/StepHeader/StepHeader";
import { useTranslation } from "react-i18next";
import styles from "./ConditionTable.module.css";
import { formatNumber } from "utility/string";
import {
  Dropdown,
  DropdownProps,
  Form,
  Input,
  InputProps,
} from "semantic-ui-react";
import iconStyles from "component/shared/Icon/Icon.module.css";
import { Button } from "component/shared/Button/Button";
import OnboardingContext from "../../reducers/OnboardingContext";
import { postGetProviderTypeContact } from "../../API/Onboarding/postGetProviderTypeFields";
import PlusIcon from "assets/tsx/icons/PlusIcon";
import { array, object, string, ValidationError } from "yup";
import { set } from "lodash-es";
import { useAppSelector } from "AppRootContext";
import postInitProviderTypesSync from "../../API/Onboarding/postInitProviderTypesSync";
import postTriggerProviderSyncObjects from "../../API/Onboarding/postTriggerProviderSyncObjects";
import {
  ConditionType,
  ProviderFieldsType,
  ProviderType,
  SyncModeType,
} from "../../API/Onboarding/contracts";
import { postGetProviderContactCount } from "../../API/Onboarding/postGetProviderObjectsCount";
import moment, { Moment } from "moment";
import DatePickerUtcAware from "component/shared/DatePickerUTCAware";
import { useCurrentUtcOffset } from "component/Chat/hooks/useCurrentUtcOffset";
import { syncModeMap } from "./AutoSyncSettings";
import useFetchCompany from "api/Company/useFetchCompany";

type ErrorMsgType = {
  fieldName?: string;
  value?: string;
};

const conditionSchema = array().of(
  object({
    fieldName: string().required("required"),
    value: string().required("required"),
  })
);

export default function ConditionTable(props: {
  submitBtnText: string;
  onSubmitSuccess: () => void;
  providerType: ProviderType;
  providerSyncObjects: string[];
  crmName: string;
}) {
  const {
    submitBtnText,
    onSubmitSuccess,
    providerType,
    providerSyncObjects,
    crmName,
  } = props;
  const { t } = useTranslation();
  const usage = useAppSelector((s) => s.usage);
  const [count, setCount] = useState<number>(0);
  const [fields, setFields] = useState<ProviderFieldsType[]>([]);
  const [errors, setErrors] = useState<(ErrorMsgType | undefined)[]>([]);
  const [loading, setLoading] = useState(false);
  const {
    onboardingDispatch,
    importConditions,
    autoSyncSetting: { syncMode, field },
  } = useContext(OnboardingContext);
  const utcOffset = useCurrentUtcOffset();
  const { refreshCompany } = useFetchCompany();
  const handleGetCount = async (conditions: ConditionType[]) => {
    try {
      const filters = conditions.map((row) => ({
        fieldName: row.fieldName,
        value: isDateType(row) ? row.value : `'${row.value}'`,
      }));
      const { count } = await postGetProviderContactCount(
        providerType,
        filters
      );
      setCount(count || 0);
    } catch (err) {
      console.error(err);
      setCount(0);
    }
  };

  useEffect(() => {
    const updateCount = async () => {
      try {
        await conditionSchema.validate(importConditions, {
          abortEarly: false,
        });
        handleGetCount(importConditions);
      } catch (err) {
        console.error(err);
      }
    };
    const timer = setTimeout(() => updateCount(), 500);
    return () => clearTimeout(timer);
  }, [importConditions]);

  useEffect(() => {
    const getFields = async () => {
      try {
        const response = await postGetProviderTypeContact(providerType);
        setFields(response.fields);
      } catch (error) {
        console.error(error);
      }
    };
    getFields();
    handleGetCount([]);
  }, []);
  const options = fields.map(({ name, label, type }) => ({
    id: name,
    value: name,
    text: label,
    type,
  }));
  const handleChangeDropdown =
    (index: number) => (e: React.SyntheticEvent, data: DropdownProps) => {
      const value = data.value as string;
      const selectedOpt = options.find((s) => s.value === value);
      onboardingDispatch({
        type: "UPDATE_CONDITION_ROW",
        value: value,
        index,
        field: "fieldName",
        fieldType: selectedOpt?.type,
      });
    };

  const handleChangeInput =
    (index: number) => (e: React.SyntheticEvent, data: InputProps) => {
      onboardingDispatch({
        type: "UPDATE_CONDITION_ROW",
        value: data.value as string,
        index,
        field: "value",
      });
    };
  const handleDateChange = (
    index: number,
    date: Moment | null,
    isDateType: boolean
  ) => {
    if (!date) {
      return;
    }
    onboardingDispatch({
      type: "UPDATE_CONDITION_ROW",
      value: isDateType
        ? date.format("YYYY-MM-DD")
        : (date.toDate().toISOString() as string),
      index,
      field: "value",
    });
  };
  const handleAddRow = () => {
    onboardingDispatch({ type: "ADD_CONDITION_ROW" });
  };

  const handleDelete = (index: number) => () => {
    onboardingDispatch({ type: "DELETE_CONDITION_ROW", index });
  };

  const handleNextStep = async () => {
    try {
      setLoading(true);
      await conditionSchema.validate(importConditions, {
        abortEarly: false,
      });
      setErrors([]);
      const condition = importConditions.map((row) => ({
        ...row,
        value: isDateType(row) ? row.value : `'${row.value}'`,
      }));
      const syncModeItem = syncModeMap.find(
        (mode) =>
          mode.toCrm === syncMode.toCrm &&
          mode.toSleekflow === syncMode.toSleekflow
      );
      const autoSyncSetting = {
        syncMode: (syncModeItem?.syncMode || "from-provider") as SyncModeType,
        field: field,
      };
      await postInitProviderTypesSync(providerType, condition, autoSyncSetting);
      await Promise.all(
        providerSyncObjects.map((type) =>
          postTriggerProviderSyncObjects(providerType, type)
        )
      );
      refreshCompany();
      onSubmitSuccess();
    } catch (err) {
      if (err instanceof ValidationError && err.name === "ValidationError") {
        const errorMsgs = err.inner.reduce(
          (
            acc: (ErrorMsgType | undefined)[],
            curr: { path: string; message: string }
          ) => {
            return set(acc, curr.path, curr.message);
          },
          []
        );
        setErrors(errorMsgs);
      } else {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };
  function isDateType(row: ConditionType) {
    return row?.type && ["date", "datetime"].includes(row.type);
  }

  return (
    <>
      <div className={`container ${onboardingStyles.content}`}>
        <StepHeader
          provider={providerType}
          title={t("onboarding.crm.stepImportConditions.title", {
            crm: crmName,
          })}
          subtitle={t("onboarding.crm.stepImportConditions.subTitle", {
            crm: crmName,
          })}
        />
        <div className={`${onboardingStyles.section} ${styles.contactCount}`}>
          {t("onboarding.crm.stepImportConditions.contactCount", {
            number: formatNumber(count),
            crm: crmName,
          })}
        </div>
        <div className={onboardingStyles.section}>
          <Form>
            <div className={styles.conditionTitle}>
              {t("onboarding.crm.stepImportConditions.conditionTitle")}
            </div>
            <div className={styles.conditionDesc}>
              {t("onboarding.crm.stepImportConditions.conditionDesc", {
                crm: crmName,
              })}
            </div>
            {importConditions.map((row, index) => (
              <div className={styles.conditionRow}>
                <div className={styles.conditionField}>
                  <Dropdown
                    selectOnBlur={false}
                    search
                    noResultsMessage={t("onboarding.crm.error.notFound")}
                    className={
                      errors?.[index]?.fieldName
                        ? onboardingStyles.dropdownError
                        : ""
                    }
                    options={options}
                    fluid
                    selection
                    value={row.fieldName}
                    onChange={handleChangeDropdown(index)}
                  />
                </div>
                <div className={styles.conditionEqual}>
                  {t("onboarding.crm.stepImportConditions.equalsTo")}
                </div>
                <div className={styles.conditionValue}>
                  {isDateType(row) ? (
                    <DatePickerUtcAware
                      selected={row.value ? moment(row.value) : undefined}
                      onChange={(date) => {
                        const time = date ?? moment.utc("00:00", "HH:mm");
                        handleDateChange(index, time, row.type === "date");
                      }}
                      utcOffset={utcOffset}
                      dateFormat={
                        row.type === "date"
                          ? "dd/MM/yyyy"
                          : "dd/MM/yyyy h:mm aa"
                      }
                      {...(row.type === "datetime"
                        ? {
                            ...{
                              timeFormat: "HH:mm",
                              showTimeSelect: true,
                              timeIntervals: 30,
                            },
                          }
                        : {})}
                    />
                  ) : (
                    <Input
                      fluid
                      onChange={handleChangeInput(index)}
                      value={row.value}
                      className={
                        errors?.[index]?.value
                          ? onboardingStyles.inputError
                          : ""
                      }
                    />
                  )}
                </div>
                <div className={styles.conditionDelete}>
                  <i
                    className={`${iconStyles.icon} ${styles.crossIcon}`}
                    onClick={handleDelete(index)}
                  />
                </div>
              </div>
            ))}
          </Form>
        </div>
        {usage.maximumContacts < usage.totalContacts + count ? (
          <div className={onboardingStyles.section}>
            <div className={styles.limitInfoWrapper}>
              <div className={styles.limitInfoTitle}>
                <i className={`${iconStyles.icon} ${styles.infoIcon}`} />
                {t("onboarding.crm.stepImportConditions.limitInfoTitle")}
              </div>
              <div className={styles.limitInfoDesc}>
                {t("onboarding.crm.stepImportConditions.limitInfoDesc", {
                  max: formatNumber(usage.maximumContacts),
                  total: formatNumber(usage.totalContacts),
                  crm: crmName,
                })}
              </div>
            </div>
          </div>
        ) : null}
        <div className={onboardingStyles.footer}>
          <Button
            customSize="mid"
            onClick={handleAddRow}
            className={onboardingStyles.addButton}
          >
            <span className={onboardingStyles.plusIcon}>
              <PlusIcon />
            </span>
            {t("onboarding.crm.action.addCondition")}
          </Button>
          <Button
            primary
            customSize="mid"
            onClick={handleNextStep}
            loading={loading}
          >
            {submitBtnText}
          </Button>
        </div>
      </div>
      {errors.length ? (
        <div className={onboardingStyles.footerErrorMsg}>
          {t("onboarding.crm.error.requiredError")}
        </div>
      ) : null}
    </>
  );
}
