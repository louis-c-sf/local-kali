import { Container } from 'inversify';

import { ClassicRealTimeService } from './classic-real-time.service';
import { ReliableSignalRService } from './reliable-signal-r.service';
import { SignalRRetryPolicy } from './signal-r-retry.policy';
import { SignalRService } from './signal-r.service';

function loadDeps(container: Container) {
  container
    .bind<ClassicRealTimeService>(ClassicRealTimeService)
    .to(ClassicRealTimeService)
    .inSingletonScope();
  container
    .bind<ReliableSignalRService>(ReliableSignalRService)
    .to(ReliableSignalRService)
    .inSingletonScope();
  container
    .bind<SignalRService>(SignalRService)
    .to(SignalRService)
    .inSingletonScope();
  container
    .bind<SignalRRetryPolicy>(SignalRRetryPolicy)
    .to(SignalRRetryPolicy)
    .inSingletonScope();
}

export const SignalR = {
  loadDeps,
};
