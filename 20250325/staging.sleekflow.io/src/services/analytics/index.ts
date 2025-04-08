import { Container } from 'inversify';

import { AnalyticsViewModel } from './analytics-view-model';
import { AnalyticsService } from './analytics.service';

function loadDeps(container: Container) {
  container
    .bind<AnalyticsService>(AnalyticsService)
    .to(AnalyticsService)
    .inSingletonScope();
  container
    .bind<AnalyticsViewModel>(AnalyticsViewModel)
    .to(AnalyticsViewModel)
    .inSingletonScope();
}

export const Analytics = {
  loadDeps,
};
