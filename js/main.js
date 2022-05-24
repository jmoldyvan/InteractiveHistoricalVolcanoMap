const wildfire_url = 'https://public.opendatasoft.com/api/records/1.0/search/?dataset=significant-volcanic-eruption-database&q=&rows=9000&facet=year&facet=tsu&facet=eq&facet=name&facet=location&facet=country&facet=type&facet=status&facet=deaths_description&facet=missing_description&facet=injuries_description&facet=damage_description&facet=houses_destroyed_description&facet=total_deaths_description&facet=total_missing_description&facet=total_injuries_description&facet=total_damage_description&facet=total_houses_destroyed_description&facet=houses_damaged_description&facet=coordinates'

fetch(wildfire_url)
    .then(res => {
        return res.json();
    })
    .then(data => {
        const volObj = data.records;
        volDict = []
        volObj.forEach(elem => {
            nameObj = elem.fields.name
            VeiObj = elem.fields.vei
            YearObj = elem.fields.year
            CordObj = elem.geometry.coordinates.reverse()
            volDict.push({
                nameDict: nameObj,
                veiDict: VeiObj,
                yearDict: YearObj,
                CordDict: CordObj,
            })
        })
        console.log(volDict);
    })
    

var map = L.map('map').setView([39.8283, -98.5795], 4);
mep = map.setView([39.8283, -98.5795], 5);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    noWrap: true,
    bounds: [
        [-90, -180],
        [90, 180]
      ],
    id: 'mapbox/satellite-v9',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1Ijoic3RhbmtyaXZlcnMiLCJhIjoiY2wydGs5Z3liMDU1ZjNrbm8xOG03djl5cyJ9.XSqdmDualn8m24ygMRo7Vg'
}).addTo(map);


// set up global variables
// how big our circle is
let rad = 1609344
let circle = L.circle();
let popup = L.popup();
// storage for layergroups to be easily accessed later
let markers = L.layerGroup();


var title = L.control({position: 'bottomleft'});
title.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'title'); // create a div with a class "info"
    this.update();

    return this._div;
};
// method that we will use to update the control based on feature properties passed
title.update = function (props) {
    this._div.innerHTML = '<h4>The Significant Historical Volcanic Eruptions Map</h4>'
};
title.addTo(map);

var latLngDisplay = L.control({position: 'topright'});
latLngDisplay.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.secondUpdate();
    return this._div;
};
latLngDisplay.secondUpdate = function (props) {
    this._div.innerHTML = `<h4>Current Latitude & Longitude</h4>` + (props ? `<h5>Latitude: ${props.lat}</h5> <h6> <br> Longitude:   ${props.lng}</h6>` : `<h5>Click To Get Coordinates</h5>`);
};
latLngDisplay.addTo(map);



var volcNumInRad = L.control({position: 'topright'});
volcNumInRad.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'legend');
    this.secondUpdate();
    return this._div;
};
volcNumInRad.secondUpdate = function (props) {
    this._div.innerHTML = 
    `<h4>Number of Volcanoes</h4>` + (props ? `<h5>${props}</h5>`: ``);
};
volcNumInRad.addTo(map);

var veiDisplay = L.control({position: 'topright'});
veiDisplay.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'legend');
    this.secondUpdate();
    return this._div;
};
veiDisplay.secondUpdate = function (props) {
    this._div.innerHTML = `<h4>Average VEI</h4>` + (props ? `<h5>${props}</h5>`: ``);
};
veiDisplay.addTo(map);

// var surviveability = L.control({position: 'topright'});
// surviveability.onAdd = function (map) {
//     this._div = L.DomUtil.create('div', 'legend');
//     this.secondUpdate();
//     return this._div;
// };
// surviveability.secondUpdate = function (props) {
//     this._div.innerHTML = `<h4>Would You Survive These Eruptions??</h4>` + (props ? `<h5>${props}</h5>`: ``);
// };
// surviveability.addTo(map);

var legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'legend');
    this.secondUpdate();
    return this._div;
};
legend.secondUpdate = function () {
    this._div.innerHTML = `<h4>Legend</h4>` + (`<h5>Red Circle Radius = 1,000mi</h5>`);
};
legend.addTo(map);



// the onclick function
function onMapClick(e) {

// center point pop up
    popup
        .setLatLng(e.latlng.lat)

    // centers map/the veiwpoint to where user clicks
    map.setView(e.latlng);

    // settings for our circle to be used later
    circle
        .setStyle({color:'rgba(255, 0, 0, 0.4)'})
        .setRadius(rad)
        .setLatLng(e.latlng)
        .addTo(map)

        // function variables to be reset on click
    let insideCircleMarks = [];
    // just a way to keep track of how many points are inside radius
    let counter_points_in_circle = 0;
    volDict.forEach(element=>{
          // Distance from our circle marker To current point in meters
          distance_from_centerPoint = e.latlng.distanceTo(element.CordDict);
          // See if meters is within radius
          if (distance_from_centerPoint <= rad) {
              counter_points_in_circle += 1;
            //   if it is push the cordict inside voldict to array
            insideCircleMarks.push(element)
          }
    })

    let lengthVei = (insideCircleMarks.filter(({veiDict}) => veiDict !== undefined)).length;
    let sumVei = insideCircleMarks.filter(({veiDict}) => veiDict !== undefined).reduce((t,c) => t + c.veiDict , 0)
    let avgVei = Math.floor(sumVei/lengthVei)

    // check if insidecirclemarks array has anything in it, if yes, push them to the layer group
    for (let i = 0; i < insideCircleMarks.length; i++) {
        marker = L.marker([insideCircleMarks[i].CordDict[0], insideCircleMarks[i].CordDict[1]])
        if (insideCircleMarks[i].veiDict === undefined){
            marker.bindPopup(`${insideCircleMarks[i].nameDict} <br> Eruption Year: ${insideCircleMarks[i].yearDict} <br> VEI: No Date or Below 0 `).openPopup();
        }
        else if (insideCircleMarks[i].veiDict !== undefined){
        marker.bindPopup(`${insideCircleMarks[i].nameDict} <br> Eruption Year: ${insideCircleMarks[i].yearDict} <br> VEI: ${insideCircleMarks[i].veiDict} `).openPopup();
        }
        markers.addLayer(marker)
    }

    // add layer group to the map
    map.addLayer(markers);
    // look through each layer
    markers.eachLayer(function(_layer){
        // set variables to equal the latitude longitude cords or each layer
        let layerLatLng = _layer._latlng
        layer_dist_from_center = e.latlng.distanceTo(layerLatLng);
        // check if they are outside radius
        if(layer_dist_from_center > rad){
            // remove layer if it is outside
            map.removeLayer(_layer)
        }
    });
    title.update(e.latlng);
    latLngDisplay.secondUpdate(e.latlng);
    veiDisplay.secondUpdate(avgVei);
    volcNumInRad.secondUpdate(counter_points_in_circle);
}
map.on('click', onMapClick);


// information tab:
// what is this project
// what information is used
// definitions
// why this project? because volcaoes are cool





// ********DONE
// should this be a sticky layer?
// center point: you are at latlng x,y
// there are 'x number' of volcanoes within the radius
// the average vei is : ''
// based on the number of volcanoes, and intensity of vei, you would be fucked


// ********DONE
// bind popup to the markers:
// name of volcanoe
// vei of volcano
// date of historical eruption
// latlng of volcanoe
