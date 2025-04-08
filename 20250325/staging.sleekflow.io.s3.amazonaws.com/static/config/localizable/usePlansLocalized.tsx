import { PlanDisplayType } from "../../types/PlanSelectionType";
import { useTranslation } from "react-i18next";
import { clone } from "ramda";

export function usePlansLocalized() {
  const { t } = useTranslation();

  const selectionPlans: PlanDisplayType[] = [
    {
      planId: "sleekflow_free",
      planTitle: t("plans.selection.free.title"),
      priceDescription: t("plans.selection.free.priceDescription"),
      price: "0",
      planDetailDescriptions: t("plans.selection.free.detailDescriptions", {
        returnObjects: true,
      }),
      agentIncluded: 1,
      extraChatAgentPrice: 9,
      planDescriptions: t("plans.selection.free.descriptions", {
        returnObjects: true,
      }),
    },
    {
      planId: "sleekflow_pro",
      planTitle: t("plans.selection.pro.title"),
      price: "39",
      agentIncluded: 1,
      extraChatAgentPrice: 9,
      priceDescription: t("plans.selection.pro.priceDescription"),
      planDetailDescriptions: [""],
      planDescriptions: t("plans.selection.pro.descriptions", {
        returnObjects: true,
      }),
    },
  ];
  const monthlyPlanList: PlanDisplayType[] = [
    {
      planId: "sleekflow_freemium",
      planTitle: t("plans.selection.freemium.title"),
      price: "",
      agentIncluded: 3,
      extraChatAgentPrice: 0,
      messageTotal: 5000,
      priceDescription: t("plans.selection.freemium.priceDescription"),
      planDetailDescriptions: t("plans.selection.freemium.detailDescriptions", {
        returnObjects: true,
      }),
      planDescriptions: t("plans.selection.freemium.descriptions", {
        returnObjects: true,
      }),
    },
    {
      planId: "sleekflow_v3_pro",
      planTitle: t("plans.selection.proV3Select.title"),
      price: "99",
      agentIncluded: 3,
      extraChatAgentPrice: 19,
      messageTotal: 5000,
      priceDescription: t("plans.selection.proV3Select.priceDescription"),
      planDetailDescriptions: t(
        "plans.selection.proV3Select.detailDescriptions",
        { returnObjects: true }
      ),
      planDescriptions: t("plans.selection.proV3Select.descriptions", {
        returnObjects: true,
      }),
    },
    {
      planId: "sleekflow_v4_premium_monthly",
      planTitle: t("plans.selection.v4PremiumMonthly.title"),
      price: "349",
      agentIncluded: 5,
      extraChatAgentPrice: 39,
      messageTotal: 20000,
      priceDescription: t("plans.selection.v4PremiumMonthly.priceDescription"),
      planDetailDescriptions: t(
        "plans.selection.v4PremiumMonthly.detailDescriptions",
        { returnObjects: true }
      ),
      planDescriptions: t("plans.selection.v4PremiumMonthly.descriptions", {
        returnObjects: true,
      }),
    },
  ];
  const yearlyPlanList: PlanDisplayType[] = [
    {
      planId: "sleekflow_v5_pro_yearly",
      planTitle: t("plans.selection.proV5Yearly.title"),
      price: "79",
      agentIncluded: 3,
      extraChatAgentPrice: 19,
      messageTotal: 5000,
      priceDescription: t("plans.selection.proV5Yearly.priceDescription"),
      planDetailDescriptions: t(
        "plans.selection.proV5Yearly.detailDescriptions",
        { returnObjects: true }
      ),
      planDescriptions: t("plans.selection.proV5Yearly.descriptions", {
        returnObjects: true,
      }),
    },
    {
      planId: "sleekflow_v4_premium_yearly",
      planTitle: t("plans.selection.v4PremiumYearly.title"),
      price: "299",
      agentIncluded: 5,
      extraChatAgentPrice: 39,
      messageTotal: 20000,
      priceDescription: t("plans.selection.v4PremiumYearly.priceDescription"),
      planDetailDescriptions: t(
        "plans.selection.v4PremiumYearly.detailDescriptions",
        { returnObjects: true }
      ),
      planDescriptions: t("plans.selection.v4PremiumYearly.descriptions", {
        returnObjects: true,
      }),
    },
  ];
  const yearlyPlanListv6: PlanDisplayType[] = [
    {
      planId: "sleekflow_v6_pro_yearly",
      planTitle: t("plans.selection.proV6Yearly.title"),
      price: "79",
      agentIncluded: 3,
      extraChatAgentPrice: 19,
      messageTotal: 5000,
      priceDescription: t("plans.selection.proV6Yearly.priceDescription"),
      planDetailDescriptions: t(
        "plans.selection.proV6Yearly.detailDescriptions",
        { returnObjects: true }
      ),
      planDescriptions: t("plans.selection.proV6Yearly.descriptions", {
        returnObjects: true,
      }),
    },
    {
      planId: "sleekflow_v6_premium_yearly",
      planTitle: t("plans.selection.v6PremiumYearly.title"),
      price: "299",
      agentIncluded: 5,
      extraChatAgentPrice: 39,
      messageTotal: 20000,
      priceDescription: t("plans.selection.v6PremiumYearly.priceDescription"),
      planDetailDescriptions: t(
        "plans.selection.v6PremiumYearly.detailDescriptions",
        { returnObjects: true }
      ),
      planDescriptions: t("plans.selection.v6PremiumYearly.descriptions", {
        returnObjects: true,
      }),
    },
  ];
  const yearlyPlanListv7: PlanDisplayType[] = [
    {
      planId: "sleekflow_v7_pro_yearly",
      planTitle: t("plans.selection.proV7Yearly.title"),
      price: "79",
      agentIncluded: 3,
      extraChatAgentPrice: 19,
      messageTotal: 5000,
      priceDescription: t("plans.selection.proV7Yearly.priceDescription"),
      planDetailDescriptions: t(
        "plans.selection.proV7Yearly.detailDescriptions",
        { returnObjects: true }
      ),
      planDescriptions: t("plans.selection.proV7Yearly.descriptions", {
        returnObjects: true,
      }),
    },
    {
      planId: "sleekflow_v7_premium_yearly",
      planTitle: t("plans.selection.v7PremiumYearly.title"),
      price: "299",
      agentIncluded: 5,
      extraChatAgentPrice: 39,
      messageTotal: 20000,
      priceDescription: t("plans.selection.v7PremiumYearly.priceDescription"),
      planDetailDescriptions: t(
        "plans.selection.v7PremiumYearly.detailDescriptions",
        { returnObjects: true }
      ),
      planDescriptions: t("plans.selection.v7PremiumYearly.descriptions", {
        returnObjects: true,
      }),
    },
  ];
  const monthlyPlanListv6: PlanDisplayType[] = [
    {
      planId: "sleekflow_freemium",
      planTitle: t("plans.selection.freemium.title"),
      price: "",
      agentIncluded: 3,
      extraChatAgentPrice: 0,
      messageTotal: 5000,
      priceDescription: t("plans.selection.freemium.priceDescription"),
      planDetailDescriptions: t("plans.selection.freemium.detailDescriptions", {
        returnObjects: true,
      }),
      planDescriptions: t("plans.selection.freemium.descriptions", {
        returnObjects: true,
      }),
    },
    {
      planId: "sleekflow_v6_pro_monthly",
      planTitle: t("plans.selection.v6ProMonthly.title"),
      price: "99",
      agentIncluded: 3,
      extraChatAgentPrice: 19,
      messageTotal: 5000,
      priceDescription: t("plans.selection.v6ProMonthly.priceDescription"),
      planDetailDescriptions: t(
        "plans.selection.v6ProMonthly.detailDescriptions",
        { returnObjects: true }
      ),
      planDescriptions: t("plans.selection.v6ProMonthly.descriptions", {
        returnObjects: true,
      }),
    },
    {
      planId: "sleekflow_v6_premium_monthly",
      planTitle: t("plans.selection.v6PremiumMonthly.title"),
      price: "349",
      agentIncluded: 5,
      extraChatAgentPrice: 39,
      messageTotal: 20000,
      priceDescription: t("plans.selection.v6PremiumMonthly.priceDescription"),
      planDetailDescriptions: t(
        "plans.selection.v6PremiumMonthly.detailDescriptions",
        { returnObjects: true }
      ),
      planDescriptions: t("plans.selection.v6PremiumMonthly.descriptions", {
        returnObjects: true,
      }),
    },
  ];
  const monthlyPlanListv7: PlanDisplayType[] = [
    {
      planId: "sleekflow_freemium",
      planTitle: t("plans.selection.freemium.title"),
      price: "",
      agentIncluded: 3,
      extraChatAgentPrice: 0,
      messageTotal: 5000,
      priceDescription: t("plans.selection.freemium.priceDescription"),
      planDetailDescriptions: t("plans.selection.freemium.detailDescriptions", {
        returnObjects: true,
      }),
      planDescriptions: t("plans.selection.freemium.descriptions", {
        returnObjects: true,
      }),
    },
    {
      planId: "sleekflow_v7_pro_monthly",
      planTitle: t("plans.selection.v7ProMonthly.title"),
      price: "99",
      agentIncluded: 3,
      extraChatAgentPrice: 19,
      messageTotal: 2000,
      priceDescription: t("plans.selection.v7ProMonthly.priceDescription"),
      planDetailDescriptions: t(
        "plans.selection.v7ProMonthly.detailDescriptions",
        { returnObjects: true }
      ),
      planDescriptions: t("plans.selection.v7ProMonthly.descriptions", {
        returnObjects: true,
      }),
    },
    {
      planId: "sleekflow_v7_premium_monthly",
      planTitle: t("plans.selection.v7PremiumMonthly.title"),
      price: "349",
      agentIncluded: 5,
      extraChatAgentPrice: 39,
      messageTotal: 10000,
      priceDescription: t("plans.selection.v7PremiumMonthly.priceDescription"),
      planDetailDescriptions: t(
        "plans.selection.v7PremiumMonthly.detailDescriptions",
        { returnObjects: true }
      ),
      planDescriptions: t("plans.selection.v7PremiumMonthly.descriptions", {
        returnObjects: true,
      }),
    },
  ];
  const settingSelectPlanList: PlanDisplayType[] = [
    {
      planId: "sleekflow_v2_standard",
      planTitle: t("plans.selection.v2Standard.title"),
      price: "19",
      messageTotal: 100,
      agentIncluded: 1,
      extraChatAgentPrice: 9,
      priceDescription: t("plans.selection.v2Standard.priceDescription"),
      planDetailDescriptions: t(
        "plans.selection.v2Standard.detailDescriptions",
        { returnObjects: true }
      ),
      planDescriptions: t("plans.selection.v2Standard.planDescriptions", {
        returnObjects: true,
      }),
    },
    {
      planId: "sleekflow_v2_pro",
      planTitle: t("plans.selection.v2Pro.title"),
      price: "79",
      agentIncluded: 3,
      extraChatAgentPrice: 19,
      messageTotal: 5000,
      priceDescription: t("plans.selection.v2Pro.priceDescription"),
      planDetailDescriptions: t("plans.selection.v2Pro.detailDescriptions", {
        returnObjects: true,
      }),
      planDescriptions: t("plans.selection.v2Pro.descriptions", {
        returnObjects: true,
      }),
    },
    {
      planId: "sleekflow_v2_premium",
      planTitle: t("plans.selection.v2Premium.title"),
      price: "299",
      agentIncluded: 5,
      extraChatAgentPrice: 39,
      messageTotal: 20000,
      priceDescription: t("plans.selection.v2Premium.priceDescription"),
      planDetailDescriptions: t(
        "plans.selection.v2Premium.detailDescriptions",
        { returnObjects: true }
      ),
      planDescriptions: t("plans.selection.v2Premium.descriptions", {
        returnObjects: true,
      }),
    },
    {
      planId: "sleekflow_v3_standard",
      planTitle: t("plans.selection.v3Standard.title"),
      price: "49",
      messageTotal: 100,
      agentIncluded: 1,
      extraChatAgentPrice: 9,
      priceDescription: t("plans.selection.v3Standard.priceDescription"),
      planDetailDescriptions: t(
        "plans.selection.v3Standard.detailDescriptions",
        { returnObjects: true }
      ),
      planDescriptions: t("plans.selection.v3Standard.descriptions", {
        returnObjects: true,
      }),
    },
    {
      planId: "sleekflow_v3_pro",
      planTitle: t("plans.selection.v3ProMonthly.title"),
      price: "99",
      agentIncluded: 3,
      extraChatAgentPrice: 19,
      messageTotal: 5000,
      priceDescription: t("plans.selection.v3ProMonthly.priceDescription"),
      planDetailDescriptions: t(
        "plans.selection.v3ProMonthly.detailDescriptions",
        { returnObjects: true }
      ),
      planDescriptions: t("plans.selection.v3ProMonthly.descriptions", {
        returnObjects: true,
      }),
    },
    {
      planId: "sleekflow_v3_premium",
      planTitle: t("plans.selection.v3Premium.title"),
      price: "299",
      agentIncluded: 5,
      extraChatAgentPrice: 39,
      messageTotal: 20000,
      priceDescription: t("plans.selection.v3Premium.priceDescription"),
      planDetailDescriptions: t(
        "plans.selection.v3Premium.detailDescriptions",
        { returnObjects: true }
      ),
      planDescriptions: t("plans.selection.v3Premium.descriptions", {
        returnObjects: true,
      }),
    },
  ];
  return {
    monthlyPlanList: clone(monthlyPlanListv7),
    selectionPlans: clone(selectionPlans),
    settingSelectPlanList: clone(settingSelectPlanList),
    yearlyPlanList: clone(yearlyPlanListv7),
  };
}
