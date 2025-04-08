import React, { Reducer, useEffect, useReducer, useState } from "react";
import {
  Button,
  Dropdown,
  DropdownItemProps,
  DropdownProps,
  Form,
  Icon,
  Image,
  Modal,
} from "semantic-ui-react";
import { CustomFieldTypeList } from "../../config/ContactTypeFieldMapping";
import { UserProfileFieldOptionsType } from "../../types/CompanyType";
import CloseIcon from "../../assets/images/x-icon.svg";
import {
  CustomProfileField,
  CustomProfileFieldProxy,
} from "../../types/ContactType";
import { propEq } from "ramda";
import { ItemInterface, ReactSortable } from "react-sortablejs";
import { EditOptionField } from "./NewColumnModal/EditOptionField";
import {
  ContactFieldAction,
  contactFieldReducer,
  ContactFieldState,
} from "./NewColumnModal/contactFieldReducer";
import { useTranslation } from "react-i18next";
import { useFieldLocales } from "./locaizable/useFieldLocales";
import useColumnTypeLocalized from "../../config/localizable/useColumnTypeLocalized";
import { noop } from "lib/utility/noop";

export interface ModifiedFieldType extends CustomProfileField {
  isModified?: boolean;
}

export interface OptionType extends ItemInterface {
  value: string;
}

export const NewColumnModal = (props: {
  type: string;
  index?: number;
  fieldInfo?: ModifiedFieldType;
  updateFieldInfo: (
    fieldInfo: ModifiedFieldType | CustomProfileFieldProxy,
    index?: number
  ) => void;
  loading: boolean;
}) => {
  const { type, index, updateFieldInfo, fieldInfo, loading } = props;
  const [label, setLabel] = useState("");
  const [fieldTypeList, setFieldTypeList] = useState<DropdownItemProps[]>([]);
  const [fieldType, setFieldType] = useState("");
  const [open, setOpen] = useState(false);
  const { customFieldTypeList } = useColumnTypeLocalized();

  const [state, dispatch] = useReducer<
    Reducer<ContactFieldState, ContactFieldAction>
  >(contactFieldReducer, { options: [] });
  const { t, i18n } = useTranslation();
  const { getFieldDisplayNameLocale } = useFieldLocales();

  const optionsVal = state.options;

  useEffect(() => {
    if (open && type === "add") {
      dispatch({ type: "OPTIONS_LOADED", options: [] });
    }
  }, [open]);

  useEffect(() => {
    setFieldTypeList(
      CustomFieldTypeList.map((customFieldType) => {
        return {
          text: customFieldTypeList[customFieldType],
          value: customFieldType,
          key: customFieldType,
        };
      })
    );
    if (fieldInfo) {
      setLabel(fieldInfo.displayName);
      setFieldType(fieldInfo.type.toLowerCase());
      const optionsInit = fieldInfo.options
        ? fieldInfo.options
            .sort((a, b) => a.order - b.order)
            .map((selectedOption, idx) => {
              let baseOption: OptionType = {
                id: selectedOption.id,
                value: "",
              };
              if (
                selectedOption.customUserProfileFieldOptionLinguals ===
                undefined
              ) {
                return { ...baseOption, value: selectedOption.value };
              }
              const displayName = getFieldDisplayNameLocale(
                selectedOption.customUserProfileFieldOptionLinguals,
                selectedOption.value
              );
              if (displayName) {
                return { ...baseOption, value: displayName };
              }

              return baseOption;
            })
        : [];
      dispatch({ type: "OPTIONS_LOADED", options: optionsInit });
    }
  }, [fieldInfo]);

  const labelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setLabel(value);
  };

  const selectOption = (e: React.SyntheticEvent, data: DropdownProps) => {
    const { value } = data;
    setFieldType(value as string);
  };

  const createOption = () => {
    dispatch({ type: "OPTION_ADDED" });
  };

  const optionValueChanged = (value: string, index: number) => {
    let optionsUpdated = [...optionsVal];
    optionsUpdated[index] = { ...optionsUpdated[index], value };
    if (fieldInfo && fieldInfo.options && index < fieldInfo.options.length) {
      const fieldLingIndex = fieldInfo.options[
        index
      ].customUserProfileFieldOptionLinguals.findIndex((lingualOption) =>
        lingualOption.language.includes(fieldInfo.locale)
      );
      fieldInfo.options[index].customUserProfileFieldOptionLinguals[
        fieldLingIndex
      ] = {
        ...fieldInfo.options[index].customUserProfileFieldOptionLinguals[
          fieldLingIndex
        ],
        displayName: value,
      };
      fieldInfo.options[index] = {
        ...fieldInfo.options[index],
        order: index,
        value,
        customUserProfileFieldOptionLinguals: [
          ...fieldInfo.options[index].customUserProfileFieldOptionLinguals,
        ],
      };
    } else {
      if (fieldInfo) {
        if (fieldInfo && fieldInfo.options && fieldInfo.options.length > 0) {
          const lastRecord = fieldInfo.options[fieldInfo.options.length - 1];
          const newOption: UserProfileFieldOptionsType = {
            value,
            id: lastRecord.id + 1,
            customUserProfileFieldOptionLinguals: [
              {
                language: "en",
                displayName: value,
              },
            ],
            order: lastRecord.order + 1,
          };
          fieldInfo.options = [...fieldInfo.options, newOption];
        } else {
          const newOption: UserProfileFieldOptionsType = {
            value,
            id: 1,
            customUserProfileFieldOptionLinguals: [
              {
                language: "en",
                displayName: value,
              },
            ],
            order: 1,
          };
          fieldInfo.options = [...(fieldInfo.options ?? []), newOption];
        }
      }
    }
    dispatch({ type: "OPTIONS_LOADED", options: optionsUpdated });
  };

  const removeOptions = (index: number) => {
    if (fieldInfo && fieldInfo.options) {
      fieldInfo.options.splice(index, 1);
    }
    dispatch({ type: "OPTION_REMOVED", index });
  };

  const closeModal = () => {
    setOpen(false);
  };

  const editHeader = (
    <Modal.Header as="h4">
      {t("profile.form.column.header.edit")}
      <Image onClick={closeModal} src={CloseIcon} />
    </Modal.Header>
  );

  const createFieldHeader = (
    <Modal.Header as="h4">
      {t("profile.form.column.header.new")}
      <Image onClick={closeModal} src={CloseIcon} />
    </Modal.Header>
  );

  const saveChanges = () => {
    if (index !== undefined && fieldInfo) {
      if (optionsVal.length > 0) {
        const options = optionsVal.map((opt, idx) => {
          const valueFound = fieldInfo?.options?.find(
            propEq("value", opt.value)
          );
          const id = valueFound?.id ?? idx;
          return {
            value: opt.value,
            id,
            customUserProfileFieldOptionLinguals: [
              {
                language: "en",
                displayName: opt.value,
              },
            ],
            order: idx,
          };
        });
        updateFieldInfo(
          {
            ...fieldInfo,
            displayName: label,
            options,
            type: fieldType,
            isModified: true,
            isVisible: true,
            isEditable: true,
          },
          index
        );
      } else {
        updateFieldInfo(
          {
            ...fieldInfo,
            displayName: label,
            options: fieldInfo.options,
            type: fieldType,
            isModified: true,
            isVisible: true,
            isEditable: true,
          },
          index
        );
      }
    } else {
      setLabel("");
      setFieldType("");
      const language =
        i18n.language.substring(0, i18n.language.indexOf("-")) || "en";
      if (optionsVal.length > 0) {
        const options = optionsVal.map((opt, index) => {
          const id = index;
          return {
            value: opt.value,
            id,
            customUserProfileFieldOptionLinguals: [
              {
                language: "en",
                displayName: opt.value,
              },
            ],
            order: index,
          };
        });
        updateFieldInfo(
          {
            fieldName: label,
            linguals: [{ displayName: label, language }],
            options,
            type: fieldType,
            displayName: label,
            isModified: true,
            isVisible: true,
            isEditable: true,
            isDeletable: true,
          },
          index
        );
      } else {
        updateFieldInfo({
          fieldName: label,
          linguals: [{ displayName: label, language }],
          options: [],
          type: fieldType,
          displayName: label,
          isVisible: true,
          isEditable: true,
          isModified: true,
          isDeletable: true,
        });
      }
    }
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      size={"small"}
      className="edit-field-modal"
      trigger={
        type === "edit" ? (
          <Button
            onClick={() => setOpen(true)}
            className={"action-item"}
            disabled={loading}
          >
            {t("form.button.edit")}
          </Button>
        ) : (
          <Button
            onClick={() => setOpen(true)}
            className={"action-item"}
            disabled={loading}
          >
            <Icon name={"plus"} />
            {t("profile.form.column.button.addColumn")}
          </Button>
        )
      }
    >
      {type === "edit" ? editHeader : createFieldHeader}
      <Modal.Content>
        <Form>
          <Form.Field>
            <label htmlFor="label">
              {t("profile.form.column.field.column.label")}
            </label>
            <Form.Input
              id="label"
              disabled={fieldInfo?.isDefault}
              value={label}
              onChange={labelChange}
            />
          </Form.Field>
          <Form.Field>
            <label htmlFor="fieldType">
              {t("profile.form.column.field.column.fieldType")}
            </label>
            <Dropdown
              scrolling
              fluid
              disabled={fieldInfo?.isDefault}
              id="fieldType"
              options={fieldTypeList}
              onChange={selectOption}
              placeholder={t("profile.form.column.field.column.placeholder")}
              text={customFieldTypeList[fieldType]}
              value={fieldType}
              upward={false}
            />
          </Form.Field>
          <div className="options-list">
            <ReactSortable
              list={optionsVal}
              direction={"vertical"}
              forceFallback
              fallbackOnBody
              onEnd={(evt, sortable, store) => {
                if (evt.oldIndex === undefined || evt.newIndex === undefined) {
                  return;
                }
                dispatch({
                  type: "OPTION_MOVED",
                  from: evt.oldIndex,
                  to: evt.newIndex,
                });
              }}
              // a temp hack to avoid a warning, used onEnd instead
              // https://github.com/SortableJS/react-sortablejs/issues/130
              setList={noop}
              animation={200}
              handle={".drag-handle"}
            >
              {optionsVal.map((optionVal, index) => (
                <EditOptionField
                  key={optionVal.id}
                  t={t}
                  index={index}
                  optionVal={optionVal.value}
                  optionValueChanged={optionValueChanged}
                  removeOptions={
                    fieldInfo?.isDefault ? undefined : removeOptions
                  }
                />
              ))}
            </ReactSortable>
            {fieldType === "options" && (
              <Button onClick={createOption} className={"add-option-link"}>
                <Icon name="add" /> {t("profile.form.column.button.addOption")}
              </Button>
            )}
          </div>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button
          className="action-btn cancel"
          onClick={closeModal}
          content={t("form.button.cancel")}
        />
        <Button
          className="action-btn save"
          onClick={saveChanges}
          content={t("form.button.save")}
        />
      </Modal.Actions>
    </Modal>
  );
};
