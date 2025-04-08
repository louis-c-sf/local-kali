import React, { useState } from "react";
import styles from "./ChannelTask.module.css";
import onboardingStyles from "./Onboarding.module.css";
import Accordion from "./components/Accordion";
import BadgeTag from "../../shared/BadgeTag/BadgeTag";
import ChannelIcon from "./assets/channel.svg";
import { Divider, Image, Menu, Tab } from "semantic-ui-react";
import { Button } from "../../shared/Button/Button";
import MessengerIcon from "../../../assets/images/channels/facebook-messenger.svg";
import InstagramIcon from "../../../assets/images/channels/Instagram.svg";
import WechatIcon from "../../../assets/images/channels/wechat.svg";
import LineIcon from "../../../assets/images/channels/line.svg";
import SmsIcon from "../../../assets/images/channels/sms.svg";
import WidgetIcon from "../../../assets/images/logo-solid.svg";
import WhatsAppIcon from "../../../assets/images/channels/whatsapp.svg";
import ShopifyIcon from "../../../assets/images/channels/shopify.svg";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { Link } from "react-router-dom";
import useRouteConfig from "config/useRouteConfig";
import AddUserModal from "../../Settings/AddUserModal";
import iconStyles from "../../shared/Icon/Icon.module.css";
import CompanyType from "types/CompanyType";
import useGetBookDemoLink from "./useGetBookDemoLink";

function TabContent(props: { title: string; key: string; list: string[] }) {
  const { title, key, list } = props;
  return (
    <Tab.Pane attached={false} key={key}>
      <div className={styles.tabContent}>
        <div>{title}</div>
        <ul className={styles.list}>
          {list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </Tab.Pane>
  );
}

const getMainPanes = (t: TFunction) => [
  {
    menuItem: (
      <Menu.Item key="whatsapp" className={styles.tab}>
        <Image src={WhatsAppIcon} className={styles.icon} />
        {t(
          "onboarding.getStarted.quickStart.channelTask.action1.whatsapp.title"
        )}
      </Menu.Item>
    ),
    render: () => {
      return (
        <TabContent
          title={t(
            "onboarding.getStarted.quickStart.channelTask.action1.whatsapp.desc"
          )}
          key="whatsapp"
          list={[
            t(
              "onboarding.getStarted.quickStart.channelTask.action1.whatsapp.broadcast"
            ),
            t(
              "onboarding.getStarted.quickStart.channelTask.action1.whatsapp.interactive"
            ),
            t(
              "onboarding.getStarted.quickStart.channelTask.action1.whatsapp.template"
            ),
          ]}
        />
      );
    },
  },
  {
    menuItem: (
      <Menu.Item key="shopify" className={styles.tab}>
        <Image src={ShopifyIcon} className={styles.icon} />
        {t(
          "onboarding.getStarted.quickStart.channelTask.action1.shopify.title"
        )}
      </Menu.Item>
    ),
    render: () => {
      return (
        <TabContent
          title={t(
            "onboarding.getStarted.quickStart.channelTask.action1.shopify.desc"
          )}
          key="shopify"
          list={[
            t(
              "onboarding.getStarted.quickStart.channelTask.action1.shopify.retarget"
            ),
            t(
              "onboarding.getStarted.quickStart.channelTask.action1.shopify.track"
            ),
            t(
              "onboarding.getStarted.quickStart.channelTask.action1.shopify.automation"
            ),
          ]}
        />
      );
    },
  },
];

const getChannels = (company: CompanyType, isWebWidgetConnected: boolean) => [
  {
    icon: MessengerIcon,
    name: "Facebook",
    easy: true,
    connected: company.facebookConfigs && company.facebookConfigs.length > 0,
  },
  {
    icon: InstagramIcon,
    name: "Instagram",
    easy: true,
    connected: company.instagramConfigs && company.instagramConfigs.length > 0,
  },
  {
    icon: WechatIcon,
    name: "WeChat",
    easy: false,
    connected: company.weChatConfig && company.weChatConfig.webChatId,
  },
  {
    icon: LineIcon,
    name: "Line Business",
    easy: false,
    connected: company.lineConfigs && company.lineConfigs.length > 0,
  },
  {
    icon: SmsIcon,
    name: "SMS",
    easy: false,
    connected: company.smsConfigs && company.smsConfigs.length > 0,
  },
  {
    icon: WidgetIcon,
    name: "Live Chat Widget",
    easy: false,
    connected: isWebWidgetConnected,
  },
];

export default function ChannelTask(props: {
  isComplete: boolean;
  isWebWidgetConnected: boolean;
  remainingCount: number;
  company: CompanyType;
}) {
  const { isComplete, isWebWidgetConnected, remainingCount, company } = props;
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();
  const [invitedModalVisible, setInvitedModalVisible] = useState(false);
  const mainPanes = getMainPanes(t);
  const channels = getChannels(company, isWebWidgetConnected);
  const bookDemoLink = useGetBookDemoLink();

  function showInvitedModal() {
    setInvitedModalVisible(true);
  }

  function closeInvitedModal() {
    setInvitedModalVisible(false);
  }

  return (
    <Accordion
      background
      image={ChannelIcon}
      title={t("onboarding.getStarted.quickStart.channelTask.title")}
      extra={
        isComplete && (
          <BadgeTag
            className={onboardingStyles.tag}
            compact
            text={t("onboarding.getStarted.quickStart.complete")}
          />
        )
      }
    >
      <div className={`${onboardingStyles.content} ${styles.content}`}>
        <div className={onboardingStyles.list}>
          <div className={onboardingStyles.title}>
            {t("onboarding.getStarted.quickStart.channelTask.action1.title")}
          </div>
          <div className={styles.plans}>
            <div className={`${styles.plan} container`}>
              <div className={styles.head}>
                <div className={styles.title}>
                  {t(
                    "onboarding.getStarted.quickStart.channelTask.action1.easyToStart"
                  )}
                </div>
                <BadgeTag
                  className={styles.free}
                  compact
                  text={t(
                    "onboarding.getStarted.quickStart.channelTask.action1.free"
                  )}
                />
              </div>
              <div className={styles.body}>
                {channels.map((channel) => (
                  <div
                    key={channel.name}
                    className={`${styles.channel} container`}
                  >
                    <div className={styles.icon}>
                      <Image src={channel.icon} />
                    </div>
                    <div className={styles.name}>{channel.name}</div>
                    {channel.easy && !channel.connected && (
                      <div className={styles.easyTag}>
                        {t(
                          "onboarding.getStarted.quickStart.channelTask.action1.easy"
                        )}
                      </div>
                    )}
                    {channel.connected ? (
                      <div className={styles.connected}>
                        <span
                          className={`${iconStyles.icon} ${styles.checkIcon}`}
                        />
                        {t(
                          "onboarding.getStarted.quickStart.channelTask.action1.connected"
                        )}
                      </div>
                    ) : (
                      <div className={styles.connectBtn}>
                        <Link to={routeTo("/channels")}>
                          <Button primary>
                            {t(
                              "onboarding.getStarted.quickStart.channelTask.button.connect"
                            )}
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className={`${styles.plan} ${styles.lastOne} container`}>
              <div className={styles.head}>
                <div className={styles.title}>
                  {t(
                    "onboarding.getStarted.quickStart.channelTask.action1.recommended"
                  )}
                </div>
                <BadgeTag
                  className={styles.recommend}
                  compact
                  text={t(
                    "onboarding.getStarted.quickStart.channelTask.action1.proAndPremium"
                  )}
                />
              </div>
              <div className={styles.body}>
                <Tab
                  className={styles.tabs}
                  menu={{ secondary: true, pointing: true }}
                  panes={mainPanes}
                />
                <div className={styles.buttons}>
                  <Link to={routeTo("/settings/plansubscription")}>
                    <Button className={styles.pricingBtn} customSize="mid">
                      {t(
                        "onboarding.getStarted.quickStart.channelTask.button.pricing"
                      )}
                    </Button>
                  </Link>
                  <Button
                    primary
                    customSize="mid"
                    target="_blank"
                    as="a"
                    rel="noreferrer noopener"
                    href={bookDemoLink}
                  >
                    {t(
                      "onboarding.getStarted.quickStart.channelTask.button.book"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Divider />
        <div className={onboardingStyles.list}>
          <div className={onboardingStyles.title}>
            {t("onboarding.getStarted.quickStart.channelTask.action2.title")}
          </div>
          <div className={onboardingStyles.desc}>
            {t("onboarding.getStarted.quickStart.channelTask.action2.desc")}
          </div>
          <div className={onboardingStyles.button}>
            <Button primary customSize="mid" onClick={showInvitedModal}>
              {t("onboarding.getStarted.quickStart.channelTask.button.invite")}
            </Button>
            <div className={onboardingStyles.helper}>
              {t("onboarding.getStarted.quickStart.channelTask.action2.limit", {
                number: remainingCount,
              })}
            </div>
          </div>
        </div>
        <AddUserModal
          showModal={invitedModalVisible}
          onHidden={closeInvitedModal}
        />
      </div>
    </Accordion>
  );
}
