// from data.js
var tableData = data;

var tableBody = d3.select("tbody");
//var tbody = d3.select("tbody");
tableBody.attr("id", "filtered-tbody-id")

var submit = d3.select("#filter-btn");

// Function to decode html strings in comments properly.
// Taken from stackoverflow example
function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

// Convert string to title format
String.prototype.toTitle = function() {
    return this.replace(/(^|\s)\S/g, function(t) { return t.toUpperCase() });
};

// Helper function to check var has a value
function isEmpty(val){
    return (val === undefined || val == null || val.length <= 0) ? true : false;
}

// Code taken from https://gist.github.com/jherax/f11d669ba286f21b7a2dcff69621eb72
// Filter functions
/**
* Filters an array of objects with multiple criteria.
*
* @param  {Array}  array: the array to filter
* @param  {Object} filters: an object with the filter criteria as the property names
* @return {Array}
*/
function multiFilter(array, filters) {
    const filterKeys = Object.keys(filters);
    // filters all elements passing the criteria
    return array.filter((item) => {
      // dynamically validate all filter criteria
      return filterKeys.every(key => !!~filters[key].indexOf(item[key]));
    });
   }

// Complete the click handler for the form
submit.on("click", function() {
    // Prevent the page from refreshing
    d3.event.preventDefault();

    // Empty filter dict to be filled on click
    var filter = {};

    // Get the value property of the input element
    var inputValue = d3.select("#datetime-select").property("value");

    // Get the value property of the input element
    var inputValueCity = d3.select("#city").property("value").toLowerCase();

    // Get the value property of the input element
    var inputValueState = d3.select("#state-select").property("value");

    // Get the value property of the input element
    var inputValueCountry = d3.select("#country-select").property("value");

    // Get the value property of the input element
    var inputValueShape = d3.select("#shape-select").property("value");

    // Check if filter value was selected
    if(inputValue !== "All"){
        filter['datetime'] = inputValue;
    }
    if(isEmpty(inputValueCity) === false){
        filter['city'] = inputValueCity;
    }
    if(inputValueState !== "All"){
        filter['state'] = inputValueState;
    }
    if(inputValueCountry !== "All"){
        filter['country'] = inputValueCountry;
    }
    if(inputValueShape !== "All"){
        filter['shape'] = inputValueShape;
    }

    console.log(filter);
    
    // return filter values using multifilter function
    var ufoFiltered = multiFilter(data, filter);

    console.log(ufoFiltered);
    
    // Check if filter returned results
    if(isEmpty(ufoFiltered) === false){
        // Clear previous filter search results
        document.getElementById("filtered-tbody-id").innerHTML = "";

        // Output filtered table
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
    }
});

// Create unique items in data table for each key-value pair
function uniqueBy(arr, prop){
    return arr.reduce((a, d) => {
      if (!a.includes(d[prop])) { a.push(d[prop]); }
      return a;
    }, []);
  }
// Use these to create dropdown items on fly
var datetimeFilter = uniqueBy(data, "datetime");
var cityFilter = uniqueBy(data, "city");
var stateFilter = uniqueBy(data, "state");
var countryFilter = uniqueBy(data, "country");
var shapeFilter = uniqueBy(data, "shape");

// console.log(datetimeFilter);
// console.log(cityFilter);
// console.log(stateFilter);
// console.log(countryFilter);
// console.log(shapeFilter);
// Use this in order to create a dummy select for drop down to select all items...i.e. not selecting a filter value
var All = "All";

// Create dropdown menus designated selectors
var select = document.getElementById("datetime-select");
select.innerHTML = "";
select.innerHTML += "<option value=\"" + All + "\">" + All + "</option>";
// Populate list with options:
for(var i = 0; i < datetimeFilter.length; i++) {
    var opt = datetimeFilter[i];
    select.innerHTML += "<option value=\"" + opt + "\">" + opt + "</option>";
} 

var select = document.getElementById("state-select");
select.innerHTML = "";
select.innerHTML += "<option value=\"" + All + "\">" + All + "</option>";
// Populate list with options:
for(var i = 0; i < stateFilter.length; i++) {
    var opt = stateFilter[i];
    select.innerHTML += "<option value=\"" + opt + "\">" + opt + "</option>";
} 

var select = document.getElementById("country-select");
select.innerHTML = "";
select.innerHTML += "<option value=\"" + All + "\">" + All + "</option>";
// Populate list with options:
for(var i = 0; i < countryFilter.length; i++) {
    var opt = countryFilter[i];
    select.innerHTML += "<option value=\"" + opt + "\">" + opt + "</option>";
} 

var select = document.getElementById("shape-select");
select.innerHTML = "";
select.innerHTML += "<option value=\"" + All + "\">" + All + "</option>";
// Populate list with options:
for(var i = 0; i < shapeFilter.length; i++) {
    var opt = shapeFilter[i];
    select.innerHTML += "<option value=\"" + opt + "\">" + opt + "</option>";
} 
