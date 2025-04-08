import type {
  TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
  TravisBackendConversationDomainViewModelsUserProfileNoCompanyResponse,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { inject, injectable } from 'inversify';
import { interval, Observable, Subject } from 'rxjs';

import { CompanyService } from '@/services/companies/company.service';
import { I18nService } from '@/services/i18n/i18n.service';

import type { ConversationWrapperLabel } from '../../conversations/managers/conversation-wrapper';
import { ClassicRealTimeService } from '../../signal-r/classic-real-time.service';
import {
  UserProfileWrapper,
  UserProfileWrapperList,
} from './user-profile-wrapper';

export interface UserProfileWrapperUpdate {
  id: string;
  type:
    | 'firstName'
    | 'lastName'
    | 'pictureUrl'
    | 'updatedAt'
    | 'labels'
    | 'lists'
    | 'supportedMessagingChannels'
    | 'lastContact';
  newValue: {
    firstName?: string;
    lastName?: string;
    pictureUrl?: string;
    updatedAt?: string;
    labels?: ConversationWrapperLabel[];
    lists?: UserProfileWrapperList[];
    supportedMessagingChannels?: string[];
    lastContact?: string;
  };
}

@injectable()
export class UserProfileWrapperManagerService {
  private userProfileIdToUserProfileWrapperMap = new Map<
    string,
    {
      userProfileWrapper: UserProfileWrapper;
      lastObservedAt: number;
    }
  >();
  private userProfileWrapperUpdate$$ = new Subject<UserProfileWrapperUpdate>();

  constructor(
    @inject(I18nService) private translationService: I18nService,
    @inject(ClassicRealTimeService)
    private classicRealTimeService: ClassicRealTimeService,
    @inject(CompanyService) private companyService: CompanyService,
  ) {
    this.classicRealTimeService
      .getOnConversationChanged$()
      .subscribe(
        (
          x: TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
        ) => {
          if (x.userProfile?.id === undefined || x.userProfile?.id === null) {
            return;
          }

          const userProfileWrapper = this.getUserProfileWrapper(
            x.userProfile?.id,
          );
          if (userProfileWrapper === undefined) {
            return;
          }

          userProfileWrapper.onNextTravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel(
            x,
          );
        },
      );

    interval(60_000).subscribe(() => {
      const recyclingUserProfileIds: string[] = [];
      this.userProfileIdToUserProfileWrapperMap.forEach((obj, key) => {
        if (
          new Date().getTime() - obj.lastObservedAt > 60_000 &&
          !obj.userProfileWrapper.observed()
        ) {
          recyclingUserProfileIds.push(key);
        }
      });
      recyclingUserProfileIds.forEach((id) => {
        const userProfileWrapperEntry =
          this.userProfileIdToUserProfileWrapperMap.get(id);

        console.log(
          'Recycling UserProfileWrapper',
          id,
          userProfileWrapperEntry,
        );

        userProfileWrapperEntry?.userProfileWrapper.destroy();
        this.userProfileIdToUserProfileWrapperMap.delete(id);
      });
    });
  }

  public getUserProfileWrapperUpdate$(): Observable<UserProfileWrapperUpdate> {
    return this.userProfileWrapperUpdate$$.asObservable();
  }

  public getOrInitUserProfileWrapper(
    id: string,
    travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse: TravisBackendConversationDomainViewModelsUserProfileNoCompanyResponse,
  ): UserProfileWrapper {
    // Asserts
    if (
      !id ||
      !travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.id
    ) {
      throw new Error('userProfileId is required.');
    }
    if (
      id !==
      travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.id
    ) {
      throw new Error('userProfileId does not match');
    }

    // Check if userProfileWrapper exists and update it
    const userProfileWrapper = this.getUserProfileWrapper(
      travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.id,
    );
    if (userProfileWrapper !== undefined) {
      userProfileWrapper.onNextTravisBackendConversationDomainViewModelsUserProfileNoCompanyResponse(
        travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse,
      );

      this.userProfileIdToUserProfileWrapperMap.set(id, {
        userProfileWrapper: userProfileWrapper,
        lastObservedAt: new Date().getTime(),
      });

      return userProfileWrapper;
    }

    const newUserProfileWrapper = new UserProfileWrapper({
      userProfileWrapperConstructorParams: {
        travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse:
          travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse,
      },
      userProfileWrapperUpdate$$: this.userProfileWrapperUpdate$$,
      companyService: this.companyService,
      translationService: this.translationService,
    });

    this.userProfileIdToUserProfileWrapperMap.set(id, {
      userProfileWrapper: newUserProfileWrapper,
      lastObservedAt: new Date().getTime(),
    });

    return newUserProfileWrapper;
  }

  public getOrInitUserProfileWrapper2(
    id: string,
    travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel: TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
  ): UserProfileWrapper {
    const userProfile =
      travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.userProfile;
    // Asserts
    if (userProfile === undefined || userProfile === null) {
      throw new Error('userProfile is required');
    }
    if (!id || !userProfile.id) {
      throw new Error('userProfileId is required. !id || !userProfile.id');
    }
    if (id !== userProfile.id) {
      throw new Error('userProfileId does not match');
    }

    // Check if userProfileWrapper exists and update it
    const userProfileWrapper = this.getUserProfileWrapper(userProfile.id);
    if (userProfileWrapper !== undefined) {
      userProfileWrapper.onNextTravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel(
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
      );

      this.userProfileIdToUserProfileWrapperMap.set(id, {
        userProfileWrapper: userProfileWrapper,
        lastObservedAt: new Date().getTime(),
      });

      return userProfileWrapper;
    }

    // Create new userProfileWrapper
    const newUserProfileWrapper = new UserProfileWrapper({
      userProfileWrapperConstructorParams: {
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel:
          travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
      },
      userProfileWrapperUpdate$$: this.userProfileWrapperUpdate$$,
      companyService: this.companyService,
      translationService: this.translationService,
    });

    this.userProfileIdToUserProfileWrapperMap.set(id, {
      userProfileWrapper: newUserProfileWrapper,
      lastObservedAt: new Date().getTime(),
    });

    return newUserProfileWrapper;
  }

  // Some APIs don't return the correct userProfileLists and customFields
  // getOrInitUserProfileWrapper3 ignores the userProfileLists and customFields
  public getOrInitUserProfileWrapper3(
    id: string,
    travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel: TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
  ): UserProfileWrapper {
    const userProfile =
      travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.userProfile;
    // Asserts
    if (userProfile === undefined || userProfile === null) {
      throw new Error('userProfile is required');
    }
    if (!id || !userProfile.id) {
      throw new Error('userProfileId is required. !id || !userProfile.id');
    }
    if (id !== userProfile.id) {
      throw new Error('userProfileId does not match');
    }

    // Check if userProfileWrapper exists and update it
    const userProfileWrapper = this.getUserProfileWrapper(userProfile.id);
    if (userProfileWrapper !== undefined) {
      userProfileWrapper.onNextTravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModelPartially(
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
      );

      this.userProfileIdToUserProfileWrapperMap.set(id, {
        userProfileWrapper: userProfileWrapper,
        lastObservedAt: new Date().getTime(),
      });

      return userProfileWrapper;
    }

    // Create new userProfileWrapper
    const newUserProfileWrapper = new UserProfileWrapper({
      userProfileWrapperConstructorParams: {
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModelPartially:
          travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
      },
      userProfileWrapperUpdate$$: this.userProfileWrapperUpdate$$,
      companyService: this.companyService,
      translationService: this.translationService,
    });

    this.userProfileIdToUserProfileWrapperMap.set(id, {
      userProfileWrapper: newUserProfileWrapper,
      lastObservedAt: new Date().getTime(),
    });

    return newUserProfileWrapper;
  }

  public getUserProfileWrapper(
    userProfileId: string,
  ): UserProfileWrapper | undefined {
    const obj = this.userProfileIdToUserProfileWrapperMap.get(userProfileId);
    if (obj === undefined) {
      return obj;
    }

    obj.lastObservedAt = new Date().getTime();

    return obj.userProfileWrapper;
  }
}
