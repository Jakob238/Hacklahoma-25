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