import { URL } from "../../../api/apiRequest";

export function staffProfilePictureURL(profilePictureURL: string) {
  return `${URL}${profilePictureURL}`;
}
