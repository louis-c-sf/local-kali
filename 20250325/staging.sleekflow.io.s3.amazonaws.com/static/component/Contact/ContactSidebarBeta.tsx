import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Header } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import { Drawer } from "../shared/sidebar/Drawer";
import {
  ListType,
  ListTypeValue,
} from "../../container/Contact/hooks/ContactsStateType";
import styles from "./ContactSidebar.module.css";
import { CustomProfileField } from "../../types/ContactType";
import { AudienceType } from "../../types/BroadcastCampaignType";
import { HashTagCountedType } from "../../types/ConversationType";
import { FilterGroup } from "./shared/FilterGroup/FilterGroup";
import {
  denormalizeFieldFilters,
  denormalizeHashtagFilters,
  denormalizeListFilters,
} from "./shared/FilterGroup/getFilterDenormalizer";
import { useCompanyHashTags } from "../Settings/hooks/useCompanyHashTags";
import useImportedLists from "../../container/Contact/Imported/useImportedLists";
import {
  FilterGroupContext,
  FilterGroupContextType,
} from "./shared/FilterGroup/FilterGroupContext";
import { ConditionNameType } from "../../config/ProfileFieldMapping";
import { append, reject, equals } from "ramda";
import { Button } from "../shared/Button/Button";
import { useContactFilterGroups } from "./shared/FilterGroup/useContactFilterGroups";

function ContactSidebarBeta(props: {
  visible: boolean;
  numOfContacts: number;
  numOfContactsTotal: number;
  fields: CustomProfileField[];
  initFieldFilters: AudienceType[];
  initTagFilters: HashTagCountedType[];
  initListIdFilters: string[];
  initListIdOperator: ConditionNameType;
  initTagOperator: ConditionNameType;
  initCollaboratorFilters: string[];
  initCollaboratorOperator: ConditionNameType;
  onHide: () => void;
  onApply: (selectedFilters: ListType) => void;
  isIncludeCollaborator?: boolean;
  excludeStaticFields?: string[];
}) {
  const {
    initFieldFilters,
    fields,
    initListIdFilters = [],
    initListIdOperator,
    numOfContacts,
    numOfContactsTotal,
    onHide,
    initTagFilters,
    initTagOperator,
    visible,
    onApply,
  } = props;

  const { t } = useTranslation();
  const [formValues, setFormValues] = useState<ListTypeValue[]>([]);

  const { fieldsBasic, getFieldErrors, isValid } = useContactFilterGroups({
    fields,
    formValues: formValues,
    excludeStaticFields: props.excludeStaticFields,
  });

  const [fieldsSubmitted, setFieldsSubmitted] = useState<string[]>([]);
  const [submitTouched, setSubmitTouched] = useState(false);
  const { lists } = useImportedLists();
  const { companyTags: tagsAvailable } = useCompanyHashTags();

  const reinitialize = useCallback(() => {
    if (!visible) {
      return;
    }
    const appliedBasicFilters = denormalizeFieldFilters(initFieldFilters);
    let initBasicTagFilters = initTagFilters;
    if (initBasicTagFilters.length > 0 && initTagOperator) {
      appliedBasicFilters.push(
        denormalizeHashtagFilters(initBasicTagFilters, initTagOperator)
        //todo differentiate tag operators?
      );
    }
    if (initListIdFilters.length > 0 && initListIdOperator) {
      appliedBasicFilters.push(
        denormalizeListFilters(initListIdFilters, initListIdOperator)
      );
    }

    //set the init values
    setFormValues([...appliedBasicFilters]);

    setSubmitTouched(false);
    setFieldsSubmitted([]);
  }, [
    JSON.stringify([initFieldFilters, initListIdFilters, initTagFilters]),
    initTagOperator,
    initListIdOperator,
    visible,
  ]);

  useEffect(() => {
    if (visible) {
      reinitialize();
    }
  }, [visible, reinitialize]);

  const getOnlySubmittedErrors = useCallback(
    (name: string, index?: number) => {
      if (submitTouched && !fieldsSubmitted.includes(name)) {
        return [];
      }
      return getFieldErrors(name, index);
    },
    [getFieldErrors, submitTouched, JSON.stringify(fieldsSubmitted)]
  );

  const allFormValues = [...formValues];

  const hasErrors = !isValid;

  const isErrorsVisible = submitTouched && hasErrors;
  const hasUnsubmittedFields = allFormValues.some(
    (v) => !fieldsSubmitted.includes(v.fieldName)
  );

  const isAnyFieldsChecked = allFormValues.length > 0;
  const isSubmitDisabled =
    !isAnyFieldsChecked ||
    (submitTouched && isErrorsVisible && !hasUnsubmittedFields);

  const tagsHash = JSON.stringify(tagsAvailable);

  const commonTags = useMemo(() => tagsAvailable, [tagsHash]);
  // memo greatly improves rendering performance

  const basicContext: FilterGroupContextType = useMemo(
    () => ({
      tagsAvailable: commonTags,
      listsAvailable: lists,
      visible,
      productTags: [],
      customerTags: [],
      orderTags: [],
      currenciesSupported: [],
      getFieldErrors: isSubmitDisabled
        ? getFieldErrors
        : getOnlySubmittedErrors,
      isErrorsVisible,
    }),
    [
      commonTags,
      visible,
      lists,
      isErrorsVisible,
      getFieldErrors,
      getOnlySubmittedErrors,
      isSubmitDisabled,
    ]
  );

  function applyFilters() {
    setSubmitTouched(true);
    const fieldsSub = [...formValues.map((v) => v.fieldName)];
    setFieldsSubmitted(fieldsSub);

    if (fieldsSub.some((f) => getFieldErrors(f))) {
      //todo clear search / show invalid fields?
      //todo open collapsed fields with errors?
      return;
    }
    onApply(formValues);
  }

  return (
    <Drawer
      visible={visible}
      className={styles.drawerGrid}
      hide={() => {
        onHide();
        reinitialize();
      }}
    >
      <Header as={"h1"} className={`top ${styles.top}`}>
        {t("profile.contacts.sidebar.header.filters")}
        <i className={"ui icon close lg-white"} onClick={() => onHide()} />
      </Header>
      <div className={styles.counter}>
        {t("profile.contacts.sidebar.header.counterShow", {
          subtotal: numOfContacts,
          count: numOfContactsTotal,
        })}
      </div>
      <div className={styles.filterGroups}>
        <FilterGroupContext.Provider value={basicContext} key={"default"}>
          <FilterGroup
            header={t("profile.contacts.sidebar.contactInformation")}
            fields={fieldsBasic}
            appliedValues={formValues}
            updateFields={setFormValues}
          />
        </FilterGroupContext.Provider>
      </div>
      <div className={styles.actions}>
        <Button
          content={t("profile.contacts.sidebar.actions.applyFilter")}
          onClick={applyFilters}
          primary
          disabled={isSubmitDisabled}
        />
        <Button
          content={t("common:form.button.cancel")}
          onClick={() => {
            reinitialize();
            onHide();
          }}
        />
      </div>
    </Drawer>
  );
}

export default ContactSidebarBeta;
