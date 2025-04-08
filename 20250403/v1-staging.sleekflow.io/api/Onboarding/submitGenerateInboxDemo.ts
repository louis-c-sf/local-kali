import { post, deleteMethod } from "../apiRequest";
import {
  POST_GENERATE_INBOX_DEMO,
  DELETE_GENERATE_INBOX_DEMO,
} from "../apiPath";

export default async function postGenerateInboxDemo(userId: string) {
  try {
    await deleteMethod(
      DELETE_GENERATE_INBOX_DEMO.replace("{staffId}", userId),
      {
        param: {},
      }
    );
    const generateInboxDemo = await post(
      POST_GENERATE_INBOX_DEMO.replace("{staffId}", userId),
      {
        param: {},
      }
    );
    return generateInboxDemo;
  } catch (e) {
    console.error(e);
  }
}
