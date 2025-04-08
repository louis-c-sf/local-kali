import { downloadFileViaPost } from "api/apiRequest";

export function submitConversationUsageExport(props: {
  facebookBusinessId: string;
  facebookWabaId: string;
  start: string;
  end: string;
}): void {
  const { facebookBusinessId, facebookWabaId, start, end } = props;
  downloadFileViaPost(
    "/company/whatsapp/cloudapi/conversation-usage/analytic/export",
    {
      facebookBusinessId,
      facebookWabaId,
      start,
      end,
    },
    "export.csv",
    "text/csv"
  );
}
