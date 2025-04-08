import {
  ImportActionType,
  PreviewHeader,
  PreviewType,
} from "../../../../../types/Contact/Import/PreviewType";
import {
  Dropdown,
  DropdownItemProps,
  Icon,
  Placeholder,
  Table,
} from "semantic-ui-react";
import iconOkImg from "../../../../../assets/images/icon-tick.svg";
import iconErrorImg from "../../../../../assets/images/icon-cross.svg";
import React, { ReactNode } from "react";
import { ColumnMapping, ColumnMappingStatic, MapField } from "../../contracts";
import { useTranslation } from "react-i18next";
import { InfoTooltip } from "../../../../../component/shared/popup/InfoTooltip";
import { READONLY_FIELDS } from "../UploadPreview";
import { insert } from "ramda";

export function PreviewTable(props: {
  response: PreviewType;
  mapFields: MapField[];
  columnsMapping: ColumnMapping[];
  initialColumnsMapping: ColumnMappingStatic[];
  setColumnMapping: (columnNumber: number, fieldName: string | null) => void;
  setColumnAction: (columnNumber: number, action: ImportActionType) => void;
}) {
  const {
    response,
    mapFields,
    columnsMapping,
    initialColumnsMapping,
    setColumnMapping,
    setColumnAction,
  } = props;
  const { t } = useTranslation();

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell className={"preview-status"}>
            {t("profile.list.import.step.preview.table.header.matched")}
          </Table.HeaderCell>
          <Table.HeaderCell>
            {t("profile.list.import.step.preview.table.header.fileColumn")}
          </Table.HeaderCell>
          <Table.HeaderCell>
            {t("profile.list.import.step.preview.table.header.preview")}
          </Table.HeaderCell>
          <Table.HeaderCell className={"preview-sleekflow-column"}>
            {t("profile.list.import.step.preview.table.header.fieldMatch")}
          </Table.HeaderCell>
          <Table.HeaderCell className={"action-column"}>
            {t("profile.list.import.step.preview.table.header.action")}
          </Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {response.headers.map((header, columnNumber) => (
          <PreviewRow
            mapFields={mapFields}
            mapping={columnsMapping[columnNumber]}
            header={header}
            columnName={initialColumnsMapping[columnNumber]?.name ?? ""}
            key={columnNumber}
            previewValue={response.records[0].fields[columnNumber]}
            onImportActionChange={(action: ImportActionType) => {
              setColumnAction(columnNumber, action);
            }}
            onMapChange={(fieldName) => {
              setColumnMapping(columnNumber, fieldName);
            }}
          />
        ))}
      </Table.Body>
    </Table>
  );
}

function PreviewRow(props: {
  header: PreviewHeader;
  mapFields: MapField[];
  mapping: ColumnMapping;
  previewValue: string;
  columnName: string;
  onMapChange: (fieldName: string | null) => void;
  onImportActionChange: (action: ImportActionType) => void;
}) {
  const {
    mapFields,
    header,
    previewValue,
    columnName,
    mapping,
    onMapChange,
    onImportActionChange,
  } = props;
  const { t } = useTranslation();
  const mapChoicesLoaded = mapFields.map<DropdownItemProps>((field, idx) => ({
    value: field.fieldName,
    key: idx,
    text: field.displayName,
  }));
  const mapChoices = [
    {
      text: t("profile.list.import.step.preview.table.option.none"),
      value: false,
      key: -1,
    },
    ...mapChoicesLoaded,
  ];
  const fieldMatch = mapFields.find((f) => f.fieldName === mapping.name);
  const mapValue = fieldMatch?.fieldName ?? false;
  const rowDisabled = mapValue === false;

  const isReadonly = READONLY_FIELDS.includes(columnName as any);

  return (
    <Table.Row className={rowDisabled ? "disabled" : ""}>
      <Table.Cell className={"preview-status"}>
        {header.isValid ? <img src={iconOkImg} /> : <img src={iconErrorImg} />}
      </Table.Cell>
      <Table.Cell>{columnName}</Table.Cell>
      <Table.Cell className={`${header.isValid || "has-error"}`}>
        {rowDisabled && (
          <span className={"danger"}>
            {t("profile.list.import.step.preview.warn.clearField")}
          </span>
        )}
        {mapValue !== false &&
          (header.isValid
            ? previewValue ?? ""
            : t("profile.list.import.step.preview.warn.invalidField"))}
      </Table.Cell>
      <Table.Cell
        className={`preview-sleekflow-column has-dropdown ${
          header.isValid || "has-error"
        }`}
      >
        {header.isValid && (
          <Dropdown
            options={mapChoices}
            fluid
            scrolling
            value={mapValue}
            onChange={(_, { value }) => {
              if (value === false) {
                onMapChange(null);
              } else {
                onMapChange(value as string);
              }
            }}
          />
        )}
        {!header.isValid &&
          t("profile.list.import.step.preview.warn.invalidField")}
      </Table.Cell>
      <Table.Cell className={"action-column has-dropdown"}>
        {!rowDisabled && !isReadonly && (
          <ActionDropdown
            mapFields={mapFields}
            mapping={mapping}
            onImportActionChange={onImportActionChange}
          />
        )}
        {isReadonly && (
          <span className={"value-static"}>
            {t("profile.list.import.step.preview.warn.readOnly")}
            <Icon name={"lock"} />
          </span>
        )}
      </Table.Cell>
    </Table.Row>
  );
}

function ActionDropdown(props: {
  onImportActionChange: (action: ImportActionType) => void;
  mapFields: MapField[];
  mapping: ColumnMapping;
}) {
  const { mapFields, mapping, onImportActionChange } = props;
  const { t } = useTranslation();
  const foundMatched = mapFields.find(
    (field) => field.fieldName === mapping.name
  );
  const hasAddExistingOption =
    foundMatched &&
    (foundMatched["type"] === "SingleLineText" ||
      foundMatched.fieldName === "Label");
  const actionNamesMap: Record<ImportActionType, string> = {
    Overwrite: t("profile.list.import.step.preview.action.overwrite.name"),
    Append: t("profile.list.import.step.preview.action.append.name"),
    UpdateBlankOnly: t(
      "profile.list.import.step.preview.action.updateBlankOnly.name"
    ),
  };
  const commonOptions = [
    {
      value: "UpdateBlankOnly",
      content: (
        <>
          <Tooltip
            text={t(
              "profile.list.import.step.preview.action.updateBlankOnly.name"
            )}
            hint={t(
              "profile.list.import.step.preview.action.updateBlankOnly.hint"
            )}
          />
        </>
      ),
    },
    {
      value: "Overwrite",
      content: (
        <>
          <Tooltip
            text={t("profile.list.import.step.preview.action.overwrite.name")}
            hint={t("profile.list.import.step.preview.action.overwrite.hint")}
          />
        </>
      ),
    },
  ];

  const options = hasAddExistingOption
    ? insert(
        1,
        {
          value: "Append",
          content: (
            <>
              <Tooltip
                text={t("profile.list.import.step.preview.action.append.name")}
                hint={t("profile.list.import.step.preview.action.append.hint")}
              />
            </>
          ),
        },
        commonOptions
      )
    : commonOptions;

  return (
    <Dropdown
      text={actionNamesMap[mapping.importAction] ?? actionNamesMap.Append}
      value={mapping.importAction}
      defaultValue={"AddButNotOverwrite"}
      onChange={(_, { value }) => {
        onImportActionChange(value as ImportActionType);
      }}
      options={options}
    />
  );
}

function Tooltip(props: { text: ReactNode; hint: ReactNode }) {
  return (
    <InfoTooltip
      offset={[0, 0]}
      trigger={<span className={"text"}>{props.text}</span>}
      placement={"right"}
    >
      {props.hint}
    </InfoTooltip>
  );
}

export function DummyTable() {
  const { t } = useTranslation();

  return (
    <Table padded>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell className={"preview-status"}>
            {t("profile.list.import.step.preview.table.header.matched")}
          </Table.HeaderCell>
          <Table.HeaderCell>
            {t("profile.list.import.step.preview.table.header.fileColumn")}
          </Table.HeaderCell>
          <Table.HeaderCell className={"preview-sleekflow-column"}>
            {t("profile.list.import.step.preview.table.header.fieldMatch")}
          </Table.HeaderCell>
          <Table.HeaderCell>
            {t("profile.list.import.step.preview.table.header.preview")}
          </Table.HeaderCell>
          <Table.HeaderCell>
            {t("profile.list.import.step.preview.table.header.action")}
          </Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <Table.Row key={i}>
              <Table.Cell className={"preview-status"}>
                <Placeholder>
                  <Placeholder.Line length={"full"} />
                </Placeholder>
              </Table.Cell>
              <Table.Cell>
                <Placeholder>
                  <Placeholder.Line length={"full"} />
                </Placeholder>
              </Table.Cell>
              <Table.Cell>
                <Placeholder>
                  <Placeholder.Line length={"full"} />
                </Placeholder>
              </Table.Cell>
              <Table.Cell className={"preview-sleekflow-column"}>
                <Placeholder>
                  <Placeholder.Line length={"full"} />
                </Placeholder>
              </Table.Cell>
            </Table.Row>
          ))}
      </Table.Body>
    </Table>
  );
}
