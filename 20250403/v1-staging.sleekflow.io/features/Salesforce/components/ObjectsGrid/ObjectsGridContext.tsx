import React, { ReactNode, useContext, useReducer, Reducer } from "react";
import { createContinuousPagerReducer } from "../../reducers/continuousPagerReducer";
import { DataGridActionType } from "./DataGridStateType";
import { createFilteredGridReducer } from "../../reducers/filteredGridReducer";
import { reduceReducers } from "../../../../utility/reduce-reducers";
import { FieldReader } from "../../API/Objects/FieldReader/FieldReader";
import { EntityType } from "../../API/Objects/contracts";
import {
  ObjectsGridContextType,
  ObjectsGridActionType,
  ObjectsGridStateType,
  GetCountInterface,
  GetObjectOwnerInterface,
  GetObjectConversationInterface,
  GetObjectUrlInterface,
} from "./ObjectsGridContextType";

const ObjectsGridContext = React.createContext<ObjectsGridContextType<
  any,
  any
> | null>(null);

export function ObjectsGridProvider<Item, Filter>(props: {
  type: EntityType;
  getObjectUrl: GetObjectUrlInterface;
  getObjectOwner: GetObjectOwnerInterface;
  getObjectConversation: GetObjectConversationInterface;
  getObjectCount: GetCountInterface;
  fieldReader: FieldReader;
  children: ReactNode;
  initState: ObjectsGridStateType<Item, Filter>;
  reducer: React.Reducer<
    ObjectsGridStateType<Item, Filter>,
    ObjectsGridActionType<Item, Filter>
  >;
}) {
  const Context = ObjectsGridContext as React.Context<
    ObjectsGridContextType<Item, Filter>
  >;

  const [state, dispatch] = useReducer(props.reducer, props.initState);

  return (
    <Context.Provider
      value={{
        state,
        dispatch,
        type: props.type,
        getObjectUrl: props.getObjectUrl,
        getObjectOwner: props.getObjectOwner,
        getObjectConversation: props.getObjectConversation,
        getObjectCount: props.getObjectCount,
        fieldReader: props.fieldReader,
      }}
    >
      {props.children}
    </Context.Provider>
  );
}

export function useObjectsGridContext<Item, Filter>() {
  const context = useContext(
    ObjectsGridContext as React.Context<ObjectsGridContextType<Item, Filter>>
  );
  if (context === null) {
    throw new Error("No init state provided");
  }
  return context;
}

export function createObjectsGridReducer<
  Item,
  Filter,
  DataLoadedAction extends string,
  State extends ObjectsGridStateType<Item, Filter>,
  Action extends DataGridActionType<Filter, Item>
>(
  dataLoadedAction: DataLoadedAction,
  filterInit: Filter,
  pageSize: number,
  pagesPerGroup: number
) {
  const pagerReducer = createContinuousPagerReducer(
    dataLoadedAction,
    pageSize,
    pagesPerGroup
  ) as Reducer<State, ObjectsGridActionType<Item, Filter>>;

  const gridReducer = createFilteredGridReducer<
    Filter,
    Item,
    State,
    DataGridActionType<Filter, Item>
  >(filterInit) as Reducer<State, ObjectsGridActionType<Item, Filter>>;

  return reduceReducers(gridReducer, pagerReducer);
}
