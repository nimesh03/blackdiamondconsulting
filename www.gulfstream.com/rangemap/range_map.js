var DEBUG = 0;
var planeCount = 0;

var disclaimers = {
    G700: {
        normal: "6",
        long: "1"
    },
    G650ER: {
        normal: "7",
        long: "2"
    },
    G600: {
        normal: "7",
        long: "2"
    },
    G500: {
        normal: "8",
        long: "3"
    },
    G550: {
        normal: "9",
        long: "4"
    },
    G280: {
        normal: "10",
        long: "5"
    }
};

function debug(msg) {
    if (DEBUG) {
        console.log(msg);
    }
}
var lang = $("html").attr("lang");
var specTrans = window._DATA.rangemap.specs;

function Airport(data, rs) {
    data = data ? data : {};
    this.name = data["name"];
    this.code = data["code"];
    this.lat = data["lat"];
    this.lon = data["lon"];

    this.rs = rs;
    this.infoWindow = new google.maps.InfoWindow();
    this.infoWindow.setContent("<span style=\"font-family: 'Horizon Light', helvetica, arial, sans-serif;\">" + this.name[lang] + "</span>");
}

Airport.prototype = {
    point: function () {
        if (!this._point) {
            this._point = new google.maps.LatLng(this.lat, this.lon);
        }
        return this._point;
    },

    marker: function () {
        if (!this._marker) {
            this._marker = new google.maps.Marker({
                position: this.point(),
                clickable: true,
                icon: this.inactive_icon(),
                // tooltip: this.name
            });

            this._marker.name = this.code;
            google.maps.event.addListener(
                this._marker,
                "click",
                function () {
                    rs.click_airport(this.code);
                    $(".city_select option[value=" + this.code + "]").attr("selected", "selected");
                    this.infoWindow.open(map, this._marker);
                }.bind(this)
            );

            google.maps.event.addListener(
                this._marker,
                "mouseover",
                function () {
                    if (this.rs.active_code != this.code) {
                        this.infoWindow.open(map, this._marker);
                    }
                }.bind(this)
            );

            google.maps.event.addListener(
                this._marker,
                "mouseout",
                function () {
                    if (this.rs.active_code != this.code) {
                        this.infoWindow.close();
                    }
                }.bind(this)
            );
        }
        return this._marker;
    },

    addToMap: function (map) {
        this.marker().setMap(map);
    },

    marker_click: function () {
        //
    },

    show_plane: function (plane_name, which_cruise) {
        // if the route isn't already setup, do that now
        if (!this.routes[which_cruise][plane_name]) {
            var plane = this.rs.planes[plane_name];
            var tmp = [];
            var airport_data = plane.airport_data[this.code][which_cruise];
            for (var i = 0; i < airport_data.length; i++) {
                tmp[i] = new google.maps.LatLng(airport_data[i][0], airport_data[i][1]);
            }
            var foo = new google.maps.Polyline({
                path: tmp,
                strokeColor: this.color,
                strokeOpacity: 0.8,
                strokeWeight: 1,
                //fillColor: '#FF0000',
                //fillOpacity: 0.35
            });

            this.routes[which_cruise][plane_name] = foo;
        }
        this.routes[which_cruise][plane_name].setMap(this.rs.map);
    },

    set_active_icon: function () {
        if (this._marker) {
            this._marker.setIcon(this.active_icon());
        }
    },

    set_inactive_icon: function () {
        if (this._marker) {
            this._marker.setIcon(this.inactive_icon());
        }
    },

    active_icon: function () {
        return {
            url: "/rangemap/assets/images/map-marker-on.png",
            size: new google.maps.Size(13, 13),
            scaledSize: new google.maps.Size(13, 13),
        };
        if (!this._active_icon) {
            this._active_icon = this._create_icon("00FF00");
        }
        return this._active_icon;
    },

    inactive_icon: function () {
        return {
            url: "/rangemap/assets/images/map-marker-off.png",
            size: new google.maps.Size(13, 13),
            scaledSize: new google.maps.Size(13, 13),
        };
        if (!this._inactive_icon) {
            this._inactive_icon = this._create_icon("FE7569");
        }
        return this._inactive_icon;
    },

    _create_icon: function (color) {
        return new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=|" + color, new google.maps.Point(0, 0), new google.maps.Point(0, 0));
    },
};

function Plane(data) {
    data = data ? data : {};
    this.name = data["name"];
    this.active = false;
    this.airport_data = data["airports"];
    this.airports = {};
    this.routes = {
        long: {},
        normal: {},
    };
    this.distance = data["distance"];

    if (data["color"]) {
        this.color = data["color"];
    } else {
        this.color = "#FF0000";
    }
}

Plane.prototype = {
    addToMap: function (elem) {
        var planeRow = $('<span class="plane_row"></span>');
        var planeStr = '<div class="plane_list" data-name="' + this.name + '"><div class="plane_button"></div><div class="plane_name">' + this.name + '</div><div data-section="plane stats"><div data-name="' + this.name + '" class="normal cruise_indicator">' + (specTrans[this.name] ? specTrans[this.name][lang].normal.replace(/,\s/, "<br/>") : this.distance.normal.replace(/Mach/, "<br/>Mach")) + "<sup>" + disclaimers[this.name].normal + '</sup></div><div data-name="' + this.name + '" class="long cruise_indicator">' + (specTrans[this.name] ? specTrans[this.name][lang].long.replace(/,\s/, "<br/>") : this.distance.long.replace(/Mach/, "<br/>Mach")) + "<sup>" + disclaimers[this.name].long + "</sup></div></div></div>";
        planeCount = planeCount < _PLANES.length ? planeCount + 1 : 1;
        if (planeCount === 1 || (planeCount - 1) % 3 === 0) {
            elem.append(planeRow);
        }
        elem.find(".plane_row")
            .last()
            .append(planeStr);
    },
    show_route: function (airport_code, which_cruise, map) {
        debug("show_route(" + airport_code + ", " + which_cruise + ", " + map + ")");
        // if the route isn't already setup, do that now
        if (!this.routes[which_cruise][airport_code]) {
            debug("setting up route " + airport_code + ", " + which_cruise);
            var tmp = [];
            var tmp2 = [];
            if (this.airport_data[airport_code]) {
                var airport_data = this.airport_data[airport_code][which_cruise];
                var flip = false;

                if (airport_data[0] == "flip") {
                    airport_data.shift();
                    flip = true;
                }

                for (var i = 0; i < airport_data.length; i++) {
                    tmp.push(new google.maps.LatLng(airport_data[i][0], airport_data[i][1]));
                }

                tmp.push(tmp[0]);

                var entireWorld = [new google.maps.LatLng(-90, -180, true), new google.maps.LatLng(-90, -60, true), new google.maps.LatLng(-90, 60, true), new google.maps.LatLng(-90, 180, true), new google.maps.LatLng(90, 180, true), new google.maps.LatLng(90, 60, true), new google.maps.LatLng(90, -60, true), new google.maps.LatLng(90, -180, true)];

                this.routes[which_cruise][airport_code] = [
                    // one for filling unreachable area of world
                    new google.maps.Polygon({
                        paths: [entireWorld, tmp],
                        strokeColor: this.color,
                        strokeOpacity: 0,
                        strokeWeight: 1,
                        fillColor: "#000000",
                        fillOpacity: 0.1,
                    }),
                    // one for showing the stroke of the line separating dark from light
                    // if we don't split them up, it draws the strokes over the meridian
                    new google.maps.Polygon({
                        paths: [tmp],
                        strokeColor: this.color,
                        strokeOpacity: 0.8,
                        strokeWeight: 1,
                        fillColor: this.color,
                        fillOpacity: 0,
                    }),
                ];

                // need to flip the polygon for routes that can cross the south pole
                if (flip) {
                    this.routes[which_cruise][airport_code][0] = new google.maps.Polygon({
                        paths: [tmp],
                        strokeColor: this.color,
                        strokeOpacity: 0,
                        strokeWeight: 1,
                        fillColor: "#000000",
                        fillOpacity: 0.2,
                    });
                }
            } else {
                debug("****** No airport data for " + this.name + ": " + airport_code + ", " + which_cruise);
            }
        }
        if (this.routes[which_cruise] && this.routes[which_cruise][airport_code]) {
            this.routes[which_cruise][airport_code][0].setMap(map);
            this.routes[which_cruise][airport_code][1].setMap(map);
        }
    },

    hide_route: function (airport_code, which_cruise) {
        if (this.routes[which_cruise][airport_code]) {
            this.routes[which_cruise][airport_code][0].setMap(null);
            this.routes[which_cruise][airport_code][1].setMap(null);
        }
    },
};

function RangeMapManager(options) {
    options = options ? options : {};
    this.map = options.map;
    this.plane_list = options.plane_list;
    this.active_code = null;
    this.active_cruise = $(".speed_select option:selected").data("name");

    if (options.airports) {
        this.setup_airports(options.airports);
    }

    if (options.planes) {
        this.planes = {};
        this.setup_planes(options.planes);
    }
}

RangeMapManager.prototype = {
    setup_airports: function (airport_data) {
        this.airports = {};
        for (var i = 0; i < airport_data.length; i++) {
            var bar = airport_data[i];
            var tmp = new Airport(bar, this);
            if (this.map) {
                tmp.addToMap(this.map);
            }
            this.airports[bar.code] = tmp;
        }
    },

    setup_planes: function (plane_data) {
        for (var i = 0; i < plane_data.length; i++) {
            var tmp = new Plane(plane_data[i]);
            if (this.plane_list) {
                tmp.addToMap(this.plane_list);
            }

            this.planes[tmp.name] = tmp;
        }
    },

    click_plane: function (target) {
        var target = $(target);
        if (!target.hasClass("plane_list")) {
            target = target.parent(".plane_list");
        }
        var aCode = target.data("name");
        if (!aCode) {
            return false;
        }
        if (target.hasClass("selected")) {
            target.removeClass("selected");
            target.find(".plane_button").css({ border: "none", boxShadow: "none" });
            this.hide_plane_route(aCode);
        } else {
            target.addClass("selected");
            target.find(".plane_button").css({ border: "1px solid #adadad", boxShadow: "0 0 0 2pt " + rs.planes[aCode].color });
            this.show_plane_route(aCode);
        }
    },

    click_airport: function (code) {
        // If this is the first click we can now hide
        // the prompt to select an airport
        if (this.active_code === null) {
            $("#select_airport").fadeOut("fast");
        }
        if (this.active_code != code) {
            // unselect current
            this.set_inactive_icon();

            // turn off current routes
            this.turn_off_all();

            // set active code
            this.active_code = code;
            // change icon
            this.set_active_icon();

            // turn on new routes
            this.turn_on_all();
        }
    },

    click_cruise: function (t) {
        var target = $(t);
        var clicked = $(target).data("name");
        if (clicked != this.active_cruise) {
            this.turn_off_all();
            this.active_cruise = clicked;
            $(".cruise_indicator").hide();
            $(".cruise_indicator." + clicked).show();
            target.addClass("selected");
            this.turn_on_all();
        }
    },

    set_active_icon: function () {
        if (this.active_code) {
            this.airports[this.active_code].set_active_icon();
            this.airports[this.active_code].infoWindow.open(map, this._marker);
            var width = $(window).width();
            map.setZoom(width < 501 ? 1 : width > 500 && width < 1000 ? 2 : 3);
            // reset zoom if a new airport is selected
        }
    },

    set_inactive_icon: function () {
        if (this.active_code) {
            this.airports[this.active_code].set_inactive_icon();
            this.airports[this.active_code].infoWindow.close();
        }
    },

    show_plane_route: function (plane_name) {
        debug("show_plane_route: " + plane_name);
        if (this.active_code) {
            this.planes[plane_name].show_route(this.active_code, this.active_cruise, this.map);
        }
    },

    hide_plane_route: function (plane_name) {
        debug("hide_plane_route: " + plane_name);
        if (this.active_code) {
            this.planes[plane_name].hide_route(this.active_code, this.active_cruise);
        }
    },

    turn_off_all: function () {
        $(".plane_list.selected").each(function (i, x) {
            rs.hide_plane_route($(x).data("name"));
        });
    },

    turn_on_all: function () {
        $(".plane_list.selected").each(function (i, x) {
            rs.show_plane_route($(x).data("name"));
        });
    },
};

// ------------------------------------
// Build map experience
// ------------------------------------

var map;
function initialize() {
    var styles = [
        {
            elementType: "labels",
            stylers: [{ visibility: "off" }],
        },
        {
            elementType: "geometry.stroke",
            stylers: [{ visibility: "on" }],
        },
        {
            featureType: "landscape",
            elementType: "geometry.fill",
            stylers: [{ visibility: "on" }, { color: "#cccccc" }],
        },
        {
            stylers: [{ saturation: -100 }],
        },
        {
            featureType: "water",
            elementType: "geometry.fill",
            stylers: [{ color: "#eeeeee" }],
        },
    ];

    var styledMap = new google.maps.StyledMapType(styles, { name: "Styled Map" });
    var width = $(window).width();
    var mapOptions = {
        center: new google.maps.LatLng(22.167, 6.503),
        zoom: width < 501 ? 1 : width > 500 && width < 1000 ? 2 : 3,
        disableDefaultUI: true,
        panControl: true,
        zoomControl: false,
        scrollwheel: false,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        overviewMapControl: false,
        mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.ROADMAP, "map_style"],
        },
    };

    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

    map.mapTypes.set("map_style", styledMap);
    map.setMapTypeId("map_style");

    rs = new RangeMapManager({
        map: map,
        airports: _AIRPORTS,
        planes: _PLANES,
        plane_list: $("#plane_list"),
    });

    $(".cruise_indicator").hide();
    // initially hide all range and speed stats

    $(".cruise_indicator." + rs.active_cruise).show();

    $(".plane_list").click(function (e) {
        e.preventDefault();
        rs.click_plane(e.target);
    });

    $("#range_map_controls .city_select").on("change", function (e) {
        new google.maps.event.trigger(rs.airports[$(this).val()]._marker, "click");
    });

    $("#range_map_controls .speed_select").on("change", function (e) {
        rs.click_cruise($(this).find("option:selected"));
    });

    $("#range_map_controls .speed_select, #range_map_controls .city_select").trigger("change");
    $("#aircraft_list .plane_row:first-child .plane_list:first-child").trigger("click");
}

google.maps.event.addDomListener(window, "load", initialize);

$(window).on("resize", function () {
    var width = $(window).width();
    var zoom = rs.map.zoom;
    if (width > 500 && width < 1000 && zoom != 2) {
        rs.map.setZoom(2);
    } else if (width < 501 && zoom != 1) {
        rs.map.setZoom(1);
    } else if (width > 999 && zoom != 3) {
        rs.map.setZoom(3);
    }
});
