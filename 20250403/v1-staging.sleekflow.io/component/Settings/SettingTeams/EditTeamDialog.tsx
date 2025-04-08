import React, { useState } from "react";
import { TeamType } from "../../../types/TeamType";
import { ModalForm } from "../../shared/ModalForm";
import { Form, Input } from "semantic-ui-react";
import { useFormik } from "formik";
import { object, string } from "yup";
import { showError } from "../../../container/Settings/SettingQuickReplies";
import { postWithExceptions } from "../../../api/apiRequest";
import { POST_TEAM_UPDATE } from "../../../api/apiPath";
import { useTranslation } from "react-i18next";
import { ChannelsValueDropdown } from "../../shared/ChannelsValueDropdown";
import { TargetedChannelType } from "../../../types/BroadcastCampaignType";

export async function sendUpdateTeam(id: number, values: EditTeamFormType) {
  const result = await postWithExceptions(
    POST_TEAM_UPDATE.replace("{id}", String(id)),
    {
      param: {
        TeamName: values.name,
        DefaultChannels: values.defaultChannels,
      },
    }
  );
  return result;
}

export type EditTeamFormType = {
  name: string;
  defaultChannels: TargetedChannelType[];
};

export function EditTeamDialog(props: {
  title: string;
  subTitle: string;
  team: TeamType;
  onSave: (value: EditTeamFormType) => void;
  onCancel: () => void;
}) {
  const { team, onSave, onCancel, title, subTitle } = props;
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const form = useFormik<EditTeamFormType>({
    initialValues: {
      name: team.name,
      defaultChannels: team.defaultChannels,
    },
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: object({
      name: string()
        .trim()
        .required(t("settings.teams.modal.edit.field.name.error.required")),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      await onSave(values);
      setLoading(false);
    },
  });

  return (
    <ModalForm
      opened={true}
      onCancel={() => {
        form.resetForm();
        onCancel();
      }}
      isLoading={loading}
      onConfirm={form.submitForm}
      title={title}
      subTitle={subTitle}
      confirmText={t("form.button.save")}
      cancelText={t("form.button.cancel")}
    >
      <Form>
        <Form.Input
          label={t("settings.teams.modal.edit.field.name.label")}
          error={showError(form.errors.name)}
        >
          <Input
            type={"text"}
            fluid
            value={form.values.name}
            onChange={(event, data) => {
              form.setFieldValue("name", data.value);
            }}
          />
        </Form.Input>
        <Form.Input
          label={t("settings.teams.modal.edit.field.defaultChannels.label")}
          error={showError(form?.errors?.defaultChannels as string)}
        >
          <div className={"input-contents"}>
            <div className="sub-header">
              {t("settings.teams.modal.edit.field.defaultChannels.subheader")}
            </div>
            <ChannelsValueDropdown
              fluid
              excludeAll={true}
              placeholder={t(
                "settings.teams.modal.edit.field.defaultChannels.placeholder"
              )}
              enabledChannels={[
                "whatsapp",
                "twilio_whatsapp",
                "facebook",
                "whatsapp360dialog",
                "whatsappcloudapi",
                "instagram",
              ]}
              multiple={true}
              value={form.values.defaultChannels}
              onChange={(data) => {
                form.setFieldValue("defaultChannels", data);
              }}
            />
          </div>
        </Form.Input>
      </Form>
    </ModalForm>
  );
}
