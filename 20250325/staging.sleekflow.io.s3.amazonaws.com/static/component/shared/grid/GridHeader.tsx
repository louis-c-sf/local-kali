import React, { ReactNode, useState } from "react";
import { Button } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import { InfoTooltip } from "../popup/InfoTooltip";
import { GridHeaderContext } from "component/shared/grid/GridHeaderContext";

export type DeleteConfirmationAwareType = {
  deleteConfirmationRequested: boolean;
};
export type ShowsDeleteConfirmationType = {
  requestDeleteConfirmation: (show: boolean) => void;
};

function GridHeader(
  props: {
    canDelete?: boolean;
    deleteLoading: boolean;
    onDeleteClick: () => void;
    selectedItemsCount: number;
    children: ReactNode;
    actionsPosition?: "top" | "bottom";
    afterMainRow?: ReactNode;
    deleteLabel?: string;
    batchButtons?: ReactNode;
    onPlayClick?: () => void;
    deleteTooltip?: string;
    title?: ReactNode;
    deleteEnabled?: boolean;
    loft?: ReactNode;
    tab?: ReactNode;
    prependActions?: ReactNode;
    split?: boolean;
  } & DeleteConfirmationAwareType &
    ShowsDeleteConfirmationType
) {
  const {
    canDelete,
    deleteLoading,
    onDeleteClick,
    batchButtons,
    selectedItemsCount,
    deleteTooltip,
    deleteConfirmationRequested,
    requestDeleteConfirmation,
    loft,
    tab,
    actionsPosition = "top",
    deleteEnabled = true, // for keeping BC in all other cases
    prependActions,
    split = false,
  } = props;

  const [mainRowNode, setMainRowNode] = useState<HTMLElement | null>(null);

  function confirmDelete() {
    requestDeleteConfirmation(true);
  }

  function cancelDelete() {
    requestDeleteConfirmation(false);
  }

  const actions = (
    <Actions
      canDelete={canDelete}
      confirmDelete={confirmDelete}
      renderBatchButtons={batchButtons}
      deleteLabel={props.deleteLabel}
      deleteTooltip={deleteTooltip}
      deleteEnabled={deleteEnabled}
      deleteLoading={deleteLoading}
      onConfirmDeleteClick={cancelDelete}
      onDeleteClick={onDeleteClick}
      selectedItemsCount={selectedItemsCount}
      deleteConfirmationRequested={deleteConfirmationRequested}
      prependActions={prependActions}
    >
      {props.children}
    </Actions>
  );
  return (
    <GridHeaderContext value={{ mainRowNode: mainRowNode }}>
      <header className={`grid-header ${split ? "split-header" : ""}`}>
        {loft && <div className="loft">{loft}</div>}
        {tab && <div className="tab">{tab}</div>}
        <div className="main-row" ref={setMainRowNode}>
          <div className="status-text">{props.title}</div>
          {actionsPosition === "top" && actions}
        </div>
        {props.afterMainRow && (
          <div className={"after-main-row"}>
            {props.afterMainRow}
            {actionsPosition === "bottom" && actions}
          </div>
        )}
      </header>
    </GridHeaderContext>
  );
}

function Actions(props: {
  canDelete?: boolean;
  confirmDelete: () => void;
  renderBatchButtons: React.ReactNode;
  deleteLabel: string | undefined;
  selectedItemsCount: number;
  deleteConfirmationRequested: boolean;
  deleteTooltip: string | undefined;
  deleteEnabled: boolean;
  deleteLoading: boolean;
  onConfirmDeleteClick: () => void;
  onDeleteClick: () => void;
  children: React.ReactNode;
  prependActions: React.ReactNode;
}) {
  const {
    canDelete,
    children,
    confirmDelete,
    deleteConfirmationRequested,
    deleteEnabled,
    deleteLabel,
    deleteLoading,
    deleteTooltip,
    onConfirmDeleteClick,
    onDeleteClick,
    renderBatchButtons,
    selectedItemsCount,
    prependActions,
  } = props;

  const anyItemsSelected = selectedItemsCount > 0;
  const showDelete = anyItemsSelected && !deleteConfirmationRequested;
  const showConfirmButton = anyItemsSelected && deleteConfirmationRequested;
  const deleteDisabled = selectedItemsCount === 0;

  const { t } = useTranslation();

  return (
    <div className="actions">
      {prependActions}
      {showDelete && (
        <SelectMode
          onClick={confirmDelete}
          disabled={deleteDisabled || canDelete === false}
          renderBatchButtons={renderBatchButtons}
          label={deleteLabel || t("form.button.delete")}
          deleteTooltip={deleteTooltip}
          deleteEnabled={deleteEnabled}
        />
      )}
      {showConfirmButton && (
        <ConfirmDeleteMode
          deleteLoading={deleteLoading}
          onClick={onConfirmDeleteClick}
          onDeleteClick={onDeleteClick}
          label={deleteLabel || t("form.button.delete")}
        />
      )}
      {!(showDelete || showConfirmButton) && children}
    </div>
  );
}

function SelectMode(props: {
  onClick: () => void;
  disabled: boolean;
  renderBatchButtons?: ReactNode;
  label: string;
  deleteTooltip?: string;
  deleteEnabled: boolean;
}) {
  const deleteBtn = props.deleteEnabled ? (
    <Button onClick={props.onClick} disabled={props.disabled}>
      {props.label}
    </Button>
  ) : (
    <div />
  );

  return (
    <>
      {props.renderBatchButtons && (
        <div className={"buttons-group"}>{props.renderBatchButtons}</div>
      )}
      {props.deleteTooltip ? (
        <InfoTooltip
          trigger={deleteBtn}
          placement={"bottom"}
          children={props.deleteTooltip}
        />
      ) : (
        deleteBtn
      )}
    </>
  );
}

function ConfirmDeleteMode(props: {
  deleteLoading: boolean;
  onClick: () => void;
  onDeleteClick: () => void;
  label: string;
}) {
  const { t } = useTranslation();
  return (
    <>
      {!props.deleteLoading && (
        <Button onClick={props.onClick}>{t("form.button.cancel")}</Button>
      )}
      <Button
        primary
        onClick={props.deleteLoading ? undefined : props.onDeleteClick}
        loading={props.deleteLoading}
      >
        {props.label}
      </Button>
    </>
  );
}

export default GridHeader;
