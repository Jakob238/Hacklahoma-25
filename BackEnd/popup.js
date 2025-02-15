document.getElementById("reset").addEventListener("click", function() {
    chrome.alarms.create("breakReminder", {
        delayInMinutes: 30,
        periodInMinutes: 30
    });
    alert("Break timer reset!");
});