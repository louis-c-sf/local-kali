import produce from "immer";
import { StaffType } from "types/StaffType";
import { TeamType } from "types/TeamType";
import {
  UnifyRuleType,
  MapUserType,
  ConditionType,
  ProviderType,
} from "../API/Onboarding/contracts";
import { ObjectNormalizedType } from "../../../../features/Salesforce/API/Objects/contracts";
import { camelize } from "lib/utility/caseConverter";
import { assoc, adjust } from "ramda";

export type UnifyRuleValueType = UnifyRuleType & { id: string };
export type CrmOnboardingStateType = {
  step: number;
  ruleToSleekflow: UnifyRuleValueType[];
  ruleToCrm: UnifyRuleValueType[];
  mapUsers: MapUserType[];
  autoSyncSetting: {
    syncMode: { toSleekflow: boolean; toCrm: boolean };
    field: string;
  };
  importConditions: ConditionType[];
};

export type CrmOnboardingActionType =
  | {
      type: "NEXT_STEP";
    }
  | {
      type: "GOTO_STEP";
      step: number;
    }
  | {
      type: "INIT_RULE_ROW";
      rules: UnifyRuleType[];
      list: "ruleToSleekflow" | "ruleToCrm";
    }
  | {
      type: "UPDATE_RULE_ROW";
      value: string;
      field: string;
      id: string;
      providerType: ProviderType | "sleekflow";
      list: "ruleToSleekflow" | "ruleToCrm";
    }
  | {
      type: "DELETE_RULE_ROW";
      id: string;
      list: "ruleToSleekflow" | "ruleToCrm";
      providerType: ProviderType | "sleekflow";
    }
  | { type: "ADD_RULE_ROW"; list: "ruleToSleekflow" | "ruleToCrm" }
  | { type: "INIT_MAP_USER"; users: StaffType[]; teams: TeamType[] }
  | { type: "INIT_SELECTED_USER"; salesforceUsers: ObjectNormalizedType[] }
  | { type: "UPDATE_MAP_USER"; index: number; salesforceUser: string }
  | { type: "INIT_CONDITION_ROW"; condition: ConditionType[] }
  | { type: "ADD_CONDITION_ROW" }
  | {
      type: "UPDATE_CONDITION_ROW";
      index: number;
      value: string;
      field: string;
      fieldType?: string;
    }
  | { type: "DELETE_CONDITION_ROW"; index: number }
  | {
      type: "UPDATE_AUTO_SYNC_IS_ENABLE";
      syncMode: { toSleekflow: boolean; toCrm: boolean };
    }
  | {
      type: "UPDATE_AUTO_SYNC_FIELD";
      field: string;
    };

export const defaultState = (): CrmOnboardingStateType => {
  return {
    step: 0,
    ruleToSleekflow: [
      {
        fieldName: "",
        strategy: "time",
        id: btoa(String(Math.random())),
        providerPrecedences: [],
        isSystem: false,
      },
    ],
    ruleToCrm: [
      {
        fieldName: "",
        strategy: "time",
        id: btoa(String(Math.random())),
        providerPrecedences: [],
        isSystem: false,
      },
    ],
    mapUsers: [],
    autoSyncSetting: {
      syncMode: {
        toSleekflow: true,
        toCrm: false,
      },
      field: "Contact",
    },
    importConditions: [{ fieldName: "", value: "", type: "" }],
  };
};

const crmOnboardingReducer: React.Reducer<
  CrmOnboardingStateType,
  CrmOnboardingActionType
> = produce((draft: CrmOnboardingStateType, action) => {
  switch (action.type) {
    case "NEXT_STEP":
      draft.step = draft.step + 1;
      break;
    case "GOTO_STEP":
      draft.step = action.step;
      break;
    case "INIT_RULE_ROW":
      const result = action.rules.map((rule: UnifyRuleType) => ({
        ...rule,
        id: btoa(String(Math.random())),
      }));
      draft[action.list] = result;
      break;
    case "UPDATE_RULE_ROW":
      const index = draft[action.list].findIndex(
        (rule: UnifyRuleValueType) => rule.id === action.id
      );
      if (action.field === "fieldName") {
        draft[action.list] = adjust(
          index,
          assoc(action.field, action.value),
          draft[action.list]
        );
      } else {
        draft[action.list] = adjust(
          index,
          assoc(action.field, [`${action.providerType}:${action.value}`]),
          draft[action.list]
        );
      }
      break;
    case "DELETE_RULE_ROW":
      draft[action.list] = draft[action.list]
        .map((rule: UnifyRuleValueType) => {
          if (rule.id !== action.id) {
            return rule;
          }
          return {
            ...rule,
            providerPrecedences: rule.providerPrecedences.filter(
              (item) => !item.includes(action.providerType)
            ),
          };
        })
        .filter(
          (rule: UnifyRuleValueType) =>
            !(rule.id === action.id && rule.providerPrecedences.length === 0)
        );
      break;
    case "ADD_RULE_ROW":
      draft[action.list] = [
        ...draft[action.list],
        {
          fieldName: "",
          strategy: "time",
          providerPrecedences: [],
          id: btoa(String(Math.random())),
          isSystem: false,
        },
      ];
      break;
    case "INIT_MAP_USER":
      draft.mapUsers = action.users.map((user: StaffType) => {
        const userTeam = action.teams.find((team: TeamType) =>
          team.members.some(
            (member: StaffType) => member.userInfo.id === user.userInfo.id
          )
        );
        return {
          id: user.userInfo.id,
          name: user.name,
          image: user.profilePictureURL,
          team: userTeam ? userTeam.teamName : "",
          salesforceUser: undefined,
        };
      });
      break;
    case "INIT_SELECTED_USER":
      draft.mapUsers = draft.mapUsers.map((user: MapUserType) => {
        const selectedUser = action.salesforceUsers.find(
          (salesforceUser: ObjectNormalizedType) =>
            salesforceUser["unified:SleekflowId"] === user.id
        );
        return { ...user, salesforceUser: selectedUser?.id || undefined };
      });

      break;
    case "UPDATE_MAP_USER":
      draft.mapUsers = draft.mapUsers.map((row, index) => {
        if (index !== action.index) return row;
        return {
          ...row,
          salesforceUser: action.salesforceUser,
        };
      });
      break;
    case "INIT_CONDITION_ROW":
      const condition = camelize(
        action.condition
      ) as unknown as ConditionType[];
      draft.importConditions = condition.map((row: ConditionType) => ({
        ...row,
        value: row.value.slice(1, -1),
      }));

      break;
    case "ADD_CONDITION_ROW":
      draft.importConditions = [
        ...draft.importConditions,
        { fieldName: "", value: "" },
      ];
      break;
    case "UPDATE_CONDITION_ROW":
      draft.importConditions = draft.importConditions.map((row, index) => {
        if (index !== action.index) return row;
        if (action.fieldType) {
          return {
            ...row,
            value: "",
            type: action.fieldType,
            [action.field]: action.value,
          };
        }
        return {
          ...row,
          [action.field]: action.value,
        };
      });
      break;
    case "DELETE_CONDITION_ROW":
      draft.importConditions = draft.importConditions.filter(
        (_, index) => index !== action.index
      );
      break;
    case "UPDATE_AUTO_SYNC_IS_ENABLE":
      draft.autoSyncSetting = {
        ...draft.autoSyncSetting,
        syncMode: action.syncMode,
      };
      break;
    case "UPDATE_AUTO_SYNC_FIELD":
      draft.autoSyncSetting = {
        ...draft.autoSyncSetting,
        field: action.field,
      };
      break;
  }
});

export default crmOnboardingReducer;
