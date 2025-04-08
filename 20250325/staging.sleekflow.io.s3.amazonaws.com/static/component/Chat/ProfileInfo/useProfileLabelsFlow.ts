import { HashTagType, tagColorsBase } from "types/ConversationType";

export type ProfileLabelsFlowInterface = ReturnType<
  typeof useProfileLabelsFlow
>;

export function useProfileLabelsFlow(props: {
  onItemAdded: (tag: HashTagType, isNew: boolean) => void;
  close: () => void;
  searchActive: boolean;
  hasExactMatch: boolean;
  searchQuery: string;
}) {
  const canAddNewLabel = props.searchActive && !props.hasExactMatch;

  function chooseLabel(item: HashTagType) {
    return () => {
      props.onItemAdded(item, false);
    };
  }

  function addNewLabel() {
    props.onItemAdded(
      { hashtag: props.searchQuery.trim(), hashTagColor: tagColorsBase[0] },
      true
    );
    props.close();
  }

  return {
    addNewLabel,
    chooseLabel,
    canAddNewLabel,
  };
}
