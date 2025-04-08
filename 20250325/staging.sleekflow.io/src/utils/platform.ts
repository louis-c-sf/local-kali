// common platforms for computers
const userAgent = navigator.userAgent,
  macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
  windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];

type devicePlatformType = 'windows' | 'mac' | 'others' | 'iOS' | 'Android';

export function getDevicePlatform() {
  let os = '' as devicePlatformType;

  // return true if result greater than -1
  if (macosPlatforms.some((key) => userAgent.indexOf(key) > -1)) {
    os = 'mac';
  } else if (windowsPlatforms.some((key) => userAgent.indexOf(key) > -1)) {
    os = 'windows';
  } else if (/Linux/.test(userAgent)) {
    os = 'mac';
  } else if (
    userAgent.indexOf('iPhone') !== -1 ||
    userAgent.indexOf('iPad') !== -1 ||
    userAgent.indexOf('iPod') !== -1
  ) {
    os = 'iOS';
  } else if (userAgent.indexOf('Android') !== -1) {
    os = 'Android';
  } else {
    os = 'others';
  }

  return os;
}
