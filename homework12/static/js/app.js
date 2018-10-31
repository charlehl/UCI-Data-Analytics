// from data.js
var tableData = data;

// YOUR CODE HERE!
var tableBody = d3.select("tbody");
//var tbody = d3.select("tbody");
tableBody.attr("id", "filtered-tbody-id")

var submit = d3.select("#filter-btn");

// Function to decode html strings in comments properly.
function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

// Convert string to title format
String.prototype.toTitle = function() {
    return this.replace(/(^|\s)\S/g, function(t) { return t.toUpperCase() });
};

// Complete the click handler for the form
submit.on("click", function() {
    // Prevent the page from refreshing
    d3.event.preventDefault();

    // Select the input element and get the raw HTML node
    var inputText = d3.select("#datetime");
    
    // Get the value property of the input element
    var inputValue = inputText.property("value");

    console.log(inputValue);

    var inputDate = new Date(inputValue);
    console.log(inputDate);

    // Use the form input to filter the data by blood type
    ufoFiltered = tableData.filter(function(sighting) {
        var datetimeConvert = new Date(sighting.datetime);
        return datetimeConvert.getTime() === inputDate.getTime();
    });

    console.log(ufoFiltered);
    // Clear previous filter search results
    document.getElementById("filtered-tbody-id").innerHTML = "";

    ufoFiltered.forEach((sighting) => {
        var tableRow = tableBody.append("tr");
        Object.entries(sighting).forEach(([key, value]) => {
            var cell = tableBody.append("td");
            if(key === "city"){
                cell.text(value.toTitle());
            }
            else if(key === "state"){
                cell.text(value.toUpperCase());
            }
            else if(key === "country"){
                cell.text(value.toUpperCase());
            }    
            else if(key === "comments"){
                cell.text(decodeHtml(value));
            }
            else{
                cell.text(value);
            }
        });
    });
});