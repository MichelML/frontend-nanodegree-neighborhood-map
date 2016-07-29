/* Steps taken to produce the app:
 * 0. Throw spinner while page is loading
 * 1. Initiate page with google maps
 * 2. Define Relevant Functions, Callbacks, Models, and ViewModel
 * 3. Procede with the FourSquare API request, including Knockout.js models and viewmodel
 * 4. Set initial state of the app
 * 5. Close spinner
 */

(function() {

    /*DOM VARIABLES*/
    var $nextButtonTop = $("#next-button-top"),
        $previousButtonTop = $("#previous-button-top"),
        $nextButtonBottom = $("#next-button-bottom"),
        $previousButtonBottom = $("#previous-button-bottom"),
        $showNavButton = $("#show-nav-button"),
        $sideNav = $("#side-nav"),
        $queryBar = $("#query-bar"),
        $queryCard = $("#query-card"),
        $buttonCollapse = $(".button-collapse"),
        $appContainer = $(".app-container"),
        $loader = $(".loader");

    /* 0. Throw spinner(shown by default) and hide app  while page is loading */
    $appContainer.hide();

    var map;
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
    };






    /*DEFINING FUNCTIONS AND VARIABLES THAT WILL SERVE IN CONVERTING FOURSQUARE PLACES TO A CLEANER AND SORTED ARRAY OF PLACES OBJECTS.
     * THEY WILL ALSO HELP IN DISPLAYING INFORMATION ON THE PAGE CORRECTLY AND SETTING UP THE MVVM CORRECTLY*/
    var places,
        placesPerPage = 10,
        fourSquareQuery_City = "Quebec city",
        nameForGoogleQuery,
        currentPlace,
        previousPlaceSelected = null, // this stores the previous place that was selected
        redpin = {
            url: 'img/redpin.png'
        },
        greenpin = {
            url: 'img/greenpin.png'
        };

    function createMapMarker(place) {

        window.mapBounds = new google.maps.LatLngBounds();
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
        var content = '<h5 class="teal-text">' + place.name + '</h5>';
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
            maxWidth: 250
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

    function toggleMarkerAnimation(place) {
        var currentMarker = place.marker;
        if (currentMarker.getAnimation() !== null) {
            currentMarker.setAnimation(null);
        } else {
            currentMarker.setIcon(greenpin);
        }
        if (previousPlaceSelected) {
            if (previousPlaceSelected !== place) {
                previousPlaceSelected.infoWindow.close();
                previousPlaceSelected.marker.setIcon(redpin);
                previousPlaceSelected.marker.setZIndex(1);
            }
        }
        place.infoWindow.open(map, place.marker);
        currentMarker.setZIndex(2);
        previousPlaceSelected = place;
    }


    function convertFourSquarePlaces(arrayOfPlaces) {
        return arrayOfPlaces.map(function(place, index) {
            currentPlace = place.venue; //Object of the place containing relevant information about it -
            //will be declared within the FourSquare callback function
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
                    "googleStreetViewUrl": "https://www.google.com/maps?q=&layer=c&cbll=" +
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
            };
        });
    }

    function sortConvertedPlacesByPopularityIndex(arrayOfPlaces) {
        // Popularity Index (PI) is a personal index I inferred based on the number of ratings and the average rating
        return arrayOfPlaces.sort(function(place1, place2) {
            var place1PI = place1.rating.ratingAverage * place1.rating.ratingNumbers || 1,
                place2PI = place2.rating.ratingAverage * place2.rating.ratingNumbers || 1;
            return place2PI - place1PI;
        });
    }



    /*BUILDING THE MODELS AND THE VIEW MODEL WITHIN THE KNOCKOUT.JS MVVM FRAMEWORK*/

    /*Q is the name of the app, this is therefore the $root*/
    function Q(Location, Places, DisplayHandlers) {
        var QApp = this;
        QApp.name = "Q";
        QApp.quote = "<small>Search top places <br>in Quebec city</small>"; //should be changed to allow more cities in the futur

        QApp.currentLocation = new Location(Places, DisplayHandlers);

        /*In the future, this app could be for more then one place. That is why I set up the currentCity at
         * the global level of the app.
         * The application is developed in the perspective that it will be extended in the futur.
         * For now, it is just for Quebec city though.
         */
        QApp.currentCity = ko.computed(function() {
            return QApp.currentLocation.searchedCity();
        });
        QApp.setLocation = function(newLocation) {
            //set new location
            QApp.currentLocation = new newLocation();
        };
    }
    /*Location constructor
     * contains places and the name of the current city searched for*/
    function Location(Places, DisplayHandlers) {
        var Location = this;
        Location.searchedCity = ko.observable(fourSquareQuery_City); //initiate with a default city (Quebec city)
        Location.displayHandlers = new DisplayHandlers(Places);
    }
    /*Places constructor - 
     * contains all information and methods regarding the places related to the searched location
     */
    function Places() {
        var Places = this;

        Places.placesFilterVal = ko.observable((locallyStoredInput) ? locallyStoredInput : "");

        function searchAlgorithm(arrayOfPlaces, filteredPlaces, inputVal) {
            arrayOfPlaces.forEach(function(place) {
                if (place.name.toLowerCase().match(inputVal)) filteredPlaces.push(place);
            });
            arrayOfPlaces.forEach(function(place) {
                if (filteredPlaces.indexOf(place) < 0) {
                    if (place.typeOfPlace.name.toLowerCase().match(inputVal)) filteredPlaces.push(place);
                }
            });
            arrayOfPlaces.forEach(function(place) {
                if (filteredPlaces.indexOf(place) < 0) {
                    if (place.address.toLowerCase().match(inputVal)) filteredPlaces.push(place);
                }
            });
        }

        function replaceIrregularChar(match) {
            return "\\" + match;
        }

        Places.filterPlaces = function(arrayOfPlaces) {
            var filteredPlaces = [],
                inputVal = Places.placesFilterVal()
                .replace(/[&\/\\#,+()$~%.\'\":*?<>{}]/g, replaceIrregularChar)
                .toLowerCase();
            if (!inputVal) return arrayOfPlaces;
            else if (inputVal.length < 2) {
                filteredPlaces = $.grep(arrayOfPlaces, function(place) {
                    return place.name[0].toLowerCase() === inputVal[0];
                });
                var remainingPlaces = [];
                arrayOfPlaces.forEach(function(place) {
                    if (filteredPlaces.indexOf(place) < 0) remainingPlaces.push(place);
                });
                searchAlgorithm(remainingPlaces, filteredPlaces, inputVal);
                return filteredPlaces;
            } else if (inputVal.length > 1) {
                searchAlgorithm(arrayOfPlaces, filteredPlaces, inputVal);
                return filteredPlaces;
            }
        };

        Places.allPlaces = ko.observableArray((locallyStoredPlaces) ? locallyStoredPlaces : places);
        Places.currentNumberOfPlaces = ko.computed(function() {
            return Places.allPlaces().length;
        });
        Places.filteredPlaces = ko.computed(function() {
            map.setCenter({
                lat: 46.8246665,
                lng: -71.253089
            });
            map.setZoom(12);
            return Places.filterPlaces(Places.allPlaces());
        });

        Places.numberOfPages = ko.computed(function() {
            return Math.ceil(Places.filteredPlaces().length / placesPerPage);
        });
        Places.currentPage = ko.observable((locallyStoredCurrentPage) ? locallyStoredCurrentPage : 1);
        Places.displayedPlaces = ko.computed(function() {
            var PlacesPerPageIndex = (Places.currentPage() - 1) * placesPerPage;
            return Places.filteredPlaces().slice(PlacesPerPageIndex, PlacesPerPageIndex + placesPerPage);
        });

        Places.wasPreviousPlacesRequestEmpty = ko.observable(false);
        Places.messageOnEmptyPlacesRequest = ko.computed(function() {
            return "All " + Places.allPlaces().length + " places are now loaded!";
        });
        Places.messageOnNonEmptyPlacesRequest = ko.computed(function() {
            return Places.allPlaces().length + " places are now loaded";
        });

        Places.isLoadingPlaces = ko.observable(false);
        Places.isNotLoadingPlaces = ko.observable(true);

        Places.shouldShowErrorOnLoadingPlaces = ko.observable(false);

        Places.createMapMarkersForPlaces = createMapMarker;
        Places.loadMorePlaces = function(displayHandlers) {
            displayHandlers.hideMarkersAndWindow();
            Places.isLoadingPlaces(true);
            Places.shouldShowErrorOnLoadingPlaces(false);
            Places.isNotLoadingPlaces(false);
            $.get("https://api.foursquare.com/v2/venues/explore?near=Quebec%20City,Quebec,Canada&" +
                    "client_id=CW3HGKGG2HTIVZQXJPVSKHHKQJNMLFSVQLOOZAJPZVMJRCCX&" +
                    "client_secret=NANZNGFDV4NIVPASVTNUKTFAI3TXIOS5TWMZHCFQBVOLWCNK&lang=en&limit=50&offset=" +
                    Places.currentNumberOfPlaces() + "&v=" + getYMD(),
                    function(data) {
                        //convert the data in places objects
                        var nonConvertedNewPlaces = data.response.groups[0].items;
                        if (nonConvertedNewPlaces.length > 0) {
                            Places.wasPreviousPlacesRequestEmpty(false);
                            var newPlaces = convertFourSquarePlaces(nonConvertedNewPlaces);
                            newPlaces.forEach(function(place, index) {
                                Places.createMapMarkersForPlaces(place);
                                place.marker.setVisible(false);
                            });
                            Places.allPlaces(sortConvertedPlacesByPopularityIndex(Places.allPlaces().concat(newPlaces)));
                            map.setCenter({
                                lat: 46.8246665,
                                lng: -71.253089
                            });
                            map.setZoom(12);

                            google.maps.event.clearListeners(map, 'click');
                            google.maps.event.addListener(map, 'click', function(event) {
                                var places = Places.allPlaces();
                                for (var i = 0; i < places.length; i++) {
                                    if (!previousPlaceSelected) break;
                                    if (places[i].marker.getIcon().url.match("green")) {
                                        places[i].infoWindow.close();
                                        places[i].marker.setIcon(redpin);
                                        break;
                                    }
                                }
                            });
                            Places.isNotLoadingPlaces(true);
                        } else {
                            Places.wasPreviousPlacesRequestEmpty(true);
                            Places.isNotLoadingPlaces(false);
                        }
                        displayHandlers.resetCurrentPage();
                        displayHandlers.displayMarkers();
                        Places.isLoadingPlaces(false);
                        Places.shouldShowErrorOnLoadingPlaces(false);
                    })
                .fail(function() {
                    Places.wasPreviousPlacesRequestEmpty(false);
                    Places.shouldShowErrorOnLoadingPlaces(true);
                    Places.isLoadingPlaces(false);
                });
        };

        Places.shouldDisplayPlaces = ko.computed(function() {
            return Places.filteredPlaces().length > 0;
        });
        Places.shouldDisplayNoPlaces = ko.computed(function() {
            return Places.filteredPlaces().length < 1;
        });



        //initiate display of markers here
        Places.displayedPlaces().forEach(function(place, index, array) {
            place.marker.setVisible(true);
        });



        //data persisting method
        //will be declared when the Places constructor is instantiated
        var placesReturned = [],
            currentplace = {},
            allPlacesLite;

        //Here, we need to remove the marker and infoWindow property of the place objects, otherwise
        //we won't be able to store them in localStorage
        var placesToBeStored = function() {
            allPlacesLite = (function() {
                Places.allPlaces().forEach(function(place) {
                    for (var key in place) {
                        if (key !== "marker" && key !== "infoWindow") currentplace[key] = place[key];
                    }
                    placesReturned.push(currentplace);
                    currentplace = {};
                });
                return placesReturned;
            })();
            placesReturned = [];
            return allPlacesLite;
        };
        //register change to the app state every 5 seconds in localStorage
        setInterval(function() {
            localforage.setItem('QApp', {
                "places": placesToBeStored(),
                "currentPage": Places.currentPage().toString(),
                "lastVisitDate": getYMD(),
                "lastSearchInput": Places.placesFilterVal()
            });
        }, 5000);
    }
    /*DisplayHandlers constructor -
     * will contain all the methods useful to manipulate what is in the side nav bar
     */
    function DisplayHandlers(Places) {
        var DisplayHandlers = this;
        DisplayHandlers.places = new Places();
        DisplayHandlers.shouldEnableNext = ko.computed(function() {
            if (DisplayHandlers.places.currentPage() < DisplayHandlers.places.numberOfPages()) {
                if ($nextButtonBottom.hasClass('disabled')) {
                    $nextButtonBottom.removeClass('disabled');
                    $nextButtonTop.removeClass('disabled');
                }
            } else {
                $nextButtonBottom.addClass('disabled');
                $nextButtonTop.addClass('disabled');
            }
            return DisplayHandlers.places.currentPage() < DisplayHandlers.places.numberOfPages();
        });
        DisplayHandlers.shouldEnableBack = ko.computed(function() {
            if (DisplayHandlers.places.currentPage() > 1) {
                if ($previousButtonBottom.hasClass('disabled')) {
                    $previousButtonBottom.removeClass('disabled');
                    $previousButtonTop.removeClass('disabled');
                }
            } else {
                $previousButtonBottom.addClass('disabled');
                $previousButtonTop.addClass('disabled');
            }
            return DisplayHandlers.places.currentPage() > 1;
        });
        DisplayHandlers.hideMarkersAndWindow = function() {
            if (previousPlaceSelected) {
                previousPlaceSelected.infoWindow.close();
                previousPlaceSelected.marker.setIcon(redpin);
            }
            DisplayHandlers.places.allPlaces().forEach(function(place) {
                place.marker.setVisible(false);
            });
        };
        DisplayHandlers.displayMarkers = function() {
            DisplayHandlers.places.displayedPlaces().forEach(function(place) {
                place.marker.setVisible(true);
            });
        };
        DisplayHandlers.resetCurrentPage = function() {
            DisplayHandlers.places.currentPage(1);
        };
        DisplayHandlers.incrementPage = function() {
            map.setCenter({
                lat: 46.8246665,
                lng: -71.253089
            });
            map.setZoom(12);
            DisplayHandlers.hideMarkersAndWindow();
            DisplayHandlers.places.currentPage(DisplayHandlers.places.currentPage() + 1);
            DisplayHandlers.displayMarkers();
        };
        DisplayHandlers.decrementPage = function() {
            map.setCenter({
                lat: 46.8246665,
                lng: -71.253089
            });
            map.setZoom(12);
            DisplayHandlers.hideMarkersAndWindow();
            DisplayHandlers.places.currentPage(DisplayHandlers.places.currentPage() - 1);
            DisplayHandlers.displayMarkers();
        };
        DisplayHandlers.toggleMarkerAnimation = toggleMarkerAnimation;
    }

    //get current date in yyyymmdd format - thanks to Pierre Guilbert and Glen Selle at http://stackoverflow.com/a/16714931/6590871
    function getYMD() {
        var rightNow = new Date();
        return rightNow.toISOString().slice(0, 10).replace(/-/g, "");
    }

    //METHOD ON REFRESH AND RELOADING PAGES FOR DATA PERSISTENCE
    var locallyStoredPlaces = false,
        locallyStoredCurrentPage = false,
        locallyStoredInput = false;
    localforage.getItem('QApp', function(err, value) {
        if (err || !value || (parseInt(getYMD()) - parseInt(value.lastVisitDate)) > 0) {
            console.log("There was a problem while retrieving localStorage data");
            $.get("https://api.foursquare.com/v2/venues/explore?near=Quebec%20City,Quebec,Canada&client_id=CW3HGKGG2HTIVZQXJPVSKHHKQJNMLFSVQLOOZAJPZVMJRCCX&client_secret=NANZNGFDV4NIVPASVTNUKTFAI3TXIOS5TWMZHCFQBVOLWCNK&lang=en&limit=50&offset=0&v=" + getYMD(), fourSquareCallback)
                .fail(fourSquareError);
        } 
        else {
            //keep the stored data only for one day, otherwise make a new request to the fourSquare API
            locallyStoredPlaces = value.places;
            locallyStoredCurrentPage = parseInt(value.currentPage);
            locallyStoredInput = value.lastSearchInput;
            var visiblePlacesIndexStart = (locallyStoredCurrentPage - 1) * 10;
            var visiblePlacesIndexEnd = visiblePlacesIndexStart + 9;
            locallyStoredPlaces.forEach(function(value, index) {
                createMapMarker(value);
                value.marker.setVisible(false);
            });

            var QApp = new Q(Location, Places, DisplayHandlers);
            ko.applyBindings(QApp);

            google.maps.event.addListener(map, "click", function(event) {
                for (var i = 0; i < locallyStoredPlaces.length; i++) {
                    if (!previousPlaceSelected) break;
                    if (locallyStoredPlaces[i].marker.getIcon().url.match("green")) {
                        locallyStoredPlaces[i].infoWindow.close();
                        locallyStoredPlaces[i].marker.setIcon(redpin);
                        break;
                    }
                }
            });

            $loader.hide();
            $appContainer.show();
            $queryBar.focus();

            //ensuring that the map focus the right way on fast and slow devices
            setTimeout(function() {
                map.setCenter({
                lat: 46.8246665,
                lng: -71.253089
            });
            map.setZoom(12);}, 500);

            setTimeout(function() {
                map.setCenter({
                lat: 46.8246665,
                lng: -71.253089
            });
            map.setZoom(12);}, 2000);
            
            setTimeout(function() {
                map.setCenter({
                lat: 46.8246665,
                lng: -71.253089
            });
            map.setZoom(12);}, 5000);
        }
    });



    function fourSquareCallback(data) {

        places = sortConvertedPlacesByPopularityIndex(convertFourSquarePlaces(data.response.groups[0].items));

        var placesPerPageIndex = placesPerPage - 1;

        places.forEach(function(place, index) {
            createMapMarker(place);
            place.marker.setVisible(false);
        });

        map.setCenter({
            lat: 46.8246665,
            lng: -71.253089
        });
        map.setZoom(12);

        var QApp = new Q(Location, Places, DisplayHandlers);
        ko.applyBindings(QApp);

        google.maps.event.addListener(map, "click", function(event) {
            for (var i = 0; i < places.length; i++) {
                if (!previousPlaceSelected) break;
                if (places[i].marker.getIcon().url.match("green")) {
                    places[i].infoWindow.close();
                    places[i].marker.setIcon(redpin);
                    break;
                }
            }
        });

        $loader.hide();
        $appContainer.show();
        $queryBar.focus();
    }

    function fourSquareError(error) {
        console.log("You got the following error on GET request: " + error.status);
        $loader.html("<div class='btn-flat center-block' onclick='location.reload()'><h4 class='yellow-text text-darken-2 center-align'>OH NO! Something went wrong<br><button class='btn white blue-text' style='margin-top:20px'>refresh page</button></h4></div>");
    }

    // Initialize collapse button
    $buttonCollapse.sideNav({
        menuWidth: 300, // Default is 240
        edge: 'left', // Choose the horizontal origin
        closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
    });
    // Initialize collapsible (uncomment the line below if you use the dropdown variation)
    $buttonCollapse.sideNav('show');

    $showNavButton.click(function() {
        $buttonCollapse.sideNav('show');
    });

    function querySwitchColorAndSize() {
        $queryCard.toggleClass('s8 offset-s2');
        $queryCard.toggleClass('s10 offset-s1');
        $queryCard.toggleClass('z-depth-1');
        $queryCard.toggleClass('z-depth-3');
    }

    $queryBar.focusin(querySwitchColorAndSize);
    $queryBar.focusout(querySwitchColorAndSize);

    $previousButtonBottom.click(function() {
        $sideNav.animate({
            scrollTop: 0
        }, "fast");
    });
    $nextButtonBottom.click(function() {
        $sideNav.animate({
            scrollTop: 0
        }, "fast");
    });


    $showNavButton.click(function() {
        $queryBar.focus();
    });

})();
