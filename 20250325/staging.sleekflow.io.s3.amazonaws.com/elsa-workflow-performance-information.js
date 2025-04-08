import { Component, h, Prop } from '@stencil/core';
import moment from 'moment';
import { durationToString } from '../../../utils/utils';
export class ElsaWorkflowPerformanceInformation {
  render() {
    if (!this.activityStats)
      return undefined;
    return [
      h("a", { href: "#", class: "-elsa-m-3 elsa-p-3 elsa-flex elsa-items-start elsa-rounded-lg hover:elsa-bg-gray-50 elsa-transition elsa-ease-in-out elsa-duration-150" },
        h("svg", { class: "elsa-flex-shrink-0 elsa-h-6 elsa-w-6 elsa-text-blue-600", width: "24", height: "24", viewBox: "0 0 24 24", "stroke-width": "2", stroke: "currentColor", fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" },
          h("path", { stroke: "none", d: "M0 0h24v24H0z" }),
          h("rect", { x: "4", y: "5", width: "16", height: "16", rx: "2" }),
          h("line", { x1: "16", y1: "3", x2: "16", y2: "7" }),
          h("line", { x1: "8", y1: "3", x2: "8", y2: "7" }),
          h("line", { x1: "4", y1: "11", x2: "20", y2: "11" }),
          h("line", { x1: "11", y1: "15", x2: "12", y2: "15" }),
          h("line", { x1: "12", y1: "15", x2: "12", y2: "18" })),
        h("div", { class: "elsa-ml-4" },
          h("p", { class: "elsa-text-base elsa-font-medium elsa-text-gray-900" }, "Average Execution Time"),
          h("p", { class: "elsa-mt-1 elsa-text-sm elsa-text-gray-500" }, durationToString(moment.duration(this.activityStats.averageExecutionTime))))),
      h("a", { href: "#", class: "-m-3 elsa-p-3 elsa-flex elsa-items-start elsa-rounded-lg hover:elsa-bg-gray-50 elsa-transition elsa-ease-in-out elsa-duration-150" },
        h("svg", { class: "elsa-flex-shrink-0 elsa-h-6 elsa-w-6 elsa-text-green-500", width: "24", height: "24", viewBox: "0 0 24 24", "stroke-width": "2", stroke: "currentColor", fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" },
          h("path", { stroke: "none", d: "M0 0h24v24H0z" }),
          h("circle", { cx: "12", cy: "12", r: "9" }),
          h("polyline", { points: "12 7 12 12 15 15" })),
        h("div", { class: "elsa-ml-4" },
          h("p", { class: "elsa-text-base elsa-font-medium elsa-text-gray-900" }, "Fastest Execution Time"),
          h("p", { class: "elsa-mt-1 elsa-text-sm elsa-text-gray-500" }, durationToString(moment.duration(this.activityStats.fastestExecutionTime))))),
      h("a", { href: "#", class: "-elsa-m-3 elsa-p-3 elsa-flex elsa-items-start elsa-rounded-lg hover:elsa-bg-gray-50 elsa-transition elsa-ease-in-out elsa-duration-150" },
        h("svg", { class: "elsa-flex-shrink-0 elsa-h-6 elsa-w-6 elsa-text-yellow-500", width: "24", height: "24", viewBox: "0 0 24 24", "stroke-width": "2", stroke: "currentColor", fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" },
          h("path", { stroke: "none", d: "M0 0h24v24H0z" }),
          h("circle", { cx: "12", cy: "12", r: "9" }),
          h("polyline", { points: "12 7 12 12 15 15" })),
        h("div", { class: "elsa-ml-4" },
          h("p", { class: "elsa-text-base elsa-font-medium elsa-text-gray-900" }, "Slowest Execution Time"),
          h("p", { class: "elsa-mt-1 elsa-text-sm elsa-text-gray-500" }, durationToString(moment.duration(this.activityStats.slowestExecutionTime))))),
      h("a", { href: "#", class: "-elsa-m-3 elsa-p-3 elsa-flex elsa-items-start elsa-rounded-lg hover:elsa-bg-gray-50 elsa-transition elsa-ease-in-out elsa-duration-150" },
        h("svg", { class: "elsa-flex-shrink-0 elsa-h-6 elsa-w-6 elsa-text-blue-600", width: "24", height: "24", viewBox: "0 0 24 24", "stroke-width": "2", stroke: "currentColor", fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" },
          h("path", { stroke: "none", d: "M0 0h24v24H0z" }),
          h("rect", { x: "4", y: "5", width: "16", height: "16", rx: "2" }),
          h("line", { x1: "16", y1: "3", x2: "16", y2: "7" }),
          h("line", { x1: "8", y1: "3", x2: "8", y2: "7" }),
          h("line", { x1: "4", y1: "11", x2: "20", y2: "11" }),
          h("line", { x1: "11", y1: "15", x2: "12", y2: "15" }),
          h("line", { x1: "12", y1: "15", x2: "12", y2: "18" })),
        h("div", { class: "elsa-ml-4" },
          h("p", { class: "elsa-text-base elsa-font-medium elsa-text-gray-900" }, "Last Executed At"),
          h("p", { class: "elsa-mt-1 elsa-text-sm elsa-text-gray-500" }, moment(this.activityStats.lastExecutedAt).format('DD-MM-YYYY HH:mm:ss'))))
    ];
  }
  static get is() { return "elsa-workflow-performance-information"; }
  static get properties() { return {
    "activityStats": {
      "type": "unknown",
      "mutable": false,
      "complexType": {
        "original": "ActivityStats",
        "resolved": "ActivityStats",
        "references": {
          "ActivityStats": {
            "location": "import",
            "path": "../../.."
          }
        }
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": ""
      }
    }
  }; }
}
