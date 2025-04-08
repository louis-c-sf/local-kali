import { CustomProfileField, CustomProfileFieldProxy } from "types/ContactType";
import { useState } from "react";
import { ModifiedFieldType } from "../NewColumnModal";
import { clone, remove, update } from "ramda";
import { useAppDispatch } from "../../../AppRootContext";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import { ModifiedFieldRequestType } from "api/Contacts/postUserProfileFields";
import { htmlEscape } from "lib/utility/htmlEscape";
import { moveItem } from "../../AssignmentRules/helpers/swapOrderables";
import { useTranslation } from "react-i18next";
import CompanyType from "types/CompanyType";
import { useFieldLocales } from "../locaizable/useFieldLocales";
import { denormalizeCustomField } from "container/Contact/hooks/useCustomProfileFields";

export function useEditColumnsModalFlow(props: {
  initFields: CustomProfileField[];
  onFieldsUpdated: (fields: CustomProfileField[]) => void;
  fetchCompany: () => Promise<CompanyType>;
  submitFields: (
    editedFields: ModifiedFieldRequestType[]
  ) => Promise<CompanyType>;
  submitDeleteFields: (fields: CustomProfileField[]) => Promise<void>;
  close: () => void;
}) {
  const initialState = clone(props.initFields)
    .map((f) => ({
      ...f,
      isModified: false,
    }))
    .sort((a, b) => a.order - b.order);
  const [fieldInfos, setFieldInfos] = useState<ModifiedFieldType[]>([
    ...initialState,
  ]);

  const [loading, isLoading] = useState(false);
  const loginDispatch = useAppDispatch();
  const flash = useFlashMessageChannel();
  const { t, i18n } = useTranslation();
  const { getFieldDisplayNameLocale } = useFieldLocales();

  const deleteField = async (fieldIndex: number) => {
    setFieldInfos(
      remove(fieldIndex, 1, fieldInfos).map((f, i) => ({ ...f, order: i }))
    );
  };

  const visibleChange = async (fieldIndex: number) => {
    const field = fieldInfos[fieldIndex];
    const originField = props.initFields.findIndex(
      (fieldVal) => fieldVal.id === field.id
    );

    const visibleValue = !field.isVisible;
    if (originField > -1) {
      fieldInfos[fieldIndex] = {
        ...field,
        isVisible: visibleValue,
        isModified: visibleValue !== props.initFields[originField].isVisible,
      };
    } else {
      fieldInfos[fieldIndex] = {
        ...field,
        isVisible: visibleValue,
        isModified: true,
      };
    }
    setFieldInfos([...fieldInfos]);
  };

  const updateFieldsInfo = (
    fieldInfo: ModifiedFieldType | CustomProfileFieldProxy,
    index?: number
  ) => {
    const newField = { ...fieldInfo, isModified: true } as ModifiedFieldType;
    if (index !== undefined) {
      setFieldInfos(update(index, newField, fieldInfos));
    } else {
      setFieldInfos([...fieldInfos, { ...newField, order: fieldInfos.length }]);
    }
  };

  const submitChange = async () => {
    isLoading(true);
    const editedFields = fieldInfos
      .filter((fieldInfo) => fieldInfo.isModified === true)
      .map<ModifiedFieldRequestType>((fieldInfo, idx) => {
        const {
          isEditable,
          isVisible,
          order,
          displayName,
          options,
          type,
          linguals,
          locale,
          isDeletable,
        } = fieldInfo;
        const updatedLingualIndex =
          linguals &&
          linguals.findIndex((lingual) => lingual.language === locale);
        if (
          typeof updatedLingualIndex === "number" &&
          updatedLingualIndex > -1
        ) {
          linguals[updatedLingualIndex] = {
            ...linguals[updatedLingualIndex],
            displayName,
          };
        }
        return {
          id: fieldInfo.id,
          type: type.charAt(0).toUpperCase() + type.substring(1),
          isEditable,
          isVisible,
          isDeletable,
          customUserProfileFieldLinguals: linguals,
          fieldName: displayName,
          order: order ?? fieldInfos.length + idx,
          customUserProfileFieldOptions:
            (options &&
              options.map((option) => {
                const { customUserProfileFieldOptionLinguals, value, order } =
                  option;
                return {
                  customUserProfileFieldOptionLinguals,
                  value,
                  order,
                };
              })) ||
            [],
        };
      });
    const transactions: Promise<any>[] = [];
    if (editedFields.length > 0) {
      transactions.push(props.submitFields(editedFields));
    }
    const deletedFields = props.initFields.filter(
      (field) => !fieldInfos.some((fi) => fi.id === field.id)
    );
    if (deletedFields.length > 0) {
      transactions.push(props.submitDeleteFields(deletedFields));
    }
    try {
      await Promise.all(transactions);

      if (editedFields.length + deletedFields.length > 0) {
        const result = await props.fetchCompany();
        loginDispatch({ type: "UPDATE_COMPANY_INFO", company: result });
        props.onFieldsUpdated(
          result.customUserProfileFields
            .map(
              denormalizeCustomField(i18n.language, getFieldDisplayNameLocale)
            )
            .map((f) => ({ ...f, isModified: false }))
        );
      } else {
        props.onFieldsUpdated(
          fieldInfos.map((f) => ({ ...f, isModified: false }))
        );
      }
      flash(t("flash.profile.field.updated"));
      props.close();
    } catch (e) {
      flash(t("flash.common.error.general", { error: `${htmlEscape(e)}` }));
    } finally {
      isLoading(false);
    }
  };

  const closeModal = () => {
    setFieldInfos(initialState);
    props.close();
  };

  function reorderColumns(indexFrom: number, indexTo: number) {
    // no need to save the same position
    if (indexFrom === indexTo) {
      return;
    }
    const modifiedBeforeMove = clone(fieldInfos);

    const results = moveItem(fieldInfos, indexFrom, indexTo).map((f, i) => ({
      ...f,
      order: i,
      isModified:
        f.isModified ||
        modifiedBeforeMove.find((bf) => bf.id === f.id)?.order !== i,
    }));

    setFieldInfos(results);
  }

  return {
    fieldInfos,
    reorderColumns,
    updateFieldsInfo,
    loading,
    deleteField,
    visibleChange,
    closeModal,
    submitChange,
  };
}
