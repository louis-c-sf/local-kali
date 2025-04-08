import {
  TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
  TravisBackendConversationDomainViewModelsDeleteRemarkResponse,
  TravisBackendConversationDomainViewModelsRemarkResponse,
  TravisBackendConversationDomainViewModelsUpdateRemarkResponse,
  TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel,
  TravisBackendMessageDomainViewModelsConversationTypingObject,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { inject, injectable } from 'inversify';
import {
  combineLatestWith,
  filter,
  map,
  merge,
  Observable,
  shareReplay,
  Subject,
  switchMap,
  take,
} from 'rxjs';

import type { BackgroundTaskResponseTypeFromApi } from '@/api/types';
import { LimitedSet } from '@/services/data-structures/limited-set';
import { LogService } from '@/services/logs/log.service';

import { CompanyService } from '../companies/company.service';
import { ReliableSignalRService } from './reliable-signal-r.service';
import {
  SignalRService,
  type TravisBackendWebPushNotification,
} from './signal-r.service';

@injectable()
export class ClassicRealTimeService {
  private onMessageReceivedIdLimitedSet = new LimitedSet<number>(1000);

  constructor(
    @inject(SignalRService) private signalRService: SignalRService,
    @inject(ReliableSignalRService)
    private reliableSignalRService: ReliableSignalRService,
    @inject(CompanyService) private companyService: CompanyService,
    @inject(LogService)
    private logService: LogService,
  ) {
    this.signalRService.getOnConversationAdded$().subscribe((x) => {
      this.onConversationAdded$$.next(x);
    });
    this.signalRService.getOnConversationStatusChanged$().subscribe((x) => {
      this.onConversationStatusChanged$$.next(x);
    });
    this.signalRService.getOnConversationAssigneeChanged$().subscribe((x) => {
      this.onConversationAssigneeChanged$$.next(x);
    });
    this.signalRService.getOnConversationAssigneeDeleted$().subscribe((x) => {
      this.onConversationAssigneeDeleted$$.next(x);
    });
    this.signalRService.getOnConversationAssignTeamChanged$().subscribe((x) => {
      this.onConversationAssignTeamChanged$$.next(x);
    });

    this.signalRService.getOnConversationTyping$().subscribe((x) => {
      this.onConversationTyping$$.next(x);
    });

    this.signalRService
      .getOnConversationAdditionalAssigneeAdded$()
      .subscribe((x) => {
        this.onConversationAdditionalAssigneeAdded$$.next(x);
      });

    this.signalRService
      .getOnConversationAdditionalAssigneeDeleted$()
      .subscribe((x) => {
        this.onConversationAdditionalAssigneeDeleted$$.next(x);
      });

    this.signalRService
      .getOnConversationAdditionalAssigneeExceeded$()
      .subscribe((x) => {
        this.onConversationAdditionalAssigneeExceeded$$.next(x);
      });

    this.signalRService.getOnMessageReceived$().subscribe((x) => {
      this.onNextOnMessageReceived(x);
    });
    this.signalRService.getOnMessageStatusChanged$().subscribe((x) => {
      this.onNextOnMessageStatusChanged(x);
    });
    this.signalRService.getOnConversationNoteReceived$().subscribe((x) => {
      this.onConversationNoteReceived$$.next(x);
    });

    this.signalRService.getOnRemarksReceived$().subscribe((x) => {
      this.onRemarksReceived$$.next(x);
    });

    this.signalRService.getOnRemarkUpdated$().subscribe((x) => {
      this.onRemarkUpdated$$.next(x);
    });

    this.signalRService.getOnRemarkDeleted$().subscribe((x) => {
      this.onRemarkDeleted$$.next(x);
    });

    this.signalRService.getOnPushNotification$().subscribe((x) => {
      this.onPushNotification$$.next(x);
    });

    this.signalRService.getOnBackgroundTaskStatusChange$().subscribe((x) => {
      this.onBackgroundTaskStatusChange$$.next(x);
    });

    this.reliableSignalRService.getMessageWrappers$().subscribe((x) => {
      switch (x.message_type) {
        case 'Classic.OnMessageReceived': {
          const model = JSON.parse(
            x.message,
          ) as TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel;

          this.onNextOnMessageReceived(model);

          break;
        }
        case 'Classic.OnMessageStatusChanged': {
          const model = JSON.parse(
            x.message,
          ) as TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel;
          this.onNextOnMessageStatusChanged(model);
          break;
        }
        default:
          this.logService.log(`Unknown message type: '${x.message_type}'.`);
          break;
      }
    });
  }

  // We make this method because we want to keep getOnMessageReceived$ is hot observable
  // If we filter the message in getOnMessageReceived$, it will become cold observable
  private onNextOnMessageReceived(
    model: TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel,
  ) {
    if (model.id === undefined || model.id === null) {
      return;
    }

    if (this.onMessageReceivedIdLimitedSet.has(model.id)) {
      return;
    }

    this.onMessageReceivedIdLimitedSet.add(model.id);
    this.onMessageReceived$$.next(model);
  }

  private onNextOnMessageStatusChanged(
    model: TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel,
  ) {
    if (model.id === undefined || model.id === null) {
      return;
    }

    this.onMessageStatusChanged$$.next(model);
  }

  public init() {
    this.reliableSignalRService.initSignalR().subscribe(undefined, (err) => {
      this.logService.error(
        'ReliableSignalRService.initSignalR() failed.',
        err,
      );

      window.location.reload();
    });
    this.signalRService.initSignalR().subscribe(undefined, (err) => {
      this.logService.error('SignalRService.initSignalR() failed.', err);

      window.location.reload();
    });
  }

  /**
   * This is a unified method for all the events related to conversations
   */
  public getOnConversationChanged$(): Observable<TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel> {
    return merge(
      this.getOnConversationAdded$(),
      this.getOnConversationAssigneeChanged$(),
      this.getOnConversationAssigneeDeleted$(),
      this.getOnConversationAssignTeamChanged$(),
      this.getOnConversationStatusChanged$(),
      this.getOnConversationAdditionalAssigneeAdded$(),
      this.getOnConversationAdditionalAssigneeDeleted$(),
      this.getOnConversationAdditionalAssigneeExceeded$(),
    ).pipe(
      shareReplay({
        bufferSize: 1,
        refCount: false,
      }),
    );
  }

  /**
   * This is a unified method for all the events related to conversation messages
   */
  public getOnConversationMessageChanged$(): Observable<TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel> {
    return merge(
      this.getOnMessageReceived$(),
      this.getOnMessageStatusChanged$(),
      this.getOnConversationNoteReceivedChanged$(),
    ).pipe(
      shareReplay({
        bufferSize: 1,
        refCount: false,
      }),
    );
  }

  private onConversationAdded$$ =
    new Subject<TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel>();
  private onConversationStatusChanged$$ =
    new Subject<TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel>();
  private onConversationAssigneeChanged$$ =
    new Subject<TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel>();
  private onConversationAssigneeDeleted$$ =
    new Subject<TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel>();
  private onConversationAssignTeamChanged$$ =
    new Subject<TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel>();

  private onConversationTyping$$ =
    new Subject<TravisBackendMessageDomainViewModelsConversationTypingObject>();

  public getOnConversationAdded$() {
    return this.onConversationAdded$$.asObservable();
  }

  public getOnConversationStatusChanged$() {
    return this.onConversationStatusChanged$$.asObservable();
  }

  public getOnConversationAssigneeChanged$() {
    return this.onConversationAssigneeChanged$$.asObservable();
  }

  public getOnConversationAssigneeDeleted$() {
    return this.onConversationAssigneeDeleted$$.asObservable();
  }

  public getOnConversationAssignTeamChanged$() {
    return this.onConversationAssignTeamChanged$$.asObservable();
  }

  public getOnConversationTyping$() {
    return this.onConversationTyping$$.asObservable();
  }

  private onConversationAdditionalAssigneeAdded$$ =
    new Subject<TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel>();
  private onConversationAdditionalAssigneeDeleted$$ =
    new Subject<TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel>();
  private onConversationAdditionalAssigneeExceeded$$ =
    new Subject<TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel>();

  public getOnConversationAdditionalAssigneeAdded$() {
    return this.onConversationAdditionalAssigneeAdded$$.asObservable();
  }

  public getOnConversationAdditionalAssigneeDeleted$() {
    return this.onConversationAdditionalAssigneeDeleted$$.asObservable();
  }

  public getOnConversationAdditionalAssigneeExceeded$() {
    return this.onConversationAdditionalAssigneeExceeded$$.asObservable();
  }

  private onMessageReceived$$ =
    new Subject<TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel>();
  private onMessageStatusChanged$$ =
    new Subject<TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel>();
  private onConversationNoteReceived$$ =
    new Subject<TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel>();

  public getOnMessageReceived$() {
    return this.companyService.getIsLoadingDisplayableMessageChannels$().pipe(
      filter((isLoading) => !isLoading),
      take(1),
      switchMap(() =>
        this.onMessageReceived$$.asObservable().pipe(
          combineLatestWith(
            this.companyService.getDisplayableMessageChannels$().pipe(take(1)),
          ),
          filter(([message, channels]) =>
            channels.some(
              (c) =>
                (c.channelType === message.channel &&
                  c.channelIdentityId === message.channelIdentityId) ||
                c.channelType === 'note' ||
                c.channelType === 'web',
            ),
          ),
          // Extract only the message from the result tuple for the subscriber
          map(([message, _]) => message),
          shareReplay({
            bufferSize: 1,
            refCount: false,
          }),
        ),
      ),
    );
  }

  private getOnMessageStatusChanged$() {
    return this.companyService.getIsLoadingDisplayableMessageChannels$().pipe(
      filter((isLoading) => !isLoading),
      take(1),
      switchMap(() =>
        this.onMessageStatusChanged$$.asObservable().pipe(
          combineLatestWith(
            this.companyService.getDisplayableMessageChannels$().pipe(take(1)),
          ),
          filter(([message, channels]) =>
            channels.some(
              (c) =>
                (c.channelType === message.channel &&
                  c.channelIdentityId === message.channelIdentityId) ||
                c.channelType === 'note' ||
                c.channelType === 'web',
            ),
          ),
          // Extract only the message from the result tuple for the subscriber
          map(([message]) => message),

          shareReplay({
            bufferSize: 1,
            refCount: false,
          }),
        ),
      ),
    );
  }

  private getOnConversationNoteReceivedChanged$() {
    return this.onConversationNoteReceived$$.asObservable();
  }

  private onRemarksReceived$$ =
    new Subject<TravisBackendConversationDomainViewModelsRemarkResponse>();

  public getOnRemarksReceived$() {
    return this.onRemarksReceived$$.asObservable();
  }

  private onRemarkUpdated$$ =
    new Subject<TravisBackendConversationDomainViewModelsUpdateRemarkResponse>();

  public getOnRemarkUpdated$() {
    return this.onRemarkUpdated$$.asObservable();
  }

  private onRemarkDeleted$$ =
    new Subject<TravisBackendConversationDomainViewModelsDeleteRemarkResponse>();

  public getOnRemarkDeleted$() {
    return this.onRemarkDeleted$$.asObservable();
  }

  private onPushNotification$$ =
    new Subject<TravisBackendWebPushNotification>();

  public getOnPushNotification$() {
    return this.onPushNotification$$.asObservable();
  }

  private onBackgroundTaskStatusChange$$ =
    new Subject<BackgroundTaskResponseTypeFromApi>();

  public getOnBackgroundTaskStatusChange$() {
    return this.onBackgroundTaskStatusChange$$.asObservable();
  }
}
