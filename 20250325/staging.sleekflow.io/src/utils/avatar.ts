export function getAvatarUrl(profilePictureURL: string) {
  return profilePictureURL
    ? `${import.meta.env.VITE_API_BASE_URL}${profilePictureURL}`
    : '';
}
