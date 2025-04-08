import { LoginType, Action } from "types/LoginType";
import { evolve } from "ramda";
import { initialUser } from "context/LoginContext";

export function whatsappCloudApiReducer(
  state: LoginType = initialUser,
  action: Action
) {
  switch (action.type) {
    // case "WHATSAPP_CLOUD_API.BOOTED":
    //   return evolve(
    //     {
    //       vendor: {
    //         whatsappCloudApi: {
    //           booted: () => true,
    //           wabaAccounts: () => [...action.wabaAccounts],
    //         },
    //       },
    //     },
    //     state
    //   );

    case "WHATSAPP_CLOUD_API.CATALOGS.BOOTED":
      return evolve(
        {
          vendor: {
            whatsappCloudApi: {
              channels: {
                booted: () => true,
                connectedChannels: () => [...action.data],
              },
            },
          },
        },
        state
      );
    default:
      return state;
  }
}
