import { useTranslation } from "react-i18next";
import { Table } from "semantic-ui-react";
import React from "react";
import TemplateBookmarkSettingsGuidePopup from "../../Popup/TemplateBookmarkSettingsGuidePopup";

interface Props {
  bookmarkedCount: number;
  deletable: boolean;
}

export function TableHeader(props: Props) {
  const { bookmarkedCount, deletable } = props;
  const { t } = useTranslation();

  return (
    <Table.Header>
      <Table.Row>
        {deletable && <Table.HeaderCell className={"checkbox"} />}
        <Table.HeaderCell>
          <TemplateBookmarkSettingsGuidePopup
            bookmarkedCount={bookmarkedCount}
          />
        </Table.HeaderCell>
        <Table.HeaderCell>
          {t("settings.templates.grid.header.name")}
        </Table.HeaderCell>
        <Table.HeaderCell>
          {t("settings.templates.grid.header.messageText")}
        </Table.HeaderCell>
        <Table.HeaderCell>
          {t("settings.templates.grid.header.category")}
        </Table.HeaderCell>
        <Table.HeaderCell>
          {t("settings.templates.grid.header.buttonType")}
        </Table.HeaderCell>
        <Table.HeaderCell>
          {t("settings.templates.grid.header.language")}
        </Table.HeaderCell>
        <Table.HeaderCell>
          {t("settings.templates.grid.header.status")}
        </Table.HeaderCell>
      </Table.Row>
    </Table.Header>
  );
}
