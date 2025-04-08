import React, { useEffect, useMemo } from "react";
import { TemplatesFilter } from "../../../../../features/Whatsapp360/components/TemplatesFilter/TemplatesFilter";
import { ButtonType } from "../../../../../features/Whatsapp360/API/ButtonType";
import { useWhatsapp360CallbackableTemplatesPaginated } from "../../../../../features/Whatsapp360/components/TemplatesGrid/useWhatsapp360CallbackableTemplatesPaginated";
import { TemplatesGrid } from "../../../../../features/Whatsapp360/components/TemplatesGrid/TemplatesGrid";
import { useTranslation } from "react-i18next";
import { Pagination, PaginationProps } from "semantic-ui-react";
import styles from "./TemplatesFiltered.module.css";
import { Icon } from "../../../../shared/Icon/Icon";
import { useFlashMessageChannel } from "../../../../BannerMessage/flashBannerMessage";
import { EditCallbackModal } from "../EditCallbackModal/EditCallbackModal";
import ModalConfirm from "../../../../shared/ModalConfirm";
import {
  useCallbackableTemplatesSearch,
  TemplateCategorySearchEnum,
} from "./useCallbackableTemplatesSearch";
import { matchesOptInFilters } from "../../../../../features/Whatsapp360/components/TemplatesGrid/matchesOptInFilters";
import { useCallbackableTemplatesEdit } from "./useCallbackableTemplatesEdit";
import { useCallbackableTemplatesRemove } from "./useCallbackableTemplatesRemove";
import { useContextActions } from "./useContextActions";
import { TemplatesGridDummy } from "../../../../../features/Whatsapp360/components/TemplatesGrid/TemplatesGridDummy";
import { useFeaturesGuard } from "component/Settings/hooks/useFeaturesGuard";
import { usePermission } from "component/shared/usePermission";
import { PERMISSION_KEY } from "types/Rbac/permission";

export type FilterType = {
  templateSearch?: string;
  buttonType?: ButtonType;
  language?: string;
  category?: TemplateCategorySearchEnum;
};

const PAGE_SIZE = 12;

export function TemplatesFiltered(props: { channelId: number }) {
  const { t } = useTranslation();
  const flash = useFlashMessageChannel();
  const featuresGuard = useFeaturesGuard();
  const { check } = usePermission();
  const [canEditTemplates] = useMemo(
    () => check([PERMISSION_KEY.channelTemplateEdit]),
    [check]
  );

  const templatesApi = useWhatsapp360CallbackableTemplatesPaginated<FilterType>(
    {
      pageSize: PAGE_SIZE,
      channelId: props.channelId,
      initFilter: {
        buttonType: undefined,
        language: undefined,
        templateSearch: "",
        category: undefined,
      },
      getTemplateFilter: (filter) => (t) =>
        matchesOptInFilters(
          filter.templateSearch ?? "",
          t.template,
          filter.language,
          filter.buttonType,
          filter.category
        ),
    }
  );

  const search = useCallbackableTemplatesSearch({
    loadPage: templatesApi.loadPage,
    channelId: props.channelId,
  });

  const editApi = useCallbackableTemplatesEdit({
    data: templatesApi.page.data,
    onCallbackAdded: (result) => {
      templatesApi.updateCallbacks(result);
      flash(t("flash.settings.changesSaved"));
    },
  });

  const removeApi = useCallbackableTemplatesRemove({
    data: templatesApi.page.data,
    onCallbackRemoved: (id, language) => {
      flash(
        t("flash.settings.whatsapp.templateRemoved", {
          template: id,
        })
      );
      templatesApi.deleteCallbacks(id, language);
    },
  });

  const contextActions = useContextActions({
    data: templatesApi.page.data,
    startEditing: editApi.startEditing,
    startRemoving: removeApi.startRemoving,
    editable: canEditTemplates,
  });

  useEffect(() => {
    templatesApi.loadPage(1, search.getFilter());
  }, [props.channelId]);

  const selectPage = (_: any, data: PaginationProps) => {
    templatesApi.loadPage(data.activePage as number, search.getFilter());
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.text}>
          {t("settings.templates.whatsapp360.grid.header")}
        </div>
        <div className={styles.actions}>
          <a
            onClick={() => {
              templatesApi.loadPage(
                templatesApi.page.number,
                search.getFilter()
              );
            }}
            className={`${styles.refresh} ${
              templatesApi.loading ? styles.loading : ""
            }`}
          >
            <span className={styles.icon}>
              <Icon type={"refresh"} colored />
            </span>
            {t("settings.templates.whatsapp360.grid.refresh")}
          </a>
        </div>
      </div>
      <TemplatesFilter
        searchLanguage={search.language}
        searchButtonType={search.buttonType}
        searchCategory={search.category}
        onTemplateChange={search.runSearchByTemplate}
        onButtonTypeChange={search.runSearchByButton}
        onLanguageChanged={search.runSearchByLanguage}
        onCategoryChanged={search.runSearchByCategory}
        languages={templatesApi.languages}
        buttonTypes={["CALL_TO_ACTION", "QUICK_REPLY"]}
      />

      {templatesApi.loading ? (
        <>
          <TemplatesGridDummy number={PAGE_SIZE} />
        </>
      ) : (
        <>
          <TemplatesGrid
            templates={templatesApi.page.data}
            renderContextActions={
              templatesApi.loading ? undefined : contextActions.render
            }
            bookmarkable={featuresGuard.hasWhatsappTemplateBookmarkFeature(
              "whatsapp360dialog"
            )}
          />
          {templatesApi.page.total > 1 && (
            <Pagination
              totalPages={templatesApi.page.total}
              activePage={templatesApi.page.number}
              onPageChange={selectPage}
              firstItem={false}
              lastItem={false}
            />
          )}
        </>
      )}

      {removeApi.confirmVisible && removeApi.templateToRemoveCallback && (
        <ModalConfirm
          opened
          title={t("settings.templates.whatsapp360.removeCallback")}
          confirmText={t("form.button.delete")}
          cancelText={t("form.button.cancel")}
          onConfirm={removeApi.removeCallback}
          onCancel={removeApi.cancelRemovingCallback}
        >
          {t("settings.templates.whatsapp360.confirmRemove", {
            template: removeApi.templateToRemoveCallback.id,
          })}
        </ModalConfirm>
      )}
      {editApi.callbackModalVisible && editApi.templateToUpdate && (
        <EditCallbackModal
          content={editApi.templateToUpdate}
          onClose={editApi.hideCallbackModal}
          onSend={editApi.saveCallbackAction}
        />
      )}
    </div>
  );
}
