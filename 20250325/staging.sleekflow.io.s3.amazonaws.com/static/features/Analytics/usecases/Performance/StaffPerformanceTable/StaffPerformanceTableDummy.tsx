import React from "react";
import styles from "features/Analytics/usecases/Performance/StaffPerformanceTable/StaffPerformanceTable.module.css";
import { Menu, Placeholder, Table } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import gridStyles from "component/shared/grid/Grid.module.css";
import GridDummy from "component/shared/Placeholder/GridDummy";

export function StaffPerformanceTableDummy() {
  const { t } = useTranslation();
  return (
    <div className={`${styles.root} ${styles.loading}`}>
      <div className={styles.head}>{t("analytics.performance.staff.head")}</div>
      <div className={styles.tabs}>
        <Menu
          secondary
          vertical={false}
          pointing
          items={Array(4).fill({
            disabled: true,
            content: (
              <Placeholder>
                <Placeholder.Paragraph>
                  <Placeholder.Line length={"short"} />
                </Placeholder.Paragraph>
              </Placeholder>
            ),
          })}
        />
      </div>
      <div className={styles.tableWrap}>
        <Table
          basic={"very"}
          sortable
          className={`${styles.table} ${gridStyles.grid} ${gridStyles.frame}`}
        >
          <GridDummy loading columnsNumber={6} hasCheckbox={false} />
        </Table>
      </div>
    </div>
  );
}
