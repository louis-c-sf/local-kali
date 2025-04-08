import React from "react";
import { CustomStoreFormType } from "../EditStore";
import { Form } from "./FormTab/Form";
import { Portal } from "semantic-ui-react";
import { Button } from "component/shared/Button/Button";
import { useTranslation } from "react-i18next";
import { useEditStoreForm } from "./FormTab/useEditStoreForm";
import { useEditStoreApi } from "./FormTab/useEditStoreApi";
import { CustomStoreType } from "core/models/Ecommerce/Catalog/CustomStoreType";

export function FormTab(props: {
  id: string;
  actionsRef: HTMLDivElement | null;
  initValues: CustomStoreFormType;
  storeLoaded: CustomStoreType;
  hasProducts: boolean;
  setName: (name: string) => void;
}) {
  const { t } = useTranslation();
  const editApi = useEditStoreApi(props.id, props.storeLoaded);
  const form = useEditStoreForm({
    onSubmit: (values) => {
      editApi.persist(values);
      props.setName(values.name);
    },
    initValues: props.initValues,
  });

  return (
    <div>
      <Form form={form} hasProducts={props.hasProducts} storeId={props.id} />
      {props.actionsRef && (
        <Portal mountNode={props.actionsRef} open>
          <Button
            primary
            disabled={form.isSubmitDisabled}
            content={t("form.button.save")}
            onClick={form.submitForm}
          />
        </Portal>
      )}
    </div>
  );
}
