
// =====================================
// FOREX TRADING JOURNAL
// Main Application Logic
// =====================================

// Get the trade form
const tradeForm = document.getElementById("tradeForm");

// Load saved trades from browser storage
let trades = JSON.parse(localStorage.getItem("forexTrades")) || [];

// Set today's date automatically
document.getElementById("tradeDate").value =
    new Date().toISOString().split("T")[0];


// =====================================
// SAVE A NEW TRADE
// =====================================

tradeForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const trade = {
        id: Date.now(),
        pair: document.getElementById("pair").value.trim().toUpperCase(),
        direction: document.getElementById("direction").value,
        entry: Number(document.getElementById("entry").value),
        exit: Number(document.getElementById("exit").value),
        profit: Number(document.getElementById("profit").value),
        result: document.getElementById("result").value,
        date: document.getElementById("tradeDate").value,
        timeframe: document.getElementById("timeframe").value,
        notes: document.getElementById("notes").value,
        marketStructure: document.getElementById("marketStructure").value,
        liquidity: document.getElementById("liquidity").value,
        entryModel: document.getElementById("entryModel").value
    };

    // Validate numerical values
    if (
        !trade.pair ||
        !Number.isFinite(trade.entry) ||
        !Number.isFinite(trade.exit) ||
        !Number.isFinite(trade.profit) ||
        !trade.date
    ) {
        alert("Please enter valid trade information.");
        return;
    }

    // Add trade to the journal
    trades.push(trade);

    // Save trades in browser storage
    localStorage.setItem("forexTrades", JSON.stringify(trades));

    // Update dashboard
    updateDashboard();

    // Clear form
    tradeForm.reset();

    // Restore today's date
    document.getElementById("tradeDate").value =
        new Date().toISOString().split("T")[0];

    alert("Trade saved successfully!");
});


// =====================================
// UPDATE DASHBOARD STATISTICS
// =====================================

function updateDashboard() {

    const total = trades.length;

    const wins = trades.filter(
        trade => trade.result === "Win"
    ).length;

    const losses = trades.filter(
        trade => trade.result === "Loss"
    ).length;

    const netProfit = trades.reduce(
        (sum, trade) => sum + trade.profit,
        0
    );

    const winRate = total > 0
        ? (wins / total) * 100
        : 0;

    document.getElementById("totalTrades").textContent = total;

    document.getElementById("winningTrades").textContent = wins;

    document.getElementById("winRate").textContent =
        winRate.toFixed(1) + "%";

    const profitElement = document.getElementById("netProfit");

    profitElement.textContent =
        "$" + netProfit.toFixed(2);

    profitElement.style.color =
        netProfit >= 0 ? "#22c55e" : "#ef4444";

    updateAnalytics(wins, losses, netProfit, winRate);

    updateCalendar();
}


// =====================================
// PERFORMANCE ANALYTICS
// =====================================

function updateAnalytics(wins, losses, netProfit, winRate) {

    const container =
        document.getElementById("analyticsContent");

    container.replaceChildren();

    const summary = document.createElement("div");

    summary.innerHTML = `
        <p>Winning trades: ${wins}</p>
        <p>Losing trades: ${losses}</p>
        <p>Win rate: ${winRate.toFixed(1)}%</p>
        <p>Net profit/loss: $${netProfit.toFixed(2)}</p>
    `;

    container.appendChild(summary);

    const heading = document.createElement("h3");
    heading.textContent = "Trade History";
    heading.style.marginTop = "25px";

    container.appendChild(heading);

    if (trades.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "No trades recorded yet.";
        container.appendChild(empty);
        return;
    }

    const table = document.createElement("table");

    table.style.width = "100%";
    table.style.marginTop = "15px";
    table.style.borderCollapse = "collapse";

    const headers = [
        "Date",
        "Pair",
        "Direction",
        "Result",
        "P/L",
        "Entry Model"
    ];

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    headers.forEach(function(header) {
        const th = document.createElement("th");
        th.textContent = header;
        th.style.padding = "10px";
        th.style.textAlign = "left";
        th.style.borderBottom = "1px solid #263650";
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    trades.slice().reverse().forEach(function(trade) {

        const row = document.createElement("tr");

        const values = [
            trade.date,
            trade.pair,
            trade.direction,
            trade.result,
            "$" + trade.profit.toFixed(2),
            trade.entryModel
        ];

        values.forEach(function(value) {
            const cell = document.createElement("td");

            cell.textContent = value;
            cell.style.padding = "10px";
            cell.style.borderBottom = "1px solid #263650";

            row.appendChild(cell);
        });

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);
}


// =====================================
// TRADING CALENDAR
// =====================================

function updateCalendar() {

    const container =
        document.getElementById("calendarContent");

    container.replaceChildren();

    if (trades.length === 0) {
        const message = document.createElement("p");
        message.textContent = "Your trading calendar is empty.";
        container.appendChild(message);
        return;
    }

    const grouped = {};

    trades.forEach(function(trade) {

        if (!grouped[trade.date]) {
            grouped[trade.date] = {
                count: 0,
                profit: 0
            };
        }

        grouped[trade.date].count++;
        grouped[trade.date].profit += trade.profit;
    });

    Object.keys(grouped).sort().reverse().forEach(function(date) {

        const day = document.createElement("div");

        day.style.padding = "12px";
        day.style.marginBottom = "10px";
        day.style.background = "#0b1120";
        day.style.borderRadius = "8px";

        const details = grouped[date];

        day.textContent =
            date + " | " +
            details.count + " trades | $" +
            details.profit.toFixed(2);

        container.appendChild(day);
    });
}


// =====================================
// LOAD SAVED TRADES WHEN PAGE OPENS
// =====================================

updateDashboard();
