import React, { useState, useContext, useEffect } from "react";
import { Header, Button, Icon } from "semantic-ui-react";
import { Redirect } from "react-router";
interface PlanSelectionSidebarProps {
  selectedPlanDescription?: string[];
  priceDescription?: string;
  subscriptionName?: string;
  onClick: Function;
}
export default (props: PlanSelectionSidebarProps) => {
  const {
    selectedPlanDescription,
    subscriptionName,
    priceDescription,
    onClick,
  } = props;
  useEffect(() => {}, [props]);
  const submitInfo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };
  return (
    <div className="plan-selection-sidebar">
      <Header as="h4">Your Cart</Header>
      {selectedPlanDescription && selectedPlanDescription.length > 0 && (
        <div className="selected-plan">
          <div className="selected-plan-description">
            <div className="p2-bold">{subscriptionName || ""}</div>
            <ul>
              {selectedPlanDescription.map((description) => (
                <li>{description}</li>
              ))}
            </ul>
          </div>
          <div className="total-description">
            <div className="total p3">
              <span>Total after trial (20% off)</span>
              <span>{priceDescription}</span>
            </div>
            <div className="total p2-bold">
              <span>Due today</span>
              <span>$0</span>
            </div>
            <Button className="confirm" onClick={submitInfo}>
              Get Started
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
