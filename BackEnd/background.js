chrome.alarms.create("breakReminder", {
    delayInMinutes: 30,
    periodInMinutes: 30
  });
  
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "breakReminder") {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: "Time for a Break!",
        message: "Take a short break to rest your eyes and stretch!"
      });
    }
  });