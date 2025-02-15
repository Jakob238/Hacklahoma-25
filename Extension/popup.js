document.getElementById("reset").addEventListener("click", function() {
    const delay = parseFloat(document.getElementById("delay").value);
    const period = parseFloat(document.getElementById("period").value);

    chrome.alarms.create("breakReminder", {
        delayInMinutes: delay,
        periodInMinutes: period
    });
    alert("Break timer reset!");
});