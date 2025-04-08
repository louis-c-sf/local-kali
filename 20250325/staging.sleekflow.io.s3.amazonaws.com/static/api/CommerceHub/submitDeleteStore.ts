import { postWithExceptions } from "../apiRequest";

export async function submitDeleteStore(id: string) {
  return await postWithExceptions("/CommerceHub/Stores/DeleteStore", {
    param: { id },
  });
}
