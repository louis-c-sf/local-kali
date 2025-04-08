import { Dropdown, DropdownProps } from "semantic-ui-react";
import React from "react";
import FacebookPageType from "../../../types/FacebookPageType";
import { useTranslation } from "react-i18next";

export interface FacebookFormInputType {
  pageTokens: FacebookPageInfoType[];
  businessIntegrationSystemUserAccessToken: string;
}

interface FacebookPageInfoType {
  id: string;
  access_token: string;
  page_name: string;
}

type FacebookFormProps = {
  facebookPageList: any;
  onChange: (e: React.SyntheticEvent, data: DropdownProps) => void;
  formInput: FacebookFormInputType;
};
export default FacebookForm;

function FacebookForm(props: FacebookFormProps) {
  const { onChange, facebookPageList, formInput } = props;
  const { t } = useTranslation();
  return (
    <div className={"channel-setup channel-setup-facebook"}>
      <label>{t("channels.form.facebook.field.page.label")}</label>
      <div className="ui input formInput">
        <Dropdown
          className="fb-selection"
          options={facebookPageList}
          value={formInput.pageTokens.map((page) => page.access_token)}
          defaultValue={facebookPageList.map(
            (fb: FacebookPageType) => fb.access_token
          )}
          multiple
          selection
          scrolling
          fluid
          onChange={onChange}
          upward={false}
        />
      </div>
    </div>
  );
}
