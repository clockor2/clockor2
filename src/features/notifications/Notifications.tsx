import { useAppSelector } from "../../app/hooks";
import { Notification, selectNotifications } from "./notificationsSlice";
import { NotificationToast } from "./components/notification";


export function Notifications() {
    const notifications = useAppSelector(selectNotifications)
    return (
        <div className="absolute z-50 bottom-0 right-0 m-5">
            {notifications.map((notification: Notification) => {
                return (
                    <div className=" mt-2">
                        <NotificationToast key={notification.id} {...notification} />
                    </div>
                )
            })}
        </div>
    );
}