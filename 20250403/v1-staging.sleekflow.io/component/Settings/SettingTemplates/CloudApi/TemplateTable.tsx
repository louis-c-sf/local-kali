import React, { useMemo } from "react";
import { WhatsappTemplateAction } from "container/Settings/OfficialWhatsApp/whatsappTemplateReducer";
import { Table } from "semantic-ui-react";
import { TableHeader } from "../Twilio/SettingTemplatesTable/TableHeader";
import TableRow from "./TableRow";
import { WhatsappCloudAPITemplateType } from "features/WhatsappCloudAPI/models/WhatsappCloudAPITemplateType";
import { usePermission } from "component/shared/usePermission";
import { PERMISSION_KEY } from "types/Rbac/permission";

export default function TemplateTable(props: {
  tabId: string;
  templates: readonly WhatsappCloudAPITemplateType[];
  checkableItems: readonly string[];
  dispatch: React.Dispatch<
    WhatsappTemplateAction<WhatsappCloudAPITemplateType>
  >;
  bookmarksPending: string[];
  toggleBookmark: (sid: string) => void;
}) {
  const {
    templates,
    checkableItems,
    dispatch,
    tabId,
    bookmarksPending,
    toggleBookmark,
  } = props;
  let bookmarkedCount = templates.filter(
    (t) => t.is_template_bookmarked
  ).length;
  const { check } = usePermission();
  const [canEditTemplate, canDeleteTemplate] = useMemo(
    () =>
      check([
        PERMISSION_KEY.channelTemplateEdit,
        PERMISSION_KEY.channelTemplateDelete,
      ]),
    [check]
  );

  return (
    <Table basic={"very"} className={"app data-grid"}>
      <TableHeader
        bookmarkedCount={bookmarkedCount}
        deletable={canDeleteTemplate}
      />
      <Table.Body>
        {[...templates].map((template) => (
          <TableRow
            tabId={tabId}
            toggleBookmark={toggleBookmark}
            dispatch={dispatch}
            checkableItems={checkableItems}
            template={template}
            bookmarkPending={bookmarksPending.includes(template.id)}
            editable={canEditTemplate}
            deletable={canDeleteTemplate}
          />
        ))}
      </Table.Body>
    </Table>
  );
}
