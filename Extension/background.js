// Alarm test
chrome.alarms.create("breakReminder", { // Creates an alarm named "breakReminder"
    delayInMinutes: 30,
    periodInMinutes: 5
});
chrome.alarms.onAlarm.addListener((alarm) => { // Listens for the alarm to go off
    if (alarm.name === "breakReminder") { // When alarm goes off, it creates a notification
        chrome.notifications.create({
            type: "basic",
            iconUrl: "images/icon128.png",
            title: "Time for a Break!",
            message: "Take a short break to rest your eyes and stretch!"
        });
    }
});

// Stopwatch - Display elapsed time
let startTime = Date.now(); // Tracks the start time of the timer
let elapsedTimeAtPause = 0; // Tracks the elapsed time at the point of pause
let isRunning = true; // Tracks if the timer is running

// Loads saved time from storage
chrome.storage.local.get(["startTime", "isRunning", "elapsedTimeAtPause", "elapsedTime", "previousSessions"], (result) => {
    if (result.startTime) { // If there is a saved start time, use it
        startTime = result.startTime;
    }
    if (result.isRunning !== undefined) { // If there is a saved isRunning value, use it
        isRunning = result.isRunning;
    }
    if (result.elapsedTimeAtPause !== undefined) { // If there is a saved elapsed time at pause, use it
        elapsedTimeAtPause = result.elapsedTimeAtPause;
    }
    if (result.elapsedTime !== undefined && result.elapsedTime > 0) {
        let previousSessions = result.previousSessions || [];
        previousSessions.push(result.elapsedTime);
        if (previousSessions.length > 5) {
            previousSessions = previousSessions.slice(-5); // Keep only the last 5 sessions
        }
        chrome.storage.local.set({ previousSessions, elapsedTime: 0 });
    }
    startTime = Date.now();
    elapsedTimeAtPause = 0;
    isRunning = true;
    chrome.storage.local.set({ startTime, isRunning, elapsedTimeAtPause });
});

// This updates timer every second
setInterval(() => {
    if (isRunning) {
        // Calculate elapsed time in seconds by finding the difference between the current time and the start time by 1000
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000) + elapsedTimeAtPause;
        chrome.storage.local.set({ elapsedTime });
    }
}, 1000);

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "resetTimer") { // Resets the timer by setting elapsed time to 0
        chrome.storage.local.get(["elapsedTime", "previousSessions"], (result) => {
            const elapsedTime = result.elapsedTime || 0;
            let previousSessions = result.previousSessions || [];
            previousSessions.push(elapsedTime);
            if (previousSessions.length > 5) {
                previousSessions = previousSessions.slice(-5); // Keep only the last 5 sessions
            }

            startTime = Date.now();
            elapsedTimeAtPause = 0;
            isRunning = true;
            chrome.storage.local.set({ startTime, isRunning, elapsedTimeAtPause, previousSessions, elapsedTime: 0 }, () => {
                sendResponse({ status: "Timer reset!" });
            });
        });
    } else if (message.action === "pauseTimer") { // Pauses the timer by setting isRunning to false
        elapsedTimeAtPause += Math.floor((Date.now() - startTime) / 1000); // Saves elapsed time at pause by dividing the difference between the current time and the start time by 1000
        isRunning = false;
        chrome.storage.local.set({ isRunning, elapsedTimeAtPause });
        sendResponse({ status: "Timer paused!" });
    } else if (message.action === "resumeTimer") { // Resumes the timer by setting isRunning to true
        startTime = Date.now();
        isRunning = true;
        chrome.storage.local.set({ isRunning, startTime, elapsedTimeAtPause }); // Saves the start time and isRunning value
        sendResponse({ status: "Timer resumed!" });
    }
});

// Reset the timer when Chrome is closed or the extension is disabled
chrome.runtime.onSuspend.addListener(() => {
    chrome.storage.local.get(["elapsedTime", "previousSessions"], (result) => {
        const elapsedTime = result.elapsedTime || 0;
        let previousSessions = result.previousSessions || [];
        previousSessions.push(elapsedTime);
        if (previousSessions.length > 5) {
            previousSessions = previousSessions.slice(-5); // Keep only the last 5 sessions
        }

        startTime = Date.now();
        elapsedTimeAtPause = 0;
        isRunning = true;
        chrome.storage.local.set({ startTime, isRunning, elapsedTimeAtPause, previousSessions, elapsedTime: 0 });
    });
});

// Handle the case where the suspension is canceled
chrome.runtime.onSuspendCanceled.addListener(() => {
    chrome.storage.local.get(["startTime", "isRunning", "elapsedTimeAtPause"], (result) => {
        if (result.startTime) { // If there is a saved start time, use it
            startTime = result.startTime;
        }
        if (result.isRunning !== undefined) { // If there is a saved isRunning value, use it
            isRunning = result.isRunning;
        }
        if (result.elapsedTimeAtPause !== undefined) { // If there is a saved elapsed time at pause, use it
            elapsedTimeAtPause = result.elapsedTimeAtPause;
        }
    });
});