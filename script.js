// fetch data
async function fetchData(csvFilePath) {
    try {
        const response = await fetch(csvFilePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for ${csvFilePath}`);
        }
        const data = await response.text();
        console.log(`Successfully fetched ${csvFilePath}`);
        return data;
    } catch (error) {
        console.error(`Failed to fetch ${csvFilePath}: ${error}`);
        return null;
    }
}

// parse
function parseCSV(csvData) {
    if (!csvData) {
        console.error("Attempted to parse null or empty CSV data.");
        return [];
    }
    const lines = csvData.trim().split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) {
        console.warn("CSV data has less than 2 lines (header + data). File content:", csvData);
        return [];
    }

    const header = lines[0].split(',').map(column => column.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(value => value.trim());
        if (values.length === header.length) {
            const row = {};
            for (let j = 0; j < header.length; j++) {
                if (header[j]) {
                   row[header[j]] = values[j];
                } else {
                    console.warn(`Undefined header at index ${j} in row ${i + 1}`);
                }
            }
            data.push(row);
        } else {
            console.warn(`Skipping malformed row ${i + 1}: Number of values (${values.length}) does not match header length (${header.length}). Line: "${lines[i]}"`);
        }
    }
    return data;
}


// --- Chart Creation

// 1. Website Traffic Line Chart
async function createWebsiteTrafficChart() {
    const csvData = await fetchData('website_traffic.csv');
    if (!csvData || csvData.trim() === '') return;
    const parsedData = parseCSV(csvData);
    if (parsedData.length === 0) return;

    const labels = parsedData.map(row => row.Date);
    const visits = parsedData.map(row => parseFloat(row.DailyVisits)).filter(v => !isNaN(v));

    console.log("Website Traffic Labels:", labels.length);
    console.log("Website Traffic Visits:", visits.length);
    if (labels.length === 0 || visits.length === 0 || labels.length !== visits.length) return;

    const ctx = document.getElementById('websiteTrafficChart');
    if (!ctx) return;
    const chartContext = ctx.getContext('2d');

    new Chart(chartContext, {
        type: 'line',
        data: { labels: labels, datasets: [{ label: 'Daily Website Visits', data: visits, borderColor: 'rgb(75, 192, 192)', tension: 0.1 }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, title: { display: true, text: 'Number of Visits' } }, x: { title: { display: true, text: 'Date' } } } }
    });
    console.log("Website Traffic chart created.");
}

// 2. Build Recommendations Bar Chart
async function createBuildRecommendationsChart() {
    const csvData = await fetchData('build_recommendations.csv');
    if (!csvData || csvData.trim() === '') return;
    const parsedData = parseCSV(csvData);
    if (parsedData.length === 0) return;

    const useCaseCounts = {};
    parsedData.forEach(row => { const useCase = row['Primary Use Case']; if (useCase) useCaseCounts[useCase] = (useCaseCounts[useCase] || 0) + 1; });
    const labels = Object.keys(useCaseCounts);
    const counts = Object.values(useCaseCounts);

    console.log("Build Recommendations Labels:", labels);
    console.log("Build Recommendations Counts:", counts);
    if (labels.length === 0 || counts.length === 0) return;

    const ctx = document.getElementById('buildRecommendationsChart');
    if (!ctx) return;
    const chartContext = ctx.getContext('2d');

    new Chart(chartContext, {
        type: 'bar',
        data: { labels: labels, datasets: [{ label: 'Number of Build Requests', data: counts, backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(75, 192, 192, 0.6)'], borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)'], borderWidth: 1 }] },
        options: { responsive: true, maintainAspectRatio: false, indexAxis: 'x', scales: { y: { beginAtZero: true, title: { display: true, text: 'Number of Requests' } }, x: { title: { display: true, text: 'Primary Use Case' } } }, plugins: { legend: { display: false } } }
    });
    console.log("Build Recommendations chart created.");
}

// 3. Component CTR Pie Chart
async function createComponentCTRChart() {
    const csvData = await fetchData('component_click_through_rates.csv');
    if (!csvData || csvData.trim() === '') return;
    const parsedData = parseCSV(csvData);
    if (parsedData.length === 0) return;

    const componentCounts = {};
    parsedData.forEach(row => { const componentType = row['Component Type']; if (componentType) componentCounts[componentType] = (componentCounts[componentType] || 0) + 1; });
    const labels = Object.keys(componentCounts);
    const counts = Object.values(componentCounts);

    console.log("Component CTR Labels:", labels);
    console.log("Component CTR Counts:", counts);
    if (labels.length === 0 || counts.length === 0) return;

    const ctx = document.getElementById('componentCTRChart');
    if (!ctx) return;
    const chartContext = ctx.getContext('2d');

    new Chart(chartContext, {
        type: 'pie',
        data: { labels: labels, datasets: [{ label: 'Component Entry Count', data: counts, backgroundColor: ['rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)', 'rgba(75, 192, 192, 0.7)'], borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)'], borderWidth: 1 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' }, tooltip: { callbacks: { label: function(context) { let label = context.label || ''; if (label) label += ': '; if (context.parsed !== null) label += context.parsed; return label; } } } } }
    });
    console.log("Component CTR chart created.");
}

// 4. Budget vs. Satisfaction Scatter Plot
async function createSatisfactionScatterChart() {
    const csvData = await fetchData('user_satisfaction.csv');
    if (!csvData || csvData.trim() === '') return;
    const parsedData = parseCSV(csvData);
    if (parsedData.length === 0) return;

    const scatterData = parsedData.map(row => { const budget = parseFloat(row.BudgetSpecified); const score = parseFloat(row.SatisfactionScore); if (!isNaN(budget) && !isNaN(score)) { return { x: budget, y: score }; } return null; }).filter(point => point !== null);

    console.log("Scatter Plot Data Points:", scatterData.length);
    if (scatterData.length === 0) return;

    const ctx = document.getElementById('satisfactionScatterChart');
    if (!ctx) return;
    const chartContext = ctx.getContext('2d');

    new Chart(chartContext, {
        type: 'scatter',
        data: { datasets: [{ label: 'Budget vs. Satisfaction', data: scatterData, backgroundColor: 'rgba(153, 102, 255, 0.6)', borderColor: 'rgba(153, 102, 255, 1)', pointRadius: 5, pointHoverRadius: 7 }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: false, min: 1, max: 5, title: { display: true, text: 'Satisfaction Score (1-5)' } }, x: { beginAtZero: true, type: 'linear', position: 'bottom', title: { display: true, text: 'Budget Specified ($)' } } }, plugins: { tooltip: { callbacks: { label: function(context) { let label = context.dataset.label || ''; if (label) label += ': '; if (context.parsed.x !== null && context.parsed.y !== null) { label += `($${context.parsed.x}, Score: ${context.parsed.y})`; } return label; } } } } }
    });
    console.log("Satisfaction Scatter chart created.");
}

// 5. Marketing Campaign Performance
async function createMarketingRadarChart() {
    const csvData = await fetchData('marketing_campaigns.csv');
    if (!csvData || csvData.trim() === '') {
         console.error("No valid data fetched or data is empty for Marketing Radar chart.");
         return;
    }
    const parsedData = parseCSV(csvData);
    if (parsedData.length === 0) {
         console.error("No data parsed for Marketing Radar chart.");
         return;
    }

    console.log("Parsed Data for Marketing Radar:", parsedData);

    // --- Data Processing for Radar Chart ---
    const labels = parsedData.map(row => row.CampaignName); 
    const costData = parsedData.map(row => parseFloat(row.Cost)).filter(v => !isNaN(v));
    const clicksData = parsedData.map(row => parseFloat(row.Clicks)).filter(v => !isNaN(v));
    const conversionsData = parsedData.map(row => parseFloat(row.Conversions)).filter(v => !isNaN(v));

    console.log("Marketing Labels:", labels);
    console.log("Marketing Costs:", costData);
    console.log("Marketing Clicks:", clicksData);
    console.log("Marketing Conversions:", conversionsData);


    if (labels.length === 0 || costData.length !== labels.length || clicksData.length !== labels.length || conversionsData.length !== labels.length) {
         console.error("Data extraction failed or mismatch for Marketing Radar chart.");
        return;
    }
    // --- End ---

    // Configuration for Radar Chart ---
    const ctx = document.getElementById('marketingRadarChart');
     if (!ctx) {
        console.error("Canvas element 'marketingRadarChart' not found.");
        return;
    }
    const chartContext = ctx.getContext('2d');

    new Chart(chartContext, {
        type: 'radar', 
        data: {
            labels: labels, 
            datasets: [
                {
                    label: 'Cost ($)',
                    data: costData,
                    fill: true,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)', // Red
                    borderColor: 'rgb(255, 99, 132)',
                    pointBackgroundColor: 'rgb(255, 99, 132)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(255, 99, 132)'
                },
                 {
                    label: 'Clicks',
                    data: clicksData,
                    fill: true,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)', // Blue
                    borderColor: 'rgb(54, 162, 235)',
                    pointBackgroundColor: 'rgb(54, 162, 235)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(54, 162, 235)'
                },
                {
                    label: 'Conversions',
                    data: conversionsData,
                    fill: true,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)', // Green
                    borderColor: 'rgb(75, 192, 192)',
                    pointBackgroundColor: 'rgb(75, 192, 192)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(75, 192, 192)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            elements: {
              line: {
                borderWidth: 3 
              }
            },
             scales: { 
                r: {

                }
            },
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        
        }
    });
    console.log("Marketing Radar chart created.");
}


// --- Initialisation ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed. Initializing charts...");
    createWebsiteTrafficChart();
    createBuildRecommendationsChart();
    createComponentCTRChart();
    createSatisfactionScatterChart();
    createMarketingRadarChart();
});