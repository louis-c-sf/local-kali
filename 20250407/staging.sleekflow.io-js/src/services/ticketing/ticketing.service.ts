import {
  TicketingHubApi,
  TravisBackendControllersTicketingHubControllersTicketingHubControllerCreateTicketCommentRequest,
  TravisBackendControllersTicketingHubControllersTicketingHubControllerCreateTicketRequest,
  TravisBackendControllersTicketingHubControllersTicketingHubControllerGetTicketCommentsRequest,
  TravisBackendControllersTicketingHubControllersTicketingHubControllerGetTicketCountRequest,
  TravisBackendControllersTicketingHubControllersTicketingHubControllerGetTicketsRequest,
  TravisBackendControllersTicketingHubControllersTicketingHubControllerUpdateTicketTypeRequest,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { inject, injectable } from 'inversify';
import { catchError, delay, map, of } from 'rxjs';

import type { TicketDetails } from '@/api/types';
import { RxjsUtils } from '@/services/rxjs-utils/rxjs-utils';

export type TicketCountResult = Record<string, string> & { count: number };

interface TicketActivityRequest {
  ticketId: string;
  limit: number;
  continuationToken?: string | null;
}

@injectable()
export class TicketingService {
  constructor(
    @inject(TicketingHubApi)
    private ticketingHubApi: TicketingHubApi,
  ) {}

  public getCompanyTicketingConfig$() {
    return this.ticketingHubApi
      .ticketingHubTicketCompanyConfigsGetTicketCompanyConfigPost()
      .pipe(
        map((res) => res.data?.ticket_company_config),
        catchError((e) => {
          // If the company config is not found, it means ticketing is disabled
          if (e.status === 404) {
            return of({});
          }
          throw e;
        }),
      );
  }

  public getTicketTypes$() {
    return this.ticketingHubApi
      .ticketingHubTicketTypesGetTicketTypesPost({
        travisBackendControllersTicketingHubControllersTicketingHubControllerGetTicketTypesRequest:
          {
            filter_groups: [
              {
                filters: [
                  {
                    field_name: 'record_statuses',
                    operator: 'array_contains',
                    value: 'Active',
                  },
                ],
              },
            ],
            sort: {
              field_name: 'sequence',
              direction: 'asc',
              is_case_sensitive: false,
            },
            limit: 10,
          },
      })
      .pipe(map((res) => res.data));
  }

  public getTicketPriorities$() {
    return this.ticketingHubApi
      .ticketingHubTicketPrioritiesGetTicketPrioritiesPost()
      .pipe(map((res) => res.data));
  }

  public createBlobUploadUrls$(type: 'Image' | 'File', count: number) {
    return this.ticketingHubApi
      .ticketingHubBlobsCreateBlobUploadSasUrlsPost({
        travisBackendControllersTicketingHubControllersTicketingHubControllerCreateBlobUploadSasUrlsRequest:
          {
            blob_type: type,
            number_of_blobs: count,
          },
      })
      .pipe(
        map((res) => {
          if (!res.data?.upload_blobs) {
            throw new Error('Invalid upload_blobs');
          }
          return res.data.upload_blobs;
        }),
        RxjsUtils.getRetryAPIRequest({
          delay: (error, retryCount) => {
            const delayTime = Math.pow(2, retryCount) * 1000; // Exponential backoff
            return of(error).pipe(delay(delayTime));
          },
        }),
      );
  }

  public createBlobDownloadUrl$(type: string, blobNames: string[]) {
    return this.ticketingHubApi
      .ticketingHubBlobsCreateBlobDownloadSasUrlsPost({
        travisBackendControllersTicketingHubControllersTicketingHubControllerCreateBlobDownloadSasUrlsRequest:
          {
            blob_type: type,
            blob_names: blobNames,
          },
      })
      .pipe(
        map((res) => {
          if (!res.data?.download_blobs) {
            throw new Error('Invalid download_blobs');
          }
          return res.data.download_blobs;
        }),
      );
  }

  public deleteBlobs$(type: string, blobNames: string[]) {
    return this.ticketingHubApi.ticketingHubBlobsDeleteBlobsPost({
      travisBackendControllersTicketingHubControllersTicketingHubControllerDeleteBlobsRequest:
        {
          blob_type: type,
          blob_names: blobNames,
        },
    });
  }

  public getComments$(
    request: TravisBackendControllersTicketingHubControllersTicketingHubControllerGetTicketCommentsRequest,
  ) {
    return this.ticketingHubApi
      .ticketingHubTicketCommentsGetTicketCommentsPost({
        travisBackendControllersTicketingHubControllersTicketingHubControllerGetTicketCommentsRequest:
          request,
      })
      .pipe(map((res) => res.data));
  }

  public createComment$(
    comment: TravisBackendControllersTicketingHubControllersTicketingHubControllerCreateTicketCommentRequest,
  ) {
    return this.ticketingHubApi
      .ticketingHubTicketCommentsCreateTicketCommentPost({
        travisBackendControllersTicketingHubControllersTicketingHubControllerCreateTicketCommentRequest:
          comment,
      })
      .pipe(map((res) => res.data));
  }

  public createTicket$(
    ticket: TravisBackendControllersTicketingHubControllersTicketingHubControllerCreateTicketRequest,
  ) {
    return this.ticketingHubApi.ticketingHubTicketsCreateTicketPost({
      travisBackendControllersTicketingHubControllersTicketingHubControllerCreateTicketRequest:
        ticket,
    });
  }

  public getTicketStatuses$() {
    return this.ticketingHubApi
      .ticketingHubTicketStatusesGetTicketStatusesPost()
      .pipe(map((res) => res.data));
  }

  public getTickets$(
    params: TravisBackendControllersTicketingHubControllersTicketingHubControllerGetTicketsRequest,
  ) {
    return this.ticketingHubApi
      .ticketingHubTicketsGetTicketsPost({
        travisBackendControllersTicketingHubControllersTicketingHubControllerGetTicketsRequest:
          params,
      })
      .pipe(map((res) => res.data));
  }

  public getTicket$(ticketId: string) {
    return this.ticketingHubApi
      .ticketingHubTicketsGetTicketPost({
        travisBackendControllersTicketingHubControllersTicketingHubControllerGetTicketRequest:
          { id: ticketId },
      })
      .pipe(map((res) => res.data?.ticket));
  }

  public updateTicket$(ticketId: string, ticket: Partial<TicketDetails>) {
    return this.ticketingHubApi
      .ticketingHubTicketsUpdateTicketPost({
        travisBackendControllersTicketingHubControllersTicketingHubControllerUpdateTicketRequest:
          {
            id: ticketId,
            updated_properties: ticket,
          },
      })
      .pipe(map((res) => res.data?.ticket));
  }

  public deleteTickets$(ticketIds: string[]) {
    return this.ticketingHubApi.ticketingHubTicketsDeleteTicketsPost({
      travisBackendControllersTicketingHubControllersTicketingHubControllerDeleteTicketsRequest:
        { ids: ticketIds },
    });
  }

  public getTicketCount$(
    params: TravisBackendControllersTicketingHubControllersTicketingHubControllerGetTicketCountRequest,
  ) {
    return this.ticketingHubApi
      .ticketingHubTicketsGetTicketCountPost({
        travisBackendControllersTicketingHubControllersTicketingHubControllerGetTicketCountRequest:
          params,
      })
      .pipe(
        map(
          (res) =>
            (
              res.data as {
                ticket_count: TicketCountResult[];
              }
            ).ticket_count,
        ),
      );
  }

  public createTicketType$(label: string) {
    return this.ticketingHubApi
      .ticketingHubTicketTypesCreateTicketTypePost({
        travisBackendControllersTicketingHubControllersTicketingHubControllerCreateTicketTypeRequest:
          { label },
      })
      .pipe(map((res) => res.data));
  }

  public updateTicketType$(
    params: TravisBackendControllersTicketingHubControllersTicketingHubControllerUpdateTicketTypeRequest,
  ) {
    return this.ticketingHubApi
      .ticketingHubTicketTypesUpdateTicketTypePost({
        travisBackendControllersTicketingHubControllersTicketingHubControllerUpdateTicketTypeRequest:
          params,
      })
      .pipe(map((res) => res.data?.records));
  }

  public updateTicketTypeOrder$(order: { id: string; sequence: number }[]) {
    return this.ticketingHubApi
      .ticketingHubTicketTypesUpdateTicketTypeOrderPost({
        travisBackendControllersTicketingHubControllersTicketingHubControllerUpdateTicketTypeOrderRequest:
          { ticket_types: order },
      })
      .pipe(map((res) => res.data));
  }

  public deleteTicketType$(id: string) {
    return this.ticketingHubApi
      .ticketingHubTicketTypesDeleteTicketTypePost({
        travisBackendControllersTicketingHubControllersTicketingHubControllerDeleteTicketTypeRequest:
          { id },
      })
      .pipe(map((res) => res.data));
  }

  public getTicketActivities$(params: TicketActivityRequest) {
    return this.ticketingHubApi
      .ticketingHubTicketActivitiesGetTicketActivitiesPost({
        travisBackendControllersTicketingHubControllersTicketingHubControllerGetTicketActivitiesRequest:
          {
            filter_groups: [
              {
                filters: [
                  {
                    field_name: 'ticket_id',
                    operator: '=',
                    value: params.ticketId,
                  },
                ],
              },
            ],
            sort: {
              direction: 'desc',
              field_name: 'created_at',
              is_case_sensitive: false,
            },
            limit: params.limit,
            continuation_token: params.continuationToken,
          },
      })
      .pipe(map((res) => res.data!));
  }

  public updateTicketPermissions$(
    permissions: Record<
      string,
      Record<string, { type: string; value: string }[]>
    >,
  ) {
    return this.ticketingHubApi
      .ticketingHubTicketCompanyConfigsUpdateTicketCompanyConfigPost({
        travisBackendControllersTicketingHubControllersTicketingHubControllerUpdateTicketCompanyConfigRequest:
          { updated_properties: permissions },
      })
      .pipe(map((res) => res.data));
  }
}
