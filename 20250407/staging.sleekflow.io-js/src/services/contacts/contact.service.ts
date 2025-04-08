import { TravisBackendConversationDomainViewModelsCompanyResponse } from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { inject, injectable } from 'inversify';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js/min';
import { concatMap, map, Observable, startWith, zip } from 'rxjs';

import { EMPTY_CELL_VALUE } from '@/constants/table';
import { transformCustomUserProfileFieldsFromApi } from '@/pages/Contacts/shared/adapters';
import {
  findCollaboratorsUserProfileField,
  findContactsListUserProfileField,
  findEmailUserProfileField,
  findHashtagUserProfileField,
  findPhoneNumberUserProfileField,
} from '@/pages/Contacts/shared/utils';

import { CompanyService } from '../companies/company.service';
import { UserProfileWrapper } from '../user-profiles/managers/user-profile-wrapper';
import { UserProfileService } from '../user-profiles/user-profile.service';
import { convertTravisBackendResponseToCompany } from './converters';

export interface UserProfileFieldIds {
  phoneNumberId?: string | null | undefined;
  emailId?: string | null | undefined;
  contactListsId?: string | null | undefined;
  collaboratorsId?: string | null | undefined;
  conversationHashtagsId?: string | null | undefined;
}

@injectable()
export class ContactService {
  constructor(
    @inject(CompanyService) private companyService: CompanyService,
    @inject(UserProfileService)
    private userProfileService: UserProfileService,
  ) {}

  public getPhoneNumber$(id: string): Observable<string> {
    return this.extractUserProfileCustomFieldValue$(
      id,
      (
        userProfile: UserProfileWrapper,
        userProfileFieldIds: UserProfileFieldIds,
      ) => {
        return userProfile
          ?.getFieldValue$$(userProfileFieldIds.phoneNumberId!)
          .pipe(
            map((phoneNumber) => {
              if (/\*+/.test(phoneNumber)) {
                return phoneNumber;
              }
              return this.getFormattedPhoneNumber(phoneNumber) ?? phoneNumber;
            }),
            startWith(''),
          );
      },
    );
  }

  public getEmail$(id: string): Observable<string> {
    return this.extractUserProfileCustomFieldValue$(
      id,
      (
        userProfile: UserProfileWrapper,
        userProfileFieldIds: UserProfileFieldIds,
      ): Observable<string> => {
        return userProfile
          ?.getFieldValue$$(userProfileFieldIds.emailId!)
          .pipe(startWith(''));
      },
    );
  }

  public getCustomUserProfileFields$() {
    const company$ = this.companyService.getCompany$();
    const userProfileFieldIds$ = this.getUserProfileFieldIds$();
    return zip(company$, userProfileFieldIds$).pipe(
      map(
        ([company, profileFieldIds]: [
          (
            | TravisBackendConversationDomainViewModelsCompanyResponse
            | null
            | undefined
          ),
          UserProfileFieldIds,
        ]) => {
          const convertedCompany =
            convertTravisBackendResponseToCompany(company);
          const customContactFields = transformCustomUserProfileFieldsFromApi({
            company: convertedCompany,
          });

          // Filter away contacts lists labels and collaborators and crm hidden property
          return customContactFields.filter(
            (field) =>
              field.id !== profileFieldIds.contactListsId &&
              field.id !== profileFieldIds.conversationHashtagsId &&
              field.id !== profileFieldIds.collaboratorsId &&
              field.type !== 'CrmSourceObjectId' &&
              field.type !== 'CrmSourceProviderName',
          );
        },
      ),
    );
  }

  private extractUserProfileCustomFieldValue$(
    id: string,
    extractValueFunction: (
      userProfile: UserProfileWrapper,
      userProfileIds: UserProfileFieldIds,
    ) => Observable<string>,
  ) {
    return zip(
      this.userProfileService.getUserProfileWrapper$(id),
      this.getUserProfileFieldIds$(),
    ).pipe(
      concatMap(
        ([userProfile, userProfileIds]: [
          UserProfileWrapper,
          UserProfileFieldIds,
        ]) => extractValueFunction(userProfile, userProfileIds),
      ),
    );
  }

  public getUserProfileFieldIds$(): Observable<UserProfileFieldIds> {
    return this.companyService.getCompany$().pipe(
      map(
        (
          company:
            | TravisBackendConversationDomainViewModelsCompanyResponse
            | null
            | undefined,
        ) => {
          const convertedCompany =
            convertTravisBackendResponseToCompany(company);
          const customUserProfileFields =
            convertedCompany.customUserProfileFields;
          return {
            phoneNumberId: findPhoneNumberUserProfileField(
              customUserProfileFields,
            )?.id,
            emailId: findEmailUserProfileField(customUserProfileFields)?.id,
            contactListsId: findContactsListUserProfileField(
              customUserProfileFields,
            )?.id,
            conversationHashtagsId: findHashtagUserProfileField(
              customUserProfileFields,
            )?.id,
            collaboratorsId: findCollaboratorsUserProfileField(
              customUserProfileFields,
            )?.id,
          } as UserProfileFieldIds;
        },
      ),
    );
  }

  private getFormattedPhoneNumber(phoneNumber: string): string {
    return phoneNumber && isValidPhoneNumber(`+${phoneNumber}`)
      ? parsePhoneNumber(`+${phoneNumber}`).formatInternational()
      : EMPTY_CELL_VALUE;
  }
}
