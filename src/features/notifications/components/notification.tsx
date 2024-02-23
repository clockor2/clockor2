import { HiFire, HiExclamationCircle, HiInformationCircle } from "react-icons/hi";
import { Toast } from "flowbite-react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { Notification, removeNotification } from "../notificationsSlice";
import { useEffect } from "react";


export function NotificationToast(notification: Notification) {
  const dispatch = useAppDispatch();
  // on click remove self from notification 
  const handleRemove = () => {
    dispatch(removeNotification(notification));
  }

  // Automatically remove the notification after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeNotification(notification));
    }, 5000);
    return () => clearTimeout(timer);
  }, [dispatch, notification]); // Dependencies to re-run this effect if they change


  // Determine icon based on notification type
  let icon;
  let color;
  switch (notification.type) {
    case "error":
      icon = <HiFire className="h-5 w-5" />;
      color = "red";
      break;
    case "warning":
      icon = <HiExclamationCircle className="h-5 w-5" />;
      color = "yellow";
      break;
    case "info":
      icon = <HiInformationCircle className="h-5 w-5" />;
      color = "cyan";
      break;
    default:
      icon = <HiFire className="h-5 w-5" />; // Fallback or default icon
      color = "cyan";
  }
  return (
    <Toast >
      <div className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-${color}-100 text-${color}-500 dark:bg-${color}-800 dark:text-${color}-200`}>
        {icon}
      </div>
      <div className="ml-3 text-sm font-normal">{notification.message}</div>
      <Toast.Toggle onClick={handleRemove}  />
    </Toast>
    );
}