import React, { useState, useEffect } from "react";
import styles from "./OrdersTab.module.css";
import moment, { Moment } from "moment";
import { OrdersFilter } from "./OrdersFilter";
import { OrderGrid } from "./OrderGrid";
import { Pagination, Dimmer, Loader } from "semantic-ui-react";
import { useAppSelector } from "../../../AppRootContext";
import { useAccessRulesGuard } from "../../../component/Settings/hooks/useAccessRulesGuard";
import { useCompanyStaff } from "../../../api/User/useCompanyStaff";
import GridDummy from "../../../component/shared/Placeholder/GridDummy";
import { RefundDialogContext } from "features/Stripe/usecases/Refund/contracts/RefundDialogContext";
import { useFetchStripePage } from "./useFetchStripePage";
import { usePaymentSettingsContext } from "features/Ecommerce/Payment/usecases/Settings/contracts/PaymentSettingsContext";

export function OrdersTab() {
  const userId = useAppSelector((s) => s.user.id);
  const initDateTo = moment();
  const initDateFrom = moment().subtract(7, "days");
  const accessRulesGuard = useAccessRulesGuard();
  const [booted, setBooted] = useState(false);
  const { staffList, booted: staffBooted } = useCompanyStaff();
  const settings = usePaymentSettingsContext();

  const {
    fetchData,
    data: results,
    loading,
    page,
    totalPages,
    filter,
    sort,
    getMySubordinateTeams,
  } = useFetchStripePage({
    user: userId,
    dateTo: initDateTo.clone(),
    dateFrom: initDateFrom.clone(),
    status: "Pending",
    countryCode: settings.country.countryCode,
  });

  useEffect(() => {
    if (staffBooted) {
      setBooted(true);
      fetchData({
        ...filter,
        countryCode: settings.country.countryCode,
      });
    }
  }, [staffBooted, booted, settings.country.countryCode]);

  function getStaffList() {
    if (accessRulesGuard.isAdmin()) {
      return staffList;
    }
    const subordinateTeamsMembers = getMySubordinateTeams();
    if (subordinateTeamsMembers.length > 0) {
      return subordinateTeamsMembers;
    }
    return [];
  }

  return (
    <>
      <div className={styles.body}>
        <div className={styles.filter}>
          <OrdersFilter
            filter={filter}
            onChange={fetchData}
            maxDate={initDateTo}
            staffList={getStaffList()}
            disabled={!booted}
            showStaffFilter={
              accessRulesGuard.isAdmin() || accessRulesGuard.isTeamAdmin()
            }
          />
        </div>
        <div className={styles.grid}>
          {booted ? (
            <>
              {loading && (
                <Dimmer active inverted className={styles.dimmer}>
                  <Loader active />
                </Dimmer>
              )}
              <RefundDialogContext>
                <OrderGrid
                  loading={loading}
                  data={results}
                  sortValue={sort}
                  sort={(by) => fetchData(filter, { sort: by })}
                  refreshOrder={() => setBooted(false)}
                />
              </RefundDialogContext>
            </>
          ) : (
            <table
              className={`${styles.dummy} ui table very basic payment-orders sortable`}
            >
              <GridDummy
                loading
                columnsNumber={9}
                hasCheckbox={false}
                rowSteps={5}
              />
            </table>
          )}
        </div>
        {booted && totalPages > 1 && (
          <div className={styles.footer}>
            <Pagination
              activePage={page}
              totalPages={totalPages}
              onPageChange={(_, data) => {
                fetchData({ ...filter }, { page: data.activePage as number });
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}
