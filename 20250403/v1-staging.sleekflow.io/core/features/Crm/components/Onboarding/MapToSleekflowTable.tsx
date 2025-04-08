import React, { ReactNode, useContext, useEffect, useState } from "react";
import onboardingStyles from "./CrmOnboarding.module.css";
import { useTranslation } from "react-i18next";
import MappingTable from "../MappingTable/MappingTable";
import iconStyles from "component/shared/Icon/Icon.module.css";
import { Dropdown, DropdownProps } from "semantic-ui-react";
import { postGetProviderTypeContact } from "../../API/Onboarding/postGetProviderTypeFields";
import OnboardingContext from "core/features/Crm/reducers/OnboardingContext";
import { useAppSelector } from "AppRootContext";
import { assoc, equals, map, propEq, when } from "ramda";
import { set } from "lodash-es";
import { Button } from "component/shared/Button/Button";
import postUpsertUnifyRules from "../../API/Onboarding/postUpsertUnifyRules";
import { array, object, string, ValidationError } from "yup";
import PlusIcon from "assets/tsx/icons/PlusIcon";
import postUserProfileFields from "api/Contacts/postUserProfileFields";
import useFetchCompany from "api/Company/useFetchCompany";
import {
  ProviderFieldsType,
  ProviderType,
  UnifyRuleType,
} from "../../API/Onboarding/contracts";
import StepHeader from "../StepHeader/StepHeader";
import { UnifyRuleValueType } from "../../reducers/onboardingReducer";
import postGetUnifyRules from "core/features/Crm/API/Onboarding/postGetUnifyRules";

type ErrorMsgType = {
  providerPrecedences?: string;
  fieldName?: string;
};

const ruleSchema = array().of(
  object({
    fieldName: string().required("required"),
    providerPrecedences: array().min(1, "required"),
  })
);

const nameFields = [
  {
    fieldName: "LastName",
    id: "LastName",
  },
  {
    fieldName: "FirstName",
    id: "FirstName",
  },
];

export default function MapToSleekflowTable(props: {
  providerType: ProviderType;
  submitBtnText: string;
  onSubmitSuccess: () => void;
  crmName: string;
  crmIcon: ReactNode;
  getOptionText?: (field: ProviderFieldsType) => string;
}) {
  const {
    submitBtnText,
    onSubmitSuccess,
    providerType,
    crmIcon,
    crmName,
    getOptionText,
  } = props;
  const { t, i18n } = useTranslation();
  const customUserProfileFields = useAppSelector(
    (s) => s.company?.customUserProfileFields,
    equals
  );
  const userProfileFields = customUserProfileFields
    ? [...nameFields, ...customUserProfileFields]
    : [];
  const { onboardingDispatch, ruleToSleekflow } = useContext(OnboardingContext);
  const [commonFields, setCommonFields] = useState<ProviderFieldsType[]>([]);
  const [errors, setErrors] = useState<(ErrorMsgType | undefined)[]>([]);
  const { refreshCompany } = useFetchCompany();
  const [customFieldLoading, setCustomFieldLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [dropdownLoading, setDropdownLoading] = useState<boolean>(false);

  useEffect(() => {
    const getFields = async () => {
      try {
        setDropdownLoading(true);
        const result = await postGetProviderTypeContact(providerType);
        setCommonFields(result.fields);
      } catch (error) {
        console.error(error);
      } finally {
        setDropdownLoading(false);
      }
    };
    getFields();
  }, []);

  useEffect(() => {
    const getMapRules = async () => {
      try {
        const response = await postGetUnifyRules("Contact");
        const rules = response.data.unifyRules.filter((rule) => !rule.isSystem);
        onboardingDispatch({
          type: "INIT_RULE_ROW",
          rules,
          list: "ruleToSleekflow",
        });
      } catch (error) {
        console.error(error);
      }
    };
    getMapRules();
  }, []);

  const handleChangeDropdown =
    (id: string, field: string) =>
    (e: React.SyntheticEvent, data: DropdownProps) => {
      onboardingDispatch({
        type: "UPDATE_RULE_ROW",
        value: data.value as string,
        providerType: providerType,
        field,
        id,
        list: "ruleToSleekflow",
      });
    };

  const handleDelete = (id: string) => {
    onboardingDispatch({
      type: "DELETE_RULE_ROW",
      id,
      list: "ruleToSleekflow",
      providerType: providerType,
    });
  };

  const handleAddRow = () => {
    onboardingDispatch({ type: "ADD_RULE_ROW", list: "ruleToSleekflow" });
  };

  const handleNextStep = async () => {
    try {
      setLoading(true);
      await ruleSchema.validate(ruleToSleekflow, {
        abortEarly: false,
      });
      setErrors([]);
      const rules = ruleToSleekflow
        .map(({ id, ...rule }) => rule)
        .reduce((acc: UnifyRuleType[], curr: UnifyRuleType) => {
          const sameNameRule = acc.find((r) => r.fieldName === curr.fieldName);
          if (!sameNameRule) {
            return [...acc, curr];
          }
          const newValue = [
            ...new Set([
              ...sameNameRule.providerPrecedences,
              ...curr.providerPrecedences,
            ]),
          ];
          return map(
            when(
              propEq("fieldName", curr.fieldName),
              assoc("providerPrecedences", newValue)
            ),
            acc
          ) as UnifyRuleType[];
        }, []);
      await postUpsertUnifyRules("Contact", rules);
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

  const handleAddCompanyCustomFields =
    (id: string, field: string) =>
    async (e: React.SyntheticEvent, data: DropdownProps) => {
      try {
        setCustomFieldLoading(true);
        const language =
          i18n.language.substring(0, i18n.language.indexOf("-")) || "en";
        await postUserProfileFields([
          {
            type: "Singlelinetext",
            isEditable: true,
            isVisible: true,
            customUserProfileFieldLinguals: [
              { displayName: data.value as string, language },
            ],
            fieldName: data.value as string,
            order: userProfileFields.length - 1,
            customUserProfileFieldOptions: [],
          },
        ]);
        refreshCompany();
        onboardingDispatch({
          type: "UPDATE_RULE_ROW",
          value: data.value as string,
          field,
          id,
          providerType: providerType,
          list: "ruleToSleekflow",
        });
        setCustomFieldLoading(false);
      } catch (err) {
        console.error(err);
      }
    };

  const values = ruleToSleekflow.filter(
    (rule) =>
      rule.providerPrecedences.some((item) => item.includes(providerType)) ||
      rule.providerPrecedences.length === 0
  );
  return (
    <>
      <div className={`container ${onboardingStyles.content}`}>
        <StepHeader
          provider={providerType}
          title={t("onboarding.crm.stepSyncToSleekflow.title", {
            crm: crmName,
          })}
          subtitle={t("onboarding.crm.stepSyncToSleekflow.subTitle", {
            crm: crmName,
          })}
        />
        <div className={onboardingStyles.section}>
          <MappingTable
            labelFrom={
              <div className={onboardingStyles.tableLabel}>
                <span className={onboardingStyles.labelText}>
                  {t("onboarding.crm.stepSyncToSleekflow.crmField", {
                    crm: crmName,
                  })}
                </span>
                <div className={onboardingStyles.logo}>{crmIcon}</div>
              </div>
            }
            labelTo={
              <div className={onboardingStyles.tableLabel}>
                <span className={onboardingStyles.labelText}>
                  {t("onboarding.crm.stepSyncToSleekflow.sleekflowField")}
                </span>
                <i
                  className={`${iconStyles.icon} ${onboardingStyles.sleekflowLogo}`}
                />
              </div>
            }
            data={values}
            renderFieldFrom={(row: UnifyRuleValueType, index: number) => (
              <Dropdown
                selectOnBlur={false}
                search
                loading={dropdownLoading}
                noResultsMessage={t("onboarding.crm.error.notFound")}
                placeholder={t("onboarding.crm.placeholder.crmField", {
                  crm: crmName,
                })}
                className={
                  errors?.[index]?.providerPrecedences
                    ? onboardingStyles.dropdownError
                    : ""
                }
                options={commonFields.map((field) => ({
                  id: field.name,
                  value: field.name,
                  text: getOptionText ? getOptionText(field) : field.name,
                  disabled: !!values.find((rule) =>
                    rule.providerPrecedences.find(
                      (item) => item === `${providerType}:${field.name}`
                    )
                  ),
                }))}
                fluid
                selection
                value={
                  row.providerPrecedences
                    ?.find((item) => item.includes(providerType))
                    ?.split(":")[1]
                }
                onChange={handleChangeDropdown(row.id, "providerPrecedences")}
              />
            )}
            renderFieldTo={(row: UnifyRuleValueType, index: number) => (
              <Dropdown
                selectOnBlur={false}
                search
                noResultsMessage={t("onboarding.crm.error.notFound")}
                placeholder={t("onboarding.crm.placeholder.sleekflowColumn")}
                allowAdditions
                additionLabel={
                  <span className={onboardingStyles.additionLabel}>
                    {t("onboarding.crm.stepSyncToSleekflow.additionalColumn")}
                  </span>
                }
                onAddItem={handleAddCompanyCustomFields(row.id, "fieldName")}
                className={
                  errors?.[index]?.fieldName
                    ? onboardingStyles.dropdownError
                    : ""
                }
                options={userProfileFields.map(({ fieldName, id }) => ({
                  key: id,
                  value: fieldName,
                  text: fieldName,
                  disabled: !!values.find(
                    (rule) => rule.fieldName === fieldName
                  ),
                }))}
                fluid
                selection
                loading={customFieldLoading}
                value={row.fieldName}
                onChange={handleChangeDropdown(row.id, "fieldName")}
              />
            )}
            handleDelete={(rule) => handleDelete(rule.id)}
          />
        </div>
        <div className={onboardingStyles.footer}>
          <Button
            customSize="mid"
            className={onboardingStyles.addButton}
            onClick={handleAddRow}
          >
            <span className={onboardingStyles.plusIcon}>
              <PlusIcon />
            </span>
            {t("onboarding.crm.action.addButton")}
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
