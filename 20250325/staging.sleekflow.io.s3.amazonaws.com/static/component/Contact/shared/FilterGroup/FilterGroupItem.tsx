import React, { useState, useContext, useEffect } from "react";
import { useVerticalCurtain } from "../../../../lib/effects/useVerticalCurtain";
import styles from "./FilterGroupItem.module.css";
import { CollapseIcon } from "../../DrawerFilter/CollapseIcon";
import { FilterField } from "./FilterField";
import { FilterGroupContext } from "./FilterGroupContext";
import {
  FilterGroupFieldType,
  RemoveValueInterface,
  AppendValueInterface,
  UpdateIndexedValueInterface,
  HandleFieldDisplayInterface,
} from "./FilterGroupFieldType";
import { CheckboxInput } from "../../../shared/input/CheckboxInput";
import { useConditionFieldOperators } from "../../Filter/useConditionFieldOperators";
import { Button } from "../../../shared/Button/Button";
import { useTranslation } from "react-i18next";
import { useInitializeFilterField } from "./useInitializeFilterField";
import { RemoveButton } from "./Condition/RemoveButton";
import { withLoop } from "../../../../utility/array";
import PlusIcon from "../../../../assets/tsx/icons/PlusIcon";
import { ListTypeValue } from "../../../../container/Contact/hooks/ContactsStateType";

export function FilterGroupItem(props: {
  onCheck: HandleFieldDisplayInterface;
  onOpen: HandleFieldDisplayInterface;
  onClose: HandleFieldDisplayInterface;
  checked: boolean;
  opened: boolean;
  field: FilterGroupFieldType;
  update: UpdateIndexedValueInterface;
  remove: RemoveValueInterface;
  append: AppendValueInterface;
  values: ListTypeValue[] | null;
  visible: boolean;
}) {
  const {
    checked,
    field,
    values,
    onCheck,
    opened,
    update,
    append,
    remove,
    onOpen,
    onClose,
  } = props;

  const { t } = useTranslation();

  const [curtainNode, setCurtainNode] = useState<HTMLDivElement | null>(null);
  const [contentNode, setContentNode] = useState<HTMLDivElement | null>(null);

  const { visible } = useContext(FilterGroupContext);

  const { initializeFilterField } = useInitializeFilterField();

  useVerticalCurtain({
    opened: opened,
    contents: contentNode,
    curtain: curtainNode,
  });

  function toggleChecked(e: React.MouseEvent) {
    e.stopPropagation();
    onCheck(field);
  }

  function toggleOpened() {
    if (opened) {
      onClose(field);
    } else {
      onOpen(field);
    }
  }

  function removeConditionAt(index: number) {
    return () => remove(field.fieldName, index);
  }

  useEffect(() => {
    if (!visible) {
      onClose(field);
    }
  }, [visible]);

  const { canHaveMultipleConditions } = useConditionFieldOperators();

  return (
    <div className={`${styles.field} ${props.visible ? "" : styles.hidden}`}>
      <div className={styles.fieldHeader}>
        <div className={styles.check}>
          <CheckboxInput onClick={toggleChecked} checked={checked} />
        </div>
        <div className={styles.label} onClick={toggleOpened}>
          {field.displayName}
        </div>
        <div className={styles.collapse}>
          <CollapseIcon opened={opened} toggle={toggleOpened} />
        </div>
      </div>
      <div className={`${styles.collapsible}`}>
        <div className={styles.curtain} ref={setCurtainNode}>
          <div ref={setContentNode}>
            {!values ? (
              <div className={`${styles.group} ${styles.last} `}>
                <div className={styles.groupBox}>
                  <FilterField
                    field={field}
                    value={undefined}
                    update={append}
                    index={0}
                    checked={checked}
                  />
                </div>
              </div>
            ) : (
              values.map(
                withLoop((value, idx, _, { isLast }) => (
                  <div
                    key={idx}
                    className={`${styles.group} ${styles.selected} ${
                      isLast ? styles.last : ""
                    }`}
                  >
                    <div className={styles.groupBox}>
                      {values.length > 1 && (
                        <div className={styles.remove}>
                          <RemoveButton close={removeConditionAt(idx)} />
                        </div>
                      )}
                      <FilterField
                        key={idx}
                        field={field}
                        update={update}
                        value={value}
                        index={idx}
                        checked={checked}
                      />
                    </div>
                    {!isLast && (
                      <div className={styles.conditionDivider}>
                        <div className={styles.label}>
                          {t("profile.contacts.sidebar.conditions.and")}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )
            )}
            {values &&
              canHaveMultipleConditions(field.fieldName, field.fieldType) && (
                <div className={styles.multipleActions}>
                  <Button
                    content={
                      <>
                        <PlusIcon />
                        {t("profile.contacts.sidebar.actions.addCondition")}
                      </>
                    }
                    onClick={() => {
                      append(initializeFilterField(field));
                    }}
                  />
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
