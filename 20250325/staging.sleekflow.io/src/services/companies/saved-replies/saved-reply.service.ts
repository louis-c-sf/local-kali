import {
  CompanyQuickReplyTextGetRequest,
  QuickReplyApi,
  TravisBackendCompanyDomainModelsAddQuickReplyResult,
  TravisBackendCompanyDomainModelsCompanyQuickReplyResponse,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { inject, injectable } from 'inversify';
import { map, Observable, shareReplay } from 'rxjs';

@injectable()
export class SavedReplyService {
  constructor(@inject(QuickReplyApi) private quickReplyApi: QuickReplyApi) {}

  private savedReplies$: Record<
    string,
    Observable<TravisBackendCompanyDomainModelsCompanyQuickReplyResponse[]>
  > = {};

  public getSavedReplies$({
    keyword = '',
    offset = 0,
    limit = 600,
    conversationId,
  }: CompanyQuickReplyTextGetRequest): Observable<
    TravisBackendCompanyDomainModelsCompanyQuickReplyResponse[]
  > {
    if (!this.savedReplies$[conversationId!]) {
      this.savedReplies$[conversationId!] = this.quickReplyApi
        .companyQuickReplyTextGet({
          keyword,
          offset,
          limit,
          conversationId,
        })
        .pipe(
          map(
            (response: TravisBackendCompanyDomainModelsAddQuickReplyResult) => {
              return response.list || [];
            },
          ),
          shareReplay({
            bufferSize: 1,
            refCount: false,
          }),
        );
    }

    return this.savedReplies$[conversationId!];
  }
}
