import { useInjection } from 'inversify-react';
import { useObservableState } from 'observable-hooks';
import { useMemo } from 'react';

import { CACHE_REFRESHING_BEHAVIOUR } from '@/services/rxjs-utils/rxjs-utils';
import { UserService } from '@/services/user.service';

export default function useMyStaff() {
  const userService = useInjection(UserService);

  const myStaff$ = useMemo(() => {
    return userService.getMyStaff$(
      CACHE_REFRESHING_BEHAVIOUR.ALWAYS_REFRESH_CLIENT,
    );
  }, [userService]);
  const myStaff = useObservableState(myStaff$);

  return myStaff;
}
