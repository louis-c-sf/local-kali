import React, { useCallback, ReactNode, useState, useEffect } from "react";
import { Dropdown, Menu, Icon, Ref } from "semantic-ui-react";
import useRouteConfig from "../../../config/useRouteConfig";
import { NavLink } from "react-router-dom";
import { MainMenuItemType } from "./localizable/useMainMenus";
import BadgeTag from "component/shared/BadgeTag/BadgeTag";
import styles from "./SubMenu.module.css";
import { findClosestParent } from "../../../utility/dom";
import { identical } from "ramda";

export function SubMenu(props: {
  items: MainMenuItemType[];
  rootTitle: string;
  selected: boolean;
}) {
  const { items, rootTitle, selected } = props;
  const { matchesCurrentRoute } = useRouteConfig();
  const isActive = useCallback(
    (path: string) => matchesCurrentRoute(path),
    [matchesCurrentRoute]
  );

  return (
    <span
      className={`
      menu-item-dropdown item menuItem
      ${styles.root} 
      ${selected ? "selected" : ""} 
      `}
    >
      <Dropdown
        pointing={false}
        text={rootTitle}
        icon={"chevron down"}
        className={`menu-item-dropdown `}
        upward={false}
      >
        <Dropdown.Menu
          className={`main-menu-dropdown contacts-menu ${styles.nestedMenu}`}
        >
          {items.map((item, idx) => {
            if (item.children) {
              return (
                <SubMenuItem
                  children={item.children}
                  item={item}
                  key={item.name}
                />
              );
            }
            if (!item.path) {
              return null;
            }
            return (
              <Item
                key={item.name}
                url={item.path}
                text={item.title}
                id={item.name}
                isActive={isActive(item.path)}
                icon={item.icon}
                beta={item.beta}
              />
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
    </span>
  );
}

function Item(props: {
  url: string;
  text: string;
  id: string;
  isActive: boolean;
  icon?: ReactNode;
  beta?: boolean;
}) {
  const { id, isActive, url, text, beta, icon } = props;
  return (
    <Dropdown.Item
      value={id}
      active={isActive}
      selected={false}
      className={styles.item}
    >
      <NavLink to={url}>
        <span className="text">{text} </span>
        {icon && <span className="icon-custom">{icon}</span>}
        {beta && <BadgeTag className="large" noMargins text="BETA" />}
      </NavLink>
    </Dropdown.Item>
  );
}

function SubMenuItem(props: {
  item: MainMenuItemType;
  children: MainMenuItemType[];
}) {
  let { item, children } = props;
  const [menuHovered, setMenuHovered] = useState<boolean>();
  const [submenuRef, setSubmenuRef] = useState<HTMLElement | null>(null);

  const { matchesCurrentRoute } = useRouteConfig();

  const isActive = useCallback(
    (path: string) => matchesCurrentRoute(path),
    [matchesCurrentRoute]
  );

  const openSubmenu = (ev: MouseEvent) => {
    setMenuHovered(true);
  };

  const closeSubmenu = (ev: MouseEvent) => {
    const target = ev.target as HTMLElement;
    const nodeTo = ev.relatedTarget as HTMLElement;
    const toSubmenu = findClosestParent(nodeTo, identical(submenuRef));
    if (!toSubmenu) {
      setMenuHovered(false);
    }
  };

  let content: ReactNode = item.title;
  if (item.icon) {
    content = (
      <div className={styles.trigger}>
        {item.icon && <span className={styles.icon}>{item.icon}</span>}
        {item.beta && <BadgeTag className="large" noMargins text="BETA" />}
        <span className="text">{item.title} </span>
        <Icon name={"chevron right"} className={styles.chevron} />
      </div>
    );
  }

  useEffect(() => {
    if (!submenuRef) {
      return;
    }
    submenuRef.addEventListener("mouseenter", openSubmenu);
    submenuRef.addEventListener("mouseleave", closeSubmenu);
    return () => {
      submenuRef.removeEventListener("mouseenter", openSubmenu);
      submenuRef.removeEventListener("mouseleave", closeSubmenu);
    };
  }, [submenuRef]);

  return (
    <Ref innerRef={setSubmenuRef}>
      <Dropdown item icon={null} trigger={content} open={menuHovered}>
        <Dropdown.Menu className={styles.menu} open={menuHovered}>
          {children.map((child, idx) => {
            if (!child.path) {
              return null;
            }
            return (
              <Item
                key={child.path ?? idx}
                id={child.path}
                isActive={isActive(child.path)}
                text={child.title}
                url={child.path}
              />
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
    </Ref>
  );
}
