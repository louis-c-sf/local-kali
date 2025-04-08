import { useCallback } from "react";
import { OptionType } from "../components/Filter/contracts";
import {
  fetchObjectFieldVendorChoices,
  PicklistValueType,
  ChoiceFieldNormalizedType,
} from "../API/Objects/fetchObjectFieldVendorChoices";
import { fetchObjectFieldTypes } from "../API/Objects/fetchObjectFieldTypes";
import { EntityType } from "../API/Objects/contracts";
import { fetchObjectFieldUnifiedChoices } from "../API/Objects/fetchObjectFieldUnifiedChoices";

export type ChoiceFieldsBooted<TName extends string> = Array<{
  name: TName;
  choices: OptionType[];
}>;

export function useFieldsBoot(props: { entityType: EntityType }) {
  function toOption(choice: PicklistValueType) {
    return {
      title: choice.label,
      value: choice.value,
    };
  }

  async function bootScalarFields() {
    const result = await fetchObjectFieldTypes("Lead");
    return result.fields;
  }

  async function bootChoiceFields<TName extends string>(
    fieldNames: TName[]
  ): Promise<{
    fields: ChoiceFieldNormalizedType[];
    choices: ChoiceFieldsBooted<TName>;
  }> {
    const fieldsPromise = fetchObjectFieldVendorChoices(props.entityType);
    const choicesPromise = Promise.all(
      fieldNames.map(async (n) => {
        const response = await fetchObjectFieldUnifiedChoices(
          props.entityType,
          n
        );
        return { name: n, values: response.values };
      })
    );

    const [fieldsResult, choicesResult] = await Promise.all([
      fieldsPromise,
      choicesPromise,
    ]);

    const choicesDenormalized = choicesResult.reduce<ChoiceFieldsBooted<TName>>(
      (acc, next) => {
        const nextName = next.name as TName;
        if (next.values && fieldNames.includes(nextName)) {
          return [
            ...acc,
            {
              name: nextName,
              choices: next.values.map((choice) => ({
                title: choice,
                value: choice,
              })),
            },
          ];
        }
        return acc;
      },
      []
    );

    return { fields: fieldsResult.fields, choices: choicesDenormalized };
  }

  return {
    bootScalarFields,
    bootChoiceFields,
  };
}
