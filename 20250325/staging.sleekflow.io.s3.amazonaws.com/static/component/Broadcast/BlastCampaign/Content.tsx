import React, { useContext } from "react";
import { Dimmer } from "semantic-ui-react";
import { ContentBodyView } from "../shared/ContentBodyView";
import {
  BlastCampaignFormikType,
  VARIABLES_VALUE_PATH,
} from "./useBlastCampaignForm";
import { BlastCampaignContext } from "./blastCampaignReducer";
import { getFormSingleErrors } from "./getFormSingleErrors";
import { IdNormalizedWhatsAppTemplateLanguageType } from "../../Chat/Messenger/SelectWhatsappTemplate/useSelectWhatsappTemplateFlow";
import { updateWhatsappTemplateVariables } from "../NewBroadcastContent";
import {
  BroadcastOptInContextProvider,
  GetIsVarValidInterface,
} from "../shared/BroadcastTemplateDisplay/BroadcastOptInContext";
import { useDisableControls } from "../../../core/components/DisableControls/DisableControls";
import { SelectMode } from "../../Chat/Messenger/SelectWhatsappTemplate/SelectMode/SelectMode";

export function Content(props: {
  startTemplateSelection: () => void;
  clearTemplateSelection: () => void;
  templatesActive: IdNormalizedWhatsAppTemplateLanguageType[];
  selectTemplate: (template: string, language: string) => void;
  form: BlastCampaignFormikType;
}) {
  const {
    clearTemplateSelection,
    startTemplateSelection,
    templatesActive,
    selectTemplate,
    form,
  } = props;
  const { dispatch, ...state } = useContext(BlastCampaignContext);
  const { disabled } = useDisableControls();

  const formErrors = getFormSingleErrors(form);

  const updateVarText = (text: string) => {
    const message = form.values.message;
    const template = message.sendWhatsAppTemplate;
    const lastInputId = template?.lastVarInputId;
    if (template && lastInputId) {
      const varsUpdated = updateWhatsappTemplateVariables(
        lastInputId,
        template,
        text
      );
      form.setFieldValue("message.sendWhatsAppTemplate.variables", varsUpdated);
    }
  };

  const lastVarInputId =
    form.values.message.sendWhatsAppTemplate?.lastVarInputId;

  const validateVars: GetIsVarValidInterface = (
    name,
    variables,
    varsTouched,
    idx,
    errors
  ) => {
    if (!errors) {
      return true;
    }
    try {
      const varErrors = errors[VARIABLES_VALUE_PATH] ?? [];
      if (varErrors && varsTouched[`content_${name}`]) {
        const errorsNormalized = JSON.parse(varErrors as string);
        return errorsNormalized[name] === undefined;
      } else {
        return true;
      }
    } catch (e) {
      return true;
    }
  };

  return (
    <>
      <div className={`content-columns template-selected`}>
        <Dimmer.Dimmable className={"text-editor-column rounded"}>
          <BroadcastOptInContextProvider getIsVarValid={validateVars}>
            <ContentBodyView
              selectedChannelMessage={form.values.message}
              isOfficialChannel={true}
              isSelectedTemplate={form.values.templateId !== null}
              params={[] /* not used */}
              contentLoaded={true}
              selectedChannelMessageIndex={0}
              templateContent={
                form.values.message.sendWhatsAppTemplate?.templateContent
                  ?.content ?? ""
              }
              formErrors={formErrors}
              enableTextEditMode={() => !1}
              isOptIn={false}
              isSMSWordExceedLimit={false}
              smsWordLimit={0}
              characterLimit={undefined}
              readonly={Boolean(form.values.templateId)}
              updateContent={(type, content) => {
                if (type === "sendWhatsAppTemplate") {
                  form.setFieldValue("message.sendWhatsAppTemplate", content);
                }
              }}
              updateChange={() => {
                //not used
              }}
              startTemplateSelection={startTemplateSelection}
              clearTemplateSelection={clearTemplateSelection}
            />
          </BroadcastOptInContextProvider>

          {state.templateSelectVisible && (
            <SelectMode
              channelType={"whatsapp360dialog"}
              anchor={document.body}
              templatesList={templatesActive}
              onClose={() => dispatch({ type: "TEMPLATE_SELECTION_HIDE" })}
              conversationId=""
              onSelect={selectTemplate}
            />
          )}
        </Dimmer.Dimmable>
        <div className={`variables-column`}>
          {/*{!disabled && (
            <VariablesSelection
              bordered
              isSearchable
              enablePaymentLink={false}
              showGroupName
              updateText={updateVarText}
              textareaId={lastVarInputId ? getInputId(lastVarInputId) : ""}
              disabled={disabled}
            />
          )}*/}
        </div>
      </div>
    </>
  );
}
