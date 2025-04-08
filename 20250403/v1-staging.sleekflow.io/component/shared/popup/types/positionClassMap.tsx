import { Placement } from "@popperjs/core";

export const positionClassMap: Record<Placement, string> = {
  bottom: "bottom center",
  "bottom-end": "bottom right",
  "bottom-start": "bottom left",
  "auto-end": "right center",
  "auto-start": "left center",
  auto: "no-arrow",
  top: "top center",
  "top-start": "top left",
  "top-end": "top right",
  left: "left center",
  "left-start": "left center",
  "left-end": "left center",
  right: "right center",
  "right-end": "right center",
  "right-start": "right center",
};
