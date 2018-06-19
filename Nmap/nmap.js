//global variables declaration
 var infowindow,city,marker;
// request for JSON of foursquare data
var clientID = 'IOFGXD5DVOVP5PFNTT0A4W4BBW2GGXFTFUAYMRA14ONNSPLX';
var clientSecret = 'D2NTW55O1HDJSNYZ3BBKWHKNDZFADC0AE4D5HIULPSURNZYV';
// this is the function called to get the main map
function initMap() {
    var Ongole = {
        lat: 15.5057,
        lng: 81.5169033
    };
     city = new google.maps.Map(document.getElementById('googlemap'),
    {
        zoom:10,
        center: Ongole
    });
    infowindow = new google.maps.InfoWindow();
    edges = new google.maps.LatLngBounds();   
    ko.applyBindings(new Design());
}
// Bounce function
function setBounce(marker) {
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() {
          marker.setAnimation(null);
      }, 1400);
    }
}
//location display function
var showlocation = function(content) {
    var self = this;
    this.heading = content.heading;
    this.position = content.location;
    this.street = '',
    this.phone = '';
    this.city = '',
    this.visible = ko.observable(true);
// storing the position variable with location 
    var link = 'https://api.foursquare.com/v2/venues/search?ll=' + this.position.lat + ',' + this.position.lng + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118' + '&query=' + this.heading;
    $.getJSON(link).done(function(content) {
		var output = data.response.venues[0];
        self.street = output.location.formattedAddress[0] ||'No street found';
        self.phone = output.contact.formattedPhone[1] ||'No phone found';
        self.city = output.location.formattedAddress[2] ||'No city found';
    }).fail(function() {
        alert('Oops!!wrong handling with FourSquareAPI');
    });
    this.marker = new google.maps.Marker({
        heading: this.heading,
        position: this.position,
        animation: google.maps.Animation.DROP,
        icon: marker
    });    
    self.remove = ko.computed(function () {
        if(self.visible() === true) {
            self.marker.setMap(city);
            city.fitBounds(edges);
            edges.extend(self.marker.position);
        } else {
            self.marker.setMap(null);
        }
    });
    // show city selected from the list
    this.show = function(location) {
        google.maps.event.trigger(self.marker, 'click');
    };
    this.marker.addListener('click', function() {
        infoAttract(this, self.street, self.phone, self.city, infowindow);
        setBounce(this);
        city.panTo(this.getPosition());
    });
    // show bounce effect when list is selected
    this.fall = function(city) {
		google.maps.event.trigger(self.marker, 'click');
	};
};
//main function
var Design = function() {
    var self = this;
    this.findcity = ko.observable('');
    this.some = ko.observableArray([]);
    // adding location for the selected city
    citys.forEach(function(location) {
        self.some.push( new showlocation(location) );
    });
    // citys identified on map
    this.citylist = ko.computed(function() {
        var filteredcity = self.findcity().toLowerCase();
        if (filteredcity) {
            return ko.utils.arrayFilter(self.some(), function(location) {
                var str = location.heading.toLowerCase();
                var sink = str.includes(findfilter);
                location.visible(sink);
				return sink;
			});
        }
        self.some().forEach(function(location) {
            location.visible(true);
        });
        return self.some();
    }, self);
};
//citys that we want to display
var citys = [
    {
        heading: 'Ongole', 
        location: {lat: 15.5057, lng:80.0499}, 
    },
    {
        heading: 'Chirala', 
        location: {lat: 15.8136, lng: 80.3547}, 
    },
    {
        heading: 'podili', 
        location: {lat: 15.6070, lng: 79.6146}, 
    },
    {
        heading: 'Darsi', 
        location: {lat: 15.7700, lng: 79.6794},
    },
    {
        heading: 'Chimakurthy', 
        location: {lat: 15.5855, lng: 79.8672}, 
    },
];
// error handler
function googleMapsError() {
    alert("Sorry! Cannot load GoogleMaps :(");
}
function infoAttract(marker, street, phone, city, infowindow) {
    if (infowindow.marker != marker) {
        infowindow.setContent('');
        infowindow.marker = marker;
        infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
        });
        var streetview = new google.maps.StreetViewService();
        var radius = 30;
        var windowContent = '<h5>' + marker.heading + '</h5>' + 
            '<p>' + street + "</br>" + phone + '</br>' + city + "</p>";
        var getview= function (content, site) {
            if (site == google.maps.StreetViewStatus.OK) {
                var viewlocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    viewlocation, marker.position);
                infowindow.setContent(windowContent);
            } 
            else {
                infowindow.setContent(windowContent + '<div style="color:darkorchid">No Street View</div>');
            }
        };
        streetview.getPanoramaByLocation(marker.position, radius, getview);
        infowindow.open(city, marker);
    }
}
