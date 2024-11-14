let timer;
let timeLeft = 0; 
let isRunning = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'start') {
        if (isRunning) {
            sendResponse({ timeLeft, isRunning });
            return;
        }
        timeLeft = message.duration * 60;
        isRunning = true;
        
        timer = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
            } else {
                clearInterval(timer);
                isRunning = false;
                showNotification(message.title);
            }
        }, 1000);

        sendResponse({ timeLeft, isRunning });
    } else if (message.action === 'stop') {
        clearInterval(timer);
        isRunning = false;
        sendResponse({ timeLeft, isRunning });
    } else if (message.action === 'reset') {
        clearInterval(timer);
        isRunning = false;
        timeLeft = 0;
        sendResponse({ timeLeft, isRunning });
    } else if (message.action === 'status') {
        sendResponse({ timeLeft, isRunning });
    }
    return true;
});

function showNotification(sessionTitle) {
    const title = chrome.i18n.getMessage("notification_title");
    const message = chrome.i18n.getMessage("notification_message").replace("{sessionTitle}", sessionTitle);

    chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icon.webp'), 
        title: title,
        message: message,
        priority: 2
    }, (notificationId) => {
        if (chrome.runtime.lastError) {
            console.error("Error al mostrar la notificación:", chrome.runtime.lastError.message);
        } else {
            console.log("Notificación mostrada con ID:", notificationId);
        }
    });
}

showNotification('Sesión de Enfoque | TEMPORIZADOR POMODORO');


