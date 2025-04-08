import { fetchListsPage } from "api/Contacts/fetchListsPage";
import { LIMIT } from "container/Contact/Imported/ListsDashboard";
import { ListDashboardAction } from "container/Contact/Imported/reducer";

export function useListsDashboardItemsProvider(props: {
  dispatch: (action: ListDashboardAction) => void;
}) {
  const { dispatch } = props;

  async function fetchPage(pageNumber: number, search: string) {
    dispatch({ type: "PAGE_LOADING", page: pageNumber });
    const query = search.trim() !== "" ? search.trim() : undefined;
    try {
      const offset = (pageNumber - 1) * LIMIT;
      const data = await fetchListsPage(LIMIT, offset, query);

      dispatch({ type: "PAGE_LOADED", data, page: pageNumber });
    } catch (e) {
      console.error("fetchPage", e);
    }
  }

  return {
    fetch: fetchPage,
  };
}
