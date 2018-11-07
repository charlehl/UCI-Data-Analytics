function buildMetadata(sample) {
  var meta_url = "/metadata/" + sample;
  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
  d3.json(meta_url).then(function(data) {
    // Use d3 to select the panel with id of `#sample-metadata`
    sampleMetadata = d3.select(`#sample-metadata`);

    // Use `.html("") to clear any existing metadata
    sampleMetadata.html("");

    metaDataPanel = "";
    Object.entries(data).forEach(([key, value]) => {
      metaDataPanel += `${key}: ${value}` + "<br>";
    });
    sampleMetadata.html(metaDataPanel);


    console.log(data);
    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.

    // BONUS: Build the Gauge Chart
    buildGauge(data.WFREQ);
  });
}

function buildCharts(sample) {

  var sample_url = "/samples/" + sample;
  var bellyData = [];

  //console.log(sample_url);
  // @TODO: Use `d3.json` to fetch the sample data for the plots
  d3.json(sample_url).then(function(data) {
    //console.log(data);
    var otu_ids = data.otu_ids;
    var otu_labels = data.otu_labels;
    var sample_values = data.sample_values;
    //data.forEach(data => {
      // bellyData.append({
      //   otu_id: data.otu_ids,
      //   otu_label: data.otu_labels,
      //   sample_value: data.sample_value
      // })
    //  console.log(data);
    //})
    for(let i = 0; i < otu_ids.length; i++){
      sample = {};
      sample.otu_id = otu_ids[i];
      sample.otu_label = otu_labels[i];
      sample.sample_value = sample_values[i];
      bellyData.push(sample);
    }
    bellyData.sort(function(a,b) {
      return b.sample_value-a.sample_value;
    });
    //console.log(bellyData);
    //console.log(bellyData.slice(0,10));
    bellySlice = bellyData.slice(0,10);
    otu_ids = [];
    otu_labels = [];
    sample_values = [];
    console.log(bellySlice);

    bellySlice.forEach(data => {
      otu_ids.push(data.otu_id);
      otu_labels.push(data.otu_label);
      sample_values.push(data.sample_value);
    });

    var layout = { showlegend: false,
                   width: 1500,
                   margin: { t: 30, b: 100, p: 200 },
                   xaxis: {title: "OTU ID"}};
    // @TODO: Build a Bubble Chart using the sample data
    var data = [{
      x: otu_ids,
      y: sample_values,
      mode: 'markers',
      marker: {
        size: sample_values,
        color: otu_ids
      },
      text: otu_labels
    }];
    Plotly.plot("bubble", data, layout);

    // @TODO: Build a Pie Chart
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
    //console.log(otu_labels);
    layout = { margin: { t: 30, b: 10 }};
    data = [{
      values: sample_values,
      labels: otu_ids,
      hovertext: otu_labels,
      hoverinfo: 'hovertext',
      type: 'pie'
    }];

    Plotly.plot("pie", data, layout);
  });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    //console.log(sampleNames);
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
