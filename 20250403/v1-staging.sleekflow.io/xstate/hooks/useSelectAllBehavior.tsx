import {
  SelectAllContext,
  selectAllItemsMachine,
  TotalResponseData,
} from "../selectAllIItemsMachine";
import { useMachine } from "@xstate/react/lib";

interface SelectAllBehaviorProps {
  selectAllCallback: (context: SelectAllContext) => Promise<TotalResponseData>;
}

export function useSelectAllBehavior(props: SelectAllBehaviorProps) {
  const [selectAllMachineState, selectAllSend] = useMachine(
    selectAllItemsMachine,
    {
      services: {
        loadTotals: props.selectAllCallback,
      },
    }
  );

  return {
    state: selectAllMachineState,
    send: selectAllSend,
  };
}
