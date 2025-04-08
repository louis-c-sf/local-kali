import { deleteMethodWithExceptions } from "../apiRequest";
import { DELETE_VIBER_DELETE_CHANNEL } from "../apiPath";

export async function submitDeleteViberChannel(id: number) {
  return await deleteMethodWithExceptions(DELETE_VIBER_DELETE_CHANNEL, {
    param: { viberChannelId: id },
  });
}
