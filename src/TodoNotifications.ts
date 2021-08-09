export function notifyUser(title: string, body: string | undefined) {
    if (!("Notification" in window)) {
        alert("Браузер не поддерживает уведомления");
    }
    else if (Notification.permission === "granted") {
        new Notification(title, {body});
    }
    else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
            new Notification(title, {body});
        } else {
            alert(`Для получения уведомлений разрешите их в настройках браузера.`);
        }
        });
    }
}