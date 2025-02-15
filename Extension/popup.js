document.getElementById("reset").addEventListener("click", function() {
    const delay = parseFloat(document.getElementById("delay").value);
    const period = parseFloat(document.getElementById("period").value);
    const creationTime = Date.now();

    chrome.storage.local.set({
        breakReminder: {
            delay: delay,
            period: period,
            creationTime: creationTime
        }
    });

    chrome.alarms.create("breakReminder", {
        delayInMinutes: delay,
        periodInMinutes: period
    });
    alert("Break timer reset!");
    window.close(); // Close the popup window
});

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
}

function updateRemainingTime() {
    chrome.storage.local.get('breakReminder', function(data) {
        if (data.breakReminder) {
            const { delay, creationTime } = data.breakReminder;
            const elapsedTime = Date.now() - creationTime;
            const remainingTime = (delay * 60 * 1000) - elapsedTime;
            if (remainingTime > 0) {
                document.getElementById('timeLeft').textContent = `Time left: ${formatTime(remainingTime)}`;
            } else {
                document.getElementById('timeLeft').textContent = 'No active timer';
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    updateRemainingTime();
    setInterval(updateRemainingTime, 1000); // Update every 5 seconds
});