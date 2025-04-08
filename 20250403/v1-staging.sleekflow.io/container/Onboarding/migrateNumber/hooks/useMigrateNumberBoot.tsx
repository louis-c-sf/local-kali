import { parseHttpError } from "api/apiRequest";
import { useContext } from "react";
import { fetchFacebookPhoneNumber } from "api/Channel/fetchFacebookPhoneNumber";
import { submitMigration } from "api/CloudAPI/submitMigration";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import { UnConnectedChannelType } from "component/CreateWhatsappFlow/types";
import { useState } from "react";
import { ConnectedFacebookType, reduceFacebookMap } from "../DropdownList";
import { MigrateNumberContext } from "../MigrateNumberContext";
import { OptionType } from "../types";
import { htmlEscape } from "../../../../lib/utility/htmlEscape";

export const useMigrateNumberBoot = (props: {
  setLoading: (loading: boolean) => void;
  setBusinessOptions: (options: OptionType[]) => void;
}) => {
  const { setLoading, setBusinessOptions } = props;
  const flash = useFlashMessageChannel();
  const [connectedWabaOptions, setConnectedWabaOptions] =
    useState<ConnectedFacebookType[]>();
  const migrateNumberContext = useContext(MigrateNumberContext);
  const getBusinessOptions = async (
    unconnectedBusiness: UnConnectedChannelType[]
  ) => {
    try {
      setLoading(true);
      const options = unconnectedBusiness
        .reduce(reduceFacebookMap, [])
        .map((option, index) => ({
          key: `facebook_business_id_${index}`,
          text: option.facebookWabaBusinessName,
          value: option.facebookBusinessId,
        }));
      setBusinessOptions(options);
    } catch (e) {
      console.error("getBusinessOptions e: ", e);
    } finally {
      setLoading(false);
    }
  };
  const getWabaOptions = async () => {
    try {
      const result = await fetchFacebookPhoneNumber();
      const options = result.connectedWaba.reduce<ConnectedFacebookType[]>(
        reduceFacebookMap,
        []
      );
      setConnectedWabaOptions(options);
    } catch (e) {
      console.error("getWabaOptions e: ", e);
    }
  };
  const initiateMigration = async (props: {
    facebookPhoneNumber: string;
    facebookWabaId: string;
    isOnPremises: boolean;
  }) => {
    const { facebookPhoneNumber, facebookWabaId, isOnPremises } = props;
    try {
      setLoading(true);
      const res = await submitMigration({
        facebookWabaId,
        facebookPhoneNumber,
        isOnPremises,
      });
      if (res.migration_initiated) {
        migrateNumberContext.dispatch({
          type: "SET_DESTINATION_ID_AND_GO_NEXT",
          destinationPhoneNumberId: res.destination_phone_number_id,
        });
      } else {
        console.error("submitMigration fail", res);
      }
    } catch (e) {
      migrateNumberContext.dispatch({
        type: "SET_CLICKED_NEXT_BUTTON",
        isClicked: false,
      });
      const error = parseHttpError(e);
      console.error("initiateMigration e: ", error);
      flash(htmlEscape(`${error}`));
    } finally {
      setLoading(false);
    }
  };

  return {
    getBusinessOptions,
    initiateMigration,
    connectedWabaOptions,
    getWabaOptions,
  };
};
