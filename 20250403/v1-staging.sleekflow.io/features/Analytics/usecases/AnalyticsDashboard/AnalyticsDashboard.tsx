import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import styles from "features/Analytics/usecases/AnalyticsDashboard/AnalyticsDashboard.module.css";
import ReactApexChart from "react-apexcharts";
import { Redirect } from "react-router";
import { Button, Checkbox, Dropdown } from "semantic-ui-react";
import ContactSidebar from "features/Analytics/usecases/AnalyticsDashboard/ContactSidebar";
import { PostLogin } from "component/Header";
import { buildParamString, get, post } from "api/apiRequest";
import {
  GET_SEGMENT_LIST,
  POST_ANALYTICS_DATA,
  POST_EXPORT_ANALYTICS_DATA_BACKGROUND,
} from "api/apiPath";
import Helmet from "react-helmet";
import moment, { Moment } from "moment";
import { useTranslation } from "react-i18next";
import { fetchTeams } from "container/Settings/SettingTeams";
import {
  isStaffRole,
  isTeamAdminRole,
} from "component/Settings/helpers/AccessRulesGuard";
import { InfoTooltip } from "component/shared/popup/InfoTooltip";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import { useFieldLocales } from "component/Contact/locaizable/useFieldLocales";
import { useCustomProfileFields } from "container/Contact/hooks/useCustomProfileFields";
import { FilterConfigType } from "types/FilterConfigType";
import { useAppSelector } from "AppRootContext";
import { pick } from "ramda";
import { useFeaturesGuard } from "component/Settings/hooks/useFeaturesGuard";
import { useSignalRGroup } from "component/SignalR/useSignalRGroup";
import { TaskResponseType } from "component/Header/ProgressBar/types/TaskType";
import UpgradePopup from "features/Analytics/usecases/AnalyticsDashboard/UpgradePopup";
import demoData from "features/Analytics/usecases/AnalyticsDashboard/demoData";
import CompanyAvgDataResponseType from "types/Analytics/api/CompanyAvgDataResponseType";
import {
  DatePeriodType,
  DateRangeFilter,
} from "component/shared/input/DateRangeFilter/DateRangeFilter";
import { PercentageBadge } from "features/Analytics/components/PercentageBadge";

const YESTERDAY = Object.freeze(moment().subtract(1, "day"));

export const StyledChart = styled(ReactApexChart)`
  margin-top: 10px;

  > * .apexcharts-legend-series {
    display: flex !important;
  }

  > * .apexcharts-legend-marker {
    margin-right: 6px;
    border-radius: 50% !important;
  }
`;

const DashboardContainer = styled.div`
  width: 100%;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ExportButtonWrapper = styled.div`
  display: flex;
  align-items: center;

  > button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px !important;
  }
`;

const FiltersContainer = styled.div`
  margin: 16px 0px;
  display: flex;
  justify-content: space-between;
`;

const ChartsContainer = styled.div`
  > div {
    display: flex;
    flex-direction: row;
    margin: 0 -10px;

    > * {
      margin: 0 10px;
    }
  }

  margin-bottom: 20px;
`;

const ChartCard = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 20px;
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 5px;
  min-height: 200px;
`;

const ChartCardValue = styled.span`
  font-size: 25px;
  font-weight: bold;
  color: #6078ff;
`;

const ChartCardPrevValue = styled.span`
  font-size: 16px;
  color: #697386;
  line-height: 14px;
`;

const ChartCardHeader = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #3c4257;
`;

const IconContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #dadfff;
  padding: 8px;
`;

const BroadcastStat = styled.div`
  display: flex;
  align-items: center;
  /* justify-content: space-between; */
  margin: 16px 0px;

  > div:last-child {
    display: flex;
    flex-direction: column;
    margin-left: 24px;
  }
`;

const ComparisonButton = styled(Button)`
  margin-left: 10px !important;
`;

const AnalyticsDashboard = () => {
  const { loggedInUserDetail, currentPlan, user } = useAppSelector(
    pick(["loggedInUserDetail", "currentPlan", "user"])
  );

  const [timePeriod, setTimePeriod] = useState<string[]>([]);
  const { t } = useTranslation();

  const taskId = useRef();
  const [isExportingData, setIsExportingData] = useState(false);

  const [isDataReady, setIsDataReady] = useState(false);

  const CHART_OPTIONS = {
    chart: {
      // offsetY: -20,
      toolbar: {
        show: false,
        tools: {
          download: false,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
        },
      },
    },
    stroke: { curve: "smooth", width: 2, dashArray: [0, 3, 0, 0] },
    fill: { type: "solid", opacity: [1, 1, 1, 1] },
    xaxis: {
      labels: {
        show: false,
      },
      categories: timePeriod,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      style: {
        colors: [],
        fontSize: "10px",
        fontWeight: 400,
      },
    },
    yaxis: {
      show: false,
    },
    colors: ["#6078FF", "#AFBAFF", "#FF9C7A", "#6EB33B"],
    grid: {
      show: false,
      padding: {
        left: 0,
        right: 0,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      floating: false,
    },
    noData: {
      text: `${t("analytics.loading")}...`,
      align: "center",
      verticalAlign: "middle",
      offsetX: 0,
      offsetY: 0,
      style: {
        color: "#B4B4B4",
        fontSize: "14px",
      },
    },
    tooltip: {
      y: {
        formatter: (val: any) => {
          return parseInt(val) || 0;
        },
      },
    },
  };

  const TIME_CHART_OPTIONS = {
    ...CHART_OPTIONS,
    tooltip: {
      y: {
        formatter: (val: any) => {
          return val > 60
            ? `${Math.floor(val / 60)}${t("analytics.time-unit.hour")} ${
                val % 60
              }${t("analytics.time-unit.min")}`
            : `${val}${t("analytics.time-unit.min")}`;
        },
      },
    },
  };

  const BAR_CHART_OPTION = {
    chart: {
      height: 350,
      type: "bar",
      events: {},
      toolbar: {
        show: false,
        tools: {
          download: false,
        },
      },
    },
    colors: ["#6078FF", "#AFBAFF"],
    plotOptions: {
      bar: {
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      offsetY: -20,
      style: {
        colors: ["#6078ff", "#697386"],
        fontWeight: 400,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      floating: false,
    },
    xaxis: {
      categories: [
        t("analytics.sent"),
        t("analytics.delivered"),
        t("analytics.bounced"),
        t("analytics.read"),
        t("analytics.replied"),
      ],
      labels: {
        style: {
          // colors: ["#6078FF", "#"],
          fontSize: "12px",
        },
      },
      axisBorder: {
        show: false,
      },
    },
    yaxis: {
      show: false,
      showForNullSeries: true,
    },
    grid: {
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
    tooltip: {
      show: false,
    },
    noData: {
      text: "No data",
      align: "center",
      verticalAlign: "middle",
      offsetX: 0,
      offsetY: 0,
      style: {
        color: "#B4B4B4",
        fontSize: "14px",
      },
    },
  };

  const flash = useFlashMessageChannel();

  const [prevPeriod, setPrevPeriod] = useState<DatePeriodType>({
    count: 7,
    unit: "day",
  });

  const [chartOption, setChartOption] = useState(CHART_OPTIONS);
  const [timeChartOption, setTimeChartOption] = useState(TIME_CHART_OPTIONS);

  useEffect(() => {
    setChartOption({
      ...chartOption,
      xaxis: {
        ...chartOption.xaxis,
        categories: timePeriod,
      },
    });
    setTimeChartOption({
      ...timeChartOption,
      xaxis: {
        ...timeChartOption.xaxis,
        categories: timePeriod,
      },
    });
  }, [timePeriod]);

  interface ChartData {
    activeConversations?: any[];
    newCustomers?: any[];
    newContacts?: any[];
    allMsgResTime?: any[];
    firstMsgResTime?: any[];
    msgSent?: any[];
    msgReceived?: any[];
    allConversations?: any[];
    uniqueActiveConvos?: any[];
    uniqueAllConvos?: any[];
  }

  const initData = {
    activeConversations: [],
    newCustomers: [],
    newContacts: [],
    allMsgResTime: [],
    firstMsgResTime: [],
    msgSent: [],
    msgReceived: [],
    allConversations: [],
    uniqueActiveConvos: [],
    uniqueAllConvos: [],
  };

  interface ChartSummary {
    activeConversations: string;
    newCustomers: string;
    newContacts: string;
    allMsgResTime: string;
    firstMsgResTime: string;
    msgSent: string;
    msgReceived: string;
    allConversations: string;
    uniqueActiveConvos: string;
    uniqueAllConvos: string;
  }

  const initSummary = {
    activeConversations: "",
    newCustomers: "",
    newContacts: "",
    allMsgResTime: "",
    firstMsgResTime: "",
    msgSent: "",
    msgReceived: "",
    allConversations: "",
    uniqueActiveConvos: "",
    uniqueAllConvos: "",
  };

  const [companyAvgData, setCompanyAvgData] = useState<ChartData>(initData);
  const [companyPrevData, setCompanyPrevData] = useState<ChartData>(initData);
  const [firstSegmentData, setFirstSegmentData] = useState<ChartData>(initData);

  const [secondSegmentData, setSecondSegmentData] =
    useState<ChartData>(initData);

  const [firstSegmentSummary, setFirstSegmentSummary] =
    useState<ChartSummary>(initSummary);

  const [secondSegmentSummary, setSecondSegmentSummary] =
    useState<ChartSummary>(initSummary);

  const initValue = "";

  const [activeConversations, setActiveConversations] = useState(initValue);
  const [allConversations, setAllConversations] = useState(initValue);
  const [newCustomer, setNewCustomer] = useState(initValue);
  const [newContacts, setNewContacts] = useState(initValue);
  const [avgResTime, setAvgResTime] = useState(initValue);
  const [msgSent, setMsgSent] = useState(initValue);
  const [msgReceived, setMsgReceived] = useState(initValue);
  const [sentMsg, setSentMsg] = useState(0);
  const [bouncedMsg, setBouncedMsg] = useState(0);
  const [deliveredMsg, setDeliveredMsg] = useState(0);
  const [readMsg, setReadMsg] = useState(0);
  const [repliedMsg, setRepliedMsg] = useState(0);
  const featureGuard = useFeaturesGuard();
  const [prevActiveConversations, setPrevActiveConversations] =
    useState(initValue);
  const [prevNewCustomer, setPrevNewCustomer] = useState(initValue);
  const [prevNewContacts, setPrevNewContacts] = useState(initValue);
  const [prevAvgResTime, setPrevAvgResTime] = useState(initValue);
  const [prevAllConversations, setPrevAllConversations] = useState(initValue);
  const [prevMsgSent, setPrevMsgSent] = useState(initValue);
  const [prevMsgReceived, setPrevMsgReceived] = useState(initValue);
  const [avgResTimeInMinutes, setAvgResTimeInMinutes] = useState(initValue);
  const [prevAvgResTimeInMinutes, setPrevAvgResTimeInMinutes] =
    useState(initValue);
  const [prevSentMsg, setPrevSentMsg] = useState(0);
  const [prevBouncedMsg, setPrevBouncedMsg] = useState(0);
  const [prevDeliveredMsg, setPrevDeliveredMsg] = useState(0);
  const [prevReadMsg, setPrevReadMsg] = useState(0);
  const [prevRepliedMsg, setPrevRepliedMsg] = useState(0);
  const [showCompanyData, setShowCompanyData] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const cannotUseAnalytics = useMemo(
    () => !!(currentPlan.id && !featureGuard.canUseAnalytics()),
    [currentPlan, featureGuard]
  );

  const refreshChartData = () => {
    setCompanyAvgData(initData);
    setCompanyPrevData(initData);
    setFirstSegmentData(initData);
    setSecondSegmentData(initData);
    setActiveConversations(initValue);
    setAllConversations(initValue);
    setNewCustomer(initValue);
    setNewContacts(initValue);
    setAvgResTime(initValue);
    setMsgSent(initValue);
    setMsgReceived(initValue);
    setPrevActiveConversations(initValue);
    setPrevAllConversations(initValue);
    setPrevNewCustomer(initValue);
    setPrevNewContacts(initValue);
    setPrevAvgResTime(initValue);
    setPrevMsgSent(initValue);
    setPrevMsgReceived(initValue);
    setAvgResTimeInMinutes(initValue);
    setPrevAvgResTimeInMinutes(initValue);
    setSentMsg(0);
    setDeliveredMsg(0);
    setBouncedMsg(0);
    setReadMsg(0);
    setRepliedMsg(0);
    setPrevSentMsg(0);
    setPrevDeliveredMsg(0);
    setPrevBouncedMsg(0);
    setPrevReadMsg(0);
    setPrevRepliedMsg(0);
  };

  const periodWithCount = (count?: number, unit?: string) => {
    if (unit === undefined) {
      return "";
    }

    const mapping = {
      day: t("analytics.time-unit.dayWithCount", { count }),
      week: t("analytics.time-unit.weekWithCount", { count }),
      year: t("analytics.time-unit.yearWithCount", { count }),
      month: t("analytics.time-unit.monthWithCount", { count }),
    };
    return mapping[unit];
  };

  const [selectedSegments, setSelectedSegments] = useState<any[]>([]);
  const [segmentList, setSegmentList] = useState<any[]>([]);
  const [segmentOptions, setSegmentOptions] = useState<any[]>([]);

  const ACTIVE_CUSTOMER_DATA = [
    {
      type: "line",
      name: t("analytics.company-total"),
      data: companyAvgData.activeConversations,
      isSegment: false,
    },
    {
      type: "line",
      name: t("analytics.prev-period", {
        prevPeriod: periodWithCount(prevPeriod.count, prevPeriod.unit),
      }),
      data: companyPrevData.activeConversations,
      isSegment: false,
      isPrev: true,
    },
    {
      type: "line",
      name: selectedSegments[0]?.name,
      data: firstSegmentData.activeConversations,
      isSegment: true,
    },
    {
      type: "line",
      name: selectedSegments[1]?.name,
      data: secondSegmentData.activeConversations,
      isSegment: true,
    },
  ];

  const ACTIVE_CONVERSATIONS_DATA = [
    {
      type: "line",
      name: t("analytics.company-total"),
      data: companyAvgData.newCustomers,
      isSegment: false,
    },
    {
      type: "line",
      name: t("analytics.prev-period", {
        prevPeriod: periodWithCount(prevPeriod.count, prevPeriod.unit),
      }),
      data: companyPrevData.newCustomers,
      isSegment: false,
      isPrev: true,
    },
    {
      type: "line",
      name: selectedSegments[0]?.name,
      data: firstSegmentData.newCustomers,
      isSegment: true,
    },
    {
      type: "line",
      name: selectedSegments[1]?.name,
      data: secondSegmentData.newCustomers,
      isSegment: true,
    },
  ];

  const NEW_CONTACTS_DATA = [
    {
      type: "line",
      name: t("analytics.company-total"),
      data: companyAvgData.newContacts,
      isSegment: false,
    },
    {
      type: "line",
      name: t("analytics.prev-period", {
        prevPeriod: periodWithCount(prevPeriod.count, prevPeriod.unit),
      }),
      data: companyPrevData.newContacts,
      isSegment: false,
      isPrev: true,
    },
    {
      type: "line",
      name: selectedSegments[0]?.name,
      data: firstSegmentData.newContacts,
      isSegment: true,
    },
    {
      type: "line",
      name: selectedSegments[1]?.name,
      data: secondSegmentData.newContacts,
      isSegment: true,
    },
  ];

  const ALL_MSG_RES_TIME_DATA = [
    {
      type: "line",
      name: t("analytics.company-average"),
      data: companyAvgData.allMsgResTime,
      isSegment: false,
    },
    {
      type: "line",
      name: t("analytics.prev-period", {
        prevPeriod: periodWithCount(prevPeriod.count, prevPeriod.unit),
      }),
      data: companyPrevData.allMsgResTime,
      isSegment: false,
      isPrev: true,
    },
    {
      type: "line",
      name: selectedSegments[0]?.name,
      data: firstSegmentData.allMsgResTime,
      isSegment: true,
    },
    {
      type: "line",
      name: selectedSegments[1]?.name,
      data: secondSegmentData.allMsgResTime,
      isSegment: true,
    },
  ];

  const ALL_CONVERSATIONS_DATA = [
    {
      type: "line",
      name: t("analytics.company-total"),
      data: companyAvgData.allConversations,
      isSegment: false,
    },
    {
      type: "line",
      name: t("analytics.prev-period", {
        prevPeriod: periodWithCount(prevPeriod.count, prevPeriod.unit),
      }),
      data: companyPrevData.allConversations,
      isSegment: false,
      isPrev: true,
    },
    {
      type: "line",
      name: selectedSegments[0]?.name,
      data: firstSegmentData.allConversations,
      isSegment: true,
    },
    {
      type: "line",
      name: selectedSegments[1]?.name,
      data: secondSegmentData.allConversations,
      isSegment: true,
    },
  ];

  const MSG_SENT_DATA = [
    {
      type: "line",
      name: t("analytics.company-total"),
      data: companyAvgData.msgSent,
      isSegment: false,
    },
    {
      type: "line",
      name: t("analytics.prev-period", {
        prevPeriod: periodWithCount(prevPeriod.count, prevPeriod.unit),
      }),
      data: companyPrevData.msgSent,
      isSegment: false,
      isPrev: true,
    },
    {
      type: "line",
      name: selectedSegments[0]?.name,
      data: firstSegmentData.msgSent,
      isSegment: true,
    },
    {
      type: "line",
      name: selectedSegments[1]?.name,
      data: secondSegmentData.msgSent,
      isSegment: true,
    },
  ];

  const MSG_RECEIVED_DATA = [
    {
      type: "line",
      name: t("analytics.company-total"),
      data: companyAvgData.msgReceived,
      isSegment: false,
    },
    {
      type: "line",
      name: t("analytics.prev-period", {
        prevPeriod: periodWithCount(prevPeriod.count, prevPeriod.unit),
      }),
      data: companyPrevData.msgReceived,
      isSegment: false,
      isPrev: true,
    },
    {
      type: "line",
      name: selectedSegments[0]?.name,
      data: firstSegmentData.msgReceived,
      isSegment: true,
    },
    {
      type: "line",
      name: selectedSegments[1]?.name,
      data: secondSegmentData.msgReceived,
      isSegment: true,
    },
  ];

  const BROADCAST_DATA = [
    {
      name: t("analytics.company-total"),
      data: [sentMsg, deliveredMsg, bouncedMsg, readMsg, repliedMsg],
    },
    {
      name: t("analytics.prev-period", {
        prevPeriod: periodWithCount(prevPeriod.count, prevPeriod.unit),
      }),
      data: [
        prevSentMsg,
        prevDeliveredMsg,
        prevBouncedMsg,
        prevReadMsg,
        prevRepliedMsg,
      ],
    },
  ];

  const formatTimeSpent = (time: any) => {
    if (time) {
      const [hour, min, _] = time.split(":");
      return parseInt(hour) * 60 + parseInt(min);
    }
  };

  const setChartData = (
    data: any,
    callback: ({}) => void,
    setSummary?: any
  ): string[] => {
    const { dailyLogs, summary } = data;
    let timePeriod: string[] = [];
    let activeConversations: any[] = [];
    let allConversations: any[] = [];
    let newCustomers: any[] = [];
    let newContacts: any[] = [];
    let allMsgResTime: any[] = [];
    let firstMsgResTime: any[] = [];
    let msgSent: any[] = [];
    let msgReceived: any[] = [];
    let activeConvosAvg: any[] = [];
    let allConvosAvg: any[] = [];
    if (setSummary) {
      const { responseTimeForAllMessages } = summary;
      const [hourOfAll, minOfAll, secondOfAll] =
        responseTimeForAllMessages.split(":");
      const formattedAllHour =
        hourOfAll > 0
          ? `${parseInt(hourOfAll)}${t("analytics.time-unit.hour")}`
          : "";
      const formattedAllMin =
        minOfAll > 0
          ? `${parseInt(minOfAll)}${t("analytics.time-unit.min")}`
          : "";
      const formattedAllSecond =
        secondOfAll > 0
          ? `${parseInt(secondOfAll)}${t("analytics.time-unit.second")}`
          : `0${t("analytics.time-unit.second")}`;
      setSummary({
        ...summary,
        responseTimeForAllMessages: `${formattedAllHour} ${formattedAllMin} ${formattedAllSecond}`,
      });
    }

    dailyLogs.map((log: any) => {
      timePeriod.push(moment(log.dateTime).format("D MMM"));
      activeConversations.push(log.numberOfUniqueActiveConversations);
      allConversations.push(log.numberOfUniqueConversations);
      newCustomers.push(log.numberOfNewEnquires);
      newContacts.push(log.numberOfContacts);
      allMsgResTime.push(formatTimeSpent(log.responseTimeForAllMessages));
      firstMsgResTime.push(formatTimeSpent(log.responseTimeForFirstMessages));
      msgSent.push(log.numberOfMessagesSent);
      msgReceived.push(log.numberOfMessageReceived);
      activeConvosAvg.push(log.numberOfUniqueActiveConversationAverage);
      allConvosAvg.push(log.numberOfUniqueConversationAverage);
    });

    callback({
      activeConversations,
      allConversations,
      newCustomers,
      newContacts,
      allMsgResTime,
      firstMsgResTime,
      msgSent,
      msgReceived,
      activeConvosAvg,
      allConvosAvg,
    });
    return timePeriod;
  };

  const [startDate, setStartDate] = useState<Moment>(
    YESTERDAY.clone().subtract(7, "day")
  );
  const [endDate, setEndDate] = useState<Moment>(YESTERDAY.clone());

  useEffect(() => {
    if (!isInitialized) return;
    refreshChartData();
    getAnalyticsData(startDate, endDate);
  }, [startDate, endDate, isInitialized]);

  const setPrevChartColor = () => {
    setTimeChartOption({
      ...timeChartOption,
      stroke: { curve: "smooth", width: 2, dashArray: [0, 3, 0, 0] },
      colors: ["#6078FF", "#AFBAFF", "#FF9C7A", "#6EB33B"],
    });
    setChartOption({
      ...chartOption,
      stroke: { curve: "smooth", width: 2, dashArray: [0, 3, 0, 0] },
      colors: ["#6078FF", "#AFBAFF", "#FF9C7A", "#6EB33B"],
    });
  };

  const setSegmentChartColor = () => {
    setTimeChartOption({
      ...timeChartOption,
      stroke: { curve: "smooth", width: 2, dashArray: [0, 0, 0] },
      colors: showCompanyData
        ? ["#6078FF", "#FF9C7A", "#6EB33B"]
        : ["#FF9C7A", "#6EB33B"],
    });
    setChartOption({
      ...chartOption,
      stroke: { curve: "smooth", width: 2, dashArray: [0, 0, 0] },
      colors: showCompanyData
        ? ["#6078FF", "#FF9C7A", "#6EB33B"]
        : ["#FF9C7A", "#6EB33B"],
    });
  };

  useEffect(() => {
    if (!isInitialized) return;
    const getSegmentData = async (
      data: any,
      callback: any,
      setSummary: any
    ) => {
      const segmentData: CompanyAvgDataResponseType = await post(
        `${POST_ANALYTICS_DATA}?${buildParamString({
          from: startDate.format("YYYY-MM-DD"),
          to: endDate.format("YYYY-MM-DD"),
        })}`,
        {
          param: data.conditions || [],
        }
      );
      await setChartData(segmentData, callback, setSummary);
      setIsDataReady(true);
    };
    setIsDataReady(false);
    setFirstSegmentData(initData);
    setSecondSegmentData(initData);
    if (selectedSegments.length > 0) {
      setSegmentChartColor();
      if (selectedSegments.length > 1) {
        getSegmentData(
          selectedSegments[1],
          setSecondSegmentData,
          setSecondSegmentSummary
        );
      } else {
        setSecondSegmentData(initData);
      }
      getSegmentData(
        selectedSegments[0],
        setFirstSegmentData,
        setFirstSegmentSummary
      );
    } else {
      setPrevChartColor();
      getAnalyticsData(startDate, endDate);
    }
  }, [selectedSegments]);

  useEffect(() => {
    Promise.all([fetchTeams(), getSegmentList()]).then(() => {
      setIsInitialized(true);
    });
  }, []);

  const updateCompanyAvgData = async (
    startDate: Moment,
    endDate: Moment,
    mock?: boolean
  ): Promise<void> => {
    const currentPeriodData: CompanyAvgDataResponseType = mock
      ? demoData.avgData
      : await post(
          `${POST_ANALYTICS_DATA}?${buildParamString({
            from: startDate.format("YYYY-MM-DD"),
            to: endDate.format("YYYY-MM-DD"),
          })}`,
          {
            param: {},
          }
        );
    const { summary } = currentPeriodData;
    if (!summary) return;
    const {
      numberOfUniqueActiveConversations,
      numberOfUniqueConversations,
      numberOfNewEnquires,
      numberOfContacts,
      responseTimeForAllMessages,
      numberOfMessagesSent,
      numberOfMessageReceived,
      numberOfBroadcastSent,
      numberOfBroadcastDelivered,
      numberOfBroadcastBounced,
      numberOfBroadcastRead,
      numberOfBroadcastReplied,
    } = summary;

    const [hourOfAll, minOfAll, secondOfAll] = responseTimeForAllMessages
      .split(":")
      .map((item: string): number => parseInt(item));

    const allInMins = hourOfAll * 60 + minOfAll;
    setAvgResTimeInMinutes(`${allInMins}`);

    setActiveConversations(String(numberOfUniqueActiveConversations));
    setAllConversations(String(numberOfUniqueConversations));
    setNewCustomer(String(numberOfNewEnquires));
    setNewContacts(String(numberOfContacts));
    const formattedAllHour =
      hourOfAll > 0 ? `${hourOfAll}${t("analytics.time-unit.hour")}` : "";
    const formattedAllMin =
      minOfAll > 0 ? `${minOfAll}${t("analytics.time-unit.min")}` : "";
    const formattedAllSecond =
      secondOfAll > 0
        ? `${secondOfAll}${t("analytics.time-unit.second")}`
        : `0${t("analytics.time-unit.second")}`;

    setAvgResTime(
      `${formattedAllHour} ${formattedAllMin} ${formattedAllSecond}`
    );

    setMsgSent(String(numberOfMessagesSent));
    setMsgReceived(String(numberOfMessageReceived));
    setSentMsg(numberOfBroadcastSent);
    setDeliveredMsg(numberOfBroadcastDelivered);
    setBouncedMsg(numberOfBroadcastBounced);
    setReadMsg(numberOfBroadcastRead);
    setRepliedMsg(numberOfBroadcastReplied);
    const timePeriod = await setChartData(currentPeriodData, setCompanyAvgData);
    await setTimePeriod(timePeriod);
  };

  const updateCompanyPrevData = async (
    startDate: Moment,
    endDate: Moment,
    mock?: boolean
  ): Promise<void> => {
    const dateDiff = moment(endDate.format("YYYY-MM-DD")).diff(
      moment(startDate.format("YYYY-MM-DD")),
      "days"
    );
    const prevStartDate = startDate.clone().subtract(dateDiff + 1, "day");
    const prevEndDate = startDate.clone().subtract(1, "day");
    const prevPeriodData: CompanyAvgDataResponseType = mock
      ? demoData.prevData
      : await post(
          `${POST_ANALYTICS_DATA}?${buildParamString({
            from: prevStartDate.format("YYYY-MM-DD"),
            to: prevEndDate.format("YYYY-MM-DD"),
          })}`,
          {
            param: {},
          }
        );
    const { summary } = prevPeriodData;
    if (!summary) return;
    const {
      numberOfUniqueActiveConversations,
      numberOfUniqueConversations,
      numberOfNewEnquires,
      numberOfContacts,
      responseTimeForAllMessages,
      numberOfMessagesSent,
      numberOfMessageReceived,
      numberOfBroadcastSent,
      numberOfBroadcastDelivered,
      numberOfBroadcastBounced,
      numberOfBroadcastRead,
      numberOfBroadcastReplied,
    } = summary;

    const [hourOfAll, minOfAll, secondOfAll] = responseTimeForAllMessages
      .split(":")
      .map((item: string): number => parseInt(item));

    const allInMins = hourOfAll * 60 + minOfAll;
    setPrevAvgResTimeInMinutes(`${allInMins}`);

    setPrevActiveConversations(String(numberOfUniqueActiveConversations));
    setPrevAllConversations(String(numberOfUniqueConversations));
    setPrevNewCustomer(String(numberOfNewEnquires));
    setPrevNewContacts(String(numberOfContacts));
    const formattedAllHour =
      hourOfAll > 0 ? `${hourOfAll}${t("analytics.time-unit.hour")}` : "";
    const formattedAllMin =
      minOfAll > 0 ? `${minOfAll}${t("analytics.time-unit.min")}` : "";
    const formattedAllSecond =
      secondOfAll > 0
        ? `${secondOfAll}${t("analytics.time-unit.second")}`
        : `0${t("analytics.time-unit.second")}`;

    setPrevAvgResTime(
      `${formattedAllHour} ${formattedAllMin} ${formattedAllSecond}`
    );

    setPrevMsgSent(String(numberOfMessagesSent));
    setPrevMsgReceived(String(numberOfMessageReceived));
    setPrevSentMsg(numberOfBroadcastSent);
    setPrevDeliveredMsg(numberOfBroadcastDelivered);
    setPrevBouncedMsg(numberOfBroadcastBounced);
    setPrevReadMsg(numberOfBroadcastRead);
    setPrevRepliedMsg(numberOfBroadcastReplied);

    await setChartData(prevPeriodData, setCompanyPrevData);
  };

  const updateSegmentData = async (
    startDate: Moment,
    endDate: Moment
  ): Promise<void> => {
    setIsDataReady(false);
    const getSegmentData = async (
      data: any,
      callback: any,
      setSummary: any
    ): Promise<void> => {
      const queryEndDate = endDate.clone().add(1, "day");
      const segmentData: CompanyAvgDataResponseType = await post(
        `${POST_ANALYTICS_DATA}?${buildParamString({
          from: startDate.format("YYYY-MM-DD"),
          to: queryEndDate.format("YYYY-MM-DD"),
        })}`,
        {
          param: data.conditions || [],
        }
      );
      await setChartData(segmentData, callback, setSummary);
      setIsDataReady(true);
    };

    if (selectedSegments.length > 0) {
      setSegmentChartColor();
      if (selectedSegments.length > 1) {
        getSegmentData(
          selectedSegments[1],
          setSecondSegmentData,
          setSecondSegmentSummary
        );
      } else {
        setSecondSegmentData(initData);
      }
      getSegmentData(
        selectedSegments[0],
        setFirstSegmentData,
        setFirstSegmentSummary
      );
    } else {
      setPrevChartColor();
      setFirstSegmentData(initData);
      setSecondSegmentData(initData);
      getAnalyticsData(startDate, endDate);
    }

    setIsDataReady(true);
  };

  const getAnalyticsData = async (
    startDate: Moment,
    endDate: Moment
  ): Promise<void> => {
    try {
      setIsDataReady(false);
      setPrevChartColor();
      if (selectedSegments.length > 0) {
        setSegmentChartColor();
        await Promise.all([
          updateSegmentData(startDate, endDate),
          updateCompanyAvgData(startDate, endDate),
        ]);
      } else {
        await Promise.all([
          updateCompanyAvgData(startDate, endDate, cannotUseAnalytics),
          updateCompanyPrevData(startDate, endDate, cannotUseAnalytics),
        ]);
      }
    } finally {
      setIsDataReady(true);
    }
  };

  const getSegmentList = async (): Promise<void> => {
    const segmentList = await get(GET_SEGMENT_LIST, { param: {} });
    setSegmentList(segmentList);
    const formattedSegmentOptions = segmentList.map((segment: any) => ({
      text: segment.name,
      key: segment.name,
      value: segment,
    }));
    setSegmentOptions(formattedSegmentOptions);
  };

  const handleSelectSegment = (segmentValues: any) => {
    if (selectedSegments.length >= 2 && segmentValues.length >= 2) {
      flash(t("analytics.atMostTwoSegment"));
    } else {
      setSelectedSegments(segmentValues);
    }
  };

  const [filterList, setFilterList] = useState<FilterConfigType[]>([]);
  const { fields: customFields } = useCustomProfileFields({
    excludeLabels: true,
  });

  const { getFieldDisplayNameLocale, staticFieldDisplayNames } =
    useFieldLocales();
  useEffect(() => {
    if (customFields.length > 0) {
      const fieldFilters: FilterConfigType[] = customFields.map((field) => ({
        fieldName: field.fieldName,
        fieldDisplayName: field.displayName,
        type: "customField",
        fieldType: field.type.toLowerCase(),
        fieldOptions: (field.options || []).map((option, key) => ({
          key: key,
          value: option.value,
          text: getFieldDisplayNameLocale(
            option.customUserProfileFieldOptionLinguals,
            option.value
          ),
        })),
      }));

      const firstName: FilterConfigType = {
        type: "customField",
        fieldName: "firstname",
        fieldDisplayName: staticFieldDisplayNames.firstname,
        fieldType: "singlelinetext",
        fieldOptions: [],
      };
      const lastName: FilterConfigType = {
        type: "customField",
        fieldName: "lastname",
        fieldDisplayName: staticFieldDisplayNames.lastname,
        fieldType: "singlelinetext",
        fieldOptions: [],
      };
      const createdAt: FilterConfigType = {
        type: "customField",
        fieldName: "createdat",
        fieldDisplayName: staticFieldDisplayNames.createdAt,
        fieldType: "datetime",
        fieldOptions: [],
      };
      setFilterList([firstName, lastName, ...fieldFilters, createdAt]);
    }
  }, [customFields]);

  const RowOneCharts = [
    {
      title: t("analytics.all-conversations"),
      tooltip: t("analytics.all-conversations-tooltip"),
      current: allConversations,
      prev: prevAllConversations,
      data: ALL_CONVERSATIONS_DATA,
      key: "numberOfUniqueConversations",
    },
    {
      title: t("analytics.active-conversations"),
      tooltip: t("analytics.active-conversations-tooltip"),
      current: activeConversations,
      prev: prevActiveConversations,
      data: ACTIVE_CUSTOMER_DATA,
      key: "numberOfUniqueActiveConversations",
    },
    {
      tooltip: t("analytics.new-customers-tooltip"),
      title: t("analytics.new-customers"),
      current: newCustomer,
      prev: prevNewCustomer,
      data: ACTIVE_CONVERSATIONS_DATA,
      key: "numberOfNewEnquires",
    },
    {
      tooltip: t("analytics.new-contacts-tooltip"),
      title: t("analytics.new-contacts"),
      current: newContacts,
      prev: prevNewContacts,
      data: NEW_CONTACTS_DATA,
      key: "numberOfContacts",
    },
  ];

  const RowTwoCharts = [
    {
      tooltip: t("analytics.all-msg-response-time-tooltip"),
      title: t("analytics.all-msg-response-time"),
      current: avgResTime,
      prev: prevAvgResTime,
      data: ALL_MSG_RES_TIME_DATA,
      timeOption: true,
      isTime: true,
      currentInMins: avgResTimeInMinutes,
      prevInMins: prevAvgResTimeInMinutes,
      key: "responseTimeForAllMessages",
    },
    {
      tooltip: t("analytics.msg-sent-tooltip"),
      title: t("analytics.msg-sent"),
      current: msgSent,
      prev: prevMsgSent,
      data: MSG_SENT_DATA,
      key: "numberOfMessagesSent",
    },
    {
      tooltip: t("analytics.msg-received-tooltip"),
      title: t("analytics.msg-received"),
      current: msgReceived,
      prev: prevMsgReceived,
      data: MSG_RECEIVED_DATA,
      key: "numberOfMessageReceived",
    },
  ];

  const [isComparisonDrawerOpen, setIsComparisonDrawerOpen] = useState(false);

  useEffect(() => {
    setSegmentChartColor();
  }, [showCompanyData]);

  useSignalRGroup(
    user?.signalRGroupName,
    {
      OnBackgroundTaskStatusChange: [
        (store, task: TaskResponseType) => {
          if (
            task.isCompleted &&
            task.id === taskId.current &&
            task.result?.url
          ) {
            window.open(task.result?.url);
          }
        },
      ],
    },
    "AnalyticsDashboard"
  );

  if (
    loggedInUserDetail &&
    (isTeamAdminRole(loggedInUserDetail) || isStaffRole(loggedInUserDetail))
  ) {
    return <Redirect to="/inbox" />;
  }

  const isDataEmpty = (dataObj: any) => dataObj.data.length !== 0;
  const filterChartData = (dataArr: any) => {
    let chartArray = dataArr.filter(isDataEmpty, dataArr);

    if (selectedSegments.length > 0) {
      if (!showCompanyData) {
        chartArray = chartArray.filter((dataObj: any) => dataObj.isSegment);
      } else {
        chartArray = chartArray.filter((dataObj: any) => !dataObj.isPrev);
      }
    }

    if (isDataReady) return chartArray;
    return [];
  };

  const exportData = async () => {
    if (selectedSegments.length <= 0) {
      try {
        setIsExportingData(true);
        const queryEndDate = endDate.clone();
        const result = await post(
          `${POST_EXPORT_ANALYTICS_DATA_BACKGROUND}?${buildParamString({
            from: startDate.format("YYYY-MM-DD"),
            to: queryEndDate.format("YYYY-MM-DD"),
          })}`,
          { param: {} }
        );

        if (result) {
          taskId.current = result.id;
        }
      } catch (e) {
        console.error("export analytics data", e);
      } finally {
        setIsExportingData(false);
      }
    }
  };

  const formattedChartOptions = (options: any) => {
    return {
      ...options,
      xaxis: {
        ...options.xaxis,
        categories: timePeriod,
      },
    };
  };

  const broadcastPercent = (all: any, compare: any) => {
    if (typeof all == "number" && typeof compare == "number") {
      if (all == 0 && compare == 0) {
        return "0%";
      }
      if (all == 0) {
        return "100%";
      }
      return `${((compare / all) * 100).toFixed(1)}%`;
    }
  };

  return (
    <div className={`post-login channel-selection`}>
      <PostLogin selectedItem={"Analytics"}>
        <>
          <Helmet title={`${t("analytics.title")} | SleekFlow`} />
          <div
            className={`channel-selection__main main`}
            style={{ minWidth: 1320 }}
          >
            <DashboardContainer
              className="channel-selection__body"
              style={{ overflowX: "hidden" }}
            >
              <DashboardHeader>
                <h3>{t("analytics.title")}</h3>
                <div>
                  <ExportButtonWrapper>
                    {selectedSegments.length <= 0 ? (
                      <Button
                        className="feedback-button"
                        loading={isExportingData}
                        onClick={exportData}
                      >
                        {t("analytics.export")}
                      </Button>
                    ) : (
                      ""
                    )}
                    <ComparisonButton
                      className="feedback-button primary"
                      onClick={() => setIsComparisonDrawerOpen(true)}
                    >
                      {t("analytics.manageSegments")}
                    </ComparisonButton>
                  </ExportButtonWrapper>
                </div>
              </DashboardHeader>
              <FiltersContainer>
                <div className={styles.filtersWrap}>
                  <DateRangeFilter
                    startDate={startDate.clone()}
                    endDate={endDate.clone()}
                    maxDate={YESTERDAY.clone()}
                    setDates={(start, end) => {
                      setStartDate(start);
                      setEndDate(end);
                      setPrevPeriod({
                        count: end
                          .clone()
                          .endOf("day")
                          ?.diff(start.startOf("day"), "day"),
                        unit: "day",
                      });
                    }}
                    showComparedPeriod={selectedSegments.length === 0}
                  />
                  <div className={styles.filtersApplied}>
                    {selectedSegments.length > 0 && (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div style={{ margin: "0px 8px" }}>
                          {t("analytics.showSelectedSegment")}
                        </div>
                        <Checkbox
                          className="toggle-checkbox"
                          fitted
                          toggle
                          checked={showCompanyData}
                          onChange={() => {
                            setShowCompanyData(!showCompanyData);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ width: 600 }}>
                  <form className="ui form">
                    <Dropdown
                      placeholder={t("analytics.selectSegmentPlaceholder")}
                      value={selectedSegments}
                      upward={false}
                      multiple
                      options={segmentOptions}
                      onChange={(_, data) => {
                        handleSelectSegment(data.value as any);
                      }}
                    ></Dropdown>
                  </form>
                </div>
              </FiltersContainer>
              <ChartsContainer>
                <div>
                  {RowOneCharts.map((chart) => (
                    <ChartCard key={chart.title}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <InfoTooltip
                            placement={"top"}
                            children={chart.tooltip}
                            trigger={
                              <ChartCardHeader>{chart.title}</ChartCardHeader>
                            }
                          />
                          {chart.current !== "" &&
                          chart.prev !== "" &&
                          selectedSegments.length <= 0 ? (
                            <PercentageBadge
                              current={chart.current}
                              prev={chart.prev}
                            />
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                      {chart.current !== "" && chart.prev !== "" ? (
                        <>
                          {selectedSegments.length <= 0 ||
                          (showCompanyData && selectedSegments.length > 0) ? (
                            <ChartCardValue>{chart.current}</ChartCardValue>
                          ) : (
                            ""
                          )}
                          {selectedSegments.length > 0 ? (
                            ""
                          ) : (
                            <ChartCardPrevValue>
                              {chart.prev}
                            </ChartCardPrevValue>
                          )}
                        </>
                      ) : (
                        ""
                      )}
                      {selectedSegments.length > 1 ? (
                        <div style={{ display: "flex" }}>
                          <div
                            style={{
                              color: "#FF9C7A",
                              fontWeight: 500,
                              fontSize: 16,
                              marginRight: 8,
                            }}
                          >
                            {firstSegmentSummary[chart.key]}
                          </div>
                          <div
                            style={{
                              color: "#6EB33B",
                              fontWeight: 500,
                              fontSize: 16,
                            }}
                          >
                            {secondSegmentSummary[chart.key]}
                          </div>
                        </div>
                      ) : selectedSegments.length > 0 ? (
                        <div style={{ display: "flex" }}>
                          <div
                            style={{
                              color: "#FF9C7A",
                              fontWeight: 500,
                              fontSize: 16,
                              marginRight: 8,
                            }}
                          >
                            {firstSegmentSummary[chart.key]}
                          </div>
                        </div>
                      ) : (
                        ""
                      )}
                      <StyledChart
                        key={chart.title}
                        series={filterChartData(chart.data)}
                        options={formattedChartOptions(chartOption)}
                        type="line"
                        height={200}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 12,
                        }}
                      >
                        <div>{moment(startDate).format("D MMM")}</div>
                        <div>{moment(endDate).format("D MMM")}</div>
                      </div>
                    </ChartCard>
                  ))}
                </div>
              </ChartsContainer>
              <ChartsContainer>
                <div>
                  {RowTwoCharts.map((chart) => (
                    <ChartCard key={chart.title}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <InfoTooltip
                            placement={"top"}
                            children={chart.tooltip}
                            trigger={
                              <ChartCardHeader>{chart.title}</ChartCardHeader>
                            }
                          />
                          {chart.timeOption &&
                          chart.current !== "" &&
                          chart.prev !== "" &&
                          selectedSegments.length <= 0 ? (
                            <PercentageBadge
                              prevTime={chart.prevInMins}
                              currentTime={chart.currentInMins}
                            />
                          ) : (
                            ""
                          )}
                          {!chart.timeOption &&
                          chart.current !== "" &&
                          chart.prev !== "" &&
                          selectedSegments.length <= 0 ? (
                            <PercentageBadge
                              current={chart.current}
                              prev={chart.prev}
                            />
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                      {chart.current !== "" && chart.prev !== "" ? (
                        <>
                          {selectedSegments.length <= 0 ||
                          (showCompanyData && selectedSegments.length > 0) ? (
                            <ChartCardValue>{chart.current}</ChartCardValue>
                          ) : (
                            ""
                          )}
                          {selectedSegments.length > 0 ? (
                            ""
                          ) : (
                            <ChartCardPrevValue>
                              {chart.prev}
                            </ChartCardPrevValue>
                          )}
                        </>
                      ) : (
                        ""
                      )}
                      {selectedSegments.length > 1 ? (
                        <div
                          style={{
                            display: "flex",
                            fontSize: 16,
                            fontWeight: 500,
                          }}
                        >
                          <div
                            style={{
                              color: "#FF9C7A",
                              fontWeight: 500,
                              fontSize: 16,
                              marginRight: 8,
                            }}
                          >
                            {firstSegmentSummary[chart.key]}
                          </div>
                          <div
                            style={{
                              color: "#6EB33B",
                              fontWeight: 500,
                              fontSize: 16,
                            }}
                          >
                            {secondSegmentSummary[chart.key]}
                          </div>
                        </div>
                      ) : selectedSegments.length > 0 ? (
                        <div style={{ display: "flex" }}>
                          <div
                            style={{
                              color: "#FF9C7A",
                              fontWeight: 500,
                              fontSize: 16,
                              marginRight: 8,
                            }}
                          >
                            {firstSegmentSummary[chart.key]}
                          </div>
                        </div>
                      ) : (
                        ""
                      )}
                      <StyledChart
                        series={filterChartData(chart.data)}
                        options={formattedChartOptions(
                          chart.timeOption ? timeChartOption : chartOption
                        )}
                        type="line"
                        height={200}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 12,
                        }}
                      >
                        <div>{moment(startDate).format("D MMM")}</div>
                        <div>{moment(endDate).format("D MMM")}</div>
                      </div>
                    </ChartCard>
                  ))}
                </div>
              </ChartsContainer>
              <ChartsContainer>
                <div>
                  <ChartCard>
                    <div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <ChartCardHeader>
                          {t("analytics.broadcast-msgs")}
                        </ChartCardHeader>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "space-between",
                          }}
                        >
                          <div style={{ width: "15%", marginTop: 30 }}>
                            <BroadcastStat>
                              <IconContainer>
                                <svg
                                  className="w-6 h-6"
                                  fill="none"
                                  stroke="#6078FF"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                  />
                                </svg>
                              </IconContainer>
                              <div>
                                <ChartCardHeader>
                                  {t("analytics.deliver-rate")}
                                </ChartCardHeader>
                                <ChartCardValue>
                                  {broadcastPercent(sentMsg, deliveredMsg)}
                                </ChartCardValue>
                              </div>
                            </BroadcastStat>
                            <BroadcastStat>
                              <IconContainer>
                                <svg
                                  className="w-6 h-6"
                                  fill="none"
                                  stroke="#6078ff"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </IconContainer>
                              <div>
                                <ChartCardHeader>
                                  {t("analytics.bounce-rate")}
                                </ChartCardHeader>
                                <ChartCardValue>
                                  {broadcastPercent(sentMsg, bouncedMsg)}
                                </ChartCardValue>
                              </div>
                            </BroadcastStat>
                            <BroadcastStat>
                              <IconContainer>
                                <svg
                                  className="w-6 h-6"
                                  fill="none"
                                  stroke="#6078FF"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                                  />
                                </svg>
                              </IconContainer>
                              <div>
                                <ChartCardHeader>
                                  {t("analytics.read-rate")}
                                </ChartCardHeader>
                                <ChartCardValue>
                                  {broadcastPercent(sentMsg, readMsg)}
                                </ChartCardValue>
                              </div>
                            </BroadcastStat>
                            <BroadcastStat>
                              <IconContainer>
                                <svg
                                  className="w-6 h-6"
                                  fill="none"
                                  stroke="#6078FF"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                                  />
                                </svg>
                              </IconContainer>
                              <div>
                                <ChartCardHeader>
                                  {t("analytics.reply-rate")}
                                </ChartCardHeader>
                                <ChartCardValue>
                                  {broadcastPercent(sentMsg, repliedMsg)}
                                </ChartCardValue>
                              </div>
                            </BroadcastStat>
                          </div>
                          <div style={{ width: "80%" }}>
                            <StyledChart
                              series={BROADCAST_DATA}
                              options={BAR_CHART_OPTION}
                              height={350}
                              type="bar"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </ChartCard>
                </div>
              </ChartsContainer>
            </DashboardContainer>
            <ContactSidebar
              visible={isComparisonDrawerOpen}
              onHide={() => setIsComparisonDrawerOpen(false)}
              getSegmentList={getSegmentList}
              segmentList={segmentList}
            />
            <UpgradePopup opened={cannotUseAnalytics} />
          </div>
        </>
      </PostLogin>
    </div>
  );
};

export default AnalyticsDashboard;
