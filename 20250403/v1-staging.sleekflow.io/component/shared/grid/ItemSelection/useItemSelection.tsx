import React, {
  useState,
  ReactNode,
  useContext,
  useEffect,
  useCallback,
} from "react";

type ItemSelectionContextType = {
  checkedIds: string[];
  anyChecked: boolean;
  allChecked: boolean;
  toggleCheck: (id: string) => void;
  toggleAll: () => void;
  deselectAll: () => void;
  isChecked(id: string): boolean | undefined;
};

const Context = React.createContext<ItemSelectionContextType | null>(null);

export function useItemSelection() {
  const context = useContext(Context);
  if (context === null) {
    throw "Please initiate with ItemSelectionContextProvider";
  }
  return context;
}

export function ItemSelectionContextProvider(props: {
  children: ReactNode;
  initIds: string[];
}) {
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const listHash = checkedIds.join();

  useEffect(() => {
    setCheckedIds([]);
  }, [props.initIds.join()]);

  const isChecked = useCallback(
    (id: string) => checkedIds.includes(id),
    [listHash]
  );

  const toggleAll = useCallback(() => {
    if (checkedIds.length < props.initIds.length) {
      setCheckedIds([...props.initIds]);
    } else {
      setCheckedIds([]);
    }
  }, [listHash, props.initIds.join()]);

  const deselectAll = useCallback(() => {
    setCheckedIds([]);
  }, []);

  const toggleCheck = useCallback(
    (checkedId: string) => {
      if (checkedIds.some((id) => id === checkedId)) {
        setCheckedIds((ids) => ids.filter((id) => id !== checkedId));
      } else {
        setCheckedIds((ids) => [...ids, checkedId]);
      }
    },
    [listHash]
  );

  const value: ItemSelectionContextType = {
    checkedIds: checkedIds,
    toggleCheck: toggleCheck,
    toggleAll: toggleAll,
    deselectAll: deselectAll,
    isChecked: isChecked,
    anyChecked: checkedIds.length > 0,
    allChecked: checkedIds.length === props.initIds.length,
  };

  return <Context.Provider value={value}>{props.children}</Context.Provider>;
}
