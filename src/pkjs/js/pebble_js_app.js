// force la météo sur l'émulateur
var m_b_Debug = false;


var myGoogleAPIKey = '';

var phone_bat = 100;


function windBearing(wind) {
  if ((wind >= 337) || (wind < 22))
    return "N";
  if ((wind >= 22) && (wind < 67))
    return "NE";
  if ((wind >= 67) && (wind < 112))
    return "E";
  if ((wind >= 112) && (wind < 157))
    return "SE";
  if ((wind >= 157) && (wind < 202))
    return "S";
  if ((wind >= 202) && (wind < 247))
    return "SW";
  if ((wind >= 247) && (wind < 292))
    return "W";
  if ((wind >= 292) && (wind < 337))
    return "NW";

  return "?";
}


var xhrRequest = function (url, type, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    callback(this.responseText);
  };
  xhr.open(type, url);
  xhr.send();
};

function getForecast_owm(url, url2) {
  var tmax;
  var tmin;
  var temp1;
  var temp2;
  var temp3;
  var temp4;
  var temp5;

  var h1;
  var h2;
  var h3;
  var hour0;
  var hour1;
  var hour2;
  var hour3;
  var rain1;
  var rain2;
  var rain3;
  var rain4;
  var rain5;
  var icon1;
  var icon2;
  var icon3;
  var wind1;
  var wind2;
  var wind3;

  // Forecasting data


  // console.log("owm mode " + url2);


  // Send request to OpenWeatherMap



  xhrRequest(url2, 'GET',
    function (responseText) {

      // responseText contains a JSON object with weather info
      // console.log("5");
      var responseFixed = responseText.replace(/3h/g, "hh");
      //   console.log("6");
      var json2 = JSON.parse(responseFixed);
      // console.log("json2 is " + JSON.stringify(json2));


      var t = json2.list[0].main.temp;
      tmax = t;
      tmin = t;

      for (var i = 1; i < 12; i++) {
        if (json2.list[i].main.temp > tmax)
          tmax = json2.list[i].main.temp;
        if (json2.list[i].main.temp < tmin)
          tmin = json2.list[i].main.temp;
      }

      temp1 = Math.round(json2.list[0].main.temp);
      //  console.log("temp1 " + temp1);
      temp2 = Math.round(json2.list[1].main.temp);
      temp3 = Math.round(json2.list[2].main.temp);
      temp4 = Math.round(json2.list[3].main.temp);
      temp5 = Math.round(json2.list[4].main.temp);


      h1 = json2.list[1].dt;
      h2 = json2.list[2].dt;
      h3 = json2.list[3].dt;


      var date1 = new Date(h1 * 1000);
      var date2 = new Date(h2 * 1000);
      var date3 = new Date(h3 * 1000);


      hour1 = date1.getHours() + "";
      hour2 = date2.getHours() + "";
      hour3 = date3.getHours() + "";
      //  console.log("hour1 " + hour1);
      icon1 = json2.list[1].weather[0].icon;
      icon2 = json2.list[2].weather[0].icon;
      icon3 = json2.list[3].weather[0].icon;

      if (json2.list[0].rain === undefined) {
        rain1 = 0;
      }
      else {
        rain1 = json2.list[0].rain.hh;
        if (rain1 > -666)
          rain1 = Math.round(rain1 * 10);
        else {
          rain1 = 0;
        }
      }

      if (json2.list[1].rain === undefined) {
        rain2 = 0;
      }
      else {
        rain2 = json2.list[1].rain.hh;
        if (rain2 > -666)
          rain2 = Math.round(rain2 * 10);
        else {

          rain2 = 0;
        }
      }
      if (json2.list[2].rain === undefined) {
        rain3 = 0;
      }
      else {
        rain3 = json2.list[2].rain.hh;
        if (rain3 > -666)
          rain3 = Math.round(rain3 * 10);
        else {

          rain3 = 0;
        }
      }
      if (json2.list[3].rain === undefined) {
        rain4 = 0;
      }
      else {
        rain4 = json2.list[3].rain.hh;
        if (rain4 > -666)
          rain4 = Math.round(rain4 * 10);
        else {

          rain4 = 0;
        }
      }
      if (json2.list[4].rain === undefined) {
        rain5 = 0;
      }
      else {
        rain5 = json2.list[4].rain.hh;
        if (rain5 > -666)
          rain5 = Math.round(rain5 * 10);
        else {

          rain5 = 0;
        }
      }

      var units = localStorage.getItem(152);

      if (units == 1) {
        wind1 = Math.round((json2.list[1].wind.speed) / 2 * 3.6);
        wind2 = Math.round((json2.list[2].wind.speed) / 2 * 3.6);
        wind3 = Math.round((json2.list[3].wind.speed) / 2 * 3.6);

      }
      else {
        wind1 = Math.round(json2.list[1].wind.speed * 3.6);
        wind2 = Math.round(json2.list[2].wind.speed * 3.6);
        wind3 = Math.round(json2.list[3].wind.speed * 3.6);

      }

      tmax = Math.round(tmax);
      tmin = Math.round(tmin);
      //console.log("tmax est " + tmax);

      // console.log("url is " + url);
      // Send request to OpenWeatherMap
      xhrRequest(url, 'GET',
        function (responseText) {
          // responseText contains a JSON object with weather info
          var json = JSON.parse(responseText);

          var location = json.name;

          var temperature;


          temperature = Math.round(json.main.temp);





          var wind = Math.round(json.wind.speed);




          var sunrise = json.sys.sunrise;

          var sunset = json.sys.sunset;


          var dsunrise = new Date(sunrise * 1000);
          var dsunset = new Date(sunset * 1000);
          var sunrise_hours = dsunrise.getHours();
          var sunrise_minutes = "0" + dsunrise.getMinutes();
          var sunset_hours = dsunset.getHours();
          var sunset_minutes = "0" + dsunset.getMinutes();


          var icon = json.weather[0].icon;

          // testenvoi layer
          // Assemble dictionary using our keys
          var dictionary = {
            "KEY_TEMPERATURE": temperature,

            "KEY_WIND_SPEED": wind,
            "KEY_ICON": icon,

            "KEY_TMIN": tmin,
            "KEY_TMAX": tmax,


            "KEY_FORECAST_H1": hour1,
            "KEY_FORECAST_H2": hour2,
            "KEY_FORECAST_H3": hour3,
            "KEY_FORECAST_WIND1": wind1,
            "KEY_FORECAST_WIND2": wind2,
            "KEY_FORECAST_WIND3": wind3,


            "KEY_FORECAST_TEMP1": temp1,
            "KEY_FORECAST_TEMP2": temp2,
            "KEY_FORECAST_TEMP3": temp3,
            "KEY_FORECAST_TEMP4": temp4,
            "KEY_FORECAST_TEMP5": temp5,

            "KEY_FORECAST_RAIN1": rain1,
            "KEY_FORECAST_RAIN2": rain2,
            "KEY_FORECAST_RAIN3": rain3,
            "KEY_FORECAST_RAIN4": rain4,

            "KEY_FORECAST_ICON1": icon1,
            "KEY_FORECAST_ICON2": icon2,
            "KEY_FORECAST_ICON3": icon3,

            "KEY_LOCATION": location,

          };

          // Send to Pebble
          Pebble.sendAppMessage(dictionary,
            function (e) {
              //  console.log("Weather info sent to Pebble successfully!");
            },
            function (e) {
              //  console.log("Error sending weather info to Pebble!");
            }
          );
        }
      );
    }
  );

}

function getForecast_wu() {

  var tmax;
  var tmin;
  var temp1;
  var temp2;
  var temp3;
  var temp4;
  var temp5;

  var h1;
  var h2;
  var h3;

  var hour1;
  var hour2;
  var hour3;

  var rain1;
  var rain2;
  var rain3;
  var rain4;
  var rain5;


  var icon1;
  var icon2;
  var icon3;

  var wind1;
  var wind2;
  var wind3;


  var coordinates = localStorage.getItem(156);
  var units = localStorage.getItem(152);

  var humidity;

  var units_s;
  if (units == 1) {
    units_s = "us";
  }
  else {
    units_s = "ca";
  }
  // Send request to forecast



  var api_key;
  api_key = '';




  var url = 'https://api.forecast.io/forecast/' + api_key + '/' + coordinates + '?units=' + units_s;
  // console.log("url forecast.io "+url);

  url = url.replace(/"/g, "");
  xhrRequest(url, 'GET',
    function (responseText) {
      //       console.log("responseText");
      var units_t;
      var location = localStorage.getItem(154);
      var graph = localStorage.getItem(155);

      var json = JSON.parse(responseText);



      // responseText contains a JSON object with weather info

      tmax = Math.round(json.daily.data[0].temperatureMax);
      tmin = Math.round(json.daily.data[0].temperatureMin);

      //    console.log("tmax " +tmax);

      //    console.log("tmin  " +tmin);

      temp1 = Math.round(json.hourly.data[0].temperature);
      temp2 = Math.round(json.hourly.data[3].temperature);
      temp3 = Math.round(json.hourly.data[6].temperature);
      temp4 = Math.round(json.hourly.data[9].temperature);
      temp5 = Math.round(json.hourly.data[12].temperature);



      h1 = json.hourly.data[3].time;
      h2 = json.hourly.data[6].time;
      h3 = json.hourly.data[9].time;



      a = new Date((h1) * 1000);
      hour1 = a.getHours() + "";

      a = new Date((h2) * 1000);
      hour2 = a.getHours() + "";

      a = new Date((h3) * 1000);
      hour3 = a.getHours() + "";

      //     console.log("hours "+hour1+" "+hour2+" "+hour3+" ");


      if (units == 1) {
        wind1 = Math.round(json.hourly.data[3].windSpeed * 1.55);
        wind2 = Math.round(json.hourly.data[6].windSpeed * 1.55);
        wind3 = Math.round(json.hourly.data[9].windSpeed * 1.55);

      }
      else {

        wind1 = Math.round(json.hourly.data[3].windSpeed);
        wind2 = Math.round(json.hourly.data[6].windSpeed);
        wind3 = Math.round(json.hourly.data[9].windSpeed);
      }

      // console.log("json.hourly.data[9].windBearing "+json.hourly.data[9].windBearing);


      icon1 = json.hourly.data[3].icon;
      icon2 = json.hourly.data[6].icon;
      icon3 = json.hourly.data[9].icon;


      rain1 = json.hourly.data[0].precipIntensity * 20;

      rain2 = json.hourly.data[3].precipIntensity * 20;

      rain3 = json.hourly.data[6].precipIntensity * 20;

      rain4 = json.hourly.data[9].precipIntensity * 20;

      rain5 = json.hourly.data[12].precipIntensity * 20;



      if (units == 1) {
        rain1 = Math.round(rain1 * 25.4);

        rain2 = Math.round(rain2 * 25.4);

        rain3 = Math.round(rain3 * 25.4);

        rain4 = Math.round(rain4 * 25.4);

        rain5 = Math.round(rain5 * 25.4);

      }
      // console.log

      var temperature;



      temperature = Math.round(json.currently.temperature);
      humidity = Math.round(json.currently.humidity * 100) + "%";
      //  console.log("json.hourly.data[9].windBearing "+json.hourly.data[9].windBearing);

      var units_w;
      if (units == 1) {
        units_w = "M/H";
      }
      else {
        units_w = "KM/H";
      }
      var wind = Math.round(json.daily.data[0].windSpeed);



      var sunrise = json.daily.data[0].sunriseTime;
      var sunset = json.daily.data[0].sunsetTime;

      var dsunrise = new Date(sunrise * 1000);
      var dsunset = new Date(sunset * 1000);

      var sunrise_hours = dsunrise.getHours();
      var sunrise_minutes = "0" + dsunrise.getMinutes();
      var sunrise_string;
      var sunset_hours = dsunset.getHours();
      var sunset_minutes = "0" + dsunset.getMinutes();
      var sunset_string;
      if (units == 1) {
        if (sunrise_hours > 12) {
          sunrise_hours = sunrise_hours % 12;
          sunrise_string = sunrise_hours + ":" + sunrise_minutes.substr(-2) + "pm";
        }
        else {
          sunrise_string = sunrise_hours + ":" + sunrise_minutes.substr(-2) + "am";
        }

      }
      else {
        sunrise_string = sunrise_hours + ":" + sunrise_minutes.substr(-2);
      }

      if (units == 1) {
        if (sunset_hours > 12) {
          sunset_hours = sunset_hours % 12;
          sunset_string = sunset_hours + ":" + sunset_minutes.substr(-2) + "pm";
        }
        else {
          sunset_string = sunset_hours + ":" + sunset_minutes.substr(-2) + "am";
        }
      }
      else {
        sunset_string = sunset_hours + ":" + sunset_minutes.substr(-2);
      }

      var icon = json.daily.data[0].icon;

      // force int
      graph++;
      graph--;

      // testenvoi layer
      // Assemble dictionary using our keys
      var dictionary = {
        "KEY_TEMPERATURE": temperature,

        "KEY_WIND_SPEED": wind,
        "KEY_ICON": icon,

        "KEY_TMIN": tmin,
        "KEY_TMAX": tmax,


        "KEY_FORECAST_H1": hour1,
        "KEY_FORECAST_H2": hour2,
        "KEY_FORECAST_H3": hour3,
        "KEY_FORECAST_WIND1": wind1,
        "KEY_FORECAST_WIND2": wind2,
        "KEY_FORECAST_WIND3": wind3,


        "KEY_FORECAST_TEMP1": temp1,
        "KEY_FORECAST_TEMP2": temp2,
        "KEY_FORECAST_TEMP3": temp3,
        "KEY_FORECAST_TEMP4": temp4,
        "KEY_FORECAST_TEMP5": temp5,

        "KEY_FORECAST_RAIN1": rain1,
        "KEY_FORECAST_RAIN2": rain2,
        "KEY_FORECAST_RAIN3": rain3,
        "KEY_FORECAST_RAIN4": rain4,

        "KEY_FORECAST_ICON1": icon1,
        "KEY_FORECAST_ICON2": icon2,
        "KEY_FORECAST_ICON3": icon3,

        "KEY_LOCATION": location,


      };


      // Send to Pebble
      Pebble.sendAppMessage(dictionary,
        function (e) {
          //  console.log("Weather info sent to Pebble successfully!");
        },
        function (e) {
          //  console.log("Error sending weather info to Pebble!");
        }
      );
    }
  );
}


function getWeatherCoord() {
  //console.log("getWeatherCoord");
  var location = " ";

  var coordinates = localStorage.getItem(156);
  //console.log("1");
  var urlGoogle = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + coordinates + '&key=' + myGoogleAPIKey;
  //console.log("2");
  //console.log("111");
  urlGoogle = urlGoogle.replace(/"/g, "");
  //console.log("3");
  urlGoogle = urlGoogle.replace(/ /g, "+");
  // console.log("4");
  // console.log("222");
  // console.log('google url: ' + urlGoogle);

  xhrRequest(urlGoogle, 'GET',
    function (responseText) {
      //  console.log("xhrRequest(urlGoogle,");
      var json = JSON.parse(responseText);
      location = json.results[0].formatted_address;
      localStorage.setItem(154, JSON.stringify(location));
      //  console.log('location: ' + location);
      getForecast_wu();
    });

}


function locationSuccess(pos) {
  var units = localStorage.getItem(152);
  var provider = localStorage.getItem(153);
  provider = 1
  //console.log('locationSuccess units: ' + units);
  // console.log('locationSuccess provider: ' + provider);
  var units_s;

  if (units == 1) {
    units_s = "imperial";
  }
  else {
    units_s = "metric";
  }
  var url1;
  var url2;
  if (provider == 1) {

    var myAPIKey = localStorage.getItem(157);
    console.log('myAPIKey: ' + myAPIKey);

    url1 = 'http://api.openweathermap.org/data/2.5/weather?lat=' +
      pos.coords.latitude + '&lon=' + pos.coords.longitude + '&appid=' + myAPIKey + '&units=' + units_s;

    url2 = 'http://api.openweathermap.org/data/2.5/forecast?lat=' +
      pos.coords.latitude + '&lon=' + pos.coords.longitude + '&appid=' + myAPIKey + '&units=' + units_s;
    // console.log('locationSuccess url1: ' + url1);
    //console.log('locationSuccess url2: ' + url2);
    getForecast_owm(url1, url2);
  }

  else {
    //  console.log("locationSuccess");
    var lat = pos.coords.latitude;
    var lng = pos.coords.longitude;
    var coordinates = lat + ',' + lng;

    console.log('forecast.io coordinates: ' + coordinates);
    localStorage.setItem(156, JSON.stringify(coordinates));
    getForecast_wu();
    //    getWeatherCoord();
  }
}

function locationError(err) {
  // console.log("Error requesting location!");
}



function send_url_position() {
  navigator.geolocation.getCurrentPosition(
    locationSuccess,
    locationError,
    { timeout: 15000, maximumAge: 60000 }
  );


}

function getWeatherLocation() {
  // console.log("getWeatherLocation");
  var location;
  if (localStorage.getItem(154) !== null) {
    location = localStorage.getItem(154);
  }
  else {
    location = "Bandol, France";

  }
  var coordinates;
  var urlGoogle = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + location + '&key=' + myGoogleAPIKey;
  //console.log("1111");
  urlGoogle = urlGoogle.replace(/"/g, "");
  urlGoogle = urlGoogle.replace(/ /g, "+");
  // console.log("2222");
  // console.log('google url: ' + urlGoogle);



  xhrRequest(urlGoogle, 'GET',
    function (responseText) {
      //console.log("urlGoogle");

      var json = JSON.parse(responseText);

      location = json.results[0].formatted_address;
      // console.log("3");
      location = location.replace(/"/g, "");
      //  console.log("4");
      var lat = json.results[0].geometry.location.lat;
      var lng = json.results[0].geometry.location.lng;

      coordinates = lat + ',' + lng;
      // Persist write a key with associated value


      localStorage.setItem(156, JSON.stringify(coordinates));
      localStorage.setItem(154, JSON.stringify(location));

      getForecast_wu();
    });
}

function send_url_city() {
  var city = localStorage.getItem(151);
  var units = localStorage.getItem(152);
  var provider = localStorage.getItem(153);


  var units_s;
  if (units == 1) {
    units_s = "imperial";
  }
  else {
    units_s = "metric";
  }
  var url1;
  var url2;
  if (provider == 1) {
    var myAPIKey = localStorage.getItem(157);
    console.log('myAPIKey: ' + myAPIKey);
    url1 = 'http://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=' + myAPIKey + '&units=' + units_s;
    url2 = 'http://api.openweathermap.org/data/2.5/forecast?q=' + city + '&appid=' + myAPIKey + '&units=' + units_s;
    getForecast_owm(url1, url2);
  }
  else {
    getWeatherLocation();
  }

}





function getWeather() {
  //console.log("getWeather !!");
  var gps = localStorage.getItem(150);
  var city = localStorage.getItem(151);
  //console.log("gps !!", gps);
  if ((gps === null || gps == 1 || city == null || city == "undefined")) {
    send_url_position();
  }
  //city string
  else if (localStorage.getItem(150) !== null) {
    send_url_city();
  }

}

// Listen for when the watchface is opened
Pebble.addEventListener('ready',
  function (e) {
    // console.log("avant battery init");
    Battery_Init();

    //console.log("PebbleKit JS ready!");
  }
);



Pebble.addEventListener('appmessage',
  function (e) {
    if ((navigator.onLine) || (m_b_Debug)) {
      //  console.log("Appel météo !!");
      getWeather();
    }
  }
);



Pebble.addEventListener('showConfiguration', function () {
  //var url = 'http://sichroteph.github.io/Ruler-Weather/';
  var url = 'http://sichroteph.github.io/Impact/';

  //  console.log('Showing configuration page: ' + url);
  Pebble.openURL(url);
});





Pebble.addEventListener('webviewclosed', function (e) {
  var configData = JSON.parse(decodeURIComponent(e.response));
  // console.log('Configuration page returned: ' + JSON.stringify(configData));

  var gps = configData['gps'];
  var input_city = configData['input_city'];
  var input_api = configData['input_api'];
  var select_utc = configData['select_utc'];
  var select_goal = configData['select_goal'];
  var select_provider = configData['select_provider'];
  var select_screen = configData['select_screen'];
  var radio_units = configData['radio_units'];
  var radio_refresh = configData['radio_refresh'];
  var toggle_vibration = configData['toggle_vibration'];

  var select_fonts = configData['select_fonts'];
  // console.log(select_fonts);

  var toggle_bt = configData['toggle_bt'];
  var toggle_pc = configData['toggle_pc'];
  var toggle_tg = configData['toggle_tg'];
  var toggle_inv = configData['toggle_inv'];
  var toggle_100 = configData['toggle_100'];
  var toggle_80 = configData['toggle_80'];
  var toggle_centered = configData['toggle_centered'];
  var toggle_month = configData['toggle_month'];


  var toggle_bw_icons = configData['toggle_bw_icons'];
  var toggle_gradiant = configData['toggle_gradiant'];
  var toggle_ruler_large = configData['toggle_ruler_large'];
  var color_right_back = configData['color_right_back'];
  var color_left_back = configData['color_left_back'];
  var color_hours = configData['color_hours'];
  var color_ruler = configData['color_ruler'];
  var color_temperatures = configData['color_temperatures'];
  var color_line = configData['color_line'];
  var color_2nd_back = configData['color_2nd_back'];
  var color_2nd_temp = configData['color_2nd_temp'];


  var dict = {};


  localStorage.setItem(150, configData['gps'] ? 1 : 0);
  localStorage.setItem(151, configData['input_city']);
  localStorage.setItem(152, configData['radio_units'] ? 1 : 0);
  localStorage.setItem(153, configData['select_provider']);
  localStorage.setItem(154, configData['input_city']);
  localStorage.setItem(157, configData['input_api']);



  dict['KEY_GPS'] = configData['gps'] ? 1 : 0;  // Send a boolean as an integer
  dict['KEY_INPUT_CITY'] = configData['input_city'];
  dict['KEY_SELECT_UTC'] = configData['select_utc'];
  dict['KEY_SELECT_GOAL'] = configData['select_goal'];
  dict['KEY_SELECT_SCREEN'] = configData['select_screen'];
  dict['KEY_SELECT_FONTS'] = configData['select_fonts'];

  dict['KEY_SELECT_PROVIDER'] = configData['select_provider'];

  dict['KEY_RADIO_UNITS'] = configData['radio_units'] ? 1 : 0;
  dict['KEY_RADIO_REFRESH'] = configData['radio_refresh'] ? 1 : 0;

  dict['KEY_TOGGLE_VIBRATION'] = configData['toggle_vibration'] ? 1 : 0;

  dict['KEY_TOGGLE_BT'] = configData['toggle_bt'] ? 1 : 0;
  dict['KEY_TOGGLE_PC'] = configData['toggle_pc'] ? 1 : 0;
  dict['KEY_TOGGLE_TG'] = configData['toggle_tg'] ? 1 : 0;
  dict['KEY_TOGGLE_INV'] = configData['toggle_inv'] ? 1 : 0;
  dict['KEY_TOGGLE_100'] = configData['toggle_100'] ? 1 : 0;
  dict['KEY_TOGGLE_80'] = configData['toggle_80'] ? 1 : 0;
  dict['KEY_TOGGLE_BW_ICONS'] = configData['toggle_bw_icons'] ? 1 : 0;
  dict['KEY_TOGGLE_GRADIANT'] = configData['toggle_gradiant'] ? 1 : 0;
  dict['KEY_TOGGLE_RULER_LARGE'] = configData['toggle_ruler_large'] ? 1 : 0;
  dict['KEY_TOGGLE_CENTERED'] = configData['toggle_centered'] ? 1 : 0;
  dict['KEY_TOGGLE_MONTH'] = configData['toggle_month'] ? 1 : 0;

  dict['KEY_COLOR_RIGHT_R'] = parseInt(color_right_back.substring(2, 4), 16);
  dict['KEY_COLOR_RIGHT_G'] = parseInt(color_right_back.substring(4, 6), 16);
  dict['KEY_COLOR_RIGHT_B'] = parseInt(color_right_back.substring(6, 8), 16);
  dict['KEY_COLOR_LEFT_R'] = parseInt(color_left_back.substring(2, 4), 16);
  dict['KEY_COLOR_LEFT_G'] = parseInt(color_left_back.substring(4, 6), 16);
  dict['KEY_COLOR_LEFT_B'] = parseInt(color_left_back.substring(6, 8), 16);


  dict['KEY_COLOR_HOURS_R'] = parseInt(color_hours.substring(2, 4), 16);
  dict['KEY_COLOR_HOURS_G'] = parseInt(color_hours.substring(4, 6), 16);
  dict['KEY_COLOR_HOURS_B'] = parseInt(color_hours.substring(6, 8), 16);

  dict['KEY_COLOR_LINE_R'] = parseInt(color_line.substring(2, 4), 16);
  dict['KEY_COLOR_LINE_G'] = parseInt(color_line.substring(4, 6), 16);
  dict['KEY_COLOR_LINE_B'] = parseInt(color_line.substring(6, 8), 16);


  dict['KEY_COLOR_LINE_R'] = parseInt(color_line.substring(2, 4), 16);
  dict['KEY_COLOR_LINE_G'] = parseInt(color_line.substring(4, 6), 16);
  dict['KEY_COLOR_LINE_B'] = parseInt(color_line.substring(6, 8), 16);

  dict['KEY_COLOR_RULER_R'] = parseInt(color_ruler.substring(2, 4), 16);
  dict['KEY_COLOR_RULER_G'] = parseInt(color_ruler.substring(4, 6), 16);
  dict['KEY_COLOR_RULER_B'] = parseInt(color_ruler.substring(6, 8), 16);


  dict['KEY_COLOR_2ND_BACK_R'] = parseInt(color_2nd_back.substring(2, 4), 16);
  dict['KEY_COLOR_2ND_BACK_G'] = parseInt(color_2nd_back.substring(4, 6), 16);
  dict['KEY_COLOR_2ND_BACK_B'] = parseInt(color_2nd_back.substring(6, 8), 16);


  dict['KEY_COLOR_2ND_TEMP_R'] = parseInt(color_2nd_temp.substring(2, 4), 16);
  dict['KEY_COLOR_2ND_TEMP_G'] = parseInt(color_2nd_temp.substring(4, 6), 16);
  dict['KEY_COLOR_2ND_TEMP_B'] = parseInt(color_2nd_temp.substring(6, 8), 16);

  dict['KEY_COLOR_TEMPERATURES_R'] = parseInt(color_temperatures.substring(2, 4), 16);
  dict['KEY_COLOR_TEMPERATURES_G'] = parseInt(color_temperatures.substring(4, 6), 16);
  dict['KEY_COLOR_TEMPERATURES_B'] = parseInt(color_temperatures.substring(6, 8), 16);



  // Send to watchapp
  Pebble.sendAppMessage(dict, function () {
    // console.log('Send successful: ' + JSON.stringify(dict));
  }, function () {
    // console.log('Send failed!');
  }
  );


});
