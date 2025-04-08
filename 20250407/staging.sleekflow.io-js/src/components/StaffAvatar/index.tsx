import React from 'react';

import { useGetStaffById } from '@/api/company';
import { Staff } from '@/api/types';
import { getAvatarUrl } from '@/utils/avatar';

import { Avatar as ColoredAvatar, AvatarProps } from '../Avatar';

function StaffAvatar({
  userId,
  size = 'small',
  alt = '',
  src,
  ...others
}: AvatarProps & { userId: string }) {
  const { data, isLoading } = useGetStaffById({
    userId,
    select: (data: Staff[]) => {
      return {
        profilePictureUrl: data[0]?.profilePictureURL,
        name: data[0]?.name,
      };
    },
    staleTime: Infinity,
  });

  return (
    <ColoredAvatar
      loading={isLoading}
      src={data?.profilePictureUrl ? getAvatarUrl(data.profilePictureUrl) : src}
      alt={data?.name || alt}
      size={size}
      {...others}
    />
  );
}
export default React.memo(StaffAvatar);
