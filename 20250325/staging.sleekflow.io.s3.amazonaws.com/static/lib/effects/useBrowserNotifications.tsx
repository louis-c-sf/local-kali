import { useCallback, useEffect, useState } from "react";
import MessageIcon from "../../assets/images/logo-solid.png";

export function useBrowserNotifications() {
  const permission =
    "Notification" in window ? Notification.permission : undefined;
  const [notificationAllowed, setNotificationAllowed] = useState(
    permission === "granted"
  );

  const notify = useCallback(
    (
      title: string,
      body?: string | null,
      onClick?: (this: Notification, ev: Event) => any
    ) => {
      if (!notificationAllowed) {
        return;
      }
      const n = new Notification(title, {
        icon: MessageIcon,
        body: body ?? undefined,
      });
      if (onClick) {
        n.onclick = onClick;
      }
    },
    [notificationAllowed]
  );

  useEffect(() => {
    if (permission === "granted") {
      setNotificationAllowed(true);
    } else {
      setNotificationAllowed(false);
    }
  }, [permission]);

  function enableBrowserNotifications() {
    // use on any browser interaction, Firefox restricts bare requests
    // https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API#requesting_permission
    if (!("Notification" in window)) {
      return;
    }
    try {
      Promise.resolve(Notification.requestPermission()).then((result) => {
        setNotificationAllowed(result === "granted");
      });
    } catch (e) {
      console.error("InboxNotifier.permission", e);
    }
  }

  return {
    browserNotificationsEnabled: notificationAllowed,
    enableBrowserNotifications,
    notify,
  };
}
