chrome.alarms.create("breakReminder", {
    delayInMinutes: 5,
    periodInMinutes: 2
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