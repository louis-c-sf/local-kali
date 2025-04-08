import React, { useCallback } from "react";
import { equals } from "ramda";
import { useTranslation } from "react-i18next";
import { Table as UITable, TableCellProps } from "semantic-ui-react";
import styles from "../../layouts/TableView.module.css";
import { parseAndFormatAnyPhone } from "../../../../component/Channel/selectors";
import { TableFieldType } from "./Table";
import { useObjectsGridContext } from "../ObjectsGrid/ObjectsGridContext";
import { ObjectNormalizedType } from "../../API/Objects/contracts";
import { Avatar } from "../../../../component/shared/Avatar/Avatar";
import moment from "moment";

function Row<Item extends ObjectNormalizedType>(props: {
  onClick: () => void;
  item: Item;
  loading: boolean;
  handleLinkClick: (leadId: string) => Promise<void>;
  fields: TableFieldType<Item>[];
  showAvatar: boolean;
}) {
  const { fields, handleLinkClick, item, loading, onClick } = props;
  const { t } = useTranslation();
  const { fieldReader, getObjectOwner } = useObjectsGridContext();

  const cellRender = useCallback(
    (props: any) => <UITable.Cell {...props} />,
    []
  );

  return (
    <UITable.Row
      cellAs={cellRender}
      cells={fields.map(
        ({ name, content, type, clickForDetails, resolveValue }) => {
          const cellBase: TableCellProps = { key: name };
          if (clickForDetails) {
            cellBase.onClick = onClick;
          }
          if (resolveValue) {
            return { ...cellBase, content: resolveValue(item) };
          }
          if (type === "name") {
            const name = fieldReader.getValue(item, "Name");

            return {
              ...cellBase,
              content: (
                <div className={styles.user}>
                  {props.showAvatar && (
                    <span className={styles.avatar}>
                      <Avatar name={name} size={"24px"} />
                    </span>
                  )}
                  {name}
                </div>
              ),
            };
          }

          if (type === "link") {
            return {
              ...cellBase,
              content: (
                <a
                  className={loading ? styles.disabled : ""}
                  onClick={loading ? undefined : () => handleLinkClick(item.id)}
                >
                  {t("salesforce.leads.link")}
                </a>
              ),
            };
          }

          if (type === "phone") {
            const phone = fieldReader.getValue(item, name);
            return {
              ...cellBase,
              content: phone ? parseAndFormatAnyPhone(phone) ?? phone : "-",
            };
          }

          if (type === "owner") {
            const owner = getObjectOwner(item);

            return {
              ...cellBase,
              content: owner ? `${owner.first_name} ${owner.last_name}` : "-",
            };
          }

          if (type === "date") {
            const dateValue = fieldReader.getValue(item, name);
            if (dateValue) {
              const momentValue = moment(dateValue);
              if (momentValue.isValid()) {
                return {
                  ...cellBase,
                  content: momentValue.format("DD.MM.yyyy"),
                };
              }
            }
          }

          if (typeof content === "string") {
            return {
              ...cellBase,
              content: content,
            };
          }

          return {
            ...cellBase,
            content: fieldReader.getValue(item, name),
          };
        }
      )}
    />
  );
}

export const RowMemo = React.memo(
  Row,
  (prev, next) => prev.loading === next.loading && equals(prev.item, next.item)
);
