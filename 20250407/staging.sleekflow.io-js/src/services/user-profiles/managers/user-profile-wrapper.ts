import {
  TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
  TravisBackendConversationDomainViewModelsUserProfileNoCompanyResponse,
  TravisBackendConversationDomainViewModelsWebClientResponse,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { formatISO } from 'date-fns';
import dayjs from 'dayjs';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  empty,
  map,
  ReplaySubject,
  startWith,
  Subject,
  switchMap,
  take,
} from 'rxjs';
import _isEqual from 'lodash/isEqual';

import {
  findEmailUserProfileField,
  findPhoneNumberUserProfileField,
} from '@/pages/Contacts/shared/utils';
import { CompanyService } from '@/services/companies/company.service';
import { I18nService } from '@/services/i18n/i18n.service';
import { getFullName } from '@/utils/formatting';

import type { ConversationWrapperLabel } from '../../conversations/managers/conversation-wrapper';
import { DisposableDataSource } from '../../data-sources/disposable-data-source';
import { Wrapper } from '../../models/wrapper';
import type { UserProfileWrapperUpdate } from './user-profile-wrapper-manager.service';

export interface UserProfileWrapperConstructorParams {
  travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse?: TravisBackendConversationDomainViewModelsUserProfileNoCompanyResponse;
  travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel?: TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel;
  travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModelPartially?: TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel;
}

export interface UserProfileWrapperList {
  id: number;
  name: string;
}

const INITIALIZING_USER_ID = 'user789';

export class UserProfileWrapper implements Wrapper {
  private readonly id: string;
  private readonly conversationId: string | null;
  private readonly createdAt: string | null;
  private readonly displayProfilePicture: string | null;
  private readonly webClient: TravisBackendConversationDomainViewModelsWebClientResponse | null;

  private updatedAtSnapshot = formatISO(new Date(+0));

  private readonly firstName$$ = new ReplaySubject<string>(1);
  private readonly lastName$$ = new ReplaySubject<string>(1);
  private readonly pictureUrl$$ = new ReplaySubject<string>(1);
  private readonly updatedAt$$ = new ReplaySubject<string>(1);
  private readonly labels$$ = new ReplaySubject<ConversationWrapperLabel[]>(1);
  private readonly fieldIds$$ = new ReplaySubject<string[]>(1);
  private readonly fieldIdToValue$$Map: Map<string, ReplaySubject<string>> =
    new Map<string, ReplaySubject<string>>();
  private readonly userProfileLists$$ = new BehaviorSubject<
    UserProfileWrapperList[] | null
  >(null);
  private readonly supportedMessagingChannels$$ = new BehaviorSubject<
    string[] | null
  >(null);

  private readonly lastContact$$ = new ReplaySubject<string>(1);
  // Fake
  private readonly emailAddress$$ = new ReplaySubject<string>(1);
  private readonly phoneNumber$$ = new ReplaySubject<string>(1);
  private userProfileWrapperUpdate$$: Subject<UserProfileWrapperUpdate>;
  private companyService?: CompanyService;
  private translationService: I18nService;

  constructor({
    userProfileWrapperConstructorParams,
    userProfileWrapperUpdate$$,
    companyService,
    translationService,
  }: {
    userProfileWrapperConstructorParams: UserProfileWrapperConstructorParams;
    userProfileWrapperUpdate$$: Subject<UserProfileWrapperUpdate>;
    companyService?: CompanyService;
    translationService: I18nService;
  }) {
    this.userProfileWrapperUpdate$$ = userProfileWrapperUpdate$$;
    this.companyService = companyService;
    this.translationService = translationService;
    if (
      userProfileWrapperConstructorParams.travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse
    ) {
      const travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse =
        userProfileWrapperConstructorParams.travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse;

      if (
        !travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.id
      ) {
        throw new Error(
          'userProfileId is required. !travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.id',
        );
      }
      this.id =
        travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.id!;
      this.conversationId =
        travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.conversationId
          ? travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.conversationId
          : null;

      this.createdAt =
        travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.createdAt
          ? travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.createdAt
          : null;
      this.displayProfilePicture =
        travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.displayProfilePicture
          ? travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.displayProfilePicture
          : null;
      this.webClient =
        travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.webClient
          ? travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.webClient
          : null;

      this.onNextTravisBackendConversationDomainViewModelsUserProfileNoCompanyResponse(
        travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse,
      );
    } else if (
      userProfileWrapperConstructorParams.travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel
    ) {
      const travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel =
        userProfileWrapperConstructorParams.travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel;

      if (
        !travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel
          .userProfile?.id
      ) {
        throw new Error(
          'userProfileId is required. !travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.userProfile?.id',
        );
      }

      this.id =
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.userProfile.id;
      this.conversationId =
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.conversationId
          ? travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.conversationId
          : null;

      this.createdAt =
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel
          .userProfile.createdAt
          ? travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel
              .userProfile.createdAt
          : null;
      this.displayProfilePicture =
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel
          .userProfile.displayProfilePicture
          ? travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel
              .userProfile.displayProfilePicture
          : null;
      this.webClient =
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel
          .userProfile.webClient
          ? travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel
              .userProfile.webClient
          : null;

      this.onNextTravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel(
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
      );
    } else if (
      userProfileWrapperConstructorParams.travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModelPartially
    ) {
      const travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModelPartially =
        userProfileWrapperConstructorParams.travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModelPartially;

      if (
        !travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModelPartially
          .userProfile?.id
      ) {
        throw new Error(
          'userProfileId is required. !travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModelPartially.userProfile?.id',
        );
      }

      this.id =
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModelPartially.userProfile.id;
      this.conversationId =
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModelPartially.conversationId
          ? travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModelPartially.conversationId
          : null;

      this.createdAt =
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModelPartially
          .userProfile.createdAt
          ? travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModelPartially
              .userProfile.createdAt
          : null;
      this.displayProfilePicture =
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModelPartially
          .userProfile.displayProfilePicture
          ? travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModelPartially
              .userProfile.displayProfilePicture
          : null;
      this.webClient =
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModelPartially
          .userProfile.webClient
          ? travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModelPartially
              .userProfile.webClient
          : null;

      this.onNextTravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModelPartially(
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModelPartially,
      );
    } else {
      throw new Error();
    }
  }

  public onNextTravisBackendConversationDomainViewModelsUserProfileNoCompanyResponse(
    travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse: TravisBackendConversationDomainViewModelsUserProfileNoCompanyResponse,
  ) {
    this.updatedAt$$
      .pipe(take(1), startWith(dayjs(0)))
      .subscribe((lastUpdatedAt) => {
        if (
          !travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.updatedAt
        ) {
          return;
        }

        if (
          dayjs(
            travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.updatedAt,
          ).isBefore(lastUpdatedAt)
        ) {
          return;
        }

        this._onNextTravisBackendConversationDomainViewModelsUserProfileNoCompanyResponse(
          travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse,
        );
      });
  }

  private _onNextTravisBackendConversationDomainViewModelsUserProfileNoCompanyResponse(
    travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse: TravisBackendConversationDomainViewModelsUserProfileNoCompanyResponse,
  ) {
    if (
      !travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.id
    ) {
      throw new Error(
        'userProfileId is required. !travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.id',
      );
    }

    if (
      travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.firstName !==
        undefined &&
      travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.firstName !==
        null
    ) {
      const firstName =
        travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.firstName;

      this.firstName$$.next(firstName);
      this.userProfileWrapperUpdate$$.next({
        id: this.id,
        type: 'firstName',
        newValue: {
          firstName: firstName,
        },
      });
    }
    if (this.companyService) {
      this.companyService.getCompany$().subscribe((company) => {
        if (company?.customUserProfileFields) {
          const phoneNumberField = findPhoneNumberUserProfileField(
            company?.customUserProfileFields as any,
          );
          const emailField = findEmailUserProfileField(
            company?.customUserProfileFields as any,
          );
          if (phoneNumberField) {
            const phoneNumber =
              travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.customFields?.find(
                (field) => {
                  return field.companyDefinedFieldId === phoneNumberField.id;
                },
              );

            if (phoneNumber?.value) {
              this.phoneNumber$$.next(phoneNumber.value);
            }
          }
          if (emailField) {
            const email =
              travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.customFields?.find(
                (field) => {
                  return field.companyDefinedFieldId === emailField.id;
                },
              );
            if (email?.value) {
              this.emailAddress$$.next(email.value);
            }
          }
        }
      });
    }

    if (
      travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.lastName !==
        undefined &&
      travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.lastName !==
        null
    ) {
      const lastName =
        travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.lastName;

      this.lastName$$.next(lastName);
      this.userProfileWrapperUpdate$$.next({
        id: this.id,
        type: 'lastName',
        newValue: {
          lastName: lastName,
        },
      });
    }

    if (
      travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.pictureUrl !==
        undefined &&
      travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.pictureUrl !==
        null
    ) {
      const pictureUrl =
        travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.pictureUrl;

      this.pictureUrl$$.next(pictureUrl);
      this.userProfileWrapperUpdate$$.next({
        id: this.id,
        type: 'pictureUrl',
        newValue: {
          pictureUrl: pictureUrl,
        },
      });
    }

    if (
      travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.updatedAt !==
        undefined &&
      travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.updatedAt !==
        null
    ) {
      const updatedAt =
        travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.updatedAt;

      this.updatedAt$$.next(updatedAt);
      this.userProfileWrapperUpdate$$.next({
        id: this.id,
        type: 'updatedAt',
        newValue: {
          updatedAt: updatedAt,
        },
      });
    }

    if (
      travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.conversationHashtags !==
        undefined &&
      travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.conversationHashtags !==
        null
    ) {
      const labels =
        travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.conversationHashtags.map(
          (ht) => {
            const label: ConversationWrapperLabel = {
              id: ht.id!,
              name: ht.hashtag!,
              color: ht.hashTagColor!,
              type: ht.hashTagType!,
            };

            return label;
          },
        );

      this.labels$$.next(labels);
      this.userProfileWrapperUpdate$$.next({
        id: this.id,
        type: 'labels',
        newValue: {
          labels: labels,
        },
      });
    } else {
      this.labels$$.next([]);
      this.userProfileWrapperUpdate$$.next({
        id: this.id,
        type: 'labels',
        newValue: {
          labels: [],
        },
      });
    }

    if (
      travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.customFields !==
        undefined &&
      travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.customFields !==
        null
    ) {
      const customFields =
        travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.customFields;

      for (const customField of customFields) {
        if (this.fieldIdToValue$$Map) {
          if (
            this.fieldIdToValue$$Map.has(customField.companyDefinedFieldId!)
          ) {
            this.fieldIdToValue$$Map
              .get(customField.companyDefinedFieldId!)!
              .next(customField.value!);
          } else {
            const fieldIdToValue$$ = new ReplaySubject<string>(1);
            fieldIdToValue$$.next(customField.value!);
            this.fieldIdToValue$$Map.set(
              customField.companyDefinedFieldId!,
              fieldIdToValue$$,
            );
          }
        }
      }

      this.fieldIds$$.next(customFields.map((cf) => cf.companyDefinedFieldId!));
    }

    if (
      travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.contactLists !==
        undefined &&
      travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.contactLists !==
        null
    ) {
      const lists =
        travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.contactLists;

      this.userProfileLists$$.next(
        lists.map((l) => {
          return {
            id: l.id!,
            name: l.listName!,
          };
        }),
      );
      this.userProfileWrapperUpdate$$.next({
        id: this.id,
        type: 'lists',
        newValue: {
          lists: [],
        },
      });
    }

    if (
      travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.lastContact !==
        undefined &&
      travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.lastContact !==
        null
    ) {
      const lastContact =
        travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.lastContact;

      this.lastContact$$.next(lastContact);
      this.userProfileWrapperUpdate$$.next({
        id: this.id,
        type: 'lastContact',
        newValue: {
          lastContact: lastContact,
        },
      });
    }

    if (
      travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.id !==
      INITIALIZING_USER_ID
    ) {
      const supportedMessagingChannels = this.getSupportedMessagingChannels(
        travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse,
      );

      this.updateSupportedMessagingChannels(supportedMessagingChannels);
    }
  }

  public onNextTravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel(
    travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel: TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
  ) {
    this.updatedAt$$
      .pipe(take(1), startWith(dayjs(0)))
      .subscribe((lastUpdatedAt) => {
        if (
          !travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel
            .userProfile?.updatedAt
        ) {
          return;
        }

        if (
          dayjs(
            travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel
              .userProfile.updatedAt,
          ).isBefore(lastUpdatedAt)
        ) {
          return;
        }

        this._onNextTravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel(
          travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
        );
      });
  }

  private _onNextTravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel(
    travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel: TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
  ) {
    const userProfile =
      travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.userProfile;

    // Asserts
    if (userProfile === undefined || userProfile === null) {
      throw new Error('userProfile is required');
    }
    if (!userProfile.id) {
      throw new Error('userProfileId is required. !userProfile.id');
    }

    if (userProfile.firstName !== undefined && userProfile.firstName !== null) {
      const firstName = userProfile.firstName;

      this.firstName$$.next(firstName);
      this.userProfileWrapperUpdate$$.next({
        id: this.id,
        type: 'firstName',
        newValue: {
          firstName: firstName,
        },
      });
    }

    if (this.companyService) {
      this.companyService.getCompany$().subscribe((company) => {
        if (company?.customUserProfileFields) {
          const phoneNumberField = findPhoneNumberUserProfileField(
            company?.customUserProfileFields as any,
          );
          if (phoneNumberField) {
            const phoneNumber =
              travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.userProfile?.customFields?.find(
                (field) => {
                  return field.companyDefinedFieldId === phoneNumberField.id;
                },
              );

            if (phoneNumber?.value) {
              this.phoneNumber$$.next(phoneNumber.value);
            }
          }

          const emailField = findEmailUserProfileField(
            company?.customUserProfileFields as any,
          );

          if (emailField) {
            const email =
              travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.userProfile?.customFields?.find(
                (field) => {
                  return field.companyDefinedFieldId === emailField.id;
                },
              );
            if (email?.value) {
              this.emailAddress$$.next(email.value);
            }
          }
        }
      });
    }

    if (userProfile.lastName !== undefined && userProfile.lastName !== null) {
      const lastName = userProfile.lastName;

      this.lastName$$.next(lastName);
      this.userProfileWrapperUpdate$$.next({
        id: this.id,
        type: 'lastName',
        newValue: {
          lastName: lastName,
        },
      });
    }

    if (
      userProfile.pictureUrl !== undefined &&
      userProfile.pictureUrl !== null
    ) {
      const pictureUrl = userProfile.pictureUrl;

      this.pictureUrl$$.next(pictureUrl);
      this.userProfileWrapperUpdate$$.next({
        id: this.id,
        type: 'pictureUrl',
        newValue: {
          pictureUrl: pictureUrl,
        },
      });
    }

    if (userProfile.updatedAt !== undefined && userProfile.updatedAt !== null) {
      const updatedAt = userProfile.updatedAt;

      this.updatedAt$$.next(updatedAt);
      this.userProfileWrapperUpdate$$.next({
        id: this.id,
        type: 'updatedAt',
        newValue: {
          updatedAt: updatedAt,
        },
      });
    }

    const conversationHashtags =
      travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.conversationHashtags ||
      userProfile.conversationHashtags ||
      undefined;
    if (conversationHashtags !== undefined && conversationHashtags !== null) {
      const labels = conversationHashtags.map((ht) => {
        const label: ConversationWrapperLabel = {
          id: ht.id!,
          name: ht.hashtag!,
          color: ht.hashTagColor!,
          type: ht.hashTagType!,
        };

        return label;
      });

      this.labels$$.next(labels);
      this.userProfileWrapperUpdate$$.next({
        id: this.id,
        type: 'labels',
        newValue: {
          labels: labels,
        },
      });
    } else {
      this.labels$$.next([]);
      this.userProfileWrapperUpdate$$.next({
        id: this.id,
        type: 'labels',
        newValue: {
          labels: [],
        },
      });
    }

    if (
      userProfile.customFields !== undefined &&
      userProfile.customFields !== null
    ) {
      const customFields = userProfile.customFields;

      for (const customField of customFields) {
        if (this.fieldIdToValue$$Map) {
          if (
            this.fieldIdToValue$$Map.has(customField.companyDefinedFieldId!)
          ) {
            this.fieldIdToValue$$Map
              .get(customField.companyDefinedFieldId!)!
              .next(customField.value!);
          } else {
            const fieldIdToValue$$ = new ReplaySubject<string>(1);
            fieldIdToValue$$.next(customField.value!);
            this.fieldIdToValue$$Map.set(
              customField.companyDefinedFieldId!,
              fieldIdToValue$$,
            );
          }
        }
      }

      this.fieldIds$$.next(customFields.map((cf) => cf.companyDefinedFieldId!));
    }

    if (
      userProfile.contactLists !== undefined &&
      userProfile.contactLists !== null
    ) {
      const lists = userProfile.contactLists;
      this.userProfileLists$$.next(
        lists.map((l) => {
          return {
            id: l.id!,
            name: l.listName!,
          };
        }),
      );
      this.userProfileWrapperUpdate$$.next({
        id: this.id,
        type: 'lists',
        newValue: {
          lists: [],
        },
      });
    }

    if (
      userProfile.lastContact !== undefined &&
      userProfile.lastContact !== null
    ) {
      const lastContact = userProfile.lastContact;

      this.lastContact$$.next(lastContact);
      this.userProfileWrapperUpdate$$.next({
        id: this.id,
        type: 'lastContact',
        newValue: {
          lastName: lastContact,
        },
      });
    }

    const supportedMessagingChannels =
      this.getSupportedMessagingChannels(userProfile);

    this.updateSupportedMessagingChannels(supportedMessagingChannels);
  }

  // Some APIs don't return the correct userProfileLists and customFields
  public onNextTravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModelPartially(
    travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel: TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
  ) {
    this.updatedAt$$
      .pipe(take(1), startWith(dayjs(0)))
      .subscribe((lastUpdatedAt) => {
        if (
          !travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel
            .userProfile?.updatedAt
        ) {
          return;
        }

        if (
          dayjs(
            travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel
              .userProfile.updatedAt,
          ).isBefore(lastUpdatedAt)
        ) {
          return;
        }

        this._onNextTravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModelPartially(
          travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
        );
      });
  }

  private _onNextTravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModelPartially(
    travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel: TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
  ) {
    const userProfile =
      travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.userProfile;

    // Asserts
    if (userProfile === undefined || userProfile === null) {
      throw new Error('userProfile is required');
    }
    if (!userProfile.id) {
      throw new Error('userProfileId is required. !userProfile.id');
    }

    if (userProfile.firstName !== undefined && userProfile.firstName !== null) {
      const firstName = userProfile.firstName;

      this.firstName$$.next(firstName);
      this.userProfileWrapperUpdate$$.next({
        id: this.id,
        type: 'firstName',
        newValue: {
          firstName: firstName,
        },
      });
    }

    if (this.companyService) {
      this.companyService.getCompany$().subscribe((company) => {
        if (company?.customUserProfileFields) {
          const phoneNumberField = findPhoneNumberUserProfileField(
            company?.customUserProfileFields as any,
          );
          if (phoneNumberField) {
            const phoneNumber =
              travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.userProfile?.customFields?.find(
                (field) => {
                  return field.companyDefinedFieldId === phoneNumberField.id;
                },
              );

            if (phoneNumber?.value) {
              this.phoneNumber$$.next(phoneNumber.value);
            }
          }

          const emailField = findEmailUserProfileField(
            company?.customUserProfileFields as any,
          );

          if (emailField) {
            const email =
              travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.userProfile?.customFields?.find(
                (field) => {
                  return field.companyDefinedFieldId === emailField.id;
                },
              );
            if (email?.value) {
              this.emailAddress$$.next(email.value);
            }
          }
        }
      });
    }

    if (userProfile.lastName !== undefined && userProfile.lastName !== null) {
      const lastName = userProfile.lastName;

      this.lastName$$.next(lastName);
      this.userProfileWrapperUpdate$$.next({
        id: this.id,
        type: 'lastName',
        newValue: {
          lastName: lastName,
        },
      });
    }

    if (
      userProfile.pictureUrl !== undefined &&
      userProfile.pictureUrl !== null
    ) {
      const pictureUrl = userProfile.pictureUrl;

      this.pictureUrl$$.next(pictureUrl);
      this.userProfileWrapperUpdate$$.next({
        id: this.id,
        type: 'pictureUrl',
        newValue: {
          pictureUrl: pictureUrl,
        },
      });
    }

    if (userProfile.updatedAt !== undefined && userProfile.updatedAt !== null) {
      const updatedAt = userProfile.updatedAt;

      this.updatedAt$$.next(updatedAt);
      this.userProfileWrapperUpdate$$.next({
        id: this.id,
        type: 'updatedAt',
        newValue: {
          updatedAt: updatedAt,
        },
      });
    }

    const conversationHashtags =
      travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.conversationHashtags ||
      userProfile.conversationHashtags ||
      undefined;
    if (conversationHashtags !== undefined && conversationHashtags !== null) {
      const labels = conversationHashtags.map((ht) => {
        const label: ConversationWrapperLabel = {
          id: ht.id!,
          name: ht.hashtag!,
          color: ht.hashTagColor!,
          type: ht.hashTagType!,
        };

        return label;
      });

      this.labels$$.next(labels);
      this.userProfileWrapperUpdate$$.next({
        id: this.id,
        type: 'labels',
        newValue: {
          labels: labels,
        },
      });
    } else {
      this.labels$$.next([]);
      this.userProfileWrapperUpdate$$.next({
        id: this.id,
        type: 'labels',
        newValue: {
          labels: [],
        },
      });
    }

    if (
      userProfile.lastContact !== undefined &&
      userProfile.lastContact !== null
    ) {
      const lastContact = userProfile.lastContact;

      this.lastContact$$.next(lastContact);
      this.userProfileWrapperUpdate$$.next({
        id: this.id,
        type: 'lastContact',
        newValue: {
          lastName: lastContact,
        },
      });
    }

    const supportedMessagingChannels =
      this.getSupportedMessagingChannels(userProfile);

    this.updateSupportedMessagingChannels(supportedMessagingChannels);
  }

  private updateSupportedMessagingChannels(
    supportedMessagingChannels: string[],
  ) {
    const prevSupportedMessagingChannels =
      this.supportedMessagingChannels$$.getValue();

    if (
      !prevSupportedMessagingChannels ||
      supportedMessagingChannels.length > prevSupportedMessagingChannels.length
    ) {
      this.supportedMessagingChannels$$.next(supportedMessagingChannels);
      this.userProfileWrapperUpdate$$.next({
        id: this.id,
        type: 'supportedMessagingChannels',
        newValue: {
          supportedMessagingChannels: supportedMessagingChannels,
        },
      });
    }
  }

  public onNextUserProfileLists(userProfileLists: UserProfileWrapperList[]) {
    this.userProfileLists$$.next(userProfileLists);
  }

  private getSupportedMessagingChannels(
    userProfile: TravisBackendConversationDomainViewModelsUserProfileNoCompanyResponse,
  ) {
    const supportedChannels = [];

    if (userProfile.whatsApp360DialogUser?.whatsAppId != null) {
      supportedChannels.push('whatsapp360dialog');
    }
    if (userProfile.whatsappCloudApiUser?.whatsappId != null) {
      supportedChannels.push('whatsappcloudapi');
    }
    if (userProfile.whatsAppAccount?.id != null) {
      supportedChannels.push('whatsapp');
    }
    if (userProfile.lineUser?.userId != null) {
      supportedChannels.push('line');
    }
    if (userProfile.facebookAccount?.id != null) {
      supportedChannels.push('facebook');
    }
    if (userProfile.weChatUser?.openid != null) {
      supportedChannels.push('wechat');
    }
    if (userProfile.instagramUser?.instagramId != null) {
      supportedChannels.push('instagram');
    }
    if (userProfile.webClient?.webClientUUID != null) {
      supportedChannels.push('web');
    }
    if (userProfile.smsUser?.id != null) {
      supportedChannels.push('sms');
    }
    if (userProfile.emailAddress?.email != null) {
      supportedChannels.push('email');
    }
    if (userProfile.telegramUser != null) {
      supportedChannels.push('telegram');
    }
    if (userProfile.viberUser != null) {
      supportedChannels.push('viber');
    }
    return supportedChannels;
  }

  public getId() {
    return this.id;
  }

  public getConversationId() {
    return this.conversationId;
  }

  public getUpdatedAtSnapshot() {
    return this.updatedAtSnapshot;
  }

  public getFirstName$() {
    return this.firstName$$.asObservable();
  }

  public getLastName$() {
    return this.lastName$$.asObservable();
  }

  public getFullName$() {
    return combineLatest({
      firstName: this.getFirstName$().pipe(startWith('')),
      lastName: this.getLastName$().pipe(startWith('')),
      phoneNumber: this.getPhoneNumber$().pipe(startWith('')),
      emailAddress: this.getEmailAddress$().pipe(startWith('')),
    }).pipe(
      map(({ firstName, lastName, phoneNumber, emailAddress }) => {
        return getFullName({
          firstName,
          lastName,
          fallback:
            phoneNumber ||
            emailAddress ||
            this.translationService.t('general.unknown-label'),
        });
      }),
    );
  }

  public getEmailAddress$() {
    return this.emailAddress$$.asObservable();
  }

  public getPhoneNumber$() {
    return this.phoneNumber$$.asObservable();
  }

  public getPictureUrl$() {
    return this.pictureUrl$$.asObservable();
  }

  public getUpdatedAt$() {
    return this.updatedAt$$.asObservable();
  }

  public getLabels$() {
    return this.labels$$.asObservable();
  }

  public getFieldValue$$(fieldId: string) {
    if (this.fieldIdToValue$$Map.has(fieldId)) {
      return this.fieldIdToValue$$Map.get(fieldId)!.asObservable();
    }
    return empty();
  }

  public getFieldIdToValue$$Entries() {
    return [...this.fieldIdToValue$$Map.entries()];
  }

  public getFieldIdToValue$$Entries$$Mapping() {
    return this.fieldIds$$.pipe(
      switchMap(() => {
        return combineLatest(
          this.getFieldIdToValue$$Entries().map(([key, subject]) =>
            subject.pipe(
              map<string, [fieldName: string, fieldValue: string]>((value) => [
                key,
                value,
              ]),
            ),
          ),
        );
      }),
    );
  }

  public getUserProfileLists$() {
    return this.userProfileLists$$.pipe(map((l) => l || []));
  }

  public getSupportedMessagingChannels$() {
    return this.supportedMessagingChannels$$.pipe(
      distinctUntilChanged(_isEqual),
      map((c) => c || []),
    );
  }

  public getIsLoadingSupportedMessagingChannels$() {
    return this.supportedMessagingChannels$$.pipe(map((c) => !c));
  }

  public getCreatedAt() {
    return this.createdAt;
  }

  public getLastContact$() {
    return this.lastContact$$.asObservable();
  }

  public getDisplayProfilePicture() {
    return this.displayProfilePicture;
  }

  public getWebClient() {
    return this.webClient;
  }

  destroy() {
    this.firstName$$.complete();
    this.lastName$$.complete();
    this.pictureUrl$$.complete();
    this.updatedAt$$.complete();
    this.labels$$.complete();

    for (const fieldIdToValue$$MapKey in this.fieldIdToValue$$Map) {
      this.fieldIdToValue$$Map.get(fieldIdToValue$$MapKey)?.complete();
    }
    this.fieldIds$$.complete();

    this.emailAddress$$.complete();
    this.phoneNumber$$.complete();
    this.lastContact$$.complete();
  }

  private subscribingDataSources: DisposableDataSource[] = [];

  subscribe(disposableDataSource: DisposableDataSource): void {
    this.subscribingDataSources = [
      ...new Set([...this.subscribingDataSources, disposableDataSource]),
    ];
  }

  unsubscribe(disposableDataSource: DisposableDataSource): void {
    this.subscribingDataSources = this.subscribingDataSources.filter((d) => {
      return d !== disposableDataSource;
    });
  }

  observed() {
    return (
      this.firstName$$.observed ||
      this.lastName$$.observed ||
      this.pictureUrl$$.observed ||
      this.updatedAt$$.observed ||
      this.labels$$.observed ||
      [...this.fieldIdToValue$$Map.values()].some((v) => v.observed) ||
      this.fieldIds$$.observed ||
      this.emailAddress$$.observed ||
      this.phoneNumber$$.observed ||
      this.phoneNumber$$.observed ||
      this.subscribingDataSources.length !== 0 ||
      this.lastContact$$.observed
    );
  }

  private static loading = new UserProfileWrapper({
    userProfileWrapperConstructorParams: {
      travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse: {
        id: INITIALIZING_USER_ID,
        firstName: '...',
        lastName: '...',
        pictureUrl: '',
        updatedAt: formatISO(new Date(+0)),
      },
    },
    userProfileWrapperUpdate$$: new Subject<UserProfileWrapperUpdate>(),
    translationService: new I18nService(),
  });

  public static initializing() {
    return this.loading;
  }
}
