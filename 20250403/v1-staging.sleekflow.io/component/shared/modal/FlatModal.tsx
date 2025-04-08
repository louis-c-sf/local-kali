import React, { ReactNode } from "react";
import { Modal } from "semantic-ui-react";
import { ModalProps } from "semantic-ui-react/dist/commonjs/modules/Modal/Modal";

interface FlatModalProps extends ModalProps {
  children: ReactNode;
  className?: string;
}

export function FlatModal(props: FlatModalProps) {
  const { className, children, content, ...restProps } = props;
  return (
    <Modal className={`flat ${props.className ?? ""}`} {...restProps}>
      {children}
    </Modal>
  );
}
