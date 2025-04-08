import React, { useContext } from "react";
import { Menu } from "semantic-ui-react";
import styles from "./BlastCampaignDetail.module.css";
import { BackNavLink } from "../../shared/nav/BackNavLink";
import { GeneralSettingView } from "../shared/GeneralSettingView";
import { UploadContacts } from "./UploadContacts";
import { FieldError } from "../../shared/form/FieldError";
import useRouteConfig from "../../../config/useRouteConfig";
import { useTranslation } from "react-i18next";
import {
  BlastCampaignFormikType,
  VARIABLES_VALUE_PATH,
} from "./useBlastCampaignForm";
import { BlastCampaignContext } from "./blastCampaignReducer";
import { getFormSingleErrors } from "./getFormSingleErrors";
import { TargetedChannelType } from "../../../types/BroadcastCampaignType";
import { useBroadcastLocales } from "../localizable/useBroadcastLocales";
import { useBlastCampaignPolicies } from "../../../api/Broadcast/Blast/useBlastCampaignPolicies";

export function Sidebar(props: {
  sendTestMessage: (profileIdList: string[]) => void;
  downloadResultsUrl: string | undefined;
  form: BlastCampaignFormikType;
}) {
  const { downloadResultsUrl, sendTestMessage, form } = props;

  const { routeTo } = useRouteConfig();
  const { t } = useTranslation();
  const state = useContext(BlastCampaignContext);
  const { validateFormMessage } = useBroadcastLocales();
  const guard = useBlastCampaignPolicies();

  const formErrors = getFormSingleErrors(form);

  const updateTitle = (title: string) => {
    form.setFieldValue("name", title);
  };

  const updateChannels = (channels: TargetedChannelType[]) => {
    if (channels.length === 0) {
      //todo use single input instead
      return;
    }
    form.setFieldValue("channel", channels[0]); //todo single
  };
  const sendTestMessageDisabled =
    state.testing ||
    !form.values.templateId ||
    !!formErrors[VARIABLES_VALUE_PATH];

  return (
    <>
      <Menu vertical className="sidebar">
        <div className={styles.nav}>
          <BackNavLink to={routeTo("/campaigns/blast")}>
            {t("nav.backShort")}
          </BackNavLink>
        </div>
        <GeneralSettingView
          formErrors={formErrors}
          selectedChannel={"whatsapp360dialog"}
          title={form.values.name}
          channels={[form.values.channel]}
          enabledChannels={["whatsapp360dialog"]}
          fallbackChannels={[]}
          multipleChannels={false}
          sendTestMessageDisabled={sendTestMessageDisabled}
          selectedAll={false}
          onTitleChange={updateTitle}
          setChannels={updateChannels}
          contactsInput={
            <>
              <UploadContacts
                uploadable={!guard.isCampaignFrozen(state)}
                setValue={(value) => {
                  form.setFieldValue("importFileNew", value);
                }}
                uploadedFile={form.values.importFileNew}
                errors={
                  formErrors.importFileNew
                    ? [validateFormMessage.missingFile]
                    : null
                }
                existedFile={form.values.importedFile?.blobFilePath}
                downloadContactsUrl={downloadResultsUrl}
              />
              {formErrors.templateId && (
                <FieldError text={validateFormMessage.missingContent} />
              )}
            </>
          }
          onSendTestMessage={sendTestMessage}
        />
      </Menu>
    </>
  );
}
