import React from "react";
import { Button, Icon, Image, Modal } from "semantic-ui-react";
import { CustomProfileField } from "../../types/ContactType";
import CloseIcon from "../../assets/images/x-icon.svg";
import { NewColumnModal } from "./NewColumnModal";
import { clone } from "ramda";
import { useTranslation } from "react-i18next";
import { InfoTooltip } from "../shared/popup/InfoTooltip";
import { ReactSortable } from "react-sortablejs";
import { noop } from "lib/utility/noop";
import { useEditColumnsModalFlow } from "./EditColumnsModal/useEditColumnsModalFlow";
import { fetchCompany } from "../../api/Company/fetchCompany";
import postUserProfileFields from "api/Contacts/postUserProfileFields";
import { deleteMethodWithExceptions } from "../../api/apiRequest";
import { DELETE_CUSTOM_PROFILE_FIELD } from "../../api/apiPath";

export default EditColumnsModal;

function EditColumnsModal(props: {
  initFields: CustomProfileField[];
  setFields: (fields: CustomProfileField[]) => void;
  opened: boolean;
  setOpened: (openPopUp: boolean) => void;
}) {
  const { t } = useTranslation();
  const { opened, setOpened } = props;

  const editColumns = useEditColumnsModalFlow({
    close: () => setOpened(false),
    initFields: props.initFields,
    onFieldsUpdated: props.setFields,
    fetchCompany: fetchCompany,
    submitFields: postUserProfileFields,
    submitDeleteFields: async (deletedFields) => {
      return await deleteMethodWithExceptions(DELETE_CUSTOM_PROFILE_FIELD, {
        param: {
          userProfileFieldIds: deletedFields.map((field) => field.id),
        },
      });
    },
  });

  return (
    <Modal
      open={opened}
      className={"edit-columns"}
      trigger={
        <InfoTooltip
          placement={"bottom"}
          children={t("profile.tooltip.action.editColumns")}
          trigger={
            <Button onClick={() => setOpened(true)}>
              <Icon name={"pencil"} className={"sf-icon pencil"} />
              {t("form.profile.button.editColumns")}
            </Button>
          }
        />
      }
    >
      <Modal.Header as="h4">
        {t("profile.editColumn.header")}
        <Image src={CloseIcon} onClick={() => setOpened(false)} />
      </Modal.Header>
      <Modal.Content className={"edit-column"}>
        <ReactSortable
          list={editColumns.fieldInfos}
          direction={"vertical"}
          className={"wrap"}
          forceFallback
          fallbackOnBody
          // a temp hack to avoid a warning, used onEnd instead
          // https://github.com/SortableJS/react-sortablejs/issues/130
          setList={noop}
          animation={200}
          handle={".top.drag-handle"}
          onEnd={(evt) => {
            if (evt.oldIndex !== undefined && evt.newIndex !== undefined) {
              editColumns.reorderColumns(evt.oldIndex, evt.newIndex);
            }
          }}
        >
          {editColumns.fieldInfos.map((field, index) => {
            return (
              <div
                key={`FormField${field.id}`}
                className={`
                  edit-columns-modal__field field 
                  ${!field.isVisible ? "hide" : "unhide"}
                `}
              >
                <div className={`top drag-handle`}>
                  <Icon className={"button-dots"} />
                </div>
                <div className="field-action">
                  <div className="field-value">{field.displayName}</div>
                  <div className="action-link">
                    {field.isEditable && (
                      <NewColumnModal
                        updateFieldInfo={editColumns.updateFieldsInfo}
                        fieldInfo={clone(editColumns.fieldInfos[index])}
                        index={index}
                        type="edit"
                        loading={editColumns.loading}
                      />
                    )}
                    {field.isDeletable && !field.isDefault && (
                      <Button
                        className="action-item"
                        onClick={(e) => {
                          e.stopPropagation();
                          editColumns.deleteField(index);
                        }}
                        disabled={editColumns.loading}
                      >
                        {t("form.button.delete")}
                      </Button>
                    )}
                    <Button
                      className="action-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        editColumns.visibleChange(index);
                      }}
                      disabled={editColumns.loading}
                    >
                      {field.isVisible
                        ? t("form.button.hide")
                        : t("form.button.unhide")}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </ReactSortable>
        <div className="add-field-link">
          <NewColumnModal
            updateFieldInfo={editColumns.updateFieldsInfo}
            type="add"
            loading={editColumns.loading}
          />
        </div>
      </Modal.Content>
      <Modal.Actions>
        <Button
          className="action-btn cancel"
          onClick={editColumns.closeModal}
          content={t("form.button.cancel")}
          disabled={editColumns.loading}
        />
        <Button
          className="action-btn submit"
          onClick={(e) => {
            e.stopPropagation();
            editColumns.submitChange();
          }}
          loading={editColumns.loading}
          content={t("form.button.save")}
        />
      </Modal.Actions>
    </Modal>
  );
}
