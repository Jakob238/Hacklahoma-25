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
    setInterval(updateRemainingTime, 5000); // Update every 5 seconds
});

// Display elapsed time
function updateElapsedTime() {
    chrome.storage.local.get(["elapsedTime"], (result) => {
        const elapsedTime = result.elapsedTime || 0;
        document.getElementById("elapsedTime").textContent = elapsedTime;
    });
}

// Update the timer every second
setInterval(updateElapsedTime, 1000);

// Reset the timer
document.getElementById("resetButton").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "resetTimer" }, (response) => {
        console.log(response.status);
    });
});

// Pause the timer
document.getElementById("pauseButton").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "pauseTimer" }, (response) => {
        console.log(response.status);
    });
});

// Resume the timer
document.getElementById("resumeButton").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "resumeTimer" }, (response) => {
        console.log(response.status);
    });
});

// Switch between views
document.getElementById("showBreakTimer").addEventListener("click", () => {
    document.getElementById("breakTimer").classList.remove("hidden");
    document.getElementById("activityTracker").classList.add("hidden");
});

document.getElementById("showActivityTracker").addEventListener("click", () => {
    document.getElementById("breakTimer").classList.add("hidden");
    document.getElementById("activityTracker").classList.remove("hidden");
});