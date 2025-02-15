// Alarm
chrome.alarms.create("breakReminder", {
    delayInMinutes: 30,
    periodInMinutes: 5
  });
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "breakReminder") {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "images/icon128.png",
        title: "Time for a Break!",
        message: "Take a short break to rest your eyes and stretch!"
      });
    }
  });


// Stopwatch - Display elapsed time
let startTime = Date.now();
let elapsedTimeAtPause = 0; // Track the elapsed time at the point of pause
let isRunning = true;

// Loads saved time from storage
chrome.storage.local.get(["startTime", "isRunning", "elapsedTimeAtPause"], (result) => {
  if (result.startTime) {
    startTime = result.startTime;
  }
  if (result.isRunning !== undefined) {
    isRunning = result.isRunning;
  }
  if (result.elapsedTimeAtPause !== undefined) {
    elapsedTimeAtPause = result.elapsedTimeAtPause;
  }
});

// This updates timer every second
setInterval(() => {
  if (isRunning) {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000) + elapsedTimeAtPause;
    chrome.storage.local.set({ elapsedTime });
  }
}, 1000);

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "resetTimer") {
    startTime = Date.now();
    elapsedTimeAtPause = 0;
    isRunning = true;
    chrome.storage.local.set({ startTime, isRunning, elapsedTimeAtPause });
    sendResponse({ status: "Timer reset!" });
  } else if (message.action === "pauseTimer") {
    elapsedTimeAtPause += Math.floor((Date.now() - startTime) / 1000); // Save elapsed time
    isRunning = false;
    chrome.storage.local.set({ isRunning, elapsedTimeAtPause });
    sendResponse({ status: "Timer paused!" });
  } else if (message.action === "resumeTimer") {
    startTime = Date.now(); // Reset start time when resuming
    isRunning = true;
    chrome.storage.local.set({ isRunning, startTime, elapsedTimeAtPause });
    sendResponse({ status: "Timer resumed!" });
  }
});