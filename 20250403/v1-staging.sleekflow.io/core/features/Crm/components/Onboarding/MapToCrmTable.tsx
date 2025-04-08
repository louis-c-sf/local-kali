import React, { ReactNode, useContext, useEffect, useState } from "react";
import onboardingStyles from "./CrmOnboarding.module.css";
import StepHeader from "core/features/Crm/components/StepHeader/StepHeader";
import { useTranslation } from "react-i18next";
import MappingTable from "../MappingTable/MappingTable";
import iconStyles from "component/shared/Icon/Icon.module.css";
import { Dropdown, DropdownProps } from "semantic-ui-react";
import OnboardingContext from "core/features/Crm/reducers/OnboardingContext";
import { useAppSelector } from "AppRootContext";
import { equals } from "ramda";
import { set } from "lodash-es";
import { Button } from "component/shared/Button/Button";
import postUpsertUnifyRules from "../../API/Onboarding/postUpsertUnifyRules";
import postGetUnifyRules from "../../API/Onboarding/postGetUnifyRules";
import { array, object, string, ValidationError } from "yup";
import PlusIcon from "assets/tsx/icons/PlusIcon";
import {
  ProviderType,
  UnifyRuleType,
  ProviderFieldsType,
} from "../../API/Onboarding/contracts";
import { UnifyRuleValueType } from "../../reducers/onboardingReducer";
import { postGetProviderTypeContact } from "../../API/Onboarding/postGetProviderTypeFields";

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

export default function MapToCrmTable(props: {
  providerType: ProviderType;
  submitBtnText: string;
  onSubmitSuccess: () => void;
  crmName: string;
  crmIcon: ReactNode;
  getOptionText?: (option: ProviderFieldsType) => string;
}) {
  const {
    submitBtnText,
    onSubmitSuccess,
    providerType,
    crmName,
    crmIcon,
    getOptionText,
  } = props;
  const { t } = useTranslation();
  const customUserProfileFields = useAppSelector(
    (s) => s.company?.customUserProfileFields,
    equals
  );
  const userProfileFields = customUserProfileFields
    ? [...nameFields, ...customUserProfileFields]
    : [];
  const { onboardingDispatch, ruleToCrm } = useContext(OnboardingContext);
  const [originUnifyRules, setOriginUnifyRules] = useState<UnifyRuleType[]>([]);
  const [unifyRules, setUnifyRules] = useState<UnifyRuleType[]>([]);
  const [errors, setErrors] = useState<(ErrorMsgType | undefined)[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [crmFields, setCrmFields] = useState<ProviderFieldsType[]>([]);
  const [dropdownLoading, setDropdownLoading] = useState<boolean>(false);

  useEffect(() => {
    const getFields = async () => {
      try {
        setDropdownLoading(true);
        const result = await postGetProviderTypeContact(providerType);
        setCrmFields(result.fields);
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
        setOriginUnifyRules(
          rules.map((rule) => ({
            ...rule,
            providerPrecedences: rule.providerPrecedences.filter(
              (item) => !item.includes("sleekflow")
            ),
          }))
        );
        const filteredRules = rules.filter((rule) =>
          rule.providerPrecedences.some((item) => item.includes(providerType))
        );
        setUnifyRules(filteredRules);
        const values = filteredRules
          .filter((rule) =>
            rule.providerPrecedences.some((item) => item.includes("sleekflow"))
          )
          .map((rule) => ({
            ...rule,
            providerPrecedences: [
              rule.providerPrecedences.find((item) =>
                item.includes("sleekflow")
              ) || "",
            ],
          }));
        onboardingDispatch({
          type: "INIT_RULE_ROW",
          list: "ruleToCrm",
          rules: values,
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
        providerType: "sleekflow",
        field,
        id,
        list: "ruleToCrm",
      });
    };

  const handleDelete = (id: string) => {
    onboardingDispatch({
      type: "DELETE_RULE_ROW",
      id,
      list: "ruleToCrm",
      providerType: "sleekflow",
    });
  };

  const handleAddRow = () => {
    onboardingDispatch({ type: "ADD_RULE_ROW", list: "ruleToCrm" });
  };

  const handleNextStep = async () => {
    try {
      setLoading(true);
      await ruleSchema.validate(ruleToCrm, {
        abortEarly: false,
      });
      setErrors([]);
      const rules = originUnifyRules.map((rule) => {
        const syncProperty = ruleToCrm.find(
          (property) => property.fieldName === rule.fieldName
        );
        if (!syncProperty) return rule;

        const precedence = syncProperty.providerPrecedences?.[0] || "";
        return {
          ...rule,
          providerPrecedences: [
            ...rule.providerPrecedences.filter(
              (item) => !item.includes("sleekflow")
            ),
            precedence,
          ],
        };
      });
      await postUpsertUnifyRules("Contact", rules);
      await onSubmitSuccess();
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

  const getCrmOptions = () =>
    unifyRules.map(({ providerPrecedences, fieldName }) => {
      const currentProviderField = providerPrecedences.find((item) =>
        item.includes(providerType)
      );
      const crmFieldName = currentProviderField?.split(":")?.[1];
      const crmField = crmFields.find((field) => field.name === crmFieldName);
      const optionText =
        getOptionText && crmField ? getOptionText(crmField) : crmFieldName;
      return {
        id: fieldName,
        value: fieldName,
        text: optionText,
        disabled: !!ruleToCrm.find((rule) => rule.fieldName === fieldName),
      };
    });

  return (
    <>
      <div className={`container ${onboardingStyles.content}`}>
        <StepHeader
          provider={providerType}
          title={t("onboarding.crm.stepSyncToCrm.title", { crm: crmName })}
          subtitle={t("onboarding.crm.stepSyncToCrm.subTitle", {
            crm: crmName,
          })}
        />
        <div className={onboardingStyles.section}>
          <MappingTable
            labelFrom={
              <div className={onboardingStyles.tableLabel}>
                <span className={onboardingStyles.labelText}>
                  {t("onboarding.crm.stepSyncToCrm.sleekflowField")}
                </span>
                <i
                  className={`${iconStyles.icon} ${onboardingStyles.sleekflowLogo}`}
                />
              </div>
            }
            labelTo={
              <div className={onboardingStyles.tableLabel}>
                <span className={onboardingStyles.labelText}>
                  {t("onboarding.crm.stepSyncToCrm.crmField", { crm: crmName })}
                </span>
                <div className={onboardingStyles.logo}>{crmIcon}</div>
              </div>
            }
            data={ruleToCrm}
            renderFieldFrom={(row: UnifyRuleValueType, index: number) => (
              <Dropdown
                selectOnBlur={false}
                search
                noResultsMessage={t("onboarding.crm.error.notFound")}
                placeholder={t("onboarding.crm.placeholder.sleekflowColumn")}
                className={
                  errors?.[index]?.providerPrecedences
                    ? onboardingStyles.dropdownError
                    : ""
                }
                options={userProfileFields.map(({ fieldName, id }) => ({
                  key: id,
                  value: fieldName,
                  text: fieldName,
                  disabled: !!ruleToCrm.find((rule) =>
                    rule.providerPrecedences.find(
                      (item) => item === `sleekflow:${fieldName}`
                    )
                  ),
                }))}
                fluid
                selection
                value={row.providerPrecedences[0]?.replace("sleekflow:", "")}
                onChange={handleChangeDropdown(row.id, "providerPrecedences")}
              />
            )}
            renderFieldTo={(row: UnifyRuleValueType, index: number) => (
              <Dropdown
                selectOnBlur={false}
                search
                noResultsMessage={t("onboarding.crm.error.notFound")}
                placeholder={t("onboarding.crm.placeholder.crmField", {
                  crm: crmName,
                })}
                className={
                  errors?.[index]?.fieldName
                    ? onboardingStyles.dropdownError
                    : ""
                }
                loading={dropdownLoading}
                options={getCrmOptions()}
                fluid
                selection
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
