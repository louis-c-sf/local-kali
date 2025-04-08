import { useWhatsappTemplates } from "../../../../container/Settings/OfficialWhatsApp/useWhatsappTemplates";
import { useState } from "react";
import { IdNormalizedWhatsAppTemplateLanguageType } from "../../../../component/Chat/Messenger/SelectWhatsappTemplate/useSelectWhatsappTemplateFlow";
import { equals } from "ramda";
import {
  fetchCallbackTemplates,
  WhatsappTemplateCallbackType,
} from "../../API/fetchCallbackTemplates";
import { extractTemplateLanguages } from "../../models/extractTemplateLanguages";
import { extractTemplatesGridItems } from "../../models/extractTemplatesGridItems";
import { NormalizedWhatsAppTemplateLanguageType } from "../../models/OptInType";
import { writeTemplateCallback } from "./writeTemplateCallback";
import { removeTemplateCallback } from "./removeTemplateCallback";
import { whereButtons } from "features/Whatsapp360/components/TemplatesGrid/whereButtons";

type FilterGetterType<TFilter extends {}> = (
  filter: TFilter
) => (t: IdNormalizedWhatsAppTemplateLanguageType) => boolean;

export function useWhatsapp360CallbackableTemplatesPaginated<
  TFilter extends {}
>(props: {
  pageSize: number;
  channelId?: number;
  getTemplateFilter: FilterGetterType<TFilter>;
  initFilter: TFilter;
}) {
  const { fetch360Templates } = useWhatsappTemplates();
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filterApplied, setFilterApplied] = useState<TFilter>(props.initFilter);
  const [templatesLoaded, setTemplatesLoaded] =
    useState<IdNormalizedWhatsAppTemplateLanguageType[]>();

  async function loadTemplates(configId: number) {
    setLoading(true);

    try {
      const templatesPromise = fetch360Templates(configId, false);
      const callbacksPromise = fetchCallbackTemplates();
      const [templatesResult, callbacksResult] = await Promise.all([
        templatesPromise,
        callbacksPromise,
      ]);
      const callbacks = callbacksResult.whatsappTemplateQuickReplyCallbacks;

      const templatesNormalized: IdNormalizedWhatsAppTemplateLanguageType[] =
        Object.entries(templatesResult).map(([id, template]) => {
          const callbacksMatch = callbacks.find(
            (cbk) => cbk.templateName === id
          )?.callbackActions;
          const templateWithCallbacks: NormalizedWhatsAppTemplateLanguageType =
            {
              ...template,
              callbacks: callbacksMatch,
            };
          return {
            id,
            template: templateWithCallbacks,
          };
        });
      setTemplatesLoaded(
        templatesNormalized.filter((t) => whereButtons(Boolean, t.template))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const loadPage = async (page: number, filter: TFilter) => {
    if (!props.channelId) {
      return;
    }

    const actualPage = equals(filter, filterApplied) ? page : 1;
    setPageNumber(actualPage);
    setFilterApplied({ ...filter });

    return await loadTemplates(props.channelId);
  };

  const start = (pageNumber - 1) * props.pageSize;
  const end = start + props.pageSize;

  const translationsVisible = (templatesLoaded ?? []).filter(
    props.getTemplateFilter(filterApplied)
  );

  const templatesVisible = extractTemplatesGridItems(translationsVisible);
  const languages = extractTemplateLanguages(translationsVisible);
  const data = templatesVisible.slice(start, end);

  function insertCallback(callback: WhatsappTemplateCallbackType) {
    setTemplatesLoaded(writeTemplateCallback(callback));
  }

  function deleteCallbacks(templateId: string, templateLanguage: string) {
    setTemplatesLoaded(removeTemplateCallback(templateId, templateLanguage));
  }

  return {
    page: {
      data,
      number: pageNumber,
      total: Math.ceil(templatesVisible.length / props.pageSize),
    },
    loading,
    loadPage,
    languages,
    updateCallbacks: insertCallback,
    deleteCallbacks,
  };
}
