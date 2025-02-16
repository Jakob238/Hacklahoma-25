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
// Formats time for break reminder(from miliseconds to hours, minutes, and seconds)
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
    setInterval(updateRemainingTime, 1000); // Update every second
});


// Stopwatch  - Display elapsed time
function updateElapsedTime() {
    chrome.storage.local.get(["elapsedTime", "previousSessions"], (result) => {
        const elapsedTime = result.elapsedTime || 0;
        document.getElementById("elapsedTime").textContent = formatTimeFromSeconds(elapsedTime);

        const previousSessions = result.previousSessions || [];
        if (previousSessions.length > 0) {
            const lastSession = previousSessions[previousSessions.length - 1];
            const feedback = elapsedTime > lastSession 
                ? "You have spent more time this session." 
                : "You have spent less time this session.";
            document.getElementById("feedback").textContent = feedback;
        }

        // Update the table
        updateTable(elapsedTime, previousSessions);
    });
}

//Formats time from seconds to hours, minutes, and seconds
function formatTimeFromSeconds(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
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

// Switch between views
document.getElementById("showActivityTracker").addEventListener("click", () => {
    document.getElementById("breakTimer").classList.add("hidden");
    document.getElementById("activityTracker").classList.remove("hidden");
});

// Initialize the chart
let sessionChart;
function initializeChart() {
    const ctx = document.getElementById('sessionChart').getContext('2d');
    sessionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Session Time (seconds)',
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Update the chart with new data
function updateChart(currentSession, previousSessions) {
    const labels = previousSessions.map((_, index) => `Session ${index + 1}`);
    labels.push('Current Session');
    const data = [...previousSessions, currentSession];

    sessionChart.data.labels = labels;
    sessionChart.data.datasets[0].data = data;
    sessionChart.update();
}

// Update the table with new data
function updateTable(currentSession, previousSessions) {
    const tbody = document.getElementById('sessionTable').getElementsByTagName('tbody')[0];
    tbody.innerHTML = ''; // Clear existing rows

    previousSessions.forEach((session, index) => {
        const row = tbody.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        cell1.textContent = `Session ${index + 1}`;
        cell2.textContent = formatTimeFromSeconds(session);
    });

    const currentRow = tbody.insertRow();
    const currentCell1 = currentRow.insertCell(0);
    const currentCell2 = currentRow.insertCell(1);
    currentCell1.textContent = 'Current Session';
    currentCell2.textContent = formatTimeFromSeconds(currentSession);
}