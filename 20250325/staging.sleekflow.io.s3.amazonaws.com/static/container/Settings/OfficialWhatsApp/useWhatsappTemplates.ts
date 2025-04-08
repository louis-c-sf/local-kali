import fetchWhatsappTemplates from "../../../api/Company/fetchWhatsappTemplates";
import {
  WhatsappTemplateType,
  WhatsappTemplateResponseType,
  Whatsapp360DialogTemplateResponse,
  isHeaderType,
  isFooterType,
  isBodyType,
  isButtonType,
  ButtonComponentType,
  HeaderComponentType,
  WhatsappContentTemplateResponseType,
  WhatsappContentTemplateType,
  HeaderFormatEnum,
} from "types/WhatsappTemplateResponseType";
import fetch360DialogTemplate from "api/Company/fetch360DialogTemplate";
import {
  NormalizedWhatsAppTemplateLanguageType,
  NormalizedWhatsAppTemplateType,
} from "features/Whatsapp360/models/OptInType";
import { deleteMethod } from "api/apiRequest";
import { useState } from "react";
import { fetchTemplates } from "api/CloudAPI/fetchTemplates";
import { normalizeCloudAPITemplate } from "features/WhatsappCloudAPI/models/normalizeCloudAPITemplate";
import fetchTwilioContentTemplate from "api/Company/fetchTwilioContentTemplate";
import { getTemplateResponseKey } from "lib/utility/getTemplateResponseKey";

export function filterApprovedTemplates(
  templates: WhatsappTemplateResponseType
) {
  return templates.whatsapp_templates
    .filter((t) =>
      t.languages.some((template) => template.status === "approved")
    )
    .map((t) => ({
      ...t,
      languages: t.languages.filter(
        (template) => template.status === "approved"
      ),
    }));
}
export function denormalizeContentTemplate(
  templates: WhatsappContentTemplateType[]
) {
  let denormalizedTemplates: NormalizedWhatsAppTemplateType = {};
  return templates.reduce(
    (
      prev: NormalizedWhatsAppTemplateType,
      template: WhatsappContentTemplateType
    ) => {
      const content =
        (
          template.types["twilio/text"] ||
          template.types["twilio/call-to-action"] ||
          template.types["twilio/quick-reply"]
        )?.body ?? "";
      const id = getTemplateResponseKey({
        templateName: template.friendly_name,
        sid: template.sid,
        language: template.language,
        channel: "twilio_whatsapp",
      });
      return {
        ...prev,
        [id]: {
          translations: {
            [template.language]: {
              content,
              isBookmarked: template.isBookmarked,
              status: template.approval_requests.status,
              isContentTemplate: true,
              contentSid: template.sid,
              buttons: template.types["twilio/quick-reply"]?.actions
                ? [
                    {
                      text: template.types["twilio/quick-reply"]?.actions[0]
                        .title,
                      type: "QUICK_REPLY",
                    },
                  ]
                : [],
            },
          },
          languages: [template.language],
          approvedCount:
            template.approval_requests.status === "approved" ? 1 : 0,
          totalCount: 1,
          rejectedCount:
            template.approval_requests.status === "rejected" ? 1 : 0,
          template_name: template.friendly_name,
          isBookmarked: template.isBookmarked,
          category: template.approval_requests.category,
        },
      };
    },
    denormalizedTemplates
  );
}
export function denormalizeTemplateMessage(templates: WhatsappTemplateType[]) {
  let denormalizedTemplates: NormalizedWhatsAppTemplateType = {};
  templates.forEach((template) => {
    let languageContent =
      template.languages.reduce<NormalizedWhatsAppTemplateLanguageType>(
        (prev, next) => {
          return {
            ...prev,
            translations: {
              ...prev.translations,
              [next.language]: {
                content: next.content,
                buttons:
                  next.components?.map((ch) => ch.buttons ?? []).flat(1) ?? [],
                isBookmarked: template.isBookmarked ?? false,
                status: next.status,
              },
            },
          };
        },
        {
          translations: {},
          languages: [...template.languages.map((t) => t.language)],
          approvedCount: template.languages.map((t) => t.status === "approved")
            .length,
          totalCount: template.languages.length,
          rejectedCount: template.languages.map((t) => t.status === "rejected")
            .length,
          template_name: template.template_name,
          isBookmarked: template.isBookmarked ?? false,
          category: template.category,
        }
      );
    denormalizedTemplates = {
      ...denormalizedTemplates,
      [template.template_name]: languageContent,
    };
  });
  return denormalizedTemplates;
}
function filterApprovedContentTemplates(
  templates: WhatsappContentTemplateResponseType,
  isOptIn: boolean
) {
  return templates?.contents?.filter(
    (t) =>
      t.approval_requests.status === "approved" &&
      (isOptIn
        ? t.types["twilio/quick-reply"] &&
          t.types["twilio/quick-reply"].actions?.length === 1
        : t.types["twilio/text"] ||
          t.types["twilio/quick-reply"] ||
          t.types["twilio/call-to-action"])
  );
}
export function useWhatsappTemplates() {
  const [loading, setLoading] = useState(false);

  const fetchTwilioTemplates = async function ({
    isOptIn = false,
    accountSID,
  }: {
    isOptIn?: boolean;
    accountSID: string;
  }): Promise<NormalizedWhatsAppTemplateType> {
    setLoading(true);
    const templatesResp = await fetchWhatsappTemplates(0, 1000, accountSID);
    const templateContentResp = await fetchTwilioContentTemplate(
      0,
      1000,
      accountSID
    );
    const filterTemplateContentReply =
      filterApprovedContentTemplates(templateContentResp, isOptIn) ?? [];
    const denormalizedContentTemplate = denormalizeContentTemplate(
      filterTemplateContentReply
    );
    const filteredQuickReply = isOptIn
      ? filterQuickReplyTemplates(templatesResp)
      : filterApprovedTemplates(templatesResp);
    const denormalizedTemplate = denormalizeTemplateMessage(filteredQuickReply);
    setLoading(false);

    return { ...denormalizedContentTemplate, ...denormalizedTemplate };
  };

  function filterApproved360DialogTemplates(
    templates: Array<Whatsapp360DialogTemplateResponse>
  ) {
    return templates.filter((t) => t.status === "approved");
  }

  function filterOptIn360DialogTemplates(
    templates: Array<Whatsapp360DialogTemplateResponse>
  ) {
    return templates.filter((template) => {
      const buttons = template.components.find(
        (c) => c.type === "BUTTONS"
      ) as ButtonComponentType;
      const headerType = template.components.find(
        (c) => c.type === "HEADER"
      ) as HeaderComponentType;
      const hasOneButton = buttons && buttons?.buttons?.length === 1;
      return (
        hasOneButton &&
        !["IMAGE", "DOCUMENT", "VIDEO"].includes(headerType?.format)
      );
    });
  }
  function filterQuickReplyTemplates(templates: WhatsappTemplateResponseType) {
    return templates.whatsapp_templates.filter((t) =>
      t.languages.some(
        (template) =>
          template.status === "approved" &&
          template.components?.some(
            (button) =>
              button.buttons.length === 1 &&
              button.buttons.some((b) => b.type === "QUICK_REPLY")
          )
      )
    );
  }

  const fetch360DialogInfo = async function (
    configId: number,
    isOptIn?: boolean
  ): Promise<NormalizedWhatsAppTemplateType> {
    setLoading(true);
    try {
      const templatesResp = await fetch360DialogTemplate(configId);
      const whatsappTemplates = isOptIn
        ? filterOptIn360DialogTemplates(templatesResp.whatsAppTemplates)
        : templatesResp.whatsAppTemplates;

      const filteredApprovedTemplates =
        filterApproved360DialogTemplates(whatsappTemplates);
      let denormalizedTemplates: NormalizedWhatsAppTemplateType = {};
      filteredApprovedTemplates.forEach((template) => {
        const headerType = template.components.find((c) => c.type === "HEADER");
        const footerType = template.components.find((c) => c.type === "FOOTER");
        const bodyType = template.components.find((c) => c.type === "BODY");
        const buttons = template.components.find((c) => c.type === "BUTTONS");
        const id = getTemplateResponseKey({
          templateName: template.name,
          language: template.language,
          channel: "whatsapp360dialog",
        });
        const denormalizeResult = {
          ...denormalizedTemplates,
          [id]: {
            translations: {
              ...(denormalizedTemplates[id]?.translations ?? {}),
              [template.language]: {
                namespace: template.namespace,
                isBookmarked: template.isTemplateBookmarked,
                status: template.status,
                content: isBodyType(bodyType!) ? bodyType.text : "",
                ...(isHeaderType(headerType) && { header: headerType }),
                ...(isFooterType(footerType) && { footer: footerType }),
                ...(isButtonType(buttons) && { buttons: buttons?.buttons }),
              },
            },
            isBookmarked: template.isTemplateBookmarked ?? false,
            languages: [template.language],
            approvedCount: template.status === "approved" ? 1 : 0,
            totalCount: 1,
            rejectedCount: template.status === "rejected" ? 1 : 0,
            template_name: template.name,
            namespace: template.namespace,
            category: template.category,
          },
        };
        denormalizedTemplates = denormalizeResult;
      });
      return denormalizedTemplates;
    } catch (e) {
      return {};
    } finally {
      setLoading(false);
    }
  };

  async function refresh360Templates(configId?: number) {
    if (!configId) {
      return;
    }
    setLoading(true);
    await deleteMethod(
      "/company/whatsapp/360dialog/{id}/template/cache".replace(
        "{id}",
        String(configId)
      ),
      {
        param: {
          limit: 1000,
          offset: 0,
        },
      }
    );
    return await fetch360DialogInfo(configId);
  }

  async function fetchCloudApiTemplates(
    waBaId: string,
    useCache: boolean,
    isDisplayRejected?: boolean,
    filterVariable?: boolean
  ): Promise<NormalizedWhatsAppTemplateType> {
    const results = await fetchTemplates(waBaId, useCache);
    results.whatsappTemplates
      .filter((s) => {
        const isComponentWithSpecifiedHeader = s.components.some(
          (h) =>
            h.type === "HEADER" &&
            h.format &&
            [
              HeaderFormatEnum.DOCUMENT,
              HeaderFormatEnum.IMAGE,
              HeaderFormatEnum.TEXT,
              HeaderFormatEnum.VIDEO,
            ].includes(h.format)
        );
        return s.components.some((h) => h.type === "HEADER")
          ? isComponentWithSpecifiedHeader
          : true;
      })
      .filter((s) => (isDisplayRejected ? true : s.status === "APPROVED"))
      .forEach((s) => normalizeCloudAPITemplate(s, filterVariable));

    let normalizeResult: NormalizedWhatsAppTemplateLanguageType[] =
      results.whatsappTemplates
        .filter((s) => (isDisplayRejected ? true : s.status === "APPROVED"))
        .map((s) => normalizeCloudAPITemplate(s, filterVariable));
    if (filterVariable) {
      normalizeResult = normalizeResult.filter((s) => s.isSkipped === false);
    }
    return normalizeResult.reduce<NormalizedWhatsAppTemplateType>(
      (acc, next) => {
        const [language] = next.languages;
        const id = getTemplateResponseKey({
          templateName: next.template_name,
          language: language,
          channel: "whatsappcloudapi",
        });
        return {
          ...acc,
          [id]: {
            ...next,
            languages: [...(acc[id]?.languages ?? []), ...next.languages],
            translations: {
              ...(acc[id]?.translations ?? {}),
              ...next.translations,
            },
          },
        };
      },
      {}
    );
  }

  async function refreshCloudApi(waBaId: string) {
    return fetchCloudApiTemplates(waBaId, true);
  }

  return {
    fetchWhatsappTemplates: fetchTwilioTemplates,
    fetch360Templates: fetch360DialogInfo,
    refresh360Templates,
    refreshCloudApi,
    fetchCloudApiTemplates,
    loading,
  };
}
