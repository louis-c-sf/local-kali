import React, { ReactNode, useEffect, useState } from "react";
import {
  Button,
  Dropdown,
  Form,
  Header,
  Input,
  Modal,
} from "semantic-ui-react";
import { deleteMethod, post, putMethod } from "api/apiRequest";
import {
  DELETE_SEGMENT,
  POST_CREATE_SEGMENT,
  PUT_EDIT_SEGMENT,
} from "api/apiPath";
import AvailableFilterList from "component/FilterList/FilterList";
import EditFilterCondition from "component/FilterList/FilterCondition";
import FilterSelectedItem from "component/FilterList/FilterSelectedItem";
import { FilterSelectedItemView } from "component/FilterList/FilterSelectedItemView";
import {
  AudienceType,
  AudienceFilterConditionType,
} from "types/BroadcastCampaignType";
import produce from "immer";
import { useFieldLocales } from "component/Contact/locaizable/useFieldLocales";
import { Trans, useTranslation } from "react-i18next";
import { InfoTooltip } from "component/shared/popup/InfoTooltip";
import { FilterConfigType } from "types/FilterConfigType";
import { FILTERS_STORAGE_KEY } from "container/Contact";
import { complement } from "ramda";
import {
  isContactOwnerFilter,
  updateContactOwnerFilter,
  visibleInGridHeader,
} from "container/ContactMain";
import { Drawer } from "component/shared/sidebar/Drawer";
import { useCompanyHashTags } from "component/Settings/hooks/useCompanyHashTags";
import { HashTagCountedType } from "types/ConversationType";
import { ChatLabel } from "component/Chat/ChatLabel";
import useImportedLists from "container/Contact/Imported/useImportedLists";
import { ContactOwnerFilter } from "component/Contact/Filter/ContactOwnerFilter";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import styled from "styled-components";
import { TagsFilter } from "component/Contact/Filter/TagsFilter";
import ListsFilter from "component/Contact/Filter/ListsFilter";
import { BackLink } from "component/shared/nav/BackLink";
import { TagInput } from "component/shared/input/TagInput";
import { useCustomProfileFields } from "container/Contact/hooks/useCustomProfileFields";
import { fromApiCondition } from "api/Contacts/fromApiCondition";
import { toApiCondition } from "api/Contacts/toApiCondition";

const NoSegmentContainer = styled.div`
  padding: 20px 40px;
  display: flex;
  line-height: 20px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  margin: 20px 0px;
  color: #666666;
  border: 1px dashed #666666;
  text-align: center;

  > div > button {
    height: 33px;
    display: flex;
    align-items: center;
    margin-top: 10px !important;
  }
`;

const ModalContainer = styled.div`
  padding: 36px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 21px;

  > div:first-child {
    font-weight: 500;
    font-size: 20px;
  }
`;

const IconContainer = styled.div`
  > svg {
    width: 18px;
    height: 18px;
  }

  width: 30px;
  height: 30px;
  background: #e5e5e5;
  display: flex;
  align-items: center;
  margin-left: 16px;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
`;

const ButtonContainer = styled.div`
  > button {
    display: flex;
    align-items: center;
    height: 33px;
    background: white !important;
  }
`;

const SegmentList = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;

  > div:first-child {
    align-items: center;
    display: flex;
    width: 80%;
    margin: 10px 0px;

    > div {
      margin-right: 16px;
    }
  }

  > div:last-child {
    display: flex;
    align-items: center;

    > button {
      display: flex !important;
      align-items: center !important;
      padding: 4px 16px !important;
      margin-left: 8px !important;
      height: 33px;
    }
  }
`;

const ErrorText = styled.div`
  font-size: 14px;
  color: #cc3333;
  margin-top: 4px;
`;

export function normalizeConditions(
  filters: AudienceType[],
  tags: HashTagCountedType[]
) {
  return filters
    .reduce<AudienceFilterConditionType[]>((acc, filter) => {
      const normalized = toApiCondition(filter);
      if (normalized) {
        return acc.concat(normalized);
      }
      return acc;
    }, [])
    .concat(
      tags.map((tag) => ({
        containHashTag: tag.hashtag,
        nextOperator: "Or",
      }))
    );
}

function ContactSidebar(props: {
  visible: boolean;
  onHide: () => void;
  getSegmentList: () => any;
  segmentList: any[];
}) {
  const { visible, getSegmentList, segmentList = [] } = props;

  const { fields } = useCustomProfileFields({ excludeLabels: true });

  const [fieldSearch, setFieldSearch] = useState("");
  const [fieldSelectedName, setFieldSelectedName] = useState("");
  const [audience, setAudience] = useState<AudienceType>();
  const [editingFilter, setEditingFilter] = useState<boolean>(false);
  const [editingTagsFilter, setEditingTagsFilter] = useState<boolean>(false);
  const [editingListsFilter, setEditingListsFilter] = useState<boolean>(false);
  const [selectingFilter, setSelectingFilter] = useState(false);
  const [newSegmentName, setNewSegmentName] = useState("");
  const [existingFilters, setFilterValues] = useState<AudienceType[]>([]);
  const [tagFilters, setTagFilters] = useState<HashTagCountedType[]>([]);
  const [listIdFilters, setListIdFilters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { getFieldDisplayNameLocale, staticFieldDisplayNames } =
    useFieldLocales();
  const { t } = useTranslation();
  const { companyTags } = useCompanyHashTags();
  const { lists } = useImportedLists();
  const flash = useFlashMessageChannel();

  function searchChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.stopPropagation();
    e.preventDefault();
    const { value } = e.target;
    setFieldSearch(value);
  }

  function conditionClick(fieldName: string) {
    setFieldSelectedName(fieldName);
    setEditingFilter(true);
    setEditingTagsFilter(false);
    setSelectingFilter(false);
    setEditingListsFilter(false);
  }

  function tagsConditionClick() {
    setFieldSelectedName("");
    setEditingFilter(false);
    setSelectingFilter(false);
    setEditingTagsFilter(true);
    setEditingListsFilter(false);
  }

  function listsConditionClick() {
    setFieldSelectedName("");
    setEditingFilter(false);
    setSelectingFilter(false);
    setEditingTagsFilter(false);
    setEditingListsFilter(true);
  }

  function startSelectingFilter() {
    setSelectingFilter(true);
  }

  function updateSelectedItem(audience: AudienceType) {
    setEditingFilter(true);
    setEditingTagsFilter(false);
    setEditingListsFilter(false);
    setAudience(audience);
    setSelectingFilter(true);
    setFieldSelectedName(audience.fieldName);
  }

  function stopEditCondition() {
    setEditingTagsFilter(false);
    setEditingListsFilter(false);
    setEditingFilter(false);
    setFieldSelectedName("");
    setFieldSearch("");
    setSelectingFilter(false);
    setAudience(undefined);
  }

  function updateCondition(
    selectedCondition: string,
    selectedValue: string[],
    type: string,
    index?: number
  ) {
    if (selectedValue) {
      const audienceTypeUpdated = produce(existingFilters, (draft) => {
        if (index !== undefined && draft[index]) {
          draft[index].filterCondition = selectedCondition;
          draft[index].filterValue = selectedValue;
        } else {
          draft.push({
            filterValue: selectedValue,
            filterCondition: selectedCondition,
            fieldName:
              (type === "customField" && fieldSelectedName) ||
              selectedCondition,
            fieldType: type,
          });
        }
      });

      setFilterValues(audienceTypeUpdated);
    }
    stopEditCondition();
  }

  function deleteFilter(index: number) {
    let filtersUpdated = [...(existingFilters || [])];
    filtersUpdated.splice(index, 1);
    setAudience(undefined);
    localStorage.removeItem(FILTERS_STORAGE_KEY);
    setFilterValues(filtersUpdated);
  }

  let filterList: FilterConfigType[] = [];

  if (fields.length > 0) {
    const fieldFilters: FilterConfigType[] = fields.map((field) => ({
      fieldName: field.fieldName,
      fieldDisplayName: field.displayName,
      type: "customField",
      fieldType: field.type.toLowerCase(),
      fieldOptions: (field.options || []).map((option, key) => ({
        key: key,
        value: option.value,
        text: getFieldDisplayNameLocale(
          option.customUserProfileFieldOptionLinguals,
          option.value
        ),
      })),
    }));

    const firstName: FilterConfigType = {
      type: "customField",
      fieldName: "firstname",
      fieldDisplayName: staticFieldDisplayNames.firstname,
      fieldType: "singlelinetext",
      fieldOptions: [],
    };
    const lastName: FilterConfigType = {
      type: "customField",
      fieldName: "lastname",
      fieldDisplayName: staticFieldDisplayNames.lastname,
      fieldType: "singlelinetext",
      fieldOptions: [],
    };
    const createdAt: FilterConfigType = {
      type: "customField",
      fieldName: "createdat",
      fieldDisplayName: staticFieldDisplayNames.createdAt,
      fieldType: "datetime",
      fieldOptions: [],
    };
    filterList = [firstName, lastName, ...fieldFilters, createdAt];
  }

  // const filterLabelOffset: [number, number] = i18n.language === "en-US" ? [5, 10] : [35, 10];
  const displayFiltersCount = existingFilters.filter(
    complement(visibleInGridHeader)
  ).length;
  const filtered = existingFilters.length > 0;

  const matchFilter =
    (sample: AudienceType | undefined) => (aud: AudienceType) =>
      aud.fieldName === sample?.fieldName &&
      aud.fieldType === sample?.fieldType;

  const editingAnyFilter =
    editingFilter || editingTagsFilter || editingListsFilter;
  const editNoFilter =
    !editingFilter && !editingTagsFilter && !editingListsFilter;
  const labelsFound =
    !fieldSearch || "label".includes(fieldSearch.toLowerCase());
  const listsFound =
    !fieldSearch || "lists".includes(fieldSearch.toLowerCase());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditSegment, setIsEditSegment] = useState(false);

  interface SegmentProps {
    name: string;
    conditions: any[];
    id?: number;
  }

  const emptySegment = { name: "", conditions: [] };
  const [currentSegment, setCurrentSegment] =
    useState<SegmentProps>(emptySegment);
  const [segmentNameTouched, setSegmentNameTouched] = useState(false);
  const [segmentNameError, setSegmentNameError] = useState(false);
  const [segmentNameLengthy, setSegmentNameLengthy] = useState(false);
  useEffect(() => {
    if (newSegmentName) setSegmentNameTouched(true);
    if (segmentNameTouched) {
      if (!newSegmentName) {
        setSegmentNameError(true);
      } else {
        setSegmentNameError(false);
      }
      if (newSegmentName.length < 20) {
        setSegmentNameLengthy(false);
      }
    }
  }, [newSegmentName]);

  const anyTagsApplied = tagFilters.length > 0;
  const anyListsApplied = listIdFilters.length > 0 && setListIdFilters;

  const anyFilterApplied = existingFilters.length > 0;
  const [isManageSegment, setIsManageSegment] = useState(true);

  const resetFormValue = () => {
    setNewSegmentName("");
    setFilterValues([]);
    setTagFilters([]);
    setListIdFilters([]);
    setSegmentNameError(false);
    setSegmentNameTouched(false);
  };

  const onSubmit = async () => {
    if (!newSegmentName) {
      setSegmentNameError(true);
      return;
    }

    const filtersToBeParsed = listIdFilters.reduce<AudienceType[]>(
      (acc, next) => [
        ...acc,
        {
          filterValue: [next],
          fieldName: "importfrom",
          fieldType: "options",
          filterCondition: "Contains",
          nextOperator: "And",
        },
      ],
      existingFilters
    );

    const parsedApiBody = normalizeConditions(filtersToBeParsed, tagFilters);

    try {
      setIsLoading(true);
      if (!isEditSegment) {
        await post(POST_CREATE_SEGMENT, {
          param: {
            name: newSegmentName,
            conditions: parsedApiBody,
          },
        });
      } else {
        if (currentSegment.id) {
          await putMethod(
            PUT_EDIT_SEGMENT.replace("{id}", `${currentSegment.id}`),
            {
              param: {
                name: newSegmentName,
                conditions: parsedApiBody,
              },
            }
          );
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
      getSegmentList();
      setIsManageSegment(true);
      resetFormValue();
      setCurrentSegment(emptySegment);
      flash(t("analytics.createSegmentSuccess"));
    }
  };

  const handleDeleteSegment = async (segmentId?: number) => {
    if (!segmentId) return;
    try {
      setIsLoading(true);
      await deleteMethod(DELETE_SEGMENT.replace("{id}", `${segmentId}`), {
        param: {},
      });
    } catch (e) {
      console.log(e);
    } finally {
      getSegmentList();
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      flash(t("analytics.deleteSegmentSuccess"));
      setCurrentSegment(emptySegment);
    }
  };

  const handleEditSegment = (segment: any) => {
    setIsEditSegment(true);
    const defaultListIds = [];
    const defaultFilterValues = [];
    const currentSegmentFilters = [...segment.conditions];
    const filtersWithoutHashtag = currentSegmentFilters.filter(
      (c) => c.fieldName
    );
    const unformattedHashtags = currentSegmentFilters
      .filter((c) => c.containHashTag)
      .map((h) => h.containHashTag);
    const hashtags = companyTags.filter((tag) =>
      unformattedHashtags.includes(tag.hashtag)
    );
    const audienceTypes: AudienceType[] =
      filtersWithoutHashtag.map(fromApiCondition);
    for (let i = 0; i < audienceTypes.length; i++) {
      if (audienceTypes[i].fieldType == "customField") {
        if (audienceTypes[i].fieldName == "importfrom") {
          defaultListIds.push(audienceTypes[i].filterValue[0]);
        } else {
          defaultFilterValues.push(audienceTypes[i]);
        }
      }
    }
    setListIdFilters(defaultListIds);
    setNewSegmentName(segment.name);
    setFilterValues(defaultFilterValues);
    setTagFilters(hashtags);
    setIsManageSegment(false);
  };

  const renderSegmentList = () => {
    return (
      <>
        <Form as="div">
          <h4>{t("analytics.segmentList")}</h4>
          {segmentList.length > 0 ? (
            <>
              <div>
                {segmentList.map((segment) => (
                  <SegmentList key={segment.name}>
                    <div>
                      <div>{segment.name}</div>
                    </div>
                    <div>
                      <IconContainer
                        onClick={() => {
                          handleEditSegment(segment);
                          setCurrentSegment(segment);
                        }}
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="#838383"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </IconContainer>
                      <IconContainer
                        onClick={() => {
                          setIsDeleteModalOpen(true);
                          setCurrentSegment(segment);
                        }}
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="#838383"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </IconContainer>
                    </div>
                  </SegmentList>
                ))}
              </div>
              <ButtonContainer style={{ marginTop: 20 }}>
                <Button
                  className="create"
                  onClick={() => setIsManageSegment(false)}
                >
                  {t("analytics.createSegment")}
                </Button>
              </ButtonContainer>
            </>
          ) : (
            <NoSegmentContainer>
              <div>
                {t("analytics.noSegmentYet")}
                <br />
                {t("analytics.createSegmentToStart")}
              </div>
              <div>
                <Button
                  className="create"
                  onClick={() => setIsManageSegment(false)}
                >
                  {t("analytics.createSegment")}
                </Button>
              </div>
            </NoSegmentContainer>
          )}
        </Form>
      </>
    );
  };
  const renderContactFilters = () => {
    return (
      <>
        <Form as="div">
          {editingAnyFilter || selectingFilter ? (
            <BackLink onClick={stopEditCondition}>
              {t("nav.backShort")}
            </BackLink>
          ) : (
            <BackLink
              onClick={() => {
                if (isEditSegment) {
                  resetFormValue();
                  setIsEditSegment(false);
                }
                setIsManageSegment(true);
              }}
            >
              {t("nav.backShort")}
            </BackLink>
          )}
          {!selectingFilter && editNoFilter && (
            <div className={`selections`}>
              <Form.Field style={{ width: "100%" }}>
                <label>{t("analytics.segmentName")}</label>
                <Input
                  type="text"
                  className={segmentNameError ? "error" : ""}
                  placeholder={t("analytics.segmentNamePlaceholder")}
                  value={newSegmentName}
                  onChange={(e) => {
                    const segmentNameInput = e.target.value;
                    if (segmentNameInput.length < 20) {
                      setNewSegmentName(e.target.value);
                    } else {
                      setSegmentNameLengthy(true);
                    }
                  }}
                />
                {segmentNameError ? (
                  <ErrorText>{t("analytics.segmentNameError")}</ErrorText>
                ) : (
                  ""
                )}
                {segmentNameLengthy ? (
                  <ErrorText>
                    {t("analytics.segmentNameLengthyError")}
                  </ErrorText>
                ) : (
                  ""
                )}
              </Form.Field>
              <div
                className="control-group collapsible"
                style={{ width: "100%", marginBottom: 16 }}
              >
                <ContactOwnerFilter
                  values={existingFilters
                    .filter(isContactOwnerFilter)
                    .reduce<string[]>(
                      (acc, next) => [...acc, ...next.filterValue],
                      []
                    )}
                  onChange={(values) => {
                    setFilterValues(
                      updateContactOwnerFilter(existingFilters, values)
                    );
                  }}
                />
              </div>
              <div
                className="control-group collapsible"
                style={{ width: "100%", marginBottom: 16 }}
              >
                <TagsFilter
                  tagFilters={tagFilters}
                  onTagFiltersChanged={setTagFilters}
                />
              </div>
              <div
                className="control-group collapsible"
                style={{ width: "100%", marginBottom: 16 }}
              >
                <ListsFilter
                  initListIds={listIdFilters}
                  onListFilterChange={setListIdFilters}
                />
              </div>
              {anyTagsApplied || anyListsApplied || anyFilterApplied ? (
                <label>{t("analytics.filtersApplied")}</label>
              ) : (
                ""
              )}
              {anyTagsApplied && (
                <>
                  <FilterSelectedItemView
                    filterDisplayValue={tagFilters.reduce<ReactNode[]>(
                      (acc, next) => {
                        const tag = companyTags.find(
                          (t) => t.hashtag === next.hashtag
                        );
                        if (tag) {
                          const tagNode = React.createElement(ChatLabel, {
                            tag,
                          });
                          return [...acc, tagNode];
                        }
                        return acc;
                      },
                      []
                    )}
                    fieldName={""}
                    fieldDisplayName={t("profile.staticField.hashtag.name")}
                    filterDisplayName={t("profile.condition.option.oneOf")}
                    className={"tags"}
                    onDelete={() => {
                      setTagFilters([]);
                    }}
                    onClick={tagsConditionClick}
                  />
                  {(anyFilterApplied || anyListsApplied) && (
                    <div className={"divider"}>
                      {t("profile.contacts.sidebar.conditions.and")}
                    </div>
                  )}
                </>
              )}
              {anyListsApplied && (
                <>
                  <FilterSelectedItemView
                    filterDisplayValue={listIdFilters
                      .reduce<string[]>((acc, next) => {
                        const list = lists.find((l) => String(l.id) === next);
                        return list ? [...acc, list.importName] : acc;
                      }, [])
                      .join(", ")}
                    fieldName={""}
                    fieldDisplayName={t("profile.staticField.importfrom.name")}
                    filterDisplayName={t("profile.condition.option.oneOf")}
                    onDelete={() => {
                      setListIdFilters && setListIdFilters([]);
                    }}
                    onClick={listsConditionClick}
                  />
                  {anyFilterApplied && (
                    <div className={"divider"}>
                      {t("profile.contacts.sidebar.conditions.and")}
                    </div>
                  )}
                </>
              )}
              {existingFilters
                // do not filter anything, keeping the filters indices
                .map((flt, index) => {
                  const foundCustomField = filterList.find(
                    (field) =>
                      field.fieldName === flt.fieldName ||
                      field.fieldDisplayName === flt.fieldName
                  );
                  return (
                    <>
                      <FilterSelectedItem
                        deleteFilter={() => deleteFilter(index)}
                        filterList={filterList}
                        type={
                          (foundCustomField && foundCustomField.fieldType) || ""
                        }
                        updateSelectedItem={updateSelectedItem}
                        key={index}
                        audience={flt}
                        index={index}
                      />
                      {index + 1 < displayFiltersCount && (
                        <div className={"divider"}>
                          {t("profile.contacts.sidebar.conditions.and")}
                        </div>
                      )}
                    </>
                  );
                })}
            </div>
          )}

          <div className={`add-filter`} style={{ paddingTop: 0 }}>
            {!selectingFilter && editNoFilter && (
              <div className={`filter`}>
                <InfoTooltip
                  placement={"right"}
                  children={t("profile.tooltip.filter.add")}
                  trigger={
                    <Button onClick={startSelectingFilter}>
                      {t("profile.contacts.sidebar.actions.addFilter")}
                    </Button>
                  }
                />
              </div>
            )}
            {selectingFilter && (
              <div className={`filter-list${fieldSelectedName && " selected"}`}>
                <Input
                  type="text"
                  fluid
                  onChange={searchChange}
                  placeholder={t("form.field.search.placeholder.short")}
                />
                <div className="filter-condition-list">
                  <AvailableFilterList
                    conditionClick={conditionClick}
                    prepend={
                      <>
                        {tagFilters.length === 0 && labelsFound && (
                          <li onClick={tagsConditionClick}>
                            {t("profile.staticField.hashtag.name")}
                          </li>
                        )}
                        {listIdFilters.length === 0 &&
                          setListIdFilters &&
                          listsFound && (
                            <li onClick={listsConditionClick}>
                              {t("profile.staticField.lists.name")}
                            </li>
                          )}
                      </>
                    }
                    filterItemList={filterList.filter((flt) =>
                      flt.fieldName
                        .toLowerCase()
                        .includes(fieldSearch.toLowerCase())
                    )}
                  />
                </div>
              </div>
            )}
            {editingFilter && (
              <EditFilterCondition
                audience={audience}
                key={
                  audience && existingFilters?.findIndex(matchFilter(audience))
                }
                index={
                  audience && existingFilters?.findIndex(matchFilter(audience))
                }
                isSelected={editingFilter}
                updateCondition={updateCondition}
                filter={filterList.find(
                  (f) =>
                    f.fieldName.toLowerCase() ===
                    fieldSelectedName.toLowerCase()
                )}
              />
            )}
            {editingTagsFilter && (
              <EditTagFilters
                tagsInit={tagFilters}
                onFilterApplied={(tags) => {
                  setTagFilters(tags);
                  stopEditCondition();
                }}
              />
            )}
            {editingListsFilter && listIdFilters && setListIdFilters && (
              <EditListFilters
                listIdsInit={listIdFilters}
                onFilterApplied={(ids) => {
                  setListIdFilters(ids);
                  stopEditCondition();
                }}
              />
            )}
          </div>
          {!editingAnyFilter && !selectingFilter && (
            <div style={{ display: "flex", marginTop: 32 }}>
              <Button
                loading={isLoading}
                disabled={isLoading}
                primary
                className={"button-small"}
                style={{
                  width: 100,
                  display: "flex",
                  justifyContent: "center",
                }}
                onClick={() => onSubmit()}
              >
                {isEditSegment ? t("analytics.update") : t("analytics.create")}
              </Button>
              <Button
                loading={isLoading}
                disabled={isLoading}
                className={"button-small"}
                style={{
                  marginLeft: 8,
                  width: 100,
                  display: "flex",
                  justifyContent: "center",
                }}
                onClick={() => resetFormValue()}
              >
                {t("analytics.reset")}
              </Button>
            </div>
          )}
        </Form>
      </>
    );
  };
  return (
    <Drawer
      visible={visible}
      className={"contact"}
      hide={() => {
        stopEditCondition();
        props.onHide();
      }}
    >
      <Header as={"h1"} className={"top"}>
        {isManageSegment
          ? t("analytics.manageSegments")
          : isEditSegment
          ? t("analytics.editSegment")
          : t("analytics.createSegment")}
        <i className={"ui icon close lg-white"} onClick={props.onHide} />
      </Header>
      {isManageSegment ? renderSegmentList() : renderContactFilters()}
      <Modal open={isDeleteModalOpen} size="tiny" style={{ width: 400 }}>
        <ModalContainer>
          <ModalHeader>
            <div>{t("analytics.deleteSegment")}</div>
          </ModalHeader>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <span>
              <Trans
                i18nKey={"analytics.confirmDelete"}
                values={{ segment: currentSegment.name }}
              >
                Are you sure you want to delete
                <span style={{ color: "#6078ff", fontWeight: 500 }}>
                  {currentSegment.name}
                </span>
                ?
              </Trans>
            </span>
            <br />
            {t("analytics.confirmDelete2")}
            <div style={{ display: "flex", marginTop: 21 }}>
              <Button
                primary
                className={"button-small"}
                style={{
                  width: 100,
                  display: "flex",
                  justifyContent: "center",
                }}
                onClick={() => handleDeleteSegment(currentSegment.id)}
              >
                {t("analytics.delete")}
              </Button>
              <Button
                className={"button-small"}
                style={{
                  marginLeft: 8,
                  width: 100,
                  display: "flex",
                  justifyContent: "center",
                }}
                onClick={() => setIsDeleteModalOpen(false)}
              >
                {t("analytics.cancel")}
              </Button>
            </div>
          </div>
        </ModalContainer>
      </Modal>
    </Drawer>
  );
}

function EditTagFilters(props: {
  tagsInit: HashTagCountedType[];
  onFilterApplied: (tags: HashTagCountedType[]) => void;
}) {
  const { t } = useTranslation();
  const { companyTags } = useCompanyHashTags();
  const [tagFiltersLocal, setTagFiltersLocal] = useState<HashTagCountedType[]>(
    props.tagsInit
  );
  return (
    <div className={`filter-condition display tags`}>
      <div className="ui form filter-content">
        <div className={"filter-name"}>
          {t("profile.staticField.hashtag.name")}
        </div>
        <div className="field">
          <TagInput
            availableTags={companyTags}
            onChange={setTagFiltersLocal}
            value={tagFiltersLocal}
          />
        </div>
      </div>
      <Button
        content={t("profile.form.filter.action.apply")}
        className={"button-small"}
        primary
        onClick={() => {
          props.onFilterApplied(tagFiltersLocal);
        }}
      />
    </div>
  );
}

function EditListFilters(props: {
  listIdsInit: string[];
  onFilterApplied: (ids: string[]) => void;
}) {
  const { t } = useTranslation();
  const { lists } = useImportedLists();
  const [listIdsLocal, setListIdsLocal] = useState<string[]>(props.listIdsInit);

  return (
    <div className={`filter-condition display tags`}>
      <div className="ui form filter-content">
        <div className={"filter-name"}>
          {t("profile.staticField.importfrom.name")}
        </div>
        <div className="field">
          <Dropdown
            fluid
            value={listIdsLocal}
            onChange={(_, { value }) => {
              setListIdsLocal(value as string[]);
            }}
            options={lists.map((l) => ({
              value: String(l.id),
              text: l.importName,
              key: l.id,
            }))}
            multiple
            search
          />
        </div>
      </div>
      <Button
        content={t("profile.form.filter.action.apply")}
        className={"button-small"}
        primary
        onClick={() => {
          props.onFilterApplied(listIdsLocal);
        }}
      />
    </div>
  );
}

export default ContactSidebar;
