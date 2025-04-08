import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Container,
  Dimmer,
  Header,
  Image,
  Loader,
} from "semantic-ui-react";
import { get, post } from "../api/apiRequest";
import { Redirect } from "react-router-dom";
import { GET_STRIPE_SETUP, POST_COMPANY_REGISTER } from "../api/apiPath";
import Sleekflow_logo_2x from "../assets/images/Sleekflow_logo_2x.svg";
import StartUpImg from "../assets/images/startup.svg";
import BuildingImg from "../assets/images/buildings.svg";
import GrowthImg from "../assets/images/growth.svg";
import PlanResponseType, { PlanDisplayType } from "../types/PlanSelectionType";
import PlanSelectionDiscountSidebar from "./CreateAccount/PlanSelectionDiscountSidebar";
import { usePlansLocalized } from "../config/localizable/usePlansLocalized";
import { clone } from "ramda";

interface PlanSelectionProps {
  activeItem: string;
  planId?: string;
  companyName: string;
  companySize: string;
  phoneNumber: string;
}

export default (props: PlanSelectionProps) => {
  const { planId, activeItem, companyName, companySize, phoneNumber } = props;
  const [loading, isLoading] = useState(false);
  const [isRedirect, setRedirect] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanDisplayType>();
  const { selectionPlans } = usePlansLocalized();
  const [selectionPlanList, setSelectionPlanList] = useState<PlanDisplayType[]>(
    clone(selectionPlans)
  );
  const getPlanDetails = async () => {
    const result: PlanResponseType = await get(GET_STRIPE_SETUP, { param: {} });
    const selectioinPlanList = selectionPlanList.map((selectionPlan, index) => {
      const foundIndex = result.plans.findIndex(
        (plan) => plan.id === selectionPlan.planId
      );
      const foundPlanDescription = selectionPlan.planDescriptions.findIndex(
        (planDescription) => planDescription.includes("${contact}")
      );
      if (foundIndex > -1) {
        selectionPlan.planDescriptions[foundPlanDescription] =
          selectionPlan.planDescriptions[foundPlanDescription].replace(
            "${contact}",
            result.plans[foundIndex].maximumContact + ""
          );
      }
      return {
        ...selectionPlan,
        planDescriptions: selectionPlan.planDescriptions,
        price: result.plans[foundIndex].amount + "",
        planId: result.plans[foundIndex].id,
      };
    });
    const foundSelectionPlan = selectioinPlanList.find(
      (selectionPlan) => selectionPlan.planId === planId
    );
    if (foundSelectionPlan) {
      setSelectedPlan(foundSelectionPlan);
    }
    setSelectionPlanList(selectioinPlanList);
  };
  useEffect(() => {
    getPlanDetails();
  }, []);
  const submitCompanyRegisterInfo = async () => {
    isLoading(true);
    await post(POST_COMPANY_REGISTER, {
      param: {
        companyName,
        subscriptionPlanId: (selectedPlan && selectedPlan.planId) || planId,
        companySize,
        timeZoneInfoId: "China Standard Time",
        phoneNumber,
      },
    });
    isLoading(false);
    setRedirect(true);
  };
  const handleClick = (e: React.MouseEvent, plan: PlanDisplayType) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedPlan(plan);
  };
  return isRedirect ? (
    <Redirect to="/success" />
  ) : loading ? (
    <Dimmer active inverted>
      <Loader inverted>
        <div className="p2">
          Hang in there! We are setting things up for you...
        </div>
      </Loader>
    </Dimmer>
  ) : (
    <div
      className={`plan-selection ${(activeItem === "plan" && "show") || ""}`}
    >
      <Container
        className={`plan-selection ${(activeItem === "plan" && "show") || ""}`}
      >
        <Header>
          <a href="https://sleekflow.io" target="_blank" className="logo">
            <Image src={Sleekflow_logo_2x} />
          </a>
        </Header>
        <div className="content">
          <Header as="h4">Confirm Your Plan.</Header>
          <div className="container">
            {selectionPlanList.length &&
              selectionPlanList.map((selectionPlan) => (
                <Card
                  className={`${
                    (selectedPlan &&
                      selectedPlan.planId === selectionPlan.planId &&
                      "selected") ||
                    ""
                  }`}
                >
                  <Card.Content>
                    {selectionPlan.planId.toLowerCase().includes("free") && (
                      <Image src={StartUpImg} />
                    )}
                    {selectionPlan.planId.toLowerCase().includes("growth") && (
                      <Image src={GrowthImg} />
                    )}
                    {selectionPlan.planId.toLowerCase().includes("pro") && (
                      <Image src={BuildingImg} />
                    )}
                    <div className="p2-bold">{selectionPlan.planTitle}</div>
                    <Header as="h4">
                      ${selectionPlan.price}/{selectionPlan.priceDescription}
                    </Header>
                    <ul>
                      {selectionPlan.planDescriptions.map((plan) => (
                        <li>{plan}</li>
                      ))}
                    </ul>
                    <Button
                      className={
                        (selectedPlan &&
                          selectedPlan.planId === selectionPlan.planId &&
                          "disabled") ||
                        ""
                      }
                      onClick={(e) => handleClick(e, selectionPlan)}
                    >
                      {(selectedPlan &&
                        selectedPlan.planId === selectionPlan.planId &&
                        "Selected") ||
                        "Choose"}
                    </Button>
                  </Card.Content>
                </Card>
              ))}
          </div>
        </div>
      </Container>
      <PlanSelectionDiscountSidebar
        subscriptionName={selectedPlan && selectedPlan.planTitle}
        onClick={submitCompanyRegisterInfo}
        selectedPlanDescription={selectedPlan && selectedPlan.planDescriptions}
        priceDescription={
          selectedPlan &&
          `$${Math.floor(Number(selectedPlan.price) * 0.8)}/${
            selectedPlan.priceDescription
          }`
        }
      />
    </div>
  );
};
