import { eventBus } from "../services";
import { EventTypes } from "../models";
export class SendHttpRequestPlugin {
  constructor() {
    this.onActivityEditorAppearing = (args) => {
      if (args.activityDescriptor.type != 'SendHttpRequest')
        return;
      document.querySelector('#ReadContent').addEventListener('change', this.updateUI);
      document.querySelector('#ResponseContentParserName').addEventListener('change', this.updateUI);
      this.updateUI();
    };
    this.onActivityEditorDisappearing = (args) => {
      if (args.activityDescriptor.type != 'SendHttpRequest')
        return;
      document.querySelector('#ReadContent').removeEventListener('change', this.updateUI);
      document.querySelector('#ResponseContentParserName').removeEventListener('change', this.updateUI);
    };
    this.updateUI = () => {
      const readContentCheckbox = document.querySelector('#ReadContent');
      const parserList = document.querySelector('#ResponseContentParserName');
      const responseContentParserListControl = document.querySelector('#ResponseContentParserNameControl');
      const responseContentTargetTypeControl = document.querySelector('#ResponseContentTargetTypeControl');
      const selectedParserName = parserList.value;
      responseContentParserListControl.classList.toggle('hidden', !readContentCheckbox.checked);
      responseContentTargetTypeControl.classList.toggle('hidden', (!readContentCheckbox.checked || selectedParserName != '.NET Type'));
    };
    eventBus.on(EventTypes.ActivityEditor.Appearing, this.onActivityEditorAppearing);
    eventBus.on(EventTypes.ActivityEditor.Disappearing, this.onActivityEditorDisappearing);
  }
}
