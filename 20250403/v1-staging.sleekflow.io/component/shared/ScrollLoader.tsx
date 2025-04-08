import React, { ReactNode, useEffect, useRef } from "react";
import { Loader } from "semantic-ui-react";
import styles from "./ScrollLoader.module.css";

const ScrollLoader = (props: {
  children: ReactNode;
  isFetchEnd: boolean;
  callback: Function;
  customConfig?: {
    root: HTMLBodyElement;
    rootMargin: string;
    threshold: number;
  };
  isFetching: boolean;
}) => {
  const {
    children,
    isFetchEnd,
    callback,
    customConfig = {},
    isFetching,
  } = props;
  const loaderRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isFetchEnd) {
      return;
    }
    let config = {};
    if (customConfig) {
      config = { ...customConfig };
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].intersectionRatio <= 0) return;
      if (isFetching) return;
      callback();
    }, config);
    //start observing
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    return () => observer.disconnect();
  }, [isFetchEnd, callback, customConfig, isFetching]);

  return (
    <div className={styles.scrollLoader}>
      {children}
      {!isFetchEnd && (
        <div className={styles.loader} ref={loaderRef}>
          <Loader active />
        </div>
      )}
    </div>
  );
};
export default ScrollLoader;
