let svgWidth = 1000;
let svgHeight = 500;

let mar = {
    top: 15,
    bottom: 100,
    right: 80,
    left: 100
};

let wdt = svgWidth - mar.left - mar.right;
let hgt = svgHeight - mar.top - mar.bottom;
let svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);
let chart = svg.append("g")
    .attr("transform", `translate(${mar.left}, ${mar.top})`);
let defaultXAxis = "poverty";
let defaultYAxis = "obesity";

function x(HealthData, defaultXAxis) {
    let xScaleLinear = d3.scaleLinear()
        .domain([d3.min(HealthData, d => d[defaultXAxis]) * 0.9,
        d3.max(HealthData, d => d[defaultXAxis]) * 1.1
        ])
        .range([0, wdt]);
    return xScaleLinear;

}

//---------------------------------------------------------------------------------------------

function y(HealthData, defaultYAxis) {
    let yScaleLinear = d3.scaleLinear()
        .domain([d3.min(HealthData, d => d[defaultYAxis]) * 0.9,
        d3.max(HealthData, d => d[defaultYAxis]) * 1.1
        ])
        .range([hgt, 0]);
    return yScaleLinear;
}

//---------------------------------------------------------------------------------------------

function rXAxis(xNew, xAxis) {
    let newBottomAxis = d3.axisBottom(xNew);
    xAxis.transition()
        .duration(1500)
        .ease(d3.easeElastic)
        .call(newBottomAxis);
    return xAxis;
}

//---------------------------------------------------------------------------------------------

function rYAxis(yNew, yAxis) {
    let newLeftAxis = d3.axisLeft(yNew);
    yAxis.transition()
        .duration(1500)
        .ease(d3.easeElastic)
        .call(newLeftAxis);
    return yAxis;
}

//---------------------------------------------------------------------------------------------

function rXCircle(circlesData, xNew, defaultXAxis) {
    circlesData.transition()
        .duration(1500)
        .attr("cx", d => xNew(+d[defaultXAxis]));
    return circlesData;
}

//---------------------------------------------------------------------------------------------

function rYCircle(circlesData, yNew, defaultYAxis) {
    circlesData.transition()
        .duration(1500)
        .attr("cy", d => yNew(+d[defaultYAxis]));
    return circlesData;
}

//---------------------------------------------------------------------------------------------

function rXText(textsData, xNew, defaultXAxis) {
    textsData.transition()
        .duration(1500)
        .attr("dx", d => xNew(+d[defaultXAxis]));
    return textsData;
}

//---------------------------------------------------------------------------------------------

function rYTexts(textsData, yNew, defaultYAxis) {
    textsData.transition()
        .duration(1500)
        .attr("dy", d => yNew(+d[defaultYAxis]));
    return textsData;
}

//---------------------------------------------------------------------------------------------

function updateTools(defaultXAxis, circlesData) {
    let xLabel;
    if (defaultXAxis === "poverty") {
        xLabel = "In Poverty (%)";
    } else if (defaultXAxis === "age") {
        xLabel = "Age (Median)";
    } else {
        xLabel = "Household Income (Median)";
    }
    let yLabel;
    if (defaultYAxis === "healthCare") {
        yLabel = "Lacks Healthcare (%)";
    }
    else if (defaultYAxis === "smokes") {
        yLabel = "Smokes (%)";
    }
    else {
        yLabel = "obesity (%)";
    }

    let tools = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(d => `${d.state} <br />${xLabel}: ${d[defaultXAxis]} <br />${yLabel}: ${d[defaultYAxis]}`);

    circlesData.call(tools);
    circlesData.on("mouseover", function (data) {
        tools.show(data, this);
    })
        .on("mouseout", function (data, index) {
            tools.hide(data, this);
        });
    return circlesData;
}

//---------------------------------------------------------------------------------------------

d3.csv("assets/data/data.csv").then(function (HealthData) {
    HealthData.forEach(function (data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.healthcare = +data.healthcare;
        data.smokes = +data.smokes;
    });

    let xScaleLinear = x(HealthData, defaultXAxis);
    let yScaleLinear = y(HealthData, defaultYAxis);
    let newBottomAxis = d3.axisBottom(xScaleLinear);
    let newLeftAxis = d3.axisLeft(yScaleLinear);
    let xAxis = chart.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${hgt})`)
        .call(newBottomAxis);
    let yAxis = chart.append("g")
        .classed("y-axis", true)
        .call(newLeftAxis);
    let circlesData = chart.selectAll("circle")
        .data(HealthData)
        .enter()
        .append("circle")
        .attr("cx", d => xScaleLinear(d[defaultXAxis]))
        .attr("cy", d => yScaleLinear(d[defaultYAxis]))
        .attr("r", 10)
        .attr("fill", "lightblue")
        .attr("opacity", "1");

    let textsData = chart.selectAll("circles")
        .data(HealthData)
        .enter()
        .append("text")
        .text(d => d.abbr)
        .attr("dx", function (d) {
            return xScaleLinear(d[defaultXAxis]);
        })
        .attr("dy", function (d) {

            return yScaleLinear(d[defaultYAxis]) + (10 * 0.33);
        })
        .attr("class", "stateText")
        .attr("font-size", 9);
    let XLabels = chart.append("g")
        .attr("transform", `translate(${wdt / 2}, ${hgt + 20})`);

    let labelPoverty = XLabels.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .text("In Proverty (%)");

    let labelAge = XLabels.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Age (Median)");

    let incomeLabel = XLabels.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .classed("inactive", true)
        .text("Household Income (Median)");

    let YLabels = chart.append("g")
        .attr("transform", `rotate(-90)`)
        .attr("dy", "1em");

    let labelHealth = YLabels.append("text")
        .attr("y", 0 - mar.left + 60)
        .attr("x", 0 - (hgt / 2))
        .attr("value", "healthcare")
        .classed("active", true)
        .text("Lacks Healthcare (%)");

    let labelSmokes = YLabels.append("text")
        .attr("y", 0 - mar.left + 40)
        .attr("x", 0 - (hgt / 1.7))
        .attr("value", "smokes")
        .classed("inactive", true)
        .attr("data-axis-name", "Smokes (%)")
        .text("Smokes (%)");

    let labelObesity = YLabels.append("text")
        .attr("y", 0 - mar.left + 20)
        .attr("x", 0 - (hgt / 1.7))
        .attr("value", "obesity")
        .classed("inactive", true)
        .text("Obese (%)");

    circlesData = updateTools(defaultXAxis, circlesData);


    XLabels.selectAll("text")
        .on("click", function () {
            let value = d3.select(this).attr("value");
            if (value !== defaultXAxis) {
                defaultXAxis = value;
                xScaleLinear = x(HealthData, defaultXAxis);
                xAxis = rXAxis(xScaleLinear, xAxis);
                circlesData = rXCircle(circlesData, xScaleLinear, defaultXAxis);
                textsData = rXText(textsData, xScaleLinear, defaultXAxis);
                circlesData = updateTools(defaultXAxis, circlesData);
                if (defaultXAxis === "age") {
                    labelAge
                        .classed("active", true)
                        .classed("inactive", false);
                    labelPoverty
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (defaultXAxis === "poverty") {
                    labelPoverty
                        .classed("active", true)
                        .classed("inactive", false);
                    labelAge
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else {
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    labelAge
                        .classed("active", false)
                        .classed("inactive", true);
                    labelPoverty
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        });

    YLabels.selectAll("text")
        .on("click", function () {
            let value = d3.select(this).attr("value");
            if (value !== defaultYAxis) {
                defaultYAxis = value;
                yScaleLinear = y(HealthData, defaultYAxis);
                yAxis = rYAxis(yScaleLinear, yAxis);
                circlesData = rYCircle(circlesData, yScaleLinear, defaultYAxis);
                textsData = rYTexts(textsData, yScaleLinear, defaultYAxis);
                circlesData = updateTools(defaultYAxis, circlesData);
                if (defaultYAxis === "healthcare") {
                    labelHealth
                        .classed("active", true)
                        .classed("inactive", false);
                    labelSmokes
                        .classed("active", false)
                        .classed("inactive", true);
                    labelObesity
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (defaultYAxis === "smokes") {
                    labelSmokes
                        .classed("active", true)
                        .classed("inactive", false);
                    labelHealth
                        .classed("active", false)
                        .classed("inactive", true);
                    labelObesity
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    labelObesity
                        .classed("active", true)
                        .classed("inactive", false);
                    labelHealth
                        .classed("active", false)
                        .classed("inactive", true);
                    labelSmokes
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        });


});