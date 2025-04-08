import React, { useEffect, useReducer, useState } from "react";
// import styles from "../SettingTemplates.module.css";
import styles from "./SettingTemplatesTwilio.module.css";
import { TemplatesFilter } from "../../../../features/Whatsapp360/components/TemplatesFilter/TemplatesFilter";
import { Button } from "../../../shared/Button/Button";
import { Table } from "semantic-ui-react";
import GridDummy from "../../../shared/Placeholder/GridDummy";
import { TableHeader } from "./SettingTemplatesTable/TableHeader";
import { TemplateTable } from "./SettingTemplatesTable/TemplateTable";
import { matchesTemplateFilters } from "../../../Broadcast/TemplateSelection/matchesTemplateFilters";
import ModalConfirm from "../../../shared/ModalConfirm";
import { Trans, useTranslation } from "react-i18next";
import { QuickReplyRequestType } from "../../../../types/QuickReplies/QuickReplyType";
import { post } from "../../../../api/apiRequest";
import { POST_CREATE_QUICK_REPLY } from "../../../../api/apiPath";
import {
  denormalizeWhatsappTemplateResponse,
  denormalizeWhatsappContentTemplateResponse,
  WhatsappTemplateNormalizedType,
} from "../../../../types/WhatsappTemplateResponseType";
import {
  defaultState,
  getWhatsappTemplateFormReducer,
} from "../../../../container/Settings/OfficialWhatsApp/whatsappTemplateReducer";
import { useHistory } from "react-router";
import useRouteConfig from "../../../../config/useRouteConfig";
import { useFlashMessageChannel } from "../../../BannerMessage/flashBannerMessage";
import { useFeaturesGuard } from "../../hooks/useFeaturesGuard";
import { Mutable } from "@storybook/addon-knobs/dist/type-defs";
import { uniq } from "ramda";
import { postRemoveTemplateBookmark } from "../../../../api/WhatsappTemplate/postRemoveTemplateBookmark";
import { postAddTemplateBookmark } from "../../../../api/WhatsappTemplate/postAddTemplateBookmark";
import fetchWhatsappTemplates from "../../../../api/Company/fetchWhatsappTemplates";
import { ChannelTabType } from "../../types/SettingTypes";
import { WhatsAppTwilioAPIConfigType } from "../../../../types/CompanyType";
import { ButtonType } from "../../../../features/Whatsapp360/API/ButtonType";
import fetchTwilioContentTemplate from "api/Company/fetchTwilioContentTemplate";
import { TemplateCategorySearchEnum } from "component/Settings/SettingTemplates/360Dialog/TemplatesFiltered/useCallbackableTemplatesSearch";
import { sendDeleteTwilioContentTemplate } from "api/Twilio/sendDeleteTwilioContentTemplate";
import { sendDeleteTwilioOldTemplate } from "api/Twilio/sendDeleteTwilioOldTemplate";
import { PermissionGuard } from "component/PermissionGuard";
import { PERMISSION_KEY } from "types/Rbac/permission";

export function SettingTemplatesTwilio(props: {
  channel: ChannelTabType;
  accountSID: string;
  whatsAppConfigs: WhatsAppTwilioAPIConfigType[] | undefined;
  backUrl: string;
}) {
  const { accountSID, backUrl, channel, whatsAppConfigs } = props;

  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();
  const history = useHistory();
  const flash = useFlashMessageChannel();
  const featureGuard = useFeaturesGuard();
  const searchParams = new URLSearchParams();
  const tabId = channel.wabaId as string;
  searchParams.set("id", tabId);
  const [selectedLang, setSelectedLang] = useState("");
  const [selectedType, setSelectedType] = useState<ButtonType>();
  const [selectedTemplateName, setSelectedTemplateName] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<TemplateCategorySearchEnum>("");
  const [savePending, setSavePending] = useState(false);
  const [bookmarksPending, setBookmarksPending] = useState<string[]>([]);

  const [state, dispatch] = useReducer(
    getWhatsappTemplateFormReducer<WhatsappTemplateNormalizedType>(),
    defaultState<WhatsappTemplateNormalizedType>()
  );

  useEffect(() => {
    dispatch({
      type: "TEMPLATES_LOAD_START",
    });
  }, []);

  useEffect(() => {
    if (
      state.itemsLoading &&
      whatsAppConfigs &&
      channel &&
      !channel?.is360Dialog
    ) {
      if (whatsAppConfigs.length > 0 && accountSID) {
        refreshWhatsappTemplateList(0, 255);
      } else {
        dispatch({
          type: "TEMPLATES_LOAD_COMPLETE",
          data: [],
        });
      }
    }
  }, [state.itemsLoading, whatsAppConfigs, channel]);

  const toggleBookmark = async (sid: string) => {
    const templateToUpdate = state.items.find(
      (i) => i.sid === sid
    ) as Mutable<WhatsappTemplateNormalizedType>;
    if (!templateToUpdate) {
      return;
    }
    try {
      setBookmarksPending((list) => uniq([...list, sid]));
      if (templateToUpdate.isBookmarked) {
        await postRemoveTemplateBookmark(accountSID, sid);
        dispatch({
          type: "TEMPLATE_UPDATED",
          template: { ...templateToUpdate, isBookmarked: false },
          templateId: sid,
        });
        flash(t("flash.template.bookmark.removed"));
      } else {
        await postAddTemplateBookmark(accountSID, sid);
        dispatch({
          type: "TEMPLATE_UPDATED",
          template: { ...templateToUpdate, isBookmarked: true },
          templateId: sid,
        });
        flash(t("flash.template.bookmark.success"));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBookmarksPending((list) => uniq(list.filter((l) => l !== sid)));
    }
  };

  function clearFilter() {
    setSelectedType(undefined);
    setSelectedLang("");
    setSelectedTemplateName("");
    setSelectedCategory("");
  }

  function createWhatsappTemplate() {
    history.push({
      pathname: routeTo("/settings/templates/create"),
      search: searchParams.toString(),
    });
  }

  function requestDelete() {
    dispatch({ type: "DELETE_INTENDED" });
  }

  function cancelDelete() {
    dispatch({ type: "DELETE_CANCELED" });
  }

  async function setQuickReply() {
    try {
      setSavePending(true);
      const selectedTemplates = state.items.filter((template) =>
        state.checkableItems.includes(template.sid)
      );
      const formattedQuickReplyRequest: QuickReplyRequestType[] =
        selectedTemplates
          .map((template) => {
            const quickReplies: QuickReplyRequestType[] =
              template.whatsapp_template
                .filter((t) => t.status === "approved")
                .map((t) => {
                  return {
                    companyQuickReplyLinguals: [
                      {
                        language: "en",
                        value: t.content,
                        params: [],
                      },
                    ],
                    value: `template_${template.template_name}_${t.language}`,
                  };
                });
            return [...quickReplies];
          })
          .flat(1);
      await post(POST_CREATE_QUICK_REPLY, {
        param: formattedQuickReplyRequest,
      });
      flash(t("flash.template.save.quickReply.success"));
    } catch (e) {
      console.error(`template save`, e);
      flash(t("flash.template.save.quickReply.failed"));
    } finally {
      setSavePending(false);
    }
  }

  async function deleteTemplates() {
    try {
      dispatch({ type: "DELETE_STARTED" });
      setSavePending(true);
      const requests = state.checkableItems.map((id) => {
        const template = state.items.find((i) => i.sid === id);
        if (!template) {
          return Promise.resolve(undefined);
        }
        if (template.isContent) {
          return sendDeleteTwilioContentTemplate(id, accountSID);
        } else {
          return sendDeleteTwilioOldTemplate(id, accountSID);
        }
      });
      await Promise.all(requests);
      dispatch({ type: "DELETE_COMPLETED", ids: [...state.checkableItems] });
      flash(
        t("flash.template.delete.success", {
          count: state.checkableItems.length,
        })
      );
      await refreshWhatsappTemplateList(0, state.items.length);
    } catch (e) {
      console.error(`template delete`, e);
      flash(t("flash.common.unknownErrorTryLater"));
    } finally {
      setSavePending(false);
    }
  }

  const templatesApprovedChecked = state.items
    .filter((t) => state.checkableItems.includes(t.sid))
    .filter((t) => t.approvedCount > 0);

  async function refreshWhatsappTemplateList(page: number, limit: number) {
    try {
      const twilioTplPromise = fetchWhatsappTemplates(page, limit, accountSID);
      const twilioContentTplPromise = fetchTwilioContentTemplate(
        page,
        limit,
        accountSID
      );
      const [twilioTemplates, twilioContentTemplates] = await Promise.all([
        twilioTplPromise,
        twilioContentTplPromise,
      ]);
      dispatch({
        type: "TEMPLATES_LOAD_COMPLETE",
        data: [
          ...(denormalizeWhatsappContentTemplateResponse(
            twilioContentTemplates
          ) ?? []),
          ...denormalizeWhatsappTemplateResponse(twilioTemplates),
        ],
      });
    } catch (error) {
      dispatch({
        type: "TEMPLATES_LOAD_ERROR",
        error: error,
      });
      console.error(`TEMPLATES_LOAD_ERROR ${error}`);
    }
  }

  return (
    <>
      <div className={styles.filterWrap}>
        <div className={styles.filterSection}>
          <TemplatesFilter
            languages={uniq(state.items.map((i) => i.languages).flat(2))}
            searchLanguage={selectedLang}
            searchButtonType={selectedType}
            onTemplateChange={setSelectedTemplateName}
            onButtonTypeChange={setSelectedType}
            onLanguageChanged={setSelectedLang}
            onReset={clearFilter}
            searchCategory={selectedCategory}
            onCategoryChanged={setSelectedCategory}
            noGap
          />
        </div>
        <div className={styles.actions}>
          {state.checkableItems.length === 0 && (
            <PermissionGuard keys={PERMISSION_KEY.channelTemplateCreate}>
              <Button
                primary
                onClick={createWhatsappTemplate}
                customSize={"mid"}
              >
                {t("settings.templates.button.createTemplate")}
              </Button>
            </PermissionGuard>
          )}
          {state.checkableItems.length > 0 && (
            <>
              <Button
                loading={savePending}
                onClick={savePending ? undefined : requestDelete}
                customSize={"mid"}
                content={t("form.button.delete")}
                className={"right-button"}
              />
              <Button
                primary
                loading={savePending}
                onClick={savePending ? undefined : setQuickReply}
                disabled={
                  templatesApprovedChecked.length !==
                  state.checkableItems.length
                }
                content={t("settings.templates.saveQuickReply")}
                customSize={"mid"}
              />
            </>
          )}
        </div>
      </div>

      {featureGuard.canSeeTemplates() && (
        <section
          className={`${
            backUrl ? styles.withNavTop : ""
          } hide-scrollable-table`}
        >
          <div className="stick-wrap">
            {state.itemsLoading ? (
              <Table basic={"very"} sortable className={"app data-grid"}>
                <GridDummy
                  loading={true}
                  columnsNumber={8}
                  hasCheckbox={false}
                  rowSteps={5}
                  renderHeader={() => (
                    <TableHeader deletable bookmarkedCount={0} />
                  )}
                />
              </Table>
            ) : (
              <>
                <TemplateTable
                  tabId={tabId}
                  dispatch={dispatch}
                  checkableItems={state.checkableItems}
                  toggleBookmark={toggleBookmark}
                  bookmarksPending={bookmarksPending}
                  templates={state.items.filter(
                    matchesTemplateFilters(
                      selectedTemplateName,
                      selectedLang,
                      selectedType as ButtonType,
                      selectedCategory
                    )
                  )}
                />
              </>
            )}
          </div>
        </section>
      )}

      <ModalConfirm
        opened={state.deletePrompt}
        onConfirm={deleteTemplates}
        onCancel={cancelDelete}
        title={t("settings.modal.deleteTemplatesPrompt.title", {
          count: state.checkableItems.length,
        })}
        confirmText={t("settings.modal.deleteTemplatesPrompt.confirm")}
        cancelText={t("settings.modal.deleteTemplatesPrompt.cancel")}
        className={"no-icon"}
      >
        <Trans
          i18nKey={"settings.modal.deleteTemplatesPrompt.body"}
          count={state.checkableItems.length}
        >
          <p className={"tight"}>
            Are you sure you want to delete N registered templates?
          </p>
          <p className={"tight"}>
            <strong>This cannot be undone.</strong>
          </p>
        </Trans>
      </ModalConfirm>
    </>
  );
}
