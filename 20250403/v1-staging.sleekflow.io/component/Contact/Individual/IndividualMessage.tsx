import React, { useEffect, useState } from "react";
import { Button, Form, Menu } from "semantic-ui-react";
import Textarea from "react-textarea-autosize";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../AppRootContext";
import { postActivityLogs } from "api/Contacts/postActivityLogs";

export default () => {
  const profile = useAppSelector((s) => s.profile);
  const [textVal, setTextVal] = useState("");
  const [profileId, setProfileId] = useState("");

  useEffect(() => {
    if (profile?.id) {
      setProfileId(profile.id);
    }
  }, [profile?.id]);

  const { t } = useTranslation();

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target;
    setTextVal((value as string) || "");
  };
  const submitRemark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    submitData();
  };

  const submitData = async () => {
    if (textVal) {
      await postActivityLogs({
        sleekflow_user_profile_id: profileId,
        audit_log_text: textVal,
      });
      setTextVal("");
    }
  };

  const keydown = async (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.keyCode === 13 && !e.shiftKey) {
      submitData();
    }
  };
  return (
    <div className="send-message">
      <Form>
        <Menu pointing secondary>
          <Menu.Item active>
            {t("profile.individual.activities.field.log.label")}
          </Menu.Item>
        </Menu>
        <div className="text-box-wrap">
          <Textarea
            onKeyDown={keydown}
            maxRows={6}
            minRows={1}
            value={textVal}
            placeholder={t(
              "profile.individual.activities.field.log.placeholder"
            )}
            onChange={onChange}
          />
          <Button
            type="submit"
            className="submit primary"
            onClick={submitRemark}
          >
            {t("profile.individual.actions.log")}
          </Button>
        </div>
      </Form>
    </div>
  );
};
