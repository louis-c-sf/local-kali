import React, { useEffect, useState, ReactNode } from "react";
import { DateRangeFilter } from "component/shared/input/DateRangeFilter/DateRangeFilter";
import { useTranslation, Trans } from "react-i18next";
import moment, { Moment } from "moment";
import { Dimmer, Dropdown, Image, Loader } from "semantic-ui-react";
import { Button } from "component/shared/Button/Button";
import { FacebookBusinessWabaType } from "types/CompanyType";
import styles from "./ConversationUsage.module.css";
import { submitConversationAnalytic } from "api/CloudAPI/submitConversationAnalytic";
import { InfoTooltip } from "component/shared/popup/InfoTooltip";
import InfoIcon from "../../../assets/images/info_gray.svg";
import { submitConversationUsageExport } from "api/CloudAPI/submitConversationUsageExport";
import { getTotalByPath } from "component/Settings/SettingBilling/getTotalByPath";

const facebookUpdateMoment = Object.freeze(moment("2023-06-01"));

const ConversationCell = (props: {
  data: CellDataType;
  totals: BreakdownPartType;
}) => {
  const { data } = props;
  const { header, content = [], lastItem = false } = data;

  return (
    <div className={`${styles.cell} ${lastItem ? "lastItem" : ""}`}>
      <div className={styles.cellHeader}>
        <div className={styles.leftSelection}>
          <div className={styles.cellTitle}>{header.key}</div>
          {header.tooltip && (
            <InfoTooltip
              placement={"right"}
              trigger={<Image src={InfoIcon} size="mini" />}
            >
              {header.tooltip}
            </InfoTooltip>
          )}
        </div>
        <div className={styles.cellValue}>
          {getTotalByPath(header.path, props.totals)}
        </div>
      </div>
      {content.length > 0 && (
        <div className={styles.cellContent}>
          {content.map((item) => {
            const path = [...props.data.header.path, ...item.path];
            return (
              <>
                <div className={styles.cellItem} key={item.path.join()}>
                  <div
                    className={`
                    ${styles.leftSelection}
                    ${item.breakdownItems ? "" : styles.subContent}
                  `}
                  >
                    <div
                      className={`${
                        item.breakdownItems
                          ? styles.cellSubTitle
                          : styles.cellTitle
                      }`}
                    >
                      {item.key}
                    </div>
                    {item.tooltip && (
                      <InfoTooltip
                        placement={"right"}
                        trigger={<Image src={InfoIcon} size="mini" />}
                      >
                        {item.tooltip}
                      </InfoTooltip>
                    )}
                  </div>
                  <div className={`${styles.cellValue} `}>
                    {getTotalByPath(path, props.totals)}
                  </div>
                </div>

                {item.breakdownItems?.map((item) => {
                  const subPath = [...path, ...item.path];
                  return (
                    <div
                      className={`${styles.cellItem} ${styles.subContent}`}
                      key={item.path.join()}
                    >
                      <div className={styles.cellSubTitle}>
                        {item.key}
                        {item.tooltip && (
                          <InfoTooltip
                            placement={"right"}
                            trigger={<Image src={InfoIcon} size="mini" />}
                          >
                            {item.tooltip}
                          </InfoTooltip>
                        )}
                      </div>
                      <div className={styles.cellValue}>
                        {getTotalByPath(subPath, props.totals)}
                      </div>
                    </div>
                  );
                })}
              </>
            );
          })}
        </div>
      )}
    </div>
  );
};

type DataType = {
  key: string;
  path: string[];
  tooltip?: ReactNode;
  breakdownItems?: DataType[];
};
type CellDataType = {
  header: DataType;
  content?: DataType[];
  lastItem?: boolean;
};

export type BreakdownPartType =
  | {
      total: number;
      key: string;
    }
  | { key: string; breakdown: BreakdownPartType[] };

type BreakdownTitledType = BreakdownPartType & {
  title: ReactNode;
};

export const ConversationUsage = (props: {
  facebookBusinessId: string;
  facebookWabas: FacebookBusinessWabaType[];
}) => {
  const { t } = useTranslation();
  const TODAY = Object.freeze(moment());
  const defaultDays = 30;

  const [startDate, setStartDate] = useState<Moment>(
    TODAY.clone().subtract(defaultDays, "day")
  );
  const [endDate, setEndDate] = useState<Moment>(TODAY.clone());
  const [selectedWaba, setSelectedWaba] = useState<string>(
    props.facebookWabas[0].facebook_waba_id
  );
  const [loading, setLoading] = useState(false);
  const [conversationUsage, setConversationUsage] = useState<{
    all: BreakdownPartType;
    free: BreakdownPartType;
    paid: BreakdownPartType;
    estimated_charge: BreakdownPartType;
    currency: string;
  }>({
    all: { total: 0, key: "all" },
    paid: { total: 0, key: "paid" },
    free: { total: 0, key: "free" },
    estimated_charge: { total: 0, key: "estimated_charge" },
    currency: "",
  });

  const isRespectFBPricingUpdate =
    startDate.isAfter(facebookUpdateMoment) ||
    endDate.isAfter(facebookUpdateMoment);

  const all_conversations_data: CellDataType = {
    header: {
      key: t(
        "settings.billing.topupCredit.conversationUsage.conversations.all.title"
      ),
      path: ["all", "conversations"],
      tooltip: (
        <Trans i18nKey="settings.billing.topupCredit.conversationUsage.conversations.tooltip.allConversations">
          This refers to the number of messaging conversations on WhatsApp
          between your business and customers.
          <br />
          <br />A conversation includes all messages delivered within a 24-hour
          period. A conversation will be counted in when the first business
          message is delivered and ends 24 hours later.
          <br />
          <br />
          The first message can be initiated by the business
          (business-initiated) or a business reply within 24 hours of a user
          message (user-initiated).
        </Trans>
      ),
    },
    content: [
      {
        key: t(
          "settings.billing.topupCredit.conversationUsage.conversations.all.business"
        ),
        path: ["business"],
        breakdownItems: !isRespectFBPricingUpdate
          ? []
          : [
              {
                path: ["authentication"],
                key: t(
                  "settings.billing.topupCredit.conversationUsage.conversations.subtype.authentication"
                ),
              },
              {
                path: ["marketing"],
                key: t(
                  "settings.billing.topupCredit.conversationUsage.conversations.subtype.marketing"
                ),
              },
              {
                path: ["utility"],
                key: t(
                  "settings.billing.topupCredit.conversationUsage.conversations.subtype.utility"
                ),
              },
            ],
      },
      {
        key: t(
          "settings.billing.topupCredit.conversationUsage.conversations.all.user"
        ),
        path: ["user"],
        breakdownItems: !isRespectFBPricingUpdate
          ? []
          : [
              {
                path: ["service"],
                key: t(
                  "settings.billing.topupCredit.conversationUsage.conversations.subtype.service"
                ),
              },
            ],
      },
    ],
  };

  const free_conversations_data: CellDataType = {
    header: {
      key: t(
        "settings.billing.topupCredit.conversationUsage.conversations.free.title"
      ),
      path: ["free"],
      tooltip: (
        <Trans i18nKey="settings.billing.topupCredit.conversationUsage.conversations.tooltip.freeConversations">
          This refers the number of free-of-charge messaging conversations on
          WhatsApp between your business and customers.
          <br />
          <br /> A conversation includes all messages delivered within a 24-hour
          period. A conversation will be counted in when the first business
          message is delivered and ends 24 hours later.
          <br />
          <br />
          The first message can be initiated by the business
          (business-initiated) or a business reply within 24 hours of a user
          message (user-initiated).
        </Trans>
      ),
    },
    content: [
      {
        key: t(
          "settings.billing.topupCredit.conversationUsage.conversations.free.tier"
        ),
        path: ["tier"],
        tooltip: (
          <Trans i18nKey="settings.billing.topupCredit.conversationUsage.conversations.tooltip.freeTier">
            This refers to the number of messaging conversations on WhatsApp
            that do not incur costs. The first 1,000 conversations your WhatsApp
            Business account has each month are free of charge. <br />
            <br /> Free-tier conversations apply to both business-initiated and
            user-initiated conversations.
          </Trans>
        ),
      },
      {
        key: t(
          "settings.billing.topupCredit.conversationUsage.conversations.free.entry"
        ),
        path: ["entry"],
        tooltip: (
          <Trans i18nKey="settings.billing.topupCredit.conversationUsage.conversations.tooltip.freeEntryPoint">
            When a WhatsApp conversation starts from specific entry points, they
            will not incur any costs. Specific entry points include Ads that
            click to WhatsApp and Facebook Page CTAs.
            <br />
            <br />
            Free entry point conversations only apply to user-initiated
            conversations. Only the first conversation that starts from the
            entry point is free of charge. The initial conversation from the
            entry point is free of charge for 3 days. Subsequent conversations
            with the same user will be charged.
          </Trans>
        ),
      },
    ],
  };

  const paid_conversations_data: CellDataType = {
    header: {
      key: t(
        "settings.billing.topupCredit.conversationUsage.conversations.paid.title"
      ),
      path: ["paid"],
      tooltip: (
        <Trans i18nKey="settings.billing.topupCredit.conversationUsage.conversations.tooltip.paidConversations">
          This refers to the number of messaging conversations on WhatsApp
          between your business and customers that are charged.
          <br />
          <br />A conversation includes all messages delivered within a 24-hour
          period.
          <br />
          <br />A conversation starts when the first business message is
          delivered and ends 24 hours later. The first message can be initiated
          by the business (business-initiated) or a business reply within 24
          hours of a user message (user-initiated).
        </Trans>
      ),
    },
    content: [
      {
        key: t(
          "settings.billing.topupCredit.conversationUsage.conversations.paid.business"
        ),
        path: ["business"],
      },
      {
        key: t(
          "settings.billing.topupCredit.conversationUsage.conversations.paid.user"
        ),
        path: ["user"],
      },
    ],
    lastItem: true,
  };

  const total_rate_data: CellDataType = {
    header: {
      key: t("settings.billing.topupCredit.conversationUsage.totalRate.charge"),
      path: ["estimated_charge"],
      tooltip: (
        <Trans i18nKey="settings.billing.topupCredit.conversationUsage.conversations.tooltip.estimatedCharge">
          This refers to the estimated total charges for conversations on
          WhatsApp. These charges may differ from what's shown on your invoices
          due to small variations in data processing.
          <br />
          <br />
          The charge for each paid conversation is determined by the rate
          assigned to the country or region of the user's phone number, and
          whether the conversation was business-initiated or user-initiated. See
          Rates for specific pricing information.
        </Trans>
      ),
    },
  };

  const getConversationUsage = async (
    startDate: Moment,
    endDate: Moment,
    selectedWaba: string,
    facebookBusinessId: string
  ) => {
    try {
      setLoading(true);
      const result = await submitConversationAnalytic({
        facebookBusinessId: facebookBusinessId,
        facebookWabaId: selectedWaba,
        start: startDate.format("YYYY-MM-DD"),
        end: endDate.format("YYYY-MM-DD"),
      });
      const analytic = result.conversation_usage_analytic;

      const totalBusinessPaid = analytic.total_business_initiated_paid_quantity;
      const totalBusinessFreeTier =
        analytic.total_business_initiated_free_tier_quantity;
      const totalUserFreeEntry =
        analytic.total_user_initiated_free_entry_point_quantity;
      const totalUserPaid = analytic.total_user_initiated_paid_quantity;
      const totalUserFreeTier =
        analytic.total_user_initiated_free_tier_quantity;

      let allBusinessPart: BreakdownPartType;
      let allUserPart: BreakdownPartType;

      if (isRespectFBPricingUpdate) {
        const categoryQuantities = analytic.conversation_category_quantities;
        allBusinessPart = {
          key: "business",
          breakdown: [
            {
              key: "authentication",
              total: categoryQuantities.AUTHENTICATION ?? 0,
            },
            {
              key: "marketing",
              total: categoryQuantities.MARKETING ?? 0,
            },
            {
              key: "utility",
              total: categoryQuantities.UTILITY ?? 0,
            },
          ],
        };
        allUserPart = {
          key: "user",
          breakdown: [
            {
              key: "service",
              total: categoryQuantities.SERVICE ?? 0,
            },
          ],
        };
      } else {
        allBusinessPart = {
          key: "business",
          total: totalBusinessFreeTier,
        };
        allUserPart = {
          key: "user",
          total: totalUserPaid,
        };
      }
      setConversationUsage({
        all: {
          key: "all",
          breakdown: [
            {
              key: "conversations",
              breakdown: [allBusinessPart, allUserPart],
            },
          ],
        },
        free: {
          key: "free",
          breakdown: [
            {
              key: "tier",
              total: totalUserFreeTier + totalBusinessFreeTier,
            },
            {
              key: "entry",
              total: totalUserFreeEntry,
            },
          ],
        },
        paid: {
          key: "paid",
          breakdown: [
            {
              key: "business",
              total: totalUserPaid,
            },
            {
              key: "user",
              total: totalUserPaid,
            },
          ],
        },
        estimated_charge: {
          total: analytic.total_used.amount,
          key: "estimated_charge",
        },
        currency: analytic.total_used.currency_iso_code,
      });
    } catch (e) {
      console.error(`submitPayment error ${e}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      await submitConversationUsageExport({
        facebookBusinessId: props.facebookBusinessId,
        facebookWabaId: selectedWaba,
        start: startDate.format("YYYY-MM-DD"),
        end: endDate.format("YYYY-MM-DD"),
      });
    } catch (e) {
      console.error(`submitPayment error ${e}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getConversationUsage(
      startDate,
      endDate,
      selectedWaba,
      props.facebookBusinessId
    );
  }, [startDate, endDate, selectedWaba, props.facebookBusinessId]);

  useEffect(() => {
    setSelectedWaba(props.facebookWabas[0].facebook_waba_id);
  }, [props.facebookWabas]);

  return (
    <div className={styles.container}>
      <div className={styles.containerHeader}>
        {t("settings.billing.topupCredit.conversationUsage.header")}
      </div>
      {loading ? (
        <Dimmer active inverted>
          <Loader inverted></Loader>
        </Dimmer>
      ) : (
        <>
          <div className={styles.actions}>
            <DateRangeFilter
              startDate={startDate.clone()}
              endDate={endDate.clone()}
              maxDate={TODAY.clone()}
              setDates={(start, end) => {
                setStartDate(start);
                setEndDate(end);
              }}
              showComparedPeriod={false}
              showCustomDropdown={false}
            />
            <Dropdown
              className={styles.wabaDropdown}
              options={props.facebookWabas.map(
                (waba: FacebookBusinessWabaType) => ({
                  key: waba.facebook_waba_id,
                  text: waba.facebook_waba_name,
                  value: waba.facebook_waba_id,
                })
              )}
              value={selectedWaba}
              onChange={(e, { value }) => setSelectedWaba(value as string)}
            />
            <Button blue className={styles.exportButton} onClick={handleExport}>
              {t(
                "settings.billing.topupCredit.conversationUsage.button.export"
              )}
            </Button>
          </div>
          <div className={styles.content}>
            <div className={styles.contentBox}>
              <div className={styles.head}>
                {t(
                  "settings.billing.topupCredit.conversationUsage.conversations.header"
                )}
              </div>
              <ConversationCell
                key={"all"}
                data={all_conversations_data}
                totals={conversationUsage.all}
              />
              <div className={styles.borderBottom} />
              <ConversationCell
                data={free_conversations_data}
                totals={conversationUsage.free}
              />
              <div className={styles.borderBottom} />
              <ConversationCell
                data={paid_conversations_data}
                totals={conversationUsage.paid}
              />
            </div>
            <div className={styles.contentBox}>
              <div className={styles.head}>
                {t(
                  "settings.billing.topupCredit.conversationUsage.totalRate.header"
                )}
              </div>
              <ConversationCell
                key={"total"}
                data={total_rate_data}
                totals={conversationUsage.estimated_charge}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
