import React, { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DropdownWithImage } from "./DropdownWithImage";
import { MigrateNumberContext } from "./MigrateNumberContext";
import { OptionType } from "./types";
import styles from "./DropdownList.module.css";
import { MigrateBspHeader } from "./MigrateBspHeader";
import { useMigrateNumberBoot } from "./hooks/useMigrateNumberBoot";
import PhoneNumber from "component/PhoneNumber";
import { Image } from "semantic-ui-react";
import TickIcon from "../../../assets/images/icons/tick-circle-blue.svg";
import i18n from "../../../i18n";
import { UnConnectedChannelType } from "component/CreateWhatsappFlow/types";
import { update } from "ramda";

export interface ConnectedFacebookType {
  facebookBusinessId: string;
  facebookWabaBusinessName: string;
  facebookWaba: {
    facebookWabaId: string;
    facebookWabaName: string;
    messagingHubWabaId: string;
  }[];
}

export function reduceFacebookMap(
  acc: ConnectedFacebookType[],
  curr: UnConnectedChannelType
) {
  const foundWabaRecordIndex = acc.findIndex(
    (c) => c.facebookBusinessId === curr.facebookWabaBusinessId
  );
  if (foundWabaRecordIndex > -1) {
    return update(
      foundWabaRecordIndex,
      {
        ...acc[foundWabaRecordIndex],
        facebookWaba: [
          ...acc[foundWabaRecordIndex].facebookWaba,
          {
            facebookWabaId: curr.facebookWabaId,
            facebookWabaName: curr.facebookWabaName,
            messagingHubWabaId: curr.messagingHubWabaId,
          },
        ],
      },
      acc
    );
  }
  acc.push({
    facebookBusinessId: curr.facebookWabaBusinessId,
    facebookWabaBusinessName: curr.facebookWabaBusinessName,
    facebookWaba: [
      {
        facebookWabaId: curr.facebookWabaId,
        facebookWabaName: curr.facebookWabaName,
        messagingHubWabaId: curr.messagingHubWabaId,
      },
    ],
  });
  return acc;
}

export const DropdownList = () => {
  const { t } = useTranslation();
  const migrateNumberContext = useContext(MigrateNumberContext);
  const [businessOptions, setBusinessOptions] = useState<OptionType[]>([]);
  const bspOptions = useMemo(
    () => [
      {
        key: "bsp0",
        value: true,
        text: t(
          "guideContainer.migrateNumber.dropdownList.bsp.option.premises"
        ),
      },
      {
        key: "bsp1",
        value: false,
        text: t("guideContainer.migrateNumber.dropdownList.bsp.option.cloud"),
      },
    ],
    [i18n.language]
  );
  const [sleekflowWabaOptions, setSleekflowWabaOptions] = useState<
    OptionType[]
  >([]);
  const setLoading = (loading: boolean) => {
    migrateNumberContext.dispatch({
      type: "SET_LOADING",
      loading,
    });
  };

  const boot = useMigrateNumberBoot({
    setLoading,
    setBusinessOptions,
  });

  useEffect(() => {
    if (!migrateNumberContext.unconnectedBusiness) {
      return;
    }
    boot.getBusinessOptions(migrateNumberContext.unconnectedBusiness);
  }, [JSON.stringify(migrateNumberContext.unconnectedBusiness)]);

  useEffect(() => {
    boot.getWabaOptions();
  }, []);
  useEffect(() => {
    if (!boot.connectedWabaOptions) {
      return;
    }
    const selectedFacebookBusiness = boot.connectedWabaOptions.find(
      (s) => s.facebookBusinessId === migrateNumberContext.businessId
    );
    if (!selectedFacebookBusiness) {
      return;
    }
    setSleekflowWabaOptions(
      selectedFacebookBusiness?.facebookWaba.map((s, index) => ({
        key: s.messagingHubWabaId,
        text: s.facebookWabaName,
        value: s.facebookWabaId,
      }))
    );
  }, [migrateNumberContext.businessId, boot.connectedWabaOptions]);
  useEffect(() => {
    if (migrateNumberContext.isClicked) {
      boot.initiateMigration({
        facebookPhoneNumber: migrateNumberContext.facebookPhoneNumber,
        facebookWabaId: migrateNumberContext.facebookWabaId,
        isOnPremises: migrateNumberContext.isOnPremises,
      });
    }
  }, [
    migrateNumberContext.isClicked,
    migrateNumberContext.facebookPhoneNumber,
    migrateNumberContext.facebookWabaId,
    migrateNumberContext.isOnPremises,
  ]);

  return (
    <div className={styles.dropdownList}>
      <MigrateBspHeader
        title={t("guideContainer.migrateNumber.dropdownList.title")}
        description={t("guideContainer.migrateNumber.dropdownList.description")}
      />
      <DropdownWithImage
        label={t("guideContainer.migrateNumber.dropdownList.business.label")}
        options={businessOptions}
        handleChange={(value: boolean | string) => {
          migrateNumberContext.dispatch({
            type: "SET_BUSINESS_INFO",
            businessId: value as string,
            businessNmae:
              businessOptions.find((v) => v.value === value)?.text ?? "",
          });
        }}
        value={migrateNumberContext.businessId}
        disabled={migrateNumberContext.loading}
        loading={migrateNumberContext.loading}
      />
      <div className={styles.dropdownRow}>
        <div className={styles.rowContainer}>
          <Image src={TickIcon} alt="dropdown" className={styles.tick} />
          <label className={styles.label}>
            {t("guideContainer.migrateNumber.dropdownList.number.label")}
          </label>
        </div>
        <div className={styles.rowContainer}>
          <div className={styles.line}></div>

          <PhoneNumber
            fieldName="phone-number"
            existValue=""
            onChange={(fieldName, phone, code) => {
              migrateNumberContext.dispatch({
                type: "SET_PHONE_NUMBER",
                facebookPhoneNumber: phone,
              });
            }}
          />
        </div>
      </div>
      <DropdownWithImage
        label={t("guideContainer.migrateNumber.dropdownList.bsp.label")}
        options={bspOptions}
        handleChange={(value: boolean | string) => {
          migrateNumberContext.dispatch({
            type: "SET_IS_ON_PREMISES",
            isOnPremises: value as boolean,
          });
        }}
        value={migrateNumberContext.isOnPremises}
        disabled={
          migrateNumberContext.loading || migrateNumberContext.businessId === ""
        }
      />
      <DropdownWithImage
        label={t(
          "guideContainer.migrateNumber.dropdownList.sleekflowWaba.label"
        )}
        options={sleekflowWabaOptions}
        handleChange={(value: boolean | string) => {
          migrateNumberContext.dispatch({
            type: "SET_FACEBOOK_WABAID",
            facebookWabaId: value as string,
            messagingHubWabaId:
              sleekflowWabaOptions.find((o) => o.value === value)?.key ?? "",
          });
        }}
        value={migrateNumberContext.facebookWabaId}
        disabled={
          migrateNumberContext.loading || migrateNumberContext.businessId === ""
        }
        loading={migrateNumberContext.loading}
      />
    </div>
  );
};
