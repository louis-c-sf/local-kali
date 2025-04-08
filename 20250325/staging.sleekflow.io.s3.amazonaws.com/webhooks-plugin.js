import { eventBus } from "../../../services";
import { EventTypes, SyntaxNames } from "../../../models";
import { htmlEncode } from "../../../utils/utils";
export class WebhooksPlugin {
  constructor() {
    eventBus.on(EventTypes.ActivityDesignDisplaying, this.onActivityDisplaying);
    eventBus.on(EventTypes.Dashboard.Appearing, this.onLoadingMenu);
  }
  onActivityDisplaying(context) {
    const activityModel = context.activityModel;
    if (!activityModel.type.endsWith('Webhook'))
      return;
    const props = activityModel.properties || [];
    const path = props.find(x => x.name == 'Path') || {
      name: 'Path',
      expressions: { 'Literal': '', syntax: SyntaxNames.Literal }
    };
    const syntax = path.syntax || SyntaxNames.Literal;
    const bodyDisplay = htmlEncode(path.expressions[syntax]);
    context.bodyDisplay = `<p>${bodyDisplay}</p>`;
  }
  onLoadingMenu(context) {
    const menuItems = [["webhook-definitions", "Webhook Definitions"]];
    const routes = [["webhook-definitions", "elsa-studio-webhook-definitions-list", true],
      ["webhook-definitions/:id", "elsa-studio-webhook-definitions-edit", false]];
    context.data.menuItems = [...context.data.menuItems, ...menuItems];
    context.data.routes = [...context.data.routes, ...routes];
  }
}
