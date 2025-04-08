import { interval } from 'rxjs';

import { DisposableDataSource } from './disposable-data-source';

export class DataSourceManager<
  TDataSource extends DisposableDataSource,
  TInput,
> {
  private paramToDataSourceMap = new Map<
    string,
    {
      dataSource: TDataSource;
      lastObservedAt: number;
    }
  >();

  constructor(private initializer: () => TDataSource) {
    interval(60_000).subscribe(() => {
      const recyclingConversationIds: string[] = [];
      this.paramToDataSourceMap.forEach((obj, key) => {
        if (
          new Date().getTime() - obj.lastObservedAt > 60_000 &&
          !obj.dataSource.observed()
        ) {
          recyclingConversationIds.push(key);
        }
      });
      recyclingConversationIds.forEach((id) => {
        console.log('Recycling', this.paramToDataSourceMap.get(id));

        this.paramToDataSourceMap.get(id)?.dataSource.disconnect();
        this.paramToDataSourceMap.delete(id);
      });
    });
  }

  public getOrInitDataSource(input: TInput): TDataSource {
    // Check if dataSource exists and update it
    const dataSource = this.getDataSource(input);
    if (dataSource !== undefined) {
      this.paramToDataSourceMap.set(this.getKey(input), {
        dataSource: dataSource,
        lastObservedAt: new Date().getTime(),
      });

      return dataSource;
    }

    // Create new conversationWrapper
    const newDataSource = this.initializer();

    this.paramToDataSourceMap.set(this.getKey(input), {
      dataSource: newDataSource,
      lastObservedAt: new Date().getTime(),
    });

    return newDataSource;
  }

  public getDataSource(input: TInput): TDataSource | undefined {
    const obj = this.paramToDataSourceMap.get(this.getKey(input));
    if (obj === undefined) {
      return obj;
    }

    obj.lastObservedAt = new Date().getTime();

    return obj.dataSource;
  }

  public getKey(input: TInput): string {
    return JSON.stringify(input);
  }
}
