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

  // below code added

  let startTime = Date.now();
  let isRunning = true;

  // load saved time from storage
  chrome.storage.local.get(["startTime", "isRunning"], (result) => {
    if (result.startTime) {
      startTime = result.startTime;
    }
    if (result.isRunning !== undefined) {
      isRunning = result.isRunning;
    }
  });

  // updating timer every second
  setInterval(() => {
    if(isRunning) {
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
      chrome.storage.local.set({ elapsedTime });
    }
  }, 1000);

  // Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "resetTimer") {
    startTime = Date.now();
    isRunning = true;
    chrome.storage.local.set({ startTime, isRunning });
    sendResponse({ status: "Timer reset!" });
  } else if (message.action === "pauseTimer") {
    isRunning = false;
    chrome.storage.local.set({ isRunning });
    sendResponse({ status: "Timer paused!" });
  } else if (message.action === "resumeTimer") {
    isRunning = true;
    chrome.storage.local.set({ isRunning });
    sendResponse({ status: "Timer resumed!" });
  }
});