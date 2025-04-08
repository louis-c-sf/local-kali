import { postWithExceptions } from "api/apiRequest";
import {
  FacebookOTNRequestParamType,
  FacebookOTNRequestType,
} from "../models/FacebookOTNTypes";

export async function submitFacebookOTNRequest(
  param: FacebookOTNRequestParamType
): Promise<FacebookOTNRequestType> {
  return await postWithExceptions("/FbOtnTopic/SendRequest", {
    param,
  });
}
