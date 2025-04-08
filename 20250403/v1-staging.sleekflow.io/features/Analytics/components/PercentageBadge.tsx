import React from "react";
import styled from "styled-components";
import { Either } from "utility/types/Either";

type PercentageBadgeProps = {
  background: string;
  color: string;
};

export function PercentageBadge(
  props: Either<
    { current: string | number; prev: string | number },
    { currentTime: string; prevTime: string }
  >
) {
  const percentageDiff = (current: string | number, prev: string | number) => {
    const currentNumber =
      typeof current === "string" ? parseInt(current) : current;
    const prevNumber = typeof prev === "string" ? parseInt(prev) : prev;

    if (prevNumber === 0) {
      return {
        background: "#cbf4c9",
        color: "#0f6245",
        isPositive: true,
        value: "+100.0%",
      };
    }

    const difference = (currentNumber - prevNumber) / prevNumber;

    if (![0, -0].includes(difference)) {
      return {
        background: difference <= 0 ? "#F8E3DE" : "#cbf4c9",
        color: difference <= 0 ? "#982C50" : "#0f6245",
        isPositive: difference <= 0,
        value: `${difference >= 0 ? "+" : ""}${(difference * 100).toFixed(1)}%`,
      };
    }
    return {
      background: "",
      color: "",
      value: `${difference > 0 ? "+" : ""}${(
        Math.abs(difference) * 100
      ).toFixed(1)}%`,
    };
  };

  const timePercentageDiff = (current: string, prev: string) => {
    if (parseInt(prev) == 0) {
      return {
        background: "#cbf4c9",
        color: "#0f6245",
        isPositive: false,
        value: "+100.0%",
      };
    }
    const difference = (parseInt(current) - parseInt(prev)) / parseInt(prev);
    if (![0, -0].includes(difference)) {
      return {
        background: difference >= 0 ? "#F8E3DE" : "#cbf4c9",
        color: difference >= 0 ? "#982C50" : "#0f6245",
        isPositive: difference <= 0,
        value: `${difference >= 0 ? "+" : ""}${(difference * 100).toFixed(1)}%`,
      };
    }
    return {
      background: "",
      color: "",
      value: `${difference >= 0 ? "+" : ""}${(
        Math.abs(difference) * 100
      ).toFixed(1)}%`,
    };
  };
  let diffData: ReturnType<typeof percentageDiff>;
  if (props.current !== undefined) {
    diffData = percentageDiff(props.current, props.prev);
  } else {
    diffData = timePercentageDiff(props.currentTime, props.prevTime);
  }

  const Badge = styled.div`
    display: inline-flex;
    align-items: center;
    margin-left: 8px;
    padding: 2px 8px;
    font-size: 12px;
    border-radius: 5px;
    line-height: 1.6;
    font-weight: 700;
    background: ${(p: PercentageBadgeProps) =>
      p.background ? p.background : "#e3e8ee"};
    color: ${(p: PercentageBadgeProps) => (p.color ? p.color : "#3c4257")};
  `;

  return (
    <Badge background={diffData.background} color={diffData.color}>
      {diffData.value}
    </Badge>
  );
}
