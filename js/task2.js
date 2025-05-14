// Select the SVG element
const svg2 = d3.select("#bar-chart-gender-heart-status"),
    width = +svg2.attr("width"),
    height = +svg2.attr("height"),
    radius = Math.min(width / 2, height) / 2 - 50,
    colors = d3.scaleOrdinal(["#4daf4a", "#e41a1c"]);

// Create two main group elements for the pie charts
const chartYes = svg2.append("g")
    .attr("transform", `translate(${width / 4}, ${height / 2})`);

const chartNo = svg2.append("g")
    .attr("transform", `translate(${(width / 4) * 3}, ${height / 2})`);

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
    // Group data by Gender and Heart Disease Status
    const genderCountYes = d3.rollup(
        data.filter(d => d["Heart Disease Status"] === "Yes"),
        v => v.length,
        d => d.Gender
    );

    const genderCountNo = d3.rollup(
        data.filter(d => d["Heart Disease Status"] === "No"),
        v => v.length,
        d => d.Gender
    );

    const totalYes = d3.sum(genderCountYes.values());
    const totalNo = d3.sum(genderCountNo.values());

    // Prepare the data for pie charts
    const pieDataYes = Array.from(genderCountYes, ([gender, count]) => ({
        gender,
        count,
        percentage: ((count / totalYes) * 100).toFixed(2)
    }));

    const pieDataNo = Array.from(genderCountNo, ([gender, count]) => ({
        gender,
        count,
        percentage: ((count / totalNo) * 100).toFixed(2)
    }));

    // Create the pie generator
    const pie = d3.pie()
        .value(d => d.count)
        .sort(null);

    // Create the arc generator
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    // Draw the Yes pie chart
    const arcsYes = chartYes.selectAll(".arc")
        .data(pie(pieDataYes))
        .join("g")
        .attr("class", "arc");

    arcsYes.append("path")
        .attr("d", arc)
        .attr("fill", d => colors(d.data.gender))
        .on("mouseover", (event, d) => {
            tooltip.style("display", "block")
                .html(`
                    <strong>Heart Disease Status: Yes</strong><br>
                    <strong>Gender:</strong> ${d.data.gender}<br>
                    <strong>Count:</strong> ${d.data.count}<br>
                    <strong>Percentage:</strong> ${d.data.percentage}%
                `);
        })
        .on("mousemove", event => {
            tooltip.style("left", (event.pageX + 15) + "px")
                   .style("top", (event.pageY - 40) + "px");
        })
        .on("mouseout", () => tooltip.style("display", "none"))
        .transition()
        .duration(1000)
        .attrTween("d", function(d) {
            const i = d3.interpolate(d.startAngle, d.endAngle);
            return function(t) {
                d.endAngle = i(t);
                return arc(d);
            };
        });

    // Add labels for Yes pie chart
    chartYes.append("text")
        .attr("text-anchor", "middle")
        .attr("y", -radius - 20)
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Heart Disease Status: Yes");

    // Draw the No pie chart
    const arcsNo = chartNo.selectAll(".arc")
        .data(pie(pieDataNo))
        .join("g")
        .attr("class", "arc");

    arcsNo.append("path")
        .attr("d", arc)
        .attr("fill", d => colors(d.data.gender))
        .on("mouseover", (event, d) => {
            tooltip.style("display", "block")
                .html(`
                    <strong>Heart Disease Status: No</strong><br>
                    <strong>Gender:</strong> ${d.data.gender}<br>
                    <strong>Count:</strong> ${d.data.count}<br>
                    <strong>Percentage:</strong> ${d.data.percentage}%
                `);
        })
        .on("mousemove", event => {
            tooltip.style("left", (event.pageX + 15) + "px")
                   .style("top", (event.pageY - 40) + "px");
        })
        .on("mouseout", () => tooltip.style("display", "none"))
        .transition()
        .duration(1000)
        .attrTween("d", function(d) {
            const i = d3.interpolate(d.startAngle, d.endAngle);
            return function(t) {
                d.endAngle = i(t);
                return arc(d);
            };
        });

    // Add labels for No pie chart
    chartNo.append("text")
        .attr("text-anchor", "middle")
        .attr("y", -radius - 20)
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Heart Disease Status: No");

    // Add legends
    const legend = svg2.append("g")
        .attr("transform", `translate(${width / 2 - 80}, 20)`);

    ["Male", "Female"].forEach((gender, i) => {
        const legendRow = legend.append("g")
            .attr("transform", `translate(0, ${i * 25})`);

        legendRow.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", colors(gender));

        legendRow.append("text")
            .attr("x", 25)
            .attr("y", 14)
            .text(gender)
            .style("fill", "#000")
            .style("font-size", "14px");
    });
});
