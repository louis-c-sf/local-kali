// Credits: https://stackoverflow.com/a/18650828/6820538

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (!+bytes) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat(`${bytes / Math.pow(k, i)}`).toFixed(dm)} ${sizes[i]}`;
};

// get full name that takes care of cases where first or last name is empty or fallback to another value
export const getFullName = ({
  firstName,
  lastName,
  fallback,
}: {
  firstName: string | undefined | null;
  lastName: string | undefined | null;
  fallback: string;
}) => {
  /*
   * Check firstName or lastName exists
   * if neither are defined fallback to untitled
   */
  let fullName = '';
  // check first name to avoid space in the front if only lastname exists
  if (firstName) {
    fullName = `${firstName?.trim() || ''} ${lastName?.trim() || ''}`.trim();
  } else {
    fullName = lastName ? lastName.trim() : fallback;
  }

  return fullName?.trim?.() !== '' ? fullName : fallback;
};

export const getUploadedFileName = (
  uploadedFileName: string | null | undefined,
) => {
  if (!uploadedFileName) return '';
  return uploadedFileName.split('/').pop() || '';
};
