import { Action, Reducer } from "redux";
import React from "react";

export function reduceReducersWithDefaults<TState, TAction extends Action>(
  ...args: Reducer<TState | undefined, TAction>[]
) {
  const reducers = args;

  return (prevState: TState | undefined, value: TAction): TState =>
    reducers.reduce<TState>(
      (
        newState: TState | undefined,
        reducer: Reducer<TState | undefined, TAction>
      ) => reducer(newState, value)!,
      prevState!
    );
}

export function reduceReducers<TState, TAction>(
  ...args: React.Reducer<TState, TAction>[]
): React.Reducer<TState, TAction> {
  const reducers = args;

  return (prevState: TState, value: TAction): TState => {
    return reducers.reduce<TState>(
      (newState, reducer: React.Reducer<TState, TAction>) => {
        return reducer(newState, value);
      },
      prevState
    );
  };
}
