import React, { useEffect, useState } from "react";
import { Dropdown, DropdownItemProps, DropdownProps } from "semantic-ui-react";
import { GET_COMPANY_TIMEZONE } from "../api/apiPath";
import { get } from "../api/apiRequest";
import { useTranslation } from "react-i18next";

interface TimeZoneComponentProps {
  onChange: Function;
  currentTimezone?: string;
  placeholder?: string;
  defaultLoading?: boolean;
}

interface TimeZoneResponseType {
  id: string;
  displayName: string;
  standardName: string;
  baseUtcOffset: string;
}

interface TimzoneType extends DropdownItemProps {
  id: string;
}

export default (props: TimeZoneComponentProps) => {
  const {
    onChange,
    currentTimezone,
    placeholder,
    defaultLoading = false,
  } = props;
  const [timezones, setTimezones] = useState<TimzoneType[]>([]);
  const [selectedTimezone, setSelectedTimezone] = useState<TimzoneType>();
  const { t } = useTranslation();
  const getTimeZoneList = async (currentTimezone?: string) => {
    try {
      const result: TimeZoneResponseType[] = await get(GET_COMPANY_TIMEZONE, {
        param: {},
        config: {
          skipAuth: true,
        },
      });
      if (result.length > 0) {
        const timeZoneMappings = (result || []).map(
          (res: TimeZoneResponseType) => {
            return {
              id: res.id,
              value: res.id,
              text: res.displayName,
            };
          }
        );
        if (currentTimezone) {
          const foundTimezone = timeZoneMappings.find((timezone) => {
            return timezone.id === currentTimezone;
          });
          setSelectedTimezone(foundTimezone);
        }
        setTimezones(timeZoneMappings);
      }
    } catch (error) {
      console.error("error", error);
    }
  };
  useEffect(() => {
    if (!defaultLoading) {
      getTimeZoneList(currentTimezone);
    }
  }, [props.currentTimezone, defaultLoading, currentTimezone]);
  const updateSelectedTimeZone = (
    e: React.SyntheticEvent,
    data: DropdownProps
  ) => {
    const { value, text } = data;
    const timeZone = timezones.find((timezone) => timezone.id === value);
    setSelectedTimezone(timeZone);
    if (timeZone) {
      onChange(timeZone.id.substring(timeZone.id.indexOf("-") + 1));
    }
  };
  return (
    <Dropdown
      options={timezones}
      scrolling
      selectOnBlur={false}
      search
      upward={false}
      placeholder={
        placeholder ? placeholder : t("form.field.timezone.placeholder")
      }
      value={(selectedTimezone && (selectedTimezone.value as string)) || ""}
      text={(selectedTimezone && (selectedTimezone.text as string)) || ""}
      onChange={updateSelectedTimeZone}
    />
  );
};
