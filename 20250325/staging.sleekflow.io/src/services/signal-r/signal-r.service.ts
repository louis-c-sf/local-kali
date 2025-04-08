import * as signalR from '@microsoft/signalr';
import { v4 as uuid4 } from 'uuid';
import {
  SleekflowApisMessagingHubModelBusinessBalanceDto,
  TravisBackendBroadcastDomainViewModelsCompanyMessageTemplateResponse,
  TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
  TravisBackendConversationDomainViewModelsDeleteRemarkResponse,
  TravisBackendConversationDomainViewModelsRemarkResponse,
  TravisBackendConversationDomainViewModelsUpdateRemarkResponse,
  TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel,
  TravisBackendMessageDomainViewModelsConversationTypingObject,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { inject, injectable } from 'inversify';
import { BehaviorSubject, concatMap, lastValueFrom, Subject, take } from 'rxjs';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';

import { getUserDefaultWorkspace } from '@/api/tenantHub';
import type { BackgroundTaskResponseTypeFromApi } from '@/api/types';
import { LogService } from '@/services/logs/log.service';

import { AuthService } from '../auth.service';
import { UserService } from '../user.service';
import { SignalRRetryPolicy } from './signal-r-retry.policy';

export interface TravisBackendWebPushNotification {
  event: string;
  title: string;
  body: string;
  companyId: string;
  conversationId: string;
  assigneeId: string;
  profileName: string;
  badge: number;
  channelType: string;
  channelIdentityId: string;
}

type DeviceSessionType = {
  deviceName: string;
  deviceType: 'Mobile' | 'Web';
  sessionStatus: 'Active' | 'Deactivate' | 'AutoLogout';
  createdAt: string;
  updatedAt: string;
  uuid: string;
};

export const BROWSER_ID_STORAGE_KEY = 'SF_V2_BROWSER_ID';

@injectable()
export class SignalRService {
  private connection: signalR.HubConnection | undefined;
  private connected$$ = new BehaviorSubject(false);
  private browserId =
    window.localStorage.getItem(BROWSER_ID_STORAGE_KEY) ?? uuid4();

  constructor(
    @inject(AuthService) private authService: AuthService,
    @inject(UserService) private userService: UserService,
    @inject(LogService)
    private logService: LogService,
  ) {}

  public getConnected$() {
    return this.connected$$.asObservable();
  }

  public initSignalR() {
    return this.userService.getMyCompany$().pipe(
      concatMap((company) => {
        if (this.connection !== undefined) {
          this.stopConnectionAsync();
        }

        return fromPromise(
          this.initSignalRWithParamsAsync([company.id]).then((connection) => {
            this.connection = connection;

            return connection;
          }),
        );
      }),
    );
  }

  private onWhatsappCloudApiBusinessBalanceChanged$$ =
    new Subject<SleekflowApisMessagingHubModelBusinessBalanceDto>();
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

  private forceLogout$$ = new BehaviorSubject<DeviceSessionType | null>(null);

  private autoLogout$$ = new BehaviorSubject<DeviceSessionType | null>(null);
  public getWhatsappBusinessBalance$() {
    return this.onWhatsappCloudApiBusinessBalanceChanged$$.asObservable();
  }

  public getOnConversationAdded$() {
    return this.onConversationAdded$$.asObservable();
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

  public getForceLogout$() {
    return this.forceLogout$$.asObservable();
  }

  public getAutoLogout$() {
    return this.autoLogout$$.asObservable();
  }

  public getOnConversationStatusChanged$() {
    return this.onConversationStatusChanged$$.asObservable();
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
    return this.onMessageReceived$$.asObservable();
  }

  public getOnMessageStatusChanged$() {
    return this.onMessageStatusChanged$$.asObservable();
  }

  public getOnConversationNoteReceived$() {
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

  private onBroadcastCampaignSending$$ =
    new Subject<TravisBackendBroadcastDomainViewModelsCompanyMessageTemplateResponse>();

  public getOnBroadcastCampaignSending$() {
    return this.onBroadcastCampaignSending$$.asObservable();
  }

  private onBroadcastCampaignSent$$ =
    new Subject<TravisBackendBroadcastDomainViewModelsCompanyMessageTemplateResponse>();

  public getOnBroadcastCampaignSent$() {
    return this.onBroadcastCampaignSent$$.asObservable();
  }

  private stopConnectionAsync() {
    this.connection?.stop();
    this.connected$$.next(false);
    this.connection = undefined;
  }

  public async startConnection(
    connection: signalR.HubConnection,
  ): Promise<void> {
    try {
      let retryCount = 0;
      let connected = false;
      let retryInterval = 1000;

      while (retryCount < 10 && !connected) {
        try {
          await connection.start();
          connected = true; // Connection started successfully
        } catch (err) {
          retryCount++;
          this.logService.error(
            `Attempt ${retryCount} to start the connection failed.`,
            err,
          );
          // Wait for retryInterval milliseconds before the next attempt
          await new Promise((resolve) => setTimeout(resolve, retryInterval));
          // Increase the retryInterval for an exponential backoff
          retryInterval *= 2;
        }
      }

      if (!connected) {
        throw new Error(
          'Failed to start the SignalR connection after retries.',
        );
      }
    } catch (err) {
      console.error('Error while starting connection:', err);

      // You can handle the final error here if all retries fail
      // For example, you could alert the user or log this issue to a monitoring service
    }
  }

  private async ensureConnectionIsStarted(
    connection: signalR.HubConnection,
    callbacks?: {
      onConnected?: () => void;
      onConnectionError?: (error: Error) => void;
    },
  ): Promise<void> {
    await this.startConnection(connection);
    if (
      connection &&
      connection.state !== signalR.HubConnectionState.Connected
    ) {
      const error = new Error('SignalR connection has not been established.');
      callbacks?.onConnectionError?.(error);
      throw error;
    }
    callbacks?.onConnected?.();
  }

  private async initSignalRWithParamsAsync(
    groupIds: string[],
  ): Promise<signalR.HubConnection> {
    const defaultUserWorkspace = await getUserDefaultWorkspace();

    // This is only for "Sessions.InitSession"
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(import.meta.env.VITE_API_BASE_URL + '/chat', {
        accessTokenFactory: async () => {
          return await lastValueFrom(
            this.authService.getAccessTokenSilently$().pipe(take(1)),
          );
        },
        headers: {
          'X-Sleekflow-Location': defaultUserWorkspace.server_location,
        },
      })
      // 192000 = ~ 3 minutes
      .withAutomaticReconnect(new SignalRRetryPolicy())
      .configureLogging(signalR.LogLevel.Debug)
      .build();

    await this.ensureConnectionIsStarted(connection, {
      onConnected: () => {
        this.connected$$.next(true);
      },
      onConnectionError: () => {
        this.connected$$.next(false);
      },
    });

    connection.onreconnected(() => {
      this.connected$$.next(true);
    });

    connection.onreconnecting(() => {
      this.connected$$.next(false);
    });

    connection.onclose((error) => {
      console.assert(
        connection.state === signalR.HubConnectionState.Disconnected,
      );
      this.connected$$.next(false);
      console.error(error);

      window.location.reload();

      throw new Error('Unable to connect SignalR');
    });

    connection.on('OnConversationAdded', (message) => {
      this.onConversationAdded$$.next(message);
    });
    connection.on('OnConversationStatusChanged', (message) => {
      this.onConversationStatusChanged$$.next(message);
    });
    connection.on('OnConversationAssigneeChanged', (message) => {
      this.onConversationAssigneeChanged$$.next(message);
    });
    connection.on('OnConversationAssigneeDeleted', (message) => {
      this.onConversationAssigneeDeleted$$.next(message);
    });
    connection.on('OnConversationAssignTeamChanged', (message) => {
      this.onConversationAssignTeamChanged$$.next(message);
    });

    connection.on('OnConversationTyping', (message) => {
      this.onConversationTyping$$.next(message);
    });

    connection.on('ForceLogout', (message) => {
      this.forceLogout$$.next(message);
    });

    connection.on('AutoLogout', (message) => {
      this.autoLogout$$.next(message);
    });

    connection.on('OnConversationAdditionalAssigneeAdded', (message) => {
      this.onConversationAdditionalAssigneeAdded$$.next(message.conversation);
    });
    connection.on('OnConversationAdditionalAssigneeDeleted', (message) => {
      this.onConversationAdditionalAssigneeDeleted$$.next(message.conversation);
    });
    connection.on('OnConversationAdditionalAssigneeExceeded', (message) => {
      this.onConversationAdditionalAssigneeExceeded$$.next(
        message.conversation,
      );
    });

    connection.on('OnWhatsappCloudApiBusinessBalanceChanged', (message) => {
      this.onWhatsappCloudApiBusinessBalanceChanged$$.next(message);
    });

    connection.on('OnMessageReceived', (message) => {
      this.onMessageReceived$$.next(message);
    });
    connection.on('OnMessageStatusChanged', (message) => {
      this.onMessageStatusChanged$$.next(message);
    });
    connection.on('OnConversationNoteReceived', (message) => {
      this.onConversationNoteReceived$$.next(message);
    });

    connection.on('OnRemarksReceived', (message) => {
      this.onRemarksReceived$$.next(message);
    });

    connection.on('OnRemarkUpdated', (message) => {
      this.onRemarkUpdated$$.next(message);
    });

    connection.on('OnRemarkDeleted', (message) => {
      this.onRemarkDeleted$$.next(message);
    });

    connection.on('PushNotitions', (message) => {
      this.onPushNotification$$.next(message);
    });

    connection.on('OnBackgroundTaskStatusChange', (message) => {
      this.onBackgroundTaskStatusChange$$.next(message);
    });

    connection.on('OnBroadcastCampaignSending', (message) => {
      this.onBroadcastCampaignSending$$.next(message);
    });

    connection.on('OnBroadcastCampaignSent', (message) => {
      this.onBroadcastCampaignSent$$.next(message);
    });

    if (!window.localStorage.getItem(BROWSER_ID_STORAGE_KEY)) {
      await connection.invoke('DeviceAddToGroup', this.browserId);
      window.localStorage.setItem(BROWSER_ID_STORAGE_KEY, this.browserId);
    } else {
      await connection.invoke(
        'DeviceAddToGroup',
        window.localStorage.getItem(BROWSER_ID_STORAGE_KEY),
      );
    }

    await Promise.all(
      groupIds.map(async (groupId) => {
        try {
          return await connection.invoke('AddToGroup', groupId);
        } catch (err: any) {
          console.error("Can't init session", err.toString());

          await connection.stop();
        }
      }),
    );

    return connection;
  }
}
