import { TFunction } from "i18next";
import React, { useState } from "react";
import Helmet from "react-helmet";
import { useTranslation } from "react-i18next";
import { PostLogin } from "../../component/Header";
import DummyRonaldImg from "../../assets/images/dummy-profile/admin_Ronald.svg";
import DummyChristyImg from "../../assets/images/dummy-profile/staff_Christy.svg";
import DummyJackImg from "../../assets/images/dummy-profile/staff_Jack.svg";
import DummyTrishImg from "../../assets/images/dummy-profile/staff_trish.svg";
import DummySteveImg from "../../assets/images/dummy-profile/teamAdmin_steve.svg";
import DummyShirleyImg from "../../assets/images/dummy-profile/teamAdmin_shirley.svg";
import DummyZhangImg from "../../assets/images/dummy-profile/teamAdmin_Zhang.svg";
import DummyWhatsappImg from "../../assets/images/dummy-channel/whatsapp.svg";
import DummyFacebookImg from "../../assets/images/dummy-channel/facebook.svg";
import DummyWeChatImg from "../../assets/images/dummy-channel/wechat.svg";
import DummyLiveChatImg from "../../assets/images/dummy-channel/livechat.svg";
import DummyLineImg from "../../assets/images/dummy-channel/line.svg";
import DummySMSImg from "../../assets/images/dummy-channel/sms.svg";
import { Image } from "semantic-ui-react";
import { useHistory, useLocation } from "react-router";

interface ChannelNameType {
  channelName: string;
  name: string;
  icon: string;
  className?: string;
}

interface StaffDisplayInfoType {
  role: string;
  pic: string;
  name: string;
  className?: string;
}

function dummyLessThan50Staff(t: TFunction) {
  return [
    {
      role: t("system.user.role.admin.name"),
      pic: DummyRonaldImg,
      name: "Ronald",
      className: "whatsapp-line-start",
    },
    {
      role: t("system.user.role.teamAdmin.name"),
      pic: DummySteveImg,
      name: "Steve",
      className: "livechat-line-start",
    },
    {
      role: t("system.user.role.staff.name"),
      pic: DummyTrishImg,
      name: "Trish",
      className: "facebook-line-start",
    },
  ];
}

function dummyStaff(t: TFunction) {
  return [
    {
      role: t("system.user.role.teamAdmin.name"),
      pic: DummyZhangImg,
      name: "Zhang",
    },
    {
      role: t("system.user.role.teamAdmin.name"),
      pic: DummyShirleyImg,
      name: "Shirley",
    },
    {
      role: t("system.user.role.staff.name"),
      pic: DummyJackImg,
      name: "Jack",
    },
    {
      role: t("system.user.role.staff.name"),
      pic: DummyChristyImg,
      name: "Christy",
    },
    {
      role: t("system.user.role.admin.name"),
      pic: DummyRonaldImg,
      name: "Ronald",
    },
    {
      role: t("system.user.role.teamAdmin.name"),
      pic: DummySteveImg,
      name: "Steve",
    },
    {
      role: t("system.user.role.staff.name"),
      pic: DummyTrishImg,
      name: "Trish",
    },
  ];
}

const dummyChannels = [
  {
    channelName: "Operations",
    name: "+1 (888) 724-1828",
    icon: DummyWhatsappImg,
  },
  {
    channelName: "Customer Support",
    name: "WeChat Official",
    icon: DummyWeChatImg,
  },
  {
    channelName: "Team C",
    name: "Line Business",
    icon: DummyLineImg,
  },
  {
    channelName: "Brand A",
    name: "+852 64522442",
    icon: DummyWhatsappImg,
  },
  {
    channelName: "Shop B",
    name: "Facebook Messenger",
    icon: DummyFacebookImg,
  },
  {
    channelName: "SMS",
    name: "+1 (888) 724-1828",
    icon: DummySMSImg,
  },
  {
    channelName: "Brand B",
    name: "+60 1140888121",
    icon: DummyWhatsappImg,
  },
  {
    channelName: "Website",
    name: "Omnichannel Widget",
    icon: DummyLiveChatImg,
  },
  {
    channelName: "Sales Team",
    name: "Facebook Messenger",
    icon: DummyFacebookImg,
  },
];

function dummyStaffChannelInfoList(t: Function) {
  return [
    {
      staffList: [
        {
          role: t("system.user.role.teamAdmin.name"),
          pic: DummyZhangImg,
          name: "Zhang",
        },
        {
          role: t("system.user.role.staff.name"),
          pic: DummyJackImg,
          name: "Jack",
        },
      ],
      channels: [
        {
          channelName: "Operations",
          name: "+1 (888) 724-1828",
          icon: DummyWhatsappImg,
        },
        {
          channelName: "Brand A",
          name: "+852 64522442",
          icon: DummyWhatsappImg,
        },
        {
          channelName: "Brand B",
          name: "+60 1140888121",
          icon: DummyWhatsappImg,
        },
      ],
    },
    {
      staffList: [
        {
          role: t("system.user.role.teamAdmin.name"),
          pic: DummyShirleyImg,
          name: "Shirley",
        },
        {
          role: t("system.user.role.staff.name"),
          pic: DummyChristyImg,
          name: "Christy",
        },
      ],
      channels: [
        {
          channelName: "Customer Support",
          name: "WeChat Official",
          icon: DummyWeChatImg,
        },
        {
          channelName: "Shop B",
          name: "Facebook Messenger",
          icon: DummyFacebookImg,
        },
        {
          channelName: "Website",
          name: "LiveChat",
          icon: DummyLiveChatImg,
        },
      ],
    },
    {
      staffList: [
        {
          role: t("system.user.role.teamAdmin.name"),
          pic: DummySteveImg,
          name: "Steve",
        },
        {
          role: t("system.user.role.staff.name"),
          pic: DummyTrishImg,
          name: "Trish",
        },
      ],
      channels: [
        {
          channelName: "Team C",
          name: "Line Business",
          icon: DummyLineImg,
        },
        {
          channelName: "SMS",
          name: "+1 (888) 724-1828",
          icon: DummySMSImg,
        },
        {
          channelName: "Sales Team",
          name: "Facebook Messenger",
          icon: DummyFacebookImg,
        },
      ],
    },
  ];
}

const dummyChannelsForLessThan50 = [
  {
    channelName: "Support Team",
    name: "+60 1140888121",
    icon: DummyWhatsappImg,
    className: "whatsapp-line-end",
  },
  {
    channelName: "Website",
    name: "LiveChat",
    icon: DummyLiveChatImg,
    className: "livechat-line-end",
  },
  {
    channelName: "Sales Team",
    name: "Facebook Messenger",
    icon: DummyFacebookImg,
    className: "facebook-line-end",
  },
];

function OnboardingContainer() {
  const { t } = useTranslation();
  const pageTitle = t("onboarding.pageTitle");
  const [step, setStep] = useState(1);
  const history = useHistory();
  const location = useLocation<{ size: number }>();
  const channels =
    location.state?.size > 50 ? dummyChannels : dummyChannelsForLessThan50;
  const staffList =
    location.state?.size > 50 ? dummyStaff(t) : dummyLessThan50Staff(t);
  const onboardingHeader = {
    one: {
      header: t("onboarding.guide.one.header"),
      subHeader: t("onboarding.guide.one.subHeader"),
    },
    two: {
      header: t("onboarding.guide.two.header"),
      subHeader: t("onboarding.guide.two.subHeader"),
    },
    three: {
      header: t("onboarding.guide.three.header"),
      subHeader: t("onboarding.guide.three.subHeader"),
    },
  };

  function goNext() {
    setStep(step + 1);
  }

  function goGetStarted() {
    history.push("/guide/get-started");
  }

  const stepMapping = {
    1: "one",
    2: "two",
    3: "three",
  };

  function contentRedirect() {
    switch (step) {
      case 1:
        return <ChannelListContainer channelNameList={channels} />;
      case 2:
        return (
          <Intro2Container staffList={staffList} channelNameList={channels} />
        );
      case 3:
        return location.state?.size > 50 ? (
          <Intro3ContainerLargerThan50 />
        ) : (
          <Intro3Container
            staffList={staffList}
            channelNameList={channels}
            extraClassName="channel-list-small"
          />
        );
    }
  }

  return (
    <div className="post-login onboarding-container">
      <Helmet title={t("nav.common.title", { page: pageTitle })} />
      <PostLogin selectedItem={""} />
      <div className="content main onborading-guide">
        <div className="_step">{step}</div>
        <div className="_container">
          <div className="header">
            <div className="header">
              {onboardingHeader[stepMapping[step]].header}
            </div>
            <div className="subHeader">
              {onboardingHeader[stepMapping[step]].subHeader}
            </div>
          </div>
          <div className="content">{contentRedirect()}</div>
          <div className="action">
            {step === 3 ? (
              <div className="ui button primary" onClick={goGetStarted}>
                {t("form.button.getStarted")}
              </div>
            ) : (
              <div className="ui button primary" onClick={goNext}>
                {t("form.button.next")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Intro3ContainerLargerThan50() {
  const { t } = useTranslation();
  const admin = dummyStaff(t).filter((staff) => staff.name === "Ronald");
  return (
    <div className="intro2_content">
      <StaffListDisplay staffList={admin} />
      <div className="direction-line larger">
        <div className="left"></div>
        <div className="center"></div>
        <div className="right"></div>
      </div>
      <StaffChannelInfo t={t} />
    </div>
  );
}

function StaffChannelInfo(props: { t: TFunction }) {
  const staffChannelInfoList = dummyStaffChannelInfoList(props.t);
  return (
    <div className="staff-info-list">
      {staffChannelInfoList.map((staffChannelInfo) => (
        <div className="staff-info-container">
          <StaffListDisplay staffList={staffChannelInfo.staffList} />
          <ChannelListContainer channelNameList={staffChannelInfo.channels} />
        </div>
      ))}
    </div>
  );
}

function Intro3Container(props: {
  staffList: StaffDisplayInfoType[];
  channelNameList: ChannelNameType[];
  extraClassName?: string;
}) {
  const { staffList, channelNameList, extraClassName } = props;
  return (
    <div className="intro2_content">
      <StaffListDisplay staffList={staffList} />
      <div className="direction-line">
        <div className="left"></div>
        <div className="center"></div>
        <div className="right"></div>
      </div>
      <ChannelListContainer
        channelNameList={channelNameList}
        extraClassName={extraClassName || ""}
      />
    </div>
  );
}

function Intro2Container(props: {
  staffList: StaffDisplayInfoType[];
  channelNameList: ChannelNameType[];
}) {
  const { staffList, channelNameList } = props;
  return (
    <div className="intro2_content">
      <StaffListDisplay staffList={staffList} />
      <ChannelListContainer channelNameList={channelNameList} />
    </div>
  );
}

function StaffListDisplay(props: { staffList: StaffDisplayInfoType[] }) {
  return (
    <div className="display-staff animate__animated animate__fast animate__fadeInDown">
      <div className="staff-list">
        {props.staffList.map((staff) => (
          <div className={`staff-info ${staff.className || ""}`}>
            <div className="image">
              <Image src={staff.pic} />
            </div>
            <div className="name">{staff.name}</div>
            <div className="role">{staff.role}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChannelListContainer(props: {
  channelNameList: ChannelNameType[];
  extraClassName?: string;
}) {
  const { extraClassName } = props;
  return (
    <div
      className={`channel-list ${
        extraClassName ? extraClassName : ""
      } animate__animated animate__fast animate__fadeInDown`}
    >
      {props.channelNameList.map((channel) => (
        <div className={`channel ${channel.className || ""}`}>
          <div className="image">
            <Image src={channel.icon} />
          </div>
          <div className="info">
            <div className="channel-name">{channel.channelName}</div>
            <div className="channel-icon">{channel.name}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default OnboardingContainer;
