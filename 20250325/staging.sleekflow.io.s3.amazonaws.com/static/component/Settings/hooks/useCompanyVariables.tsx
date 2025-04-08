import { useEffect, useState } from "react";
import { StrictDropdownItemProps } from "semantic-ui-react";
import { useDenormalizeCustomFieldsToDisplay } from "../../../container/Contact/hooks/useCustomProfileFields";
import { useAppSelector } from "../../../AppRootContext";

export function useCompanyVariables() {
  const company = useAppSelector((s) => s.company);
  const [variables, setVariables] = useState<StrictDropdownItemProps[]>([]);
  const {
    denormalizeCustomFieldsToDisplay,
  } = useDenormalizeCustomFieldsToDisplay();

  useEffect(() => {
    if (!company) {
      return;
    }
    const variableSet = denormalizeCustomFieldsToDisplay(company).map<
      StrictDropdownItemProps
    >((fieldName) => {
      const key = Object.keys(fieldName)[0];
      return {
        key: key,
        value: key.toLowerCase(),
        text: key.toLowerCase(),
      };
    });
    setVariables(variableSet);
  }, [JSON.stringify(company?.customUserProfileFields)]);

  return {
    variables,
  };
}
