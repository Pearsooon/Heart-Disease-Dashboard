// Select the SVG element
const svg3 = d3.select("#grouped-bar-chart-smoking-heart-status"),
    width3 = +svg3.attr("width"),
    height3 = +svg3.attr("height"),
    margin3 = { top: 40, right: 120, bottom: 50, left: 100 },
    chartWidth3 = width3 - margin3.left - margin3.right,
    chartHeight3 = height3 - margin3.top - margin3.bottom;

// Create the main group element
const chart3 = svg3.append("g")
    .attr("transform", `translate(${margin3.left},${margin3.top})`);

d3.csv("../data/project_heart_disease.csv").then(function (data) {
    data.forEach(d => {
        d.Smoking = d.Smoking.trim();
        d["Heart Disease Status"] = d["Heart Disease Status"].trim();
    });

    // Group data
    const grouped = d3.rollup(
        data,
        v => v.length,
        d => d.Smoking,
        d => d["Heart Disease Status"]
    );

    const keys = ["Yes", "No"]; // Heart Disease Status
    const chartData = Array.from(grouped, ([smoking, values]) => {
        const row = { Smoking: smoking };
        keys.forEach(k => {
            row[k] = values.get(k) || 0;
        });
        return row;
    });

    // Scales
    const y0 = d3.scaleBand()
        .domain(chartData.map(d => d.Smoking))
        .range([0, chartHeight3])
        .padding(0.2);

    const y1 = d3.scaleBand()
        .domain(keys)
        .range([0, y0.bandwidth()])
        .padding(0.05);

    const x = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d3.max(keys, key => d[key]))])
        .nice()
        .range([0, chartWidth3]);

    const color = d3.scaleOrdinal()
        .domain(keys)
        .range(["#4daf4a", "#e41a1c"]);

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

    // Draw the bars
    chart3.selectAll(".bar-group")
        .data(chartData)
        .join("g")
        .attr("class", "bar-group")
        .attr("transform", d => `translate(0,${y0(d.Smoking)})`)
        .selectAll("rect")
        .data(d => keys.map(key => ({ key, value: d[key], smoking: d.Smoking })))
        .join("rect")
        .attr("y", d => y1(d.key))
        .attr("x", 0)
        .attr("height", y1.bandwidth())
        .attr("width", 0)
        .attr("fill", d => color(d.key))
        .on("mouseover", (event, d) => {
            tooltip.style("display", "block")
                .html(`
                    <strong>Smoking Status:</strong> ${d.smoking}<br>
                    <strong>Heart Disease ${d.key}:</strong> ${d.value}
                `);
        })
        .on("mousemove", event => {
            tooltip.style("left", (event.pageX + 15) + "px")
                   .style("top", (event.pageY - 40) + "px");
        })
        .on("mouseout", () => tooltip.style("display", "none"))
        .transition()
        .duration(1000)
        .attr("width", d => x(d.value));

    // Add X and Y axes
    chart3.append("g")
        .attr("transform", `translate(0,${chartHeight3})`)
        .call(d3.axisBottom(x));

    chart3.append("g")
        .call(d3.axisLeft(y0));

    // Add axis labels
    chart3.append("text")
        .attr("x", chartWidth3 / 2)
        .attr("y", chartHeight3 + 40)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#000")
        .text("Records");

    chart3.append("text")
        .attr("x", -chartHeight3 / 2)
        .attr("y", -80)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .style("font-size", "14px")
        .style("fill", "#000")
        .text("Smoking Status");

    // Add legend
    const legend = svg3.append("g")
        .attr("transform", `translate(${chartWidth3 + margin3.left - 200}, ${margin3.top})`);

    keys.forEach((key, i) => {
        const g = legend.append("g").attr("transform", `translate(0, ${i * 25})`);

        g.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", color(key));

        g.append("text")
            .attr("x", 25)
            .attr("y", 14)
            .text(`Heart Disease Status: ${key}`)
            .style("fill", "#000")
            .style("font-size", "14px");
    });
});
