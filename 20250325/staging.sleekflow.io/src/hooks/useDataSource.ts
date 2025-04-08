import type { DataSourceManager } from '@/services/data-sources/data-source-manager';
import { MountableDataSource } from '@/services/data-sources/mountable-data-source';
import type { interfaces } from 'inversify';
import { useInjection } from 'inversify-react';
import { useEffect, useMemo } from 'react';

export const useDataSource = <
  M extends DataSourceManager<MountableDataSource, unknown>,
>(
  dataSourceManager: interfaces.ServiceIdentifier<M>,
  input: Parameters<M['getOrInitDataSource']>[0],
) => {
  const manager = useInjection(dataSourceManager);

  type TDataSource = ReturnType<M['getOrInitDataSource']>;
  const dataSource = useMemo(
    () => manager.getOrInitDataSource(input) as TDataSource,
    [input, manager],
  );

  useEffect(() => {
    dataSource.setMounted(true);
    dataSource.onMounted();
    return () => {
      dataSource.setMounted(false);
      dataSource.onUnmount();
    };
  }, [dataSource]);

  return [dataSource, manager] as const;
};
