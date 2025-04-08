import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dropdown,
  DropdownItemProps,
  DropdownProps,
  Input,
} from "semantic-ui-react";
import { parseAndFormatAnyPhone } from "./Channel/selectors";
import { useTranslation } from "react-i18next";
import { useCountryDialList } from "../config/localizable/useCountryDialList";
import { getCountryCode } from "../api/countryCode";

interface PhoneNumberProps {
  onChange: (fieldName: string, phone: string, code: string) => any;
  fieldName: string;
  existValue?: string;
  isError?: boolean;
  placeholder?: string;
  countryCode?: string;
}

export default function PhoneNumber(props: PhoneNumberProps) {
  const { onChange, fieldName, isError, existValue, placeholder, countryCode } =
    props;
  const [selectedPhoneCode, setSelectedPhoneCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const { t } = useTranslation();
  const {
    countryDialList,
    fetchCountryByCountryCode,
    getCountryCodeByAbbreviationOrName,
  } = useCountryDialList();

  const phoneCodeList: DropdownItemProps[] = useMemo(() => {
    const phoneCodeListDict: DropdownItemProps[] = countryDialList.map(
      (country, index) => {
        const { name, callingCode } = country;
        return {
          text: `${name} (+${callingCode})`,
          value: callingCode,
          key: `callingCode${index}`,
        };
      }
    );
    return phoneCodeListDict;
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchCountryCode = async () => {
      try {
        const result = await getCountryCode();
        if ("countryCode" in result) {
          const phoneCountryCode = await fetchCountryByCountryCode(
            result.countryCode
          ).catch((e) => {
            console.error("error fetching country code", e);
          });
          if (phoneCountryCode && !selectedPhoneCode) {
            if (isMounted) {
              setSelectedPhoneCode(`+${phoneCountryCode}`);
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    const fetchCountryList = async () => {
      if (countryCode && !selectedPhoneCode) {
        const phoneCountryCode = await getCountryCodeByAbbreviationOrName(
          countryCode
        ).catch((e) => {
          console.error("error fetching phone code", e);
        });
        if (phoneCountryCode && isMounted) {
          setSelectedPhoneCode(`+${phoneCountryCode}`);
        }
      }
    };

    if (countryCode) {
      if (!existValue) {
        fetchCountryList();
      }
    } else {
      if (!existValue) {
        // for some contacts do not have countryCode and existValue in the contact
        fetchCountryCode();
      }
    }

    return () => {
      isMounted = false;
    };
  }, [JSON.stringify([existValue, countryCode])]);

  useEffect(() => {
    if (existValue) {
      const phoneNumber = parseAndFormatAnyPhone(existValue);
      const countryCallingCode = phoneNumber?.substring(
        0,
        phoneNumber.indexOf(" ")
      );

      const firstCharPos = existValue.startsWith("+") ? 1 : 0;
      const existCallingCode = countryDialList.find((country) => {
        return countryCallingCode?.substring(1) === country.callingCode;
      });
      if (existCallingCode) {
        setSelectedPhoneCode(`+${existCallingCode.callingCode}`);
        setPhoneNumber(
          existValue.substring(
            existCallingCode.callingCode.length + firstCharPos
          )
        );
      } else {
        // when the existCallingCode does not found, will handle by existValue
        const foundByFirstFewCharacters = countryDialList.find((country) => {
          return (
            existValue.substring(
              firstCharPos,
              country.callingCode.length + firstCharPos
            ) === country.callingCode
          );
        });
        const countryCodeFound = foundByFirstFewCharacters?.callingCode;
        if (countryCodeFound) {
          setSelectedPhoneCode(`+${countryCodeFound}`);
          setPhoneNumber(existValue.substring(countryCodeFound.length)); // 0 + firstCharPos doesn't mean anything here
        } else {
          setSelectedPhoneCode(`+`);
          setPhoneNumber(existValue);
        }
      }
    } else {
      setPhoneNumber("");
    }
  }, [existValue]);

  const selectOption = useCallback(
    (e: React.SyntheticEvent, data: DropdownProps) => {
      e.preventDefault();
      e.stopPropagation();
      const { value } = data;

      setSelectedPhoneCode(`+${value}` as string);
      const phoneValue = phoneNumber.trim() === "" ? "" : value + phoneNumber;

      onChange(fieldName, phoneValue, value as string);
    },
    [fieldName, phoneNumber, onChange]
  );

  const textChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const { id, value } = e.target;
    setPhoneNumber(value);
    const phoneValue =
      value.trim() === "" ? "" : selectedPhoneCode.replace(/\+/g, "") + value;
    onChange(id, phoneValue, selectedPhoneCode);
  };

  return (
    <div className="phone-number">
      {phoneNumber && isError && (
        <div className="error">{t("form.profile.field.phone.code.prompt")}</div>
      )}
      <div className="phone-number">
        <Dropdown
          className={"code-choice"}
          lazyLoad
          upward={false}
          placeholder={`Code`}
          search
          scrolling
          floating
          value={selectedPhoneCode}
          text={`+${selectedPhoneCode.replace("+", "")}`}
          options={phoneCodeList}
          selectOnBlur={false}
          onChange={selectOption}
        />
        <Input
          fluid
          type="tel"
          error={isError}
          id={fieldName}
          value={phoneNumber}
          placeholder={
            placeholder ||
            t("form.prompt.enterValue", {
              n: t("account.form.field.phoneNumber.placeholder"),
            })
          }
          onChange={textChange}
        />
      </div>
    </div>
  );
}
