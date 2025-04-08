import { Button } from "semantic-ui-react";
import React, { ChangeEvent } from "react";
import { DropzoneInputProps } from "react-dropzone";
import { InfoTooltip } from "../../shared/popup/InfoTooltip";
import { useTranslation } from "react-i18next";

export function AttachButton(props: {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  getFileInputProps: () => DropzoneInputProps;
}) {
  const { t } = useTranslation();
  return (
    <>
      <InfoTooltip
        placement={"top"}
        children={t("chat.actions.attach.add")}
        offset={[70, 10]}
        trigger={
          <Button className={"attach-button"}>
            <Button.Content as="a">
              <label htmlFor="fileupload">
                <i className={"ui icon attachment-trigger"} />
                <input
                  className="fileupload"
                  id="fileupload"
                  type="file"
                  multiple={true}
                  onChange={props.onChange}
                  {...props.getFileInputProps()}
                  value=""
                />
              </label>
            </Button.Content>
          </Button>
        }
      />
    </>
  );
}
