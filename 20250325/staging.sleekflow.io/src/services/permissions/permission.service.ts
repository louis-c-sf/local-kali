import { getIsRbacEnabledQueryOptions } from '@/api/settings';
import { queryClient } from '@/utils/queryClient';
import { injectable } from 'inversify';
import { from, map } from 'rxjs';

@injectable()
export class PermissionService {
  getIsRbacEnabled$ = () =>
    from(queryClient.fetchQuery(getIsRbacEnabledQueryOptions)).pipe(
      map((data) => !!data.is_enabled),
    );
}
