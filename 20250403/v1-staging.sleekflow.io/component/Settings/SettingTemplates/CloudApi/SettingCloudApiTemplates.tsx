import React, { useEffect, useReducer, useState } from "react";
import twilioStyles from "../Twilio/SettingTemplatesTwilio.module.css";
import { TemplatesFilter } from "features/Whatsapp360/components/TemplatesFilter/TemplatesFilter";
import { uniq } from "ramda";
import { ButtonType } from "features/Whatsapp360/API/ButtonType";
import {
  defaultState,
  getWhatsappTemplateFormReducer,
} from "container/Settings/OfficialWhatsApp/whatsappTemplateReducer";
import { Button } from "component/shared/Button/Button";
import { useHistory } from "react-router";
import useRouteConfig from "config/useRouteConfig";
import { Trans, useTranslation } from "react-i18next";
import { fetchTemplates } from "api/CloudAPI/fetchTemplates";
import { submitDeleteTemplate } from "api/CloudAPI/submitDeleteTemplate";
import { WhatsappCloudAPITemplateType } from "features/WhatsappCloudAPI/models/WhatsappCloudAPITemplateType";
import { useFeaturesGuard } from "../../hooks/useFeaturesGuard";
import GridDummy from "component/shared/Placeholder/GridDummy";
import { Table } from "semantic-ui-react";
import TableHeader from "./TableHeader";
import TemplateTable from "./TemplateTable";
import { matchesTemplateFilters } from "../../../Broadcast/TemplateSelection/matchesTemplateFilters";
import ModalConfirm from "component/shared/ModalConfirm";
import { useFlashMessageChannel } from "../../../BannerMessage/flashBannerMessage";
import { Mutable } from "@storybook/addon-knobs/dist/type-defs";
import { postWithExceptions } from "api/apiRequest";
import { deleteMethodWithExceptions } from "api/apiRequest";
import { TemplateCategorySearchEnum } from "component/Settings/SettingTemplates/360Dialog/TemplatesFiltered/useCallbackableTemplatesSearch";
import { PermissionGuard } from "component/PermissionGuard";
import { PERMISSION_KEY } from "types/Rbac/permission";

export default function SettingTemplates(props: { wabaId: string }) {
  const { wabaId } = props;
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const { t } = useTranslation();
  const [selectedLang, setSelectedLang] = useState("");
  const [selectedType, setSelectedType] = useState<ButtonType>();
  const [selectedTemplateName, setSelectedTemplateName] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<TemplateCategorySearchEnum>("");
  const featureGuard = useFeaturesGuard();
  const [savePending, setSavePending] = useState(false);
  const [bookmarksPending, setBookmarksPending] = useState<string[]>([]);

  const flash = useFlashMessageChannel();
  const searchParams = new URLSearchParams();
  searchParams.set("id", wabaId);

  const [state, dispatch] = useReducer(
    getWhatsappTemplateFormReducer<WhatsappCloudAPITemplateType>(),
    defaultState<WhatsappCloudAPITemplateType>()
  );
  console.log("state: ", state);

  function clearFilter() {
    setSelectedType(undefined);
    setSelectedLang("");
    setSelectedTemplateName("");
  }

  function createWhatsappTemplate() {
    history.push({
      pathname: routeTo("/settings/templates/create"),
      search: searchParams.toString(),
    });
  }

  function fetchWhatsappTemplateList() {
    if (wabaId) {
      return fetchTemplates(wabaId, true)
        .then((res) => {
          //TODO: add rejectReason key
          console.log("res: ", res);
          dispatch({
            type: "TEMPLATES_LOAD_COMPLETE",
            data: res.whatsappTemplates,
          });
        })
        .catch((error) => {
          dispatch({
            type: "TEMPLATES_LOAD_ERROR",
            error: error,
          });
          console.error(`TEMPLATES_LOAD_ERROR ${error}`);
        });
    }
  }

  async function handleDeleteTemplates() {
    try {
      if (!wabaId) {
        return;
      }
      dispatch({ type: "DELETE_STARTED" });
      setSavePending(true);
      const requests = state.checkableItems.map((item) =>
        submitDeleteTemplate(wabaId, item.split("-")[1])
      );
      await Promise.all(requests);
      dispatch({ type: "DELETE_COMPLETED", ids: [...state.checkableItems] });
      flash(
        t("flash.template.delete.success", {
          count: state.checkableItems.length,
        })
      );
      fetchWhatsappTemplateList();
    } catch (e) {
      console.error(`template delete`, e);
      flash(t("flash.common.unknownErrorTryLater"));
    } finally {
      setSavePending(false);
    }
  }

  const toggleBookmark = async (sid: string) => {
    const templateToUpdate = state.items.find(
      (i) => i.id === sid
    ) as Mutable<WhatsappCloudAPITemplateType>;
    if (!templateToUpdate) {
      return;
    }
    try {
      setBookmarksPending((list) => uniq([...list, sid]));
      if (templateToUpdate.is_template_bookmarked) {
        await deleteMethodWithExceptions(
          "/company/whatsapp/cloudapi/template/bookmark",
          {
            param: {
              wabaId: wabaId,
              templateId: sid,
            },
          }
        );
        dispatch({
          type: "TEMPLATE_UPDATED",
          template: { ...templateToUpdate, is_template_bookmarked: false },
          templateId: sid,
        });
        flash(t("flash.template.bookmark.removed"));
      } else {
        await postWithExceptions(
          "/company/whatsapp/cloudapi/template/bookmark",
          {
            param: {
              wabaId: wabaId,
              templateId: sid,
              templateName: templateToUpdate.name,
              templateLanguage: templateToUpdate.language,
            },
          }
        );
        dispatch({
          type: "TEMPLATE_UPDATED",
          template: { ...templateToUpdate, is_template_bookmarked: true },
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

  useEffect(() => {
    clearFilter();
    dispatch({
      type: "TEMPLATES_LOAD_START",
    });
  }, [wabaId]);

  useEffect(() => {
    if (state.itemsLoading) {
      if (wabaId) {
        fetchWhatsappTemplateList();
      } else {
        dispatch({
          type: "TEMPLATES_LOAD_COMPLETE",
          data: [],
        });
      }
    }
  }, [state.itemsLoading, wabaId]);

  return (
    <>
      <div className={twilioStyles.filterWrap}>
        <div className={twilioStyles.filterSection}>
          <TemplatesFilter
            languages={uniq(state.items.map((i) => i.language))}
            searchLanguage={selectedLang}
            searchButtonType={selectedType}
            searchCategory={selectedCategory}
            onTemplateChange={setSelectedTemplateName}
            onButtonTypeChange={setSelectedType}
            onLanguageChanged={setSelectedLang}
            onCategoryChanged={setSelectedCategory}
            onReset={clearFilter}
            noGap
          />
        </div>
        <div className={twilioStyles.actions}>
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
                onClick={() => dispatch({ type: "DELETE_INTENDED" })}
                customSize={"mid"}
                content={t("form.button.delete")}
                className="right-button"
              />
            </>
          )}
        </div>
      </div>
      {featureGuard.canSeeTemplates() && (
        <section className="hide-scrollable-table">
          <div className="stick-wrap">
            {state.itemsLoading ? (
              <Table basic={"very"} sortable className={"app data-grid"}>
                <GridDummy
                  loading={true}
                  columnsNumber={7}
                  hasCheckbox={false}
                  rowSteps={5}
                  renderHeader={() => <TableHeader />}
                />
              </Table>
            ) : (
              <>
                <TemplateTable
                  tabId={wabaId}
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
        onConfirm={handleDeleteTemplates}
        onCancel={() => dispatch({ type: "DELETE_CANCELED" })}
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
