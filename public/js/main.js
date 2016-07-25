
//get current date in yyyymmdd format - thanks to Pierre Guilbert and Glen Selle at http://stackoverflow.com/a/16714931/6590871
$(".app-container").hide();

$(document).ready(function() {

    var map;
    //init google map
    window.initMap = function initMap() {

        // Specify features and elements to define styles
        // Source:https://snazzymaps.com/style/25/blue-water
        var styleArray = [{
            "featureType": "administrative",
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": "#444444"
            }]
        }, {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [{
                "color": "#f2f2f2"
            }]
        }, {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [{
                "visibility": "off"
            }]
        }, {
            "featureType": "road",
            "elementType": "all",
            "stylers": [{
                "saturation": -100
            }, {
                "lightness": 45
            }]
        }, {
            "featureType": "road.highway",
            "elementType": "all",
            "stylers": [{
                "visibility": "simplified"
            }]
        }, {
            "featureType": "road.arterial",
            "elementType": "labels.icon",
            "stylers": [{
                "visibility": "off"
            }]
        }, {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [{
                "visibility": "off"
            }]
        }, {
            "featureType": "water",
            "elementType": "all",
            "stylers": [{
                "color": "#46bcec"
            }, {
                "visibility": "on"
            }]
        }];

        // Create a map object and specify the DOM element for display.

        map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: 46.8186665,
                lng: -71.266189
            },
            scrollwheel: true,
            // Apply the map style array to the map.
            styles: styleArray,
            zoom: 12,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            scaleControl: true,
            draggable: true,
            disableDefaultUI: true
        });
    }





    function getYMD() {
        var rightNow = new Date();
        return rightNow.toISOString().slice(0, 10).replace(/-/g, "");
    }

    var places;
    var placesPerPage = 10;

    function fourSquareCallback(data) {

        var current,
            nameForGoogleQuery,
            currentPlaceID,
            currentPlaceIcon;
        places = data.response.groups[0].items
            .sort(function(a, b) {
                return b.venue.ratingSignals * b.venue.rating - a.venue.ratingSignals * a.venue.rating;
            })
            .map(function(place, index) {
                currentPlaceFqID = place.referralId; //FourSquare ID
                currentPlace = place.venue; //Object of the place containing relevant information about it
                nameForGoogleQuery = place.venue.name.replace(/\s/g, "+"); // utility to generate relevant google urls
                return {
                    "index": index,
                    "name": currentPlace.name,
                    "rating": {
                        "ratingAverage": currentPlace.rating,
                        "ratingNumbers": currentPlace.ratingSignals,
                    },
                    "urls": {
                        "websiteUrl": currentPlace.url,
                        "googleSearchUrl": "https://www.google.com/search?q=" + nameForGoogleQuery,
                        "googleStreetViewUrl":"https://www.google.com/maps?q=&layer=c&cbll=" + 
                                                currentPlace.location.lat + ',' + currentPlace.location.lng + 
                                                "&ll=" + currentPlace.location.lat + "," + currentPlace.location.lng,
                        //the following url will lead the user to a google maps page where the focus will
                        //be in the empty "From" input. The "To" input will be the location for which the user
                        //wanted to obtain directions
                        "googleMapsUrl": "https://www.google.com/maps/dir//" + nameForGoogleQuery
                    },
                    "address": currentPlace.location.formattedAddress.join(', '),
                    "coordinates": {
                        "lat": currentPlace.location.lat,
                        "lng": currentPlace.location.lng,
                    },
                    "typeOfPlace": {
                        name: currentPlace.categories[0].name,
                        icon32: currentPlace.categories[0].icon.prefix + "bg_" + 32 + currentPlace.categories[0].icon.suffix,
                        icon64: currentPlace.categories[0].icon.prefix + "bg_" + 64 + currentPlace.categories[0].icon.suffix
                    },
                    "marker": {}, // will store the marker related to this specific place 
                    "infoWindow": {} // will store the infoWindow related to this specific place
                }
            });
        console.log(places);
        console.log(data);

        /*
  createMapMarker(place) reads Google Places search results to create map pins.
  place is the object returned from search results containing information
  about a single location.
  */
        var previousPlaceSelected = null; // this stores the previous place that was selected
        var redpin = {
            url: 'img/redpin.png'
        };
        var greenpin = {
            url: 'img/greenpin.png'
        };

        function toggleMarkerAnimation(place) {
            var currentMarker = place.marker;
            if (currentMarker.getAnimation() !== null) {
                currentMarker.setAnimation(null);
            } else {
                currentMarker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function() {
                    currentMarker.setAnimation(null)
                }, 700);
                currentMarker.setIcon(greenpin);
            }
            if (previousPlaceSelected) {
                if (previousPlaceSelected !== place) {
                    previousPlaceSelected.infoWindow.close();
                    previousPlaceSelected.marker.setIcon(redpin);
                    previousPlaceSelected.marker.setZIndex(1);
                }
            };
            place.infoWindow.open(map, place.marker);
            currentMarker.setZIndex(2);
            previousPlaceSelected = place;
        }

        function createMapMarker(place) {

            window.mapBounds = new google.maps.LatLngBounds();
            // The next lines save location data from the search result object to local variables
            var bounds = window.mapBounds; // current boundaries of the map window

            // marker is an object with additional data about the pin for a single location
            place.marker = new google.maps.Marker({
                map: map,
                position: place.coordinates,
                animation: google.maps.Animation.DROP,
                title: place.name,
                icon: redpin,
                zIndex: 1
            });

            // infoWindows are the little helper windows that open when you click
            // or hover over a pin on a map. They usually contain more information
            // about a location.
            var content = '<h5><span class="pin-lg greenpin-lg"></span>' + place.name + '</h5>';
            content += '<p>' + (place.address) + '</p>';
            content += '<h5 style="padding-bottom:0;margin-bottom:0"><small>' + place.typeOfPlace.name + '</small></h5>';
            content += '<table><thead><tr><th style="padding-left:0"><img src="' + place.typeOfPlace.icon64 + '" alt="' + place.name + '"></th>';
            content += '<th><h6>Rating:</h6><h5 class="inline">' + place.rating.ratingAverage + ' <i class="material-icons">grade</i></h5><p class="inline"><small> (' + place.rating.ratingNumbers + ' ratings)</small></p></th></tr></table>';
            content += '<h6 style="padding-top:5px">More Links:</h6>';
            content += '<div><a target="_blank" href="' + place.urls.googleMapsUrl + '" class="links">Get Directions >></a></div>';
            content += '<div><a target="_blank" href="' + place.urls.googleStreetViewUrl + '" class="links">See on Street View >></a></div>';
            content += '<div><a target="_blank" href="' + place.urls.googleSearchUrl + '" class="links">Search on Google >></a></div>';
            content += '<div><a target="_blank" href="' + place.urls.websiteUrl + '" class="links">Visit website >></a></div>';


            place.infoWindow = new google.maps.InfoWindow({
                content: content,
                maxWidth: 225
            });

            // Display information when a marker is clicked, 
            // and hide the info window from the marker previously clicked


            google.maps.event.addListener(place.marker, 'click', function() {
                toggleMarkerAnimation(place);
            });

            // this is where the pin actually gets added to the map.
            // bounds.extend() takes in a map location object
            bounds.extend(new google.maps.LatLng(place.coordinates.lat, place.coordinates.lng));
            // fit the map to the new marker
            map.fitBounds(bounds);
            // center the map
            map.setCenter(bounds.getCenter());
        }

        var placesPerPageIndex = placesPerPage - 1;
        places.forEach(function(place, index) {
            createMapMarker(place);
            if (index > placesPerPageIndex) place.marker.setVisible(false);
        });

        map.setCenter({
            lat: 46.8246665,
            lng: -71.253089
        });

        map.setZoom(12);

        // This is a simple *viewmodel* - JavaScript that defines the data and behavior of your UI
        function AppViewModel(places) {
            var AVM = this;
            var $nextButton = $("#next-button");
            var $previousButton = $("#previous-button");

            var $showNavButton = $("#show-nav-button");
            var $sideNav = $("#side-nav");

            function searchAlgorithm(observableArray, filteredPlaces, inputVal) {
                observableArray().forEach(function(place) {
                    if (place.name.toLowerCase().match(inputVal)) filteredPlaces.push(place);
                });
                observableArray().forEach(function(place) {
                    if (place.typeOfPlace.name.toLowerCase().match(inputVal)) filteredPlaces.push(place);
                });
                observableArray().forEach(function(place) {
                    if (place.address.toLowerCase().match(inputVal)) filteredPlaces.push(place);
                });
            }

            function filter(observableArray) {
                function replaceIrregularChar(match) {
                    return "\\" + match
                }
                var filteredPlaces = [],
                    inputVal = AVM.searchInput()
                    .replace(/[&\/\\#,+()$~%.\'\":*?<>{}]/g, replaceIrregularChar)
                    .toLowerCase();
                if (!inputVal) return observableArray();
                else if (inputVal.length < 2) {
                    filteredPlaces = $.grep(observableArray(), function(place) {
                        return place.name[0].toLowerCase() === inputVal[0];
                    });
                    observableArray().forEach(function(place) {
                        if (filteredPlaces.indexOf(place) > -1) { /*do nothing*/ } else {
                            searchAlgorithm(observableArray, filteredPlaces, inputVal);
                        }
                    });
                    return filteredPlaces;
                } else if (inputVal.length > 1) {
                    searchAlgorithm(observableArray, filteredPlaces, inputVal);
                    return filteredPlaces;
                }
            }

            AVM.searchInput = ko.observable("");
            AVM.allPlaces = ko.observableArray(places);
            AVM.filteredPlaces = ko.computed(function() {
                return filter(AVM.allPlaces);
            });
            AVM.numberOfPages = ko.computed(function() {
                return Math.ceil(AVM.filteredPlaces().length / placesPerPage);
            });
            AVM.currentPage = ko.observable(1);
            AVM.shouldEnableNext = ko.computed(function() {
                if (AVM.currentPage() < AVM.numberOfPages()) {
                    if ($nextButton.hasClass('disabled')) $nextButton.removeClass('disabled');
                } else {
                    $nextButton.addClass('disabled');
                }
                return AVM.currentPage() < AVM.numberOfPages();
            });
            AVM.shouldEnableBack = ko.computed(function() {
                if (AVM.currentPage() > 1) {
                    if ($previousButton.hasClass('disabled')) $previousButton.removeClass('disabled');
                } else {
                    $previousButton.addClass('disabled');
                }
                return AVM.currentPage() > 1;
            });


            AVM.hideMarkersAndWindow = function() {
                if (previousPlaceSelected) {
                    previousPlaceSelected.infoWindow.close();
                    previousPlaceSelected.marker.setIcon(redpin);
                }
                AVM.allPlaces().forEach(function(place) {
                    place.marker.setVisible(false)
                });
            };
            AVM.displayMarkers = function() {
                AVM.placesDisplayed().forEach(function(place) {
                    place.marker.setVisible(true)
                });
            };
            AVM.resetCurrentPage = function() {
                AVM.currentPage(1);
            };
            AVM.incrementPage = function() {
                AVM.hideMarkersAndWindow();
                AVM.currentPage(AVM.currentPage() + 1);
                AVM.displayMarkers();
            };
            AVM.decrementPage = function() {
                AVM.hideMarkersAndWindow();
                AVM.currentPage(AVM.currentPage() - 1);
                AVM.displayMarkers();
            };

            AVM.placesDisplayed = ko.computed(function() {
                var constant = (AVM.currentPage() - 1) * placesPerPage;
                return AVM.filteredPlaces().slice(constant, constant + placesPerPage);
            });

            AVM.shouldDisplayPlaces = ko.computed(function() {
                return AVM.filteredPlaces().length > 0;
            });
            AVM.shouldDisplayNoResults = ko.computed(function() {
                return AVM.filteredPlaces().length < 1;
            });
            AVM.toggleMarkerAnimation = toggleMarkerAnimation;
        }

        ko.applyBindings(new AppViewModel(places));

        google.maps.event.addListener(map, "click", function(event) {
            for (var i = 0; i < places.length; i++) { //thanks to google.maps.event.addListener(map, "click", function(event) {
                if (!previousPlaceSelected) break;
                if (places[i].marker.getIcon().url.match("green")) {
                    places[i].infoWindow.close();
                    places[i].marker.setIcon(redpin);
                    break;
                }
            }
        });

    $(".loader").hide();

    $(".app-container").show();

    $("#query-bar").focus();


    } // end of fourSquare Function

    function fourSquareError(error) {
        console.log("You got the following error on GET request: ");
    }

    $.get("https://api.foursquare.com/v2/venues/explore?near=Quebec%20City,Quebec,Canada&client_id=CW3HGKGG2HTIVZQXJPVSKHHKQJNMLFSVQLOOZAJPZVMJRCCX&client_secret=NANZNGFDV4NIVPASVTNUKTFAI3TXIOS5TWMZHCFQBVOLWCNK&lang=en&limit=50&offset=0&v=" + getYMD(), fourSquareCallback)
        .fail(fourSquareError);



    // Initialize collapse button
    $(".button-collapse").sideNav({
        menuWidth: 300, // Default is 240
        edge: 'left', // Choose the horizontal origin
        closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
    });
    // Initialize collapsible (uncomment the line below if you use the dropdown variation)
    $('.button-collapse').sideNav('show');

    $('#show-nav-button').click(function() {
        $('.button-collapse').sideNav('show');
    });

    var $queryBar = $("#query-bar"),
        $searchBar = $("#search-bar"),
        $queryCard = $("#query-card");

    function querySwitchColor() {
        $queryCard.toggleClass('s8 offset-s2');
        $queryCard.toggleClass('s10 offset-s1');
        $queryCard.toggleClass('z-depth-1');
        $queryCard.toggleClass('z-depth-3');
    }

    $queryBar.focusin(querySwitchColor);
    $queryBar.focusout(querySwitchColor);



    $("#previous-button").click(function() {
        $("#side-nav").animate({
            scrollTop: 0
        }, "fast");
    });
    $("#next-button").click(function() {
        $("#side-nav").animate({
            scrollTop: 0
        }, "fast");
    });


    $("#show-nav-button").click(function() {
        $("#query-bar").focus();    
    });

});