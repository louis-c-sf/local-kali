import { CampaignNormalizedType } from "./CampaignNormalizedType";
import { CampaignsFilterFormType } from "./CampaignsFilterFormType";
import { FieldReader } from "../../../API/Objects/FieldReader/FieldReader";
import React, { ReactNode, Reducer } from "react";
import {
  ObjectsGridProvider,
  createObjectsGridReducer,
} from "../../../components/ObjectsGrid/ObjectsGridContext";
import {
  ObjectsGridStateType,
  ObjectsGridActionType,
  GetObjectOwnerInterface,
  GetObjectUrlInterface,
  GetObjectConversationInterface,
  GetCountInterface,
} from "../../../components/ObjectsGrid/ObjectsGridContextType";
import {
  defaultDataGridState,
  DataGridStateType,
} from "../../../components/ObjectsGrid/DataGridStateType";
import { defaultContinuousPagerState } from "../../../reducers/continuousPagerReducer";
import { ObjectNormalizedType } from "../../../API/Objects/contracts";

export type CampaignsStateType = ObjectsGridStateType<
  CampaignNormalizedType,
  CampaignsFilterFormType
>;

function defaultFilter(): CampaignsFilterFormType {
  return { search: "", stage: null };
}

export function defaultCampaignsState() {
  return {
    ...defaultDataGridState<CampaignsFilterFormType, CampaignNormalizedType>(
      defaultFilter()
    ),
    ...defaultContinuousPagerState(),
  };
}

export function createCampaignsReducer(
  pageSize: number,
  pagesPerGroup: number
) {
  return createObjectsGridReducer(
    "DATA_LOADED",
    defaultFilter(),
    pageSize,
    pagesPerGroup
  ) as Reducer<
    ObjectsGridStateType<CampaignNormalizedType, CampaignsFilterFormType>,
    ObjectsGridActionType<CampaignNormalizedType, CampaignsFilterFormType>
  >;
}

export function CampaignsGridProvider(props: {
  children: ReactNode;
  getObjectUrl: GetObjectUrlInterface;
  getObjectOwner: GetObjectOwnerInterface;
  getObjectConversation: GetObjectConversationInterface;
  getObjectCount: GetCountInterface;
  fieldReader: FieldReader;
  pageSize: number;
  pagesPerGroup: number;
  initDetail: ObjectNormalizedType | null;
}) {
  const defaultState = defaultCampaignsState();

  const initState: ObjectsGridStateType<
    CampaignNormalizedType,
    CampaignsFilterFormType
  > = props.initDetail
    ? {
        ...defaultState,
        detailData: { ...props.initDetail },
        detailVisible: true,
      }
    : { ...defaultState };
  return (
    <ObjectsGridProvider<CampaignNormalizedType, CampaignsFilterFormType>
      type={"Campaign"}
      initState={initState}
      reducer={createCampaignsReducer(props.pageSize, props.pagesPerGroup)}
      getObjectUrl={props.getObjectUrl}
      getObjectOwner={props.getObjectOwner}
      getObjectConversation={props.getObjectConversation}
      getObjectCount={props.getObjectCount}
      fieldReader={props.fieldReader}
    >
      {props.children}
    </ObjectsGridProvider>
  );
}
