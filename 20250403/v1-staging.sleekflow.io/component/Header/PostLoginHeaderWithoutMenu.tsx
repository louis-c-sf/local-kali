import React, { useEffect } from "react";
import { useHistory } from "react-router";
import { Image, Menu } from "semantic-ui-react";
import UserProfileDropdown from "./UserProfileDropdown";
import SleekFlowIcon from "../../assets/images/logo-solid.svg";
import Cookie from "js-cookie";
import { LanguageDropdown } from "./LanguageDropdown";
import { useCurrentUserDetail } from "../../api/User/useCurrentUserDetail";
import { useAppSelector } from "../../AppRootContext";
import useFetchCompany from "../../api/Company/useFetchCompany";

export default function PostLoginHeaderWithoutMenu() {
  const [user, company] = useAppSelector((s) => [s.user, s.company]);
  const history = useHistory();
  const {
    refreshCurrentUserDetail,
    loggedInUserDetail,
  } = useCurrentUserDetail();
  const { refreshCompany } = useFetchCompany();

  const loadHomePage = () => {
    Cookie.set("skipChannels", "true");
    history.push({
      pathname: `/inbox/${user.id}`,
      search: `selectedStatus=open&selectedChannel=all`,
    });
  };

  useEffect(() => {
    if (!loggedInUserDetail && user?.id) {
      refreshCurrentUserDetail();
    }
  }, [Boolean(loggedInUserDetail), user?.id]);

  useEffect(() => {
    if (!company) {
      refreshCompany();
    }
  }, [company]);
  if (user?.id === "" || !user) {
    history.push("/");
  }
  return (
    <div className="postlogin-container">
      <Menu className="postlogin">
        <Menu.Item header className="logo">
          <Image src={SleekFlowIcon} onClick={loadHomePage} />
        </Menu.Item>
        <Menu.Menu position="right" className="profile">
          <Menu.Item className="info">
            <div className="info-section">
              <LanguageDropdown popupPosition={"bottom left"} />
            </div>
            <div className="info-section">
              <UserProfileDropdown fullName />
            </div>
          </Menu.Item>
        </Menu.Menu>
      </Menu>
    </div>
  );
}
