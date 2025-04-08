import { Menu, Portal, Sidebar } from "semantic-ui-react";
import React, { useEffect, useState } from "react";

export function Drawer(props: {
  children: React.ReactNode;
  visible: boolean;
  className?: string;
  dim?: boolean;
  onVisible?: () => void;
  hide: () => void;
}) {
  const {
    children,
    className,
    visible,
    dim = false,
    onVisible: propsOnVisible = () => {},
  } = props;
  const sidebarRoot = document.getElementById("sidebar-area-right");
  const sidebarPusher = document.getElementById("app-sidebar-pusher");
  const [display, setDisplay] = useState(false);

  useEffect(() => {
    if (!sidebarRoot || !sidebarPusher) return;
    // on opening start
    if (visible) {
      sidebarRoot?.classList.add("opened");
      if (dim) {
        sidebarPusher?.classList.add("dimmed");
      } else {
        sidebarPusher?.classList.remove("dimmed");
      }
      setDisplay(true);
    } else {
      setDisplay(false);
      sidebarRoot?.classList.remove("opened");
      sidebarPusher?.classList.remove("dimmed");
    }
    return () => {
      // hide dimmer on unmount as the real divs remain mounted
      sidebarRoot?.classList.remove("opened");
      sidebarPusher?.classList.remove("dimmed");
    };
  }, [visible, dim, sidebarRoot, sidebarPusher]);

  return (
    <Portal mountNode={sidebarRoot} open={Boolean(sidebarRoot)}>
      <Sidebar
        as={Menu}
        visible={visible}
        vertical
        onHide={() => {
          props.hide();
          if (dim) {
            sidebarPusher?.classList.remove("dimmed");
          }
        }}
        onHidden={() => {
          sidebarRoot?.classList.remove("opened");
          setDisplay(false);
        }}
        onVisible={() => {
          propsOnVisible();
          setDisplay(true);
        }}
        direction={"right"}
        className={`drawer ${className ?? ""} ${display ? "display" : ""}`}
        animation={"push"}
        content={children}
      />
    </Portal>
  );
}
