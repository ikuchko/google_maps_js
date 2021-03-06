var destinationKey = "AIzaSyDp0QftGXRtod_pyaNZeQnMbJScGQ87F40";
// var destinationKey = "AIzaSyDEf3D-N_JjVjOPBLwpmHCna-gegi5GcDs";
var KEY = "e0aa4703629c3d46bd310eee601b23ff";
var map;
var myLatLng = {lat: -25.363, lng: 131.044};
var bounds = new google.maps.LatLngBounds();
var markers = [];
var waypts = [];

var getMarkers = function (htmlId) {
  for (var index in htmlId) {
    var geocode = new google.maps.Geocoder();
    geocode.geocode(
      {
        address: $('#' + htmlId[index]).val()
      }, callback);
    function callback(response, status) {
      for (var i in response) {
        var myLatLng = {lat: response[i].geometry.location.lat(), lng: response[i].geometry.location.lng()};
        var marker = new google.maps.Marker({
          position: myLatLng,
          draggable: true,
          animation: google.maps.Animation.DROP,
          map: map,
        });
        markers.push(marker);
        bounds.extend(marker.position);
      }
      map.fitBounds(bounds);
    };
  }
};

var clearMarkers = function() {
  for (var i in markers) {
    markers[i].setMap(null);
  }
};

var currentLocation = function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      var marker = new google.maps.Marker({
        position: pos,
        draggable: true,
        animation: google.maps.Animation.DROP,
        map: map,
      });
      marker.addListener('click', toggleBounce);
      markers.push(marker);
      map.setCenter(pos);
      map.setZoom(14);
      function toggleBounce() {
        if (marker.getAnimation() !== null) {
          marker.setAnimation(null);
        } else {
          marker.setAnimation(google.maps.Animation.BOUNCE);
        }
      }
    }, function() {
    });
  }
};

var placeMarkerAndPanTo = function(latLng, map) {
  var marker = new google.maps.Marker({
    position: latLng,
    map: map
  });
  markers.push(marker);
  //map.panTo(latLng)
}

var getDirection = function() {
  var theRout = new google.maps.DirectionsService();
  theRout.route({
    origin: $("#origin").val(),
    destination: $("#destination").val(),//markers[1].position | String | google.maps.Place,
    // console.log(markers[0].position)
    // console.log(markers[0])
    travelMode: google.maps.TravelMode.DRIVING
  //   transitOptions: {
  //   arrivalTime: Date,
  //   departureTime: Date,
  //   modes[]: TransitMode,
  //   routingPreference: TransitRoutePreference
  // },
  //   provideRouteAlternatives: true,
  //   avoidHighways: false,
  //   avoidTolls: false;
}, callback);
  function callback(response, status) {
    getMarkers(["origin", "destination"]);
  }
};

var calcRoute = function() {
  var directionsRender = new google.maps.DirectionsRenderer();
  directionsRender.setMap(map);
  directionsRender.setPanel(document.getElementById("directionsPanel"));
  var directionsService = new google.maps.DirectionsService();
  var start = document.getElementById("origin").value;
  var end = document.getElementById("destination").value;
  clearMarkers();
  var request = {
    origin:start,
    destination:end,
    travelMode: google.maps.TravelMode.DRIVING,
    waypoints: waypts
  };

  directionsService.route(request, function(result, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsRender.setDirections(result);
    }
  });
};

var getMultipleDirection = function() {
  debugger;
  if (markers.length > 2) {
    for (var i = 0; i < markers.length; i++) {
      if ((i !== 0) && (i !== markers.length)) {
        waypts.push({lat: markers[i].position.lat(), lng: markers[i].position.lng()});
      }
    }
  }
  calcRoute();
}

// Gmaps code needs to be in $(document).ready format in order to load properly
$(function () {


  map = new google.maps.Map(document.getElementById('map'), {
    center: myLatLng,
    zoom: 5
  });
  currentLocation();

  $("#current-location-btn").click(function() {
    currentLocation();
  });

  $("#multiple-route").click(function() {
    getMultipleDirection();
  });

  $("#clear-btn").click(function() {
    clearMarkers();
  });

  $(".map-location").submit(function(event){
    clearMarkers();
    event.preventDefault();
    // for (map.markers)
    getMarkers(["address"]);
  });

  $(".map-destination").submit(function(event){
    event.preventDefault();
    var origin1 = $("#origin").val();
    var destinationA = $("#destination").val();

    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [origin1],
        destinations: [destinationA],
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(Date.now() + 1000),
          trafficModel: "optimistic"
        },
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false,
      }, callback);

    function callback(response, status) {
      getMarkers(["origin", "destination"]);
      $('#destination-result').append('<p><em>Destination: </em>' + response.destinationAddresses + '<br><em>Trip Length: </em>'
                                      + response.rows[0].elements[0].duration.text + '<br><em>Trip Distance: </em>' + response.rows[0].elements[0].distance.text + '</p>');
    }
    getDirection();
    calcRoute();
  });

  map.addListener('click', function(e) {
    placeMarkerAndPanTo(e.latLng, map);
  });

});
