import { Dropdown, Image } from "semantic-ui-react";
import useCompanyChannels, {
  iconFactory,
} from "../Chat/hooks/useCompanyChannels";
import SelectedDropdownWithImage from "../Chat/SelectedDropdownWithImage";
import React, { useEffect } from "react";
import { TargetedChannelType } from "../../types/BroadcastCampaignType";
import { getConfigId, MERGE_ALIASES } from "../Channel/selectors";
import { ChannelConfiguredType, ChannelType } from "../Chat/Messenger/types";
import { toOptionValues } from "../Chat/mutators";
import { useChatChannelLocales } from "../Chat/localizable/useChatChannelLocales";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import errorStyles from "../shared/form/FieldError.module.css";

export interface ChannelOptionValueType {
  type: ChannelType | "all";
  id?: string;
}

export function matchingNames(names?: string[]) {
  return (ch: ChannelConfiguredType<any>) => {
    return names && names.length > 0 ? names.includes(ch.type) : true;
  };
}

function useChannelValuesDropdownOptions(
  t: TFunction,
  enabledChannels?: string[]
) {
  let companyChannelEnabled = [
    ...useCompanyChannels(),
    {
      type: "note",
      image: iconFactory("note"),
      name: t("broadcast.edit.field.channels.note"),
    } as ChannelConfiguredType<never>,
  ];
  if (enabledChannels) {
    companyChannelEnabled = companyChannelEnabled.filter(
      matchingNames(enabledChannels)
    );
  }
  return companyChannelEnabled.reduce(toOptionValues, []);
}

export function ChannelsValueDropdown(props: {
  value: TargetedChannelType[];
  multiple: boolean;
  excludeAll: boolean;
  onChange: (data: TargetedChannelType[]) => void;
  enabledChannels?: string[];
  filterChannel?: TargetedChannelType[];
  disabled?: boolean;
  isGroupByChannelName?: boolean;
  fluid?: boolean;
  selectAll?: boolean;
  placeholder?: string;
  hasError?: boolean;
  search?: boolean;
}) {
  const {
    disabled,
    enabledChannels,
    excludeAll,
    filterChannel,
    fluid,
    hasError = false,
    isGroupByChannelName,
    multiple,
    onChange,
    placeholder,
    selectAll,
    value,
    search = true,
  } = props;

  const { optionText } = useChatChannelLocales();
  const { t } = useTranslation();
  const companyChannels = useCompanyChannels();

  let companyChannelEnabled = [
    ...companyChannels,
    {
      type: "note",
      image: iconFactory("note"),
      name: t("broadcast.edit.field.channels.note"),
    } as ChannelConfiguredType<never>,
  ].filter(matchingNames(enabledChannels));

  let optionsEnabled = useChannelValuesDropdownOptions(t, enabledChannels);

  const filteredChannel = filterChannel;
  if (filteredChannel) {
    optionsEnabled = optionsEnabled.filter((opt) => {
      const selectedChannels = filteredChannel?.filter((filter) =>
        filter?.channel?.includes(opt.type)
      );
      if (selectedChannels.length > 0) {
        return selectedChannels.filter(
          (filter) => opt.id && filter.ids?.includes(opt.id)
        );
      }
      return true;
    });
  }

  const valueFlattened = multiple ? value : value.slice(0, 1);
  let valuesNormalized = valueFlattened.reduce<ChannelOptionValueType[]>(
    toOptionChoices(companyChannelEnabled),
    []
  );
  if (!excludeAll) {
    optionsEnabled.push({
      type: "all",
    });
  }

  const options = optionsEnabled.map((channel, i) => {
    const img = iconFactory(channel.type);
    const text =
      enabledChannels && channel.type === "note"
        ? t("broadcast.edit.field.channels.note")
        : optionText(channel, companyChannelEnabled);
    return {
      ...channel,
      key: i,
      content: (
        <div
          className={`text ${img ? "text_has-img" : "text_no-image"}`}
          key={i}
        >
          {img && <Image src={img} />}
          <span className={"text-label"}>{text}</span>
        </div>
      ),
      text: text,
      value: wrapOptionToString(channel),
    };
  });

  const selectedItems = selectAll
    ? optionsEnabled.filter((ch) => ch.type !== "note")
    : valuesNormalized;

  useEffect(() => {
    if (selectAll) {
      const selectedData = groupChannelIds(selectedItems, isGroupByChannelName);
      onChange(selectedData);
    }
  }, [selectAll]);

  return (
    <Dropdown
      openOnFocus
      closeOnChange={true}
      value={
        multiple
          ? selectedItems.map(wrapOptionToString)
          : selectedItems[0]
          ? wrapOptionToString(selectedItems[0])
          : undefined
      }
      selection={multiple ? true : undefined}
      search={search}
      multiple={multiple}
      fluid={fluid ?? true}
      upward={false}
      disabled={disabled ?? false}
      placeholder={placeholder ?? t("broadcast.edit.field.channel.placeholder")}
      className={`channels-dropdown ${
        hasError ? errorStyles.hasError : ""
      } selection`}
      loading={companyChannels.length === 0}
      trigger={
        multiple
          ? undefined
          : value[0] &&
            selectedItems[0] && (
              <SelectedDropdownWithImage
                image={iconFactory(value[0].channel)}
                text={optionText(selectedItems[0], companyChannelEnabled)}
                adaptive={false}
              />
            )
      }
      renderLabel={(channel: ChannelOptionValueType | any) => {
        const text =
          enabledChannels && channel.type === "note"
            ? t("broadcast.edit.field.channels.note")
            : optionText(channel, companyChannelEnabled);
        return {
          content: (
            <SelectedDropdownWithImage
              image={iconFactory(channel.type)}
              text={text}
              adaptive={false}
            />
          ),
        };
      }}
      onChange={(_, data) => {
        const channels = multiple
          ? (data.value as string[])
          : [data.value as string];
        const dataMerged = mergeUpdatedChannels(
          channels,
          valuesNormalized,
          isGroupByChannelName
        );
        return onChange(dataMerged);
      }}
      options={options}
    />
  );
}

function toOptionChoices(companyChannelEnabled: ChannelConfiguredType<any>[]) {
  return (acc: ChannelOptionValueType[], val: TargetedChannelType) => {
    function isConfigChannelMatchNameAndId(id: string, type: string) {
      return companyChannelEnabled
        .filter((c) => c.type === type)
        .some((c: ChannelConfiguredType<any>) => {
          return c.configs?.some(
            (config) =>
              id ===
              getConfigId({
                name: type as ChannelType,
                config,
              })
          );
        });
    }

    if (!val.ids) {
      acc.push({ type: val.channel });
    } else {
      for (let id of val.ids) {
        // channel have no aliases
        if (!Object.values(MERGE_ALIASES).includes(val.channel)) {
          acc.push({
            id,
            type: val.channel,
          });
        } else {
          // check aliases
          for (let [original, alias] of Object.entries(MERGE_ALIASES)) {
            // whatsapp means we have either whatsapp or twilio_whatsapp id
            if (val.channel === alias) {
              if (isConfigChannelMatchNameAndId(id, alias)) {
                // write whatsapp as-is
                acc.push({
                  id,
                  type: alias,
                });
              } else if (isConfigChannelMatchNameAndId(id, original)) {
                // write twilio
                acc.push({
                  id,
                  type: original as ChannelType,
                });
              }
            }
          }
        }
      }
    }
    return acc;
  };
}

function mergeUpdatedChannels(
  chnl: string[],
  value: ChannelOptionValueType[],
  isGroupByChannelName?: boolean
) {
  const values = isGroupByChannelName ? [chnl[chnl.length - 1]] : chnl;
  const channelValuesNew = values.map(unwrapStringOptionValue);
  let result: ChannelOptionValueType[] = [];
  if (channelValuesNew.length > 0) {
    if (channelValuesNew.some((v) => v.type === "all")) {
      if (value.length === 1 && value[0].type === "all") {
        // something added to a single :All" item; Remove "All, leave others
        result = channelValuesNew.filter((v) => v.type !== "all");
      } else {
        // "All" item were chosen, remove others
        result = [{ type: "all" }];
      }
    } else {
      result = channelValuesNew;
    }
  }

  return groupChannelIds(result, isGroupByChannelName);
}

/**
 * Gathers configs like [ { channel: "whatsapp", ids: [1] }, { channel: "whatsapp", ids: [2] }, { channel: "twilio_whatsapp", ids: [3] } ]
 * back to [ {channel: "whatsapp", ids: [1,2,3]} ]
 */
function groupChannelIds(
  channels: ChannelOptionValueType[],
  isGroupByChannelName?: boolean
) {
  return channels.reduce<TargetedChannelType[]>((reduced, channel) => {
    const candidateType = channel.type as ChannelType;
    let mergeCandidate = reduced.find((c) => c.channel === candidateType);

    if (!mergeCandidate) {
      mergeCandidate = { channel: candidateType };
    }
    if (channel.id) {
      mergeCandidate.ids = isGroupByChannelName
        ? [channel.id]
        : [...(mergeCandidate.ids ?? []), channel.id];
    }
    return reduced
      .filter((r) => r.channel !== candidateType)
      .concat(mergeCandidate);
  }, []);
}

// internal conversion utilities as a workaround for string-only values in Dropdown component
function wrapOptionToString(
  optionValue: ChannelOptionValueType | string
): string {
  if (typeof optionValue === "string") {
    return JSON.stringify({
      type: optionValue.toString(),
    } as ChannelOptionValueType);
  }
  return JSON.stringify(optionValue);
}

function unwrapStringOptionValue(value: string): ChannelOptionValueType {
  try {
    const json: ChannelOptionValueType = JSON.parse(value);

    let unwrapped: ChannelOptionValueType = {
      type: json.type ?? "unknown",
    };
    if (json.id) {
      unwrapped.id = json.id;
    }
    return unwrapped;
  } catch (e) {
    return { type: value as ChannelType };
  }
}
