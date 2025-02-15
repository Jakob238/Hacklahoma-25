document.getElementById("reset").addEventListener("click", function() {
    chrome.alarms.create("breakReminder", {
        delayInMinutes: 5,
        periodInMinutes: 2
    });
    alert("Break timer reset!");
});