// Select the SVG element
const svg5 = d3.select("#boxplot-Cholesterol-Level-heart-status");
const margin = { top: 40, right: 30, bottom: 50, left: 60 };
const gap = 80;  // Khoảng cách giữa hai histogram
const width = ((+svg5.attr("width") - margin.left - margin.right) - gap) / 2;
const height = +svg5.attr("height") - margin.top - margin.bottom;

// Create groups for two separate histograms
const gYes = svg5.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
const gNo = svg5.append("g").attr("transform", `translate(${margin.left + width + gap},${margin.top})`);

// Create tooltip
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "rgba(0, 0, 0, 0.8)")
    .style("color", "#fff")
    .style("padding", "8px")
    .style("border-radius", "5px")
    .style("font-size", "12px")
    .style("display", "none")
    .style("pointer-events", "none");

// Load the data
d3.csv("../data/project_heart_disease.csv").then(data => {
    // Filter and group data by Heart Disease Status
    const dataYes = data.filter(d => d["Heart Disease Status"] === "Yes")
                        .map(d => +d["Cholesterol Level"]);
    const dataNo = data.filter(d => d["Heart Disease Status"] === "No")
                       .map(d => +d["Cholesterol Level"]);

    // Create histogram generator
    const histogram = d3.histogram()
        .domain([d3.min(data, d => +d["Cholesterol Level"]), d3.max(data, d => +d["Cholesterol Level"])])
        .thresholds(30); // 30 bins

    // Generate the bins
    const binsYes = histogram(dataYes);
    const binsNo = histogram(dataNo);

    // Set up scales (shared)
    const x = d3.scaleLinear()
        .domain([d3.min(data, d => +d["Cholesterol Level"]), d3.max(data, d => +d["Cholesterol Level"])])
        .range([0, width]);

    const yYes = d3.scaleLinear()
        .domain([0, d3.max(binsYes, d => d.length)])
        .nice()
        .range([height, 0]);

    const yNo = d3.scaleLinear()
        .domain([0, d3.max(binsNo, d => d.length)])
        .nice()
        .range([height, 0]);

    // Set colors
    const colorYes = "#e41a1c";  // Red for "Yes"
    const colorNo = "#4daf4a";  // Green for "No"

    // Draw the histogram for "Yes"
    gYes.selectAll(".bar-yes")
        .data(binsYes)
        .join("rect")
        .attr("class", "bar-yes")
        .attr("x", d => x(d.x0))
        .attr("y", d => yYes(d.length))
        .attr("width", d => x(d.x1) - x(d.x0) - 2)
        .attr("height", d => height - yYes(d.length))
        .attr("fill", colorYes)
        .attr("opacity", 0.9)
        .on("mouseover", (event, d) => {
            tooltip.style("display", "block")
                .html(`
                    <strong>Cholesterol Range:</strong> ${d.x0} - ${d.x1}<br>
                    <strong>Frequency:</strong> ${d.length}
                `);
        })
        .on("mousemove", event => {
            tooltip.style("left", (event.pageX + 15) + "px")
                   .style("top", (event.pageY - 40) + "px");
        })
        .on("mouseout", () => tooltip.style("display", "none"));

    // Draw the histogram for "No"
    gNo.selectAll(".bar-no")
        .data(binsNo)
        .join("rect")
        .attr("class", "bar-no")
        .attr("x", d => x(d.x0))
        .attr("y", d => yNo(d.length))
        .attr("width", d => x(d.x1) - x(d.x0) - 2)
        .attr("height", d => height - yNo(d.length))
        .attr("fill", colorNo)
        .attr("opacity", 0.9)
        .on("mouseover", (event, d) => {
            tooltip.style("display", "block")
                .html(`
                    <strong>Cholesterol Range:</strong> ${d.x0} - ${d.x1}<br>
                    <strong>Frequency:</strong> ${d.length}
                `);
        })
        .on("mousemove", event => {
            tooltip.style("left", (event.pageX + 15) + "px")
                   .style("top", (event.pageY - 40) + "px");
        })
        .on("mouseout", () => tooltip.style("display", "none"));

    // Add X and Y axes for "Yes"
    gYes.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    gYes.append("g")
        .call(d3.axisLeft(yYes));

    gYes.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Cholesterol Level (Heart Disease Status: Yes)");

    gYes.append("text")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .style("font-size", "14px")
        .text("Frequency");

    // Add X and Y axes for "No"
    gNo.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    gNo.append("g")
        .call(d3.axisLeft(yNo));

    gNo.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Cholesterol Level (Heart Disease Status: No)");

    gNo.append("text")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .style("font-size", "14px")
        .text("Frequency");

    // Add legend
    const legend = svg5.append("g")
        .attr("transform", `translate(${width + 350}, ${margin.top - 40})`);

    const legendData = [
        { label: "Heart Disease Status: Yes", color: colorYes },
        { label: "Heart Disease Status: No", color: colorNo }
    ];

    legendData.forEach((d, i) => {
        const legendRow = legend.append("g")
            .attr("transform", `translate(0, ${i * 25})`);

        legendRow.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", d.color);

        legendRow.append("text")
            .attr("x", 25)
            .attr("y", 14)
            .text(d.label)
            .style("fill", "#000")
            .style("font-size", "14px");
    });
});
