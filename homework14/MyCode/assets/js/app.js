// @TODO: YOUR CODE HERE!

// Establish svg size based on bootstrap column size allocated for scatter
var scatterWidth = document.querySelector("#scatter").getBoundingClientRect()
//console.log(scatterWidth);
var svgWidth = scatterWidth.width;
var svgHeight = svgWidth/1.5;

var radius = 12;
var font = "10px";

if(scatterWidth.width < 400) {
    radius = 2;
}



var margin = {
  top: 20,
  right: 20,
  bottom: 125,
  left: 125
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

//console.log(width);

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .classed("chart", true)
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare"

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
        d3.max(censusData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  
}
// function used for updating x-scale var upon click on axis label
function yScale(censusData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
        d3.max(censusData, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
  
    return yLinearScale;
  
}

// function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis, newYScale, chosenYaxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
}

function renderLabels(textGroup, newXScale, chosenXaxis, newYScale, chosenYaxis) {

    textGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]));
  
    return textGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    if (chosenXAxis === "poverty") {
      var labelX = "Poverty(%)";
    }
    else if(chosenXAxis === "age") {
      var labelX = "Age(Median)";
    }
    else {
      var labelX = "Household Income(Median)";
    }
  
    if (chosenYAxis === "healthcare") {
        var labelY = "Healthcare(%)";
    }
    else if (chosenYAxis === "smokes") {
        var labelY = "Smokes(%)";
    }
    else {
        var labelY = "Obese(%)";
    }

    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([10, -10])
      .html(function(d) {
        return (`${d.state}:<br>${labelY}: ${d[chosenYAxis]}<br>${labelX}: ${d[chosenXAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
async function loadData() {
    const censusData = await d3.csv("assets/data/data.csv")
        .then(function(csvData) {
            csvData.forEach(function(data) {
                data.id = +data.id;
                data.poverty = +data.poverty;
                data.age = +data.age;
                data.income = +data.income;
                data.healthcare = +data.healthcare;
                data.obesity = +data.obesity;
                data.smokes = +data.smokes;
            });
            // console.log(censusData);
            return csvData;

        })
        .catch(function(error) {
            console.log(error);
        });
    
/////////////////////////////////////////////////////////////////////////////////////////////
    // xLinearScale function above csv import
    var xLinearScale = xScale(censusData, chosenXAxis);

    // Create y scale function
    var yLinearScale = yScale(censusData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle.stateCircle")
        .data(censusData)
        .enter()
        .append("circle")
        .classed("stateCircle", true)
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", radius);
    
    // var stateAbbr = censusData.slice();
    // console.log(stateAbbr);
    var textGroup = chartGroup.selectAll("text.stateText")
        .data(censusData)
        .enter()
        .append("text")
        .classed("stateText", true)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr("text-anchor", "middle")
        .attr("font-size", font)
        .attr("dy", ".3em")
        .text(d=> d.abbr);


    // Create group for  2 x- axis labels
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active .aText", true)
        .text("In Poverty(%)");

   var ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive .aText", true)
        .text("Age (Median)");

    var householdIncomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive .aText", true)
        .text("Household Income (Median)");

    // append y axis
    var labelsYGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");
        
    var healthcareLabel = labelsYGroup.append("text")
        .attr("y", -60)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active .aText", true)
        .text("Lacks Healthcare(%)");

    var smokeLabel = labelsYGroup.append("text")
        .attr("y", -80)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive .aText", true)
        .text("Smokes(%)");

    var obeseLabel = labelsYGroup.append("text")
        .attr("y", -100)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "obesity") // value to grab for event listener
        .classed("inactive .aText", true)
        .text("Obese(%)");

   // updateToolTip function above csv import
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    //x axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        console.log(value);
        if (value !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = value;

            // console.log(chosenXAxis)

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(censusData, chosenXAxis);

            // updates x axis with transition
            xAxis = renderXAxis(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            textGroup = renderLabels(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenXAxis === "poverty") {
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                householdIncomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenXAxis === "age") {
                ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                householdIncomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else {
                householdIncomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
        }
        });
    //y axis labels event listener
    labelsYGroup.selectAll("text")
        .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        console.log(value);
        if (value !== chosenYAxis) {

            // replaces chosenXAxis with value
            chosenYAxis = value;

            // console.log(chosenYAxis)

            // functions here found above csv import
            // updates x scale for new data
            yLinearScale = yScale(censusData, chosenYAxis);

            // updates x axis with transition
            yAxis = renderYAxis(yLinearScale, yAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            textGroup = renderLabels(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenYAxis === "healthcare") {
                healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);
                smokeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obeseLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenYAxis === "smokes") {
                smokeLabel
                    .classed("active", true)
                    .classed("inactive", false);
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obeseLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else {
                obeseLabel
                    .classed("active", true)
                    .classed("inactive", false);
                smokeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
        }
        });
/////////////////////////////////////////////////////////////////////////////////////////////    
}

loadData();
