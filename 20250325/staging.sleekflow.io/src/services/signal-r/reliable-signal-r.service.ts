import * as signalR from '@microsoft/signalr';
import { inject, injectable } from 'inversify';
import {
  BehaviorSubject,
  combineLatest,
  concatMap,
  from,
  lastValueFrom,
  Subject,
  take,
} from 'rxjs';

import { LogService } from '@/services/logs/log.service';

import { AuthService } from '../auth.service';
import { UserService } from '../user.service';
import { SignalRRetryPolicy } from './signal-r-retry.policy';

// Example 1
// message_id "41GtZoZ3l4DEVEL"
// message "{\"id\":279171,\"companyId\":\"b6d7e442-38ae-4b9a-b100-2951729768bc\",\"conversationId\":\"400149d7-affb-4eb5-9d84-757616aa3234\",\"messageUniqueID\":\"wamid.HBgLODUyNjEwOTY2MjMVAgASGBQzQThGQzUxRTczRDJBRkUwNzlGOQA=\",\"messageChecksum\":null,\"channel\":\"whatsappcloudapi\",\"messageChannel\":null,\"sender\":null,\"facebookSender\":null,\"facebookReceiver\":null,\"whatsappSender\":null,\"whatsappReceiver\":null,\"webClientSender\":null,\"webClientReceiver\":null,\"weChatSender\":null,\"weChatReceiver\":null,\"lineSender\":null,\"lineReceiver\":null,\"smsSender\":null,\"smsReceiver\":null,\"instagramSender\":null,\"instagramReceiver\":null,\"whatsapp360DialogSender\":null,\"whatsapp360DialogReceiver\":null,\"dynamicChannelSender\":{\"companyId\":\"b6d7e442-38ae-4b9a-b100-2951729768bc\",\"channelType\":\"whatsappcloudapi\",\"channelIdentityId\":\"15734946372\",\"senderEntityId\":646119,\"userIdentityId\":\"85261096623\",\"userDisplayName\":\"Leo Choi\"},\"whatsappCloudApiSender\":{\"whatsappId\":\"85261096623\",\"whatsappUserDisplayName\":\"Leo Choi\",\"whatsappChannelPhoneNumber\":\"15734946372\"},\"whatsappCloudApiReceiver\":null,\"telegramSender\":null,\"telegramReceiver\":null,\"viberSender\":null,\"viberReceiver\":null,\"viberUser\":null,\"viberUserId\":null,\"telegramUser\":null,\"emailFrom\":null,\"emailTo\":null,\"emailCC\":null,\"subject\":null,\"messageAssignee\":null,\"messageType\":\"text\",\"deliveryType\":\"Normal\",\"messageContent\":\"Hi\",\"uploadedFiles\":[],\"createdAt\":\"2023-10-09T05:04:05.000Z\",\"updatedAt\":\"2023-10-09T05:04:05.000Z\",\"timestamp\":1696827845,\"localTimestamp\":null,\"status\":\"Received\",\"channelName\":\"whatsappcloudapi\",\"isSentFromSleekflow\":false,\"channelStatusMessage\":null,\"quotedMsgBody\":null,\"quotedMsgId\":null,\"isSandbox\":false,\"storyURL\":null,\"whatsapp360DialogExtendedMessagePayload\":null,\"sleekPayRecordId\":null,\"sleekPayRecord\":null,\"extendedMessagePayload\":null,\"isFromImport\":false,\"metadata\":{}}"
// message_type "Classic.OnMessageReceived"
// unix_time_milliseconds 1696827848808
// sequence 17
export interface MessageWrapper {
  message_id: string;
  message_type: string;
  message: string;
  unix_time_milliseconds: number;
  sequence: number;
}

export type RecommendedReplyStreamEndpointEmitEvent = {
  type: 'emit';
  clientRequestId: string;
  partialRecommendedReply: string;
};

export type RecommendedReplyStreamEndpointFinishedEvent = {
  type: 'finish';
  clientRequestId: string;
};

export type RecommendedReplyStreamEndpointEvent =
  | RecommendedReplyStreamEndpointEmitEvent
  | RecommendedReplyStreamEndpointFinishedEvent;

@injectable()
export class ReliableSignalRService {
  private sessionId: string | undefined;
  private connection: signalR.HubConnection | undefined;
  private connected$$ = new BehaviorSubject<boolean>(false);
  private messagesWrapper$$ = new Subject<MessageWrapper>();
  private recommededReplyStreamEndpoint$$ =
    new Subject<RecommendedReplyStreamEndpointEvent>();

  constructor(
    @inject(AuthService) private authService: AuthService,
    @inject(UserService) private userService: UserService,
    @inject(LogService)
    private logService: LogService,
  ) {}

  public getSessionId() {
    return this.sessionId;
  }

  public getConnected$() {
    return this.connected$$.asObservable();
  }

  private base64UrlEncode(data: string) {
    // Convert string data to Base64
    let base64 = btoa(data);

    // Modify Base64 to make it URL-friendly
    base64 = base64.replace('+', '-');
    base64 = base64.replace('/', '_');
    base64 = base64.replace(/=+$/, '');

    return base64;
  }

  public initSignalR() {
    return combineLatest([
      this.userService.getMyCompany$().pipe(take(1)),
      this.userService.getMyStaff$().pipe(take(1)),
    ]).pipe(
      concatMap(([company, staff]) => {
        if (this.connection !== undefined) {
          this.stopConnectionAsync();
        }

        return from(
          this.initSignalRWithParamsAsync(staff.id, [
            `COMPANY_${company.id}`,
          ]).then((connection) => {
            this.connection = connection;

            return connection;
          }),
        );
      }),
    );
  }

  public getMessageWrappers$() {
    return this.messagesWrapper$$.asObservable();
  }

  public getRecommededReplyStreamEndpoint$() {
    return this.recommededReplyStreamEndpoint$$.asObservable();
  }

  private stopConnectionAsync() {
    this.connection?.stop();
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
    userId: string,
    groupIds: string[],
  ): Promise<signalR.HubConnection> {
    // This is only for "Sessions.InitSession"
    const data = {
      user_id: userId,
      group_ids: groupIds,
    };

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(
        import.meta.env.VITE_SLEEKFLOW_API_BASE_URL +
          '/v1/user-event-hub/ReliableMessage?data=' +
          this.base64UrlEncode(JSON.stringify(data)),
        {
          accessTokenFactory: async () => {
            return await lastValueFrom(
              this.authService.getAccessTokenSilently$().pipe(take(1)),
            );
          },
        },
      )
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
      connection
        .invoke('Sessions.JoinSession', this.sessionId)
        .then(() => {
          console.log(`Reconnecting with sessionId${this.sessionId}!`);
          this.connected$$.next(true);
        })
        .catch((err) => {
          this.connected$$.next(false);
          console.error(err.toString());
        });
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

      throw new Error('Unable to connect ReliableSignalR');
    });

    connection.on('Exceptions.SessionNotFoundException', () => {
      // The session is expired or not existed
      // Need to reset everything
      window.location.reload();

      throw new Error('Unable to join the session');
    });

    connection.on('Exceptions.AlreadyJoinedSessionException', () => {
      // ignored
    });

    connection.on('Sessions.JoinedSession', (mySessionId) => {
      if (this.sessionId === undefined) {
        this.sessionId = mySessionId;
      } else if (this.sessionId !== mySessionId) {
        this.logService.error('SessionId is not matched', {
          currentSessionId: this.sessionId,
          targetSessionId: mySessionId,
        });
      }
    });

    connection.on('Sessions.LeftSessionMessage', (mySessionId) => {
      if (this.sessionId !== mySessionId) {
        this.logService.error('SessionId is not matched', {
          currentSessionId: this.sessionId,
          targetSessionId: mySessionId,
        });
      } else {
        this.sessionId = undefined;
      }
    });

    connection.on(
      'Reliable.ReceiveMessage',
      (_messageType, _connectionId, messageWrapperJson) => {
        const messageWrapper = JSON.parse(messageWrapperJson) as MessageWrapper;

        this.messagesWrapper$$.next(messageWrapper);

        connection
          .invoke('Reliable.AckMessage', messageWrapper.message_id)
          .catch((err) => this.logService.error(err.toString()));
      },
    );

    connection.on(
      'RecommendedReply.StreamEmit',
      (clientRequestId, partialRecommendedReply) => {
        this.recommededReplyStreamEndpoint$$.next({
          type: 'emit',
          clientRequestId: clientRequestId,
          partialRecommendedReply: partialRecommendedReply,
        });
      },
    );

    connection.on('RecommendedReply.StreamEmitFinished', (clientRequestId) => {
      this.recommededReplyStreamEndpoint$$.next({
        type: 'finish',
        clientRequestId: clientRequestId,
      });
    });

    try {
      await connection.invoke('Sessions.InitSession');
    } catch (err: any) {
      this.logService.error("Can't init session", err.toString());

      await connection.stop();

      throw new Error(
        'Unable to connect ReliableSignalR when Sessions.InitSession',
      );
    }

    return connection;
  }
}
