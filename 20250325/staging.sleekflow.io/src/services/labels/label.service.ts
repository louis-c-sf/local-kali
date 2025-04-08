import { TagsApi } from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { inject, injectable } from 'inversify';
import { map, Observable, ReplaySubject } from 'rxjs';

import { HashtagColorOptionsType } from '@/api/types';
import {
  CACHE_REFRESHING_BEHAVIOUR,
  RxjsUtils,
} from '@/services/rxjs-utils/rxjs-utils';

export interface Label {
  id: string;
  hashtag: string;
  hashTagColor: HashtagColorOptionsType;
  count: number | undefined;
  hashTagType: string;
}

@injectable()
export class LabelService {
  constructor(@inject(TagsApi) private tagApi: TagsApi) {}

  private allLabelsReplaySubject$$?: ReplaySubject<Label[]> = undefined;

  public getAllLabels$(
    cacheRefreshingBehaviour: CACHE_REFRESHING_BEHAVIOUR = CACHE_REFRESHING_BEHAVIOUR.ALWAYS_REFRESH_CLIENT,
  ): Observable<Label[]> {
    const { replaySubject$$: allLabels$$, observable$: allLabels$ } =
      RxjsUtils.cacheAndRetryObservable<Label[]>(
        () => this.allLabelsReplaySubject$$,
        this.tagApi.companyTagsGet({}).pipe(
          map((tags: any) => {
            return tags.map((tag: any) => {
              return tag as Label;
            });
          }),
        ),
        cacheRefreshingBehaviour ===
          CACHE_REFRESHING_BEHAVIOUR.ALWAYS_REFRESH_SERVER,
      );

    this.allLabelsReplaySubject$$ = allLabels$$;

    if (
      cacheRefreshingBehaviour ===
      CACHE_REFRESHING_BEHAVIOUR.ALWAYS_REFRESH_CLIENT
    ) {
      return this.allLabelsReplaySubject$$.asObservable();
    }

    return allLabels$;
  }
}
