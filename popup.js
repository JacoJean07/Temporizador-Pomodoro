document.addEventListener('DOMContentLoaded', () => {
    chrome.runtime.sendMessage({ action: 'status' }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("Error al obtener el estado:", chrome.runtime.lastError.message);
            return;
        }
        if (response) {
            updateDisplay(response.timeLeft);
            if (response.isRunning) {
                startInterval(); 
            }
        }
    });

    document.querySelectorAll('[data-i18n]').forEach(elem => {
        const message = chrome.i18n.getMessage(elem.getAttribute('data-i18n'));
        if (message) elem.textContent = message;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(elem => {
        const message = chrome.i18n.getMessage(elem.getAttribute('data-i18n-placeholder'));
        if (message) elem.setAttribute('placeholder', message);
    });
});

const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const resetButton = document.getElementById('reset');
const sessionTitleInput = document.getElementById('session-title');
const sessionDurationInput = document.getElementById('session-duration');
const timeDisplay = document.getElementById('time');

let timerInterval;

function updateDisplay(timeLeft) {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    timeDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startInterval() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        chrome.runtime.sendMessage({ action: 'status' }, (res) => {
            if (res && res.timeLeft !== undefined) {
                updateDisplay(res.timeLeft);
                if (!res.isRunning) {
                    clearInterval(timerInterval);
                }
            }
        });
    }, 1000);
}

startButton.addEventListener('click', () => {
    const duration = parseInt(sessionDurationInput.value);
    const title = sessionTitleInput.value || 'Sesión de Enfoque';
    if (isNaN(duration) || duration <= 0) {
        alert('Por favor, ingresa una duración válida en minutos.');
        return;
    }
    
    chrome.runtime.sendMessage({ action: 'start', duration, title }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("Error de comunicación:", chrome.runtime.lastError.message);
            return;
        }
        if (response && response.timeLeft !== undefined) {
            updateDisplay(response.timeLeft);
            if (response.isRunning) {
                startInterval();
            }
        }
    });
});

stopButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'stop' }, (response) => {
        if (response) updateDisplay(response.timeLeft);
        clearInterval(timerInterval);
    });
});

resetButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'reset' }, (response) => {
        if (response) updateDisplay(0);
        clearInterval(timerInterval);
    });
});
