
function getColor(mag){
  if(mag < 1 ) {
    return "#84E80D";
  }
  else if(mag < 2) {
    return "#D2FA0E";
  }
  else if(mag < 3) {
    return "#BAD82A";
  }
  else if(mag < 4) {
    return "#D8962A";
  }
  else if(mag < 5) {
    return "#DD822C";
  }
  else {
    return "#DD4C2C";
  }
}
function earthQuakeStyle(feature) {
  return {
    radius: 8 * feature.properties.mag,
    fillColor: getColor(feature.properties.mag),
    color: getColor(feature.properties.mag),
    fillOpacity: 0.8
  };
}
quake_link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
// plates_link = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
d3.json(quake_link, function(request) {
  console.log(request);
  var startLat = request.bbox[1] + request.bbox[4];
  var startLon = request.bbox[0] + request.bbox[3];
  
  var street = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var light = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });
      
  var dark = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Create a baseMaps object to hold the lightmap layer
  var baseMaps = {
    Satellite: satellite,
    Street: street,
    Light: light,
    Dark: dark
  };

  // Create the map object with options
  var myMap = L.map("map-id", {
    center: [startLat, startLon],
    zoom: 3,
    layers: [satellite]
  });

  var earthQuakeLayer = L.geoJson(request, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, earthQuakeStyle(feature));
    },
    // Called on each feature
    onEachFeature: function(feature, layer) {
      // Giving each feature a pop-up with information pertinent to it
      layer.bindPopup("<h3>" + feature.properties.place + "</h3>"
                      + "<hr> <h3>" + feature.properties.type + ": magnitude" + feature.properties.mag +"</h3>");
    }
  }).addTo(myMap);

  var overlayMaps = {
    Earthquakes: earthQuakeLayer,
  };

  // Add control layers to map
  var controlLayers = L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Add legend to map
  var legend = L.control({position: 'bottomright'});
  legend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'info legend'),
      mags = [0, 1, 2, 3, 4, 5],
      labels = [];

    for(var i=0; i < mags.length; i++) {
      div.innerHTML += '<i style="background:' + getColor(mags[i]) + '"></i> ' +
      mags[i] + (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+');
    }
    return div;
  };
  legend.addTo(myMap);

  // Add tectonic plates
  plates_link = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
  d3.json(plates_link, function(plate){
    //console.log(request);
    var newLayer = L.geoJson(plate, {
      // Style each feature (in this case a neighborhood)
      style: function(feature) {
        return {
          color: "yellow",
          fillOpacity: 0,
          weight: 1.5
        };
      },
      // Called on each feature
      onEachFeature: function(feature, layer) {
        // Set mouse events to change map styling
        layer.on({
          // When a feature (neighborhood) is clicked, it is enlarged to fit the screen
          click: function(event) {
            myMap.fitBounds(event.target.getBounds());
          }
        });
        // Giving each feature a pop-up with information pertinent to it
        layer.bindPopup("<h1>" + feature.properties.Name + "</h1>");
  
      }
    }).addTo(myMap);
    controlLayers.addOverlay(newLayer, "Plates")
  });
});


//county_link = "http://boundaries.latimes.com/1.0/boundary-set/la-county-neighborhoods-v5/?format=geojson"
// plates_link = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
// d3.json(plates_link, function(request){
//   console.log(request);
//   L.geoJson(request, {
//     // Style each feature (in this case a neighborhood)
//     style: function(feature) {
//       return {
//         color: "yellow",
//         // Call the chooseColor function to decide which color to color our neighborhood (color based on borough)
//         fillColor: "lightblue",
//         fillOpacity: 0,
//         weight: 1.5
//       };
//     },
//     // Called on each feature
//     onEachFeature: function(feature, layer) {
//       // Set mouse events to change map styling
//       layer.on({
//         // When a feature (neighborhood) is clicked, it is enlarged to fit the screen
//         click: function(event) {
//           myMap.fitBounds(event.target.getBounds());
//         }
//       });
//       // Giving each feature a pop-up with information pertinent to it
//       layer.bindPopup("<h1>" + feature.properties.Name + "</h1>");

//     }
//   }).addTo(myMap);
// });
