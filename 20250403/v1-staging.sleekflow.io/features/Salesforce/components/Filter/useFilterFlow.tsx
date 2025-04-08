import { DropdownProps } from "semantic-ui-react";
import React from "react";
import { FilterProps, FilterBaseType, FilterSearchableType } from "./contracts";

function stub() {}

export function useFilterFlow<Filter extends FilterSearchableType>(
  props: FilterProps<Filter> & { searchDisabled: boolean }
) {
  if (props.disabled) {
    return {
      updateFilter: stub,
      handleDropdown: () => stub,
      handleSearch: () => stub,
      submit: stub,
      reset: stub,
    };
  }

  const searchByText = (name: string, value: string, loadResults: boolean) => {
    props.updateFilter(name as keyof Filter, value);
    if (loadResults) {
      props.onSubmit({ ...props.filter, [name]: value });
    }
  };

  const submit = (override?: Partial<Filter>) => {
    if (props.loading || props.searchDisabled) {
      return;
    }
    const filter = override ? { ...props.filter, ...override } : props.filter;
    props.onSubmit(filter);
  };

  const handleDropdown =
    (name: keyof Filter) => (_: any, dropdownProps: DropdownProps) => {
      const value = dropdownProps.value as Filter[any];
      props.updateFilter(name, value);
      props.onSubmit({ ...props.filter, [name]: value } as Filter);
    };

  const reset = () => {
    if (props.isResultsAreFiltered) {
      props.onSubmit(null);
    }
  };

  return {
    updateFilter: props.updateFilter,
    handleDropdown,
    handleSearch: searchByText,
    submit,
    reset,
  };
}
