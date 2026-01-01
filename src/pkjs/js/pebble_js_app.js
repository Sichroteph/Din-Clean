// force la météo sur l'émulateur
var b_force_internet = false;
var bFakeData = 0;
var bFakePosition = 0;

var myGoogleAPIKey = '';

var phone_bat = 100;

var KEY_CONFIG = 157;
var KEY_LAST_UPDATE = 158;

var bIsImperial;

var currentCity;
var current_Latitude;
var current_Longitude;
var current_Last_update;
var current_dictionary;

var current_page = 0;
var cityIndex = 0;

var API_URL = "https://api.iopool.com/v1/pools";

var poolTemp = 0;
var poolPH = 0;
var poolORP = 0;


function convertMpsToMph(mps) {
  const conversionFactor = 2.23694;
  return Math.round(mps * conversionFactor);
}

function celsiusToFahrenheit(celsius) {
  return Math.round((celsius * 9 / 5) + 32);
}


function SendStatus(status) {
  var dictionary = {
    "KEY_STATUS": status,
  };

  Pebble.sendAppMessage(dictionary, function () {
  }, function () {
  });
}

var xhrRequest = function (url, type, callback) {
  var xhr = new XMLHttpRequest();

  xhr.onload = function () {
    callback(this.responseText);
  };

  xhr.onerror = function (err) {
    console.error('XHR failed', err);
  };

  xhr.open(type, url);
  xhr.send();
};

// Build a small, offline fake forecast so emulator tests work without network.
function buildFakeResponse() {
  var timeseries = [];
  var baseTime = Date.UTC(2024, 11, 16, 9, 0, 0);
  for (var i = 0; i <= 24; i++) {
    timeseries.push({
      time: new Date(baseTime + (i * 3600000)).toISOString(),
      data: {
        instant: {
          details: {
            air_temperature: 12 + (i % 6),
            relative_humidity: 55 + (i % 5),
            wind_speed: 3 + (i % 2),
            wind_from_direction: (90 + (i * 10)) % 360
          }
        },
        next_12_hours: { summary: { symbol_code: "clearsky_day" }, details: {} },
        next_1_hours: { summary: { symbol_code: "clearsky_day" }, details: { precipitation_amount: (i % 3) * 0.1 } },
        next_6_hours: { summary: { symbol_code: "clearsky_day" }, details: { air_temperature_max: 18, air_temperature_min: 10, precipitation_amount: 0 } }
      }
    });
  }

  return JSON.stringify({
    type: "Feature",
    geometry: { type: "Point", coordinates: [2.35, 48.85, 0] },
    properties: {
      meta: { updated_at: "2024-12-16T09:18:24Z" },
      timeseries: timeseries
    }
  });
}

// Shared weather parsing/sending logic.
function processWeatherResponse(responseText) {
  var responseFixed = responseText.replace(/3h/g, "hh");
  var jsonWeather = JSON.parse(responseFixed);

  var units = localStorage.getItem(152);

  var tmin = 1000;
  var tmax = -1000;
  for (var i = 0; i <= 24; i++) {
    var temp = Math.round(jsonWeather.properties.timeseries[i].data.instant.details.air_temperature);
    if (temp < tmin) {
      tmin = temp;
    }
    if (temp > tmax) {
      tmax = temp;
    }
  }

  var rTemperature = Math.round(jsonWeather.properties.timeseries[0].data.instant.details.air_temperature);
  var humidity = Math.round(jsonWeather.properties.timeseries[0].data.instant.details.relative_humidity);

  if (units == 1) {
    rTemperature = celsiusToFahrenheit(rTemperature);
    tmin = celsiusToFahrenheit(tmin);
    tmax = celsiusToFahrenheit(tmax);
  }

  tmax = Math.round(tmax);
  tmin = Math.round(tmin);
  var temperature = Math.round(rTemperature);
  var wind = Math.round(jsonWeather.properties.timeseries[0].data.instant.details.wind_speed);

  if (units == 1) {
    wind = convertMpsToMph(wind);
  }

  if (bFakeData == 1) {
    wind = 666;
    tmin = 20;
    tmax = 10;
    temperature = 28;
    humidity = 50;
  }

  var icon = jsonWeather.properties.timeseries[0].data.next_12_hours.summary.symbol_code;

  var hourlyTemperatures = {
    hour0: 0, hour3: 0, hour6: 0, hour9: 0, hour12: 0, hour15: 0, hour18: 0, hour21: 0, hour24: 0
  };
  var hourly_time = {
    hour0: 0, hour3: 0, hour6: 0, hour9: 0, hour12: 0, hour15: 0, hour18: 0, hour21: 0, hour24: 0
  };
  var hourly_icons = {
    hour0: "", hour3: "", hour6: "", hour9: "", hour12: "", hour15: "", hour18: "", hour21: "", hour24: ""
  };
  var hourlyWind = {
    hour0: "", hour3: "", hour6: "", hour9: "", hour12: "", hour15: "", hour18: "", hour21: "", hour24: ""
  };
  var hourlyRain = {
    hour0: 0, hour1: 0, hour2: 0, hour3: 0, hour4: 0, hour5: 0, hour6: 0, hour7: 0, hour8: 0, hour9: 0,
    hour10: 0, hour11: 0, hour12: 0, hour13: 0, hour14: 0, hour15: 0, hour16: 0, hour17: 0, hour18: 0,
    hour19: 0, hour20: 0, hour21: 0, hour22: 0, hour23: 0
  };

  var units_setting = localStorage.getItem(152);
  for (var j = 0; j <= 24; j++) {
    if ((j % 3) === 0) {
      var utcTimeString = jsonWeather.properties.timeseries[j].time;
      var utcDate = new Date(utcTimeString);
      var offsetMinutes2 = new Date().getTimezoneOffset();
      var localTime = new Date(utcDate.getTime() - (offsetMinutes2 * 60000));
      var localHour = localTime.getHours();
      hourly_time['hour' + j] = localHour;

      var tempI = Math.round(jsonWeather.properties.timeseries[j].data.instant.details.air_temperature);
      if (units_setting == 1) {
        tempI = celsiusToFahrenheit(tempI);
      }
      hourlyTemperatures['hour' + j] = tempI;

      var windSpeedMps = jsonWeather.properties.timeseries[j].data.instant.details.wind_speed;
      var humidityHour = Math.round(jsonWeather.properties.timeseries[j].data.instant.details.relative_humidity);
      var windValue;
      if (units_setting == 1) {
        windValue = convertMpsToMph(windSpeedMps);
      } else {
        windValue = Math.round(windSpeedMps * 3.6);
      }
      hourlyWind['hour' + j] = windValue + "\n";

      if (jsonWeather.properties.timeseries[j].data.next_1_hours && jsonWeather.properties.timeseries[j].data.next_1_hours.summary) {
        hourly_icons['hour' + j] = jsonWeather.properties.timeseries[j].data.next_1_hours.summary.symbol_code;
      } else if (jsonWeather.properties.timeseries[j].data.next_6_hours && jsonWeather.properties.timeseries[j].data.next_6_hours.summary) {
        hourly_icons['hour' + j] = jsonWeather.properties.timeseries[j].data.next_6_hours.summary.symbol_code;
      }
    }

    if (j < 24) {
      if (jsonWeather.properties.timeseries[j].data.next_1_hours && jsonWeather.properties.timeseries[j].data.next_1_hours.details) {
        hourlyRain['hour' + j] = jsonWeather.properties.timeseries[j].data.next_1_hours.details.precipitation_amount;
      }
      hourlyRain['hour' + j] = Math.round(hourlyRain['hour' + j] * 20);
    }
  }

  // --- 3-day forecast data extraction ---
  var day_temps = ["", "", ""];
  var day_icons = ["", "", ""];
  var day_rains = ["", "", ""];
  var day_winds = ["", "", ""];

  // Day offsets: 24h (tomorrow), 48h (day after), 72h (3rd day) - at noon
  var dayOffsets = [24, 48, 72];

  for (var d = 0; d < 3; d++) {
    var idx = dayOffsets[d];
    if (jsonWeather.properties.timeseries.length > idx) {
      var dayData = jsonWeather.properties.timeseries[idx].data;

      // Temperature (use next_6_hours if available for min/max, otherwise instant)
      var dayTemp = 0;
      if (dayData.next_6_hours && dayData.next_6_hours.details) {
        var tMax = dayData.next_6_hours.details.air_temperature_max || dayData.instant.details.air_temperature;
        var tMin = dayData.next_6_hours.details.air_temperature_min || dayData.instant.details.air_temperature;
        dayTemp = Math.round((tMax + tMin) / 2);
      } else {
        dayTemp = Math.round(dayData.instant.details.air_temperature);
      }
      if (units == 1) {
        dayTemp = celsiusToFahrenheit(dayTemp);
      }
      day_temps[d] = dayTemp + "°";

      // Icon
      if (dayData.next_12_hours && dayData.next_12_hours.summary) {
        day_icons[d] = dayData.next_12_hours.summary.symbol_code;
      } else if (dayData.next_6_hours && dayData.next_6_hours.summary) {
        day_icons[d] = dayData.next_6_hours.summary.symbol_code;
      } else if (dayData.next_1_hours && dayData.next_1_hours.summary) {
        day_icons[d] = dayData.next_1_hours.summary.symbol_code;
      }

      // Rain - sum over 6 hours
      var rainSum = 0;
      if (dayData.next_6_hours && dayData.next_6_hours.details && dayData.next_6_hours.details.precipitation_amount) {
        rainSum = dayData.next_6_hours.details.precipitation_amount;
      } else if (dayData.next_1_hours && dayData.next_1_hours.details && dayData.next_1_hours.details.precipitation_amount) {
        rainSum = dayData.next_1_hours.details.precipitation_amount * 6;
      }
      day_rains[d] = Math.round(rainSum) + "mm";

      // Wind
      var dayWind = Math.round(dayData.instant.details.wind_speed * 3.6); // m/s to km/h
      if (units == 1) {
        dayWind = convertMpsToMph(dayData.instant.details.wind_speed);
      }
      day_winds[d] = dayWind + (units == 1 ? "mph" : "km/h");
    }
  }

  var dictionary = {
    "KEY_TEMPERATURE": temperature,
    "KEY_HUMIDITY": humidity,
    "KEY_WIND_SPEED": wind,
    "KEY_ICON": icon,
    "KEY_TMIN": tmin,
    "KEY_TMAX": tmax,
    "KEY_FORECAST_TEMP1": hourlyTemperatures.hour0,
    "KEY_FORECAST_TEMP2": hourlyTemperatures.hour3,
    "KEY_FORECAST_TEMP3": hourlyTemperatures.hour6,
    "KEY_FORECAST_TEMP4": hourlyTemperatures.hour9,
    "KEY_FORECAST_TEMP5": hourlyTemperatures.hour12,
    "KEY_FORECAST_H0": hourly_time.hour0,
    "KEY_FORECAST_H1": hourly_time.hour3,
    "KEY_FORECAST_H2": hourly_time.hour6,
    "KEY_FORECAST_H3": hourly_time.hour9,
    "KEY_FORECAST_WIND0": hourlyWind.hour0,
    "KEY_FORECAST_WIND1": hourlyWind.hour3,
    "KEY_FORECAST_WIND2": hourlyWind.hour6,
    "KEY_FORECAST_WIND3": hourlyWind.hour9,
    "KEY_FORECAST_RAIN1": hourlyRain.hour0,
    "KEY_FORECAST_RAIN11": hourlyRain.hour1,
    "KEY_FORECAST_RAIN12": hourlyRain.hour2,
    "KEY_FORECAST_RAIN2": hourlyRain.hour3,
    "KEY_FORECAST_RAIN21": hourlyRain.hour4,
    "KEY_FORECAST_RAIN22": hourlyRain.hour5,
    "KEY_FORECAST_RAIN3": hourlyRain.hour6,
    "KEY_FORECAST_RAIN31": hourlyRain.hour7,
    "KEY_FORECAST_RAIN32": hourlyRain.hour8,
    "KEY_FORECAST_RAIN4": hourlyRain.hour9,
    "KEY_FORECAST_RAIN41": hourlyRain.hour10,
    "KEY_FORECAST_RAIN42": hourlyRain.hour11,
    "KEY_FORECAST_ICON1": hourly_icons.hour3,
    "KEY_FORECAST_ICON2": hourly_icons.hour6,
    "KEY_FORECAST_ICON3": hourly_icons.hour9,
    "KEY_LOCATION": "",
    "POOLTEMP": poolTemp * 10,
    "POOLPH": poolPH * 100,
    "POOLORP": poolORP,
    "KEY_DAY1_TEMP": day_temps[0],
    "KEY_DAY1_ICON": day_icons[0],
    "KEY_DAY1_RAIN": day_rains[0],
    "KEY_DAY1_WIND": day_winds[0],
    "KEY_DAY2_TEMP": day_temps[1],
    "KEY_DAY2_ICON": day_icons[1],
    "KEY_DAY2_RAIN": day_rains[1],
    "KEY_DAY2_WIND": day_winds[1],
    "KEY_DAY3_TEMP": day_temps[2],
    "KEY_DAY3_ICON": day_icons[2],
    "KEY_DAY3_RAIN": day_rains[2],
    "KEY_DAY3_WIND": day_winds[2],
  };

  Pebble.sendAppMessage(dictionary,
    function () {
      console.log("Weather info sent to Pebble successfully!");
    },
    function () {
      console.log("Error sending weather info to Pebble!");
    }
  );
}

function getIOPoolData() {

  var apiKey = localStorage.getItem(158);

  if (apiKey !== null) {

    var size = apiKey.length;

    if (size == 40) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", API_URL, true);
      xhr.setRequestHeader("x-api-key", apiKey);
      xhr.onload = function () {


        if (xhr.status === 200) {
          try {
            var data = JSON.parse(xhr.responseText);
            if (data && data.length > 0 && data[0].latestMeasure) {
              poolTemp = Math.round(data[0].latestMeasure.temperature);
              poolPH = Math.round(data[0].latestMeasure.ph * 100) / 100;
              poolORP = Math.round(data[0].latestMeasure.orp);
              console.log("poolTemp");
              console.log(poolTemp);
              console.log("poolPH");
              console.log(poolPH);
              console.log("poolORP");
              console.log(poolORP);
              getForecast();
            } else {
              console.error("Données inattendues :", data);
            }
          } catch (e) {
            console.error("Erreur de parsing JSON :", e);
          }
        } else {
          console.error("Erreur HTTP :", xhr.status, xhr.statusText);
        }
      };
      xhr.onerror = function () {
        console.error("Erreur réseau");
      };
      xhr.send();
      console.log("fin");
    }
    else {
      getForecast();
      console.error("API key manquante");
    }

  } else {
    getForecast();
    console.error("API key manquante");
  }
}


function getForecast() {

  console.log("getForecast");

  if (bFakeData == 1) {
    console.log("Using offline fake weather sample");
    processWeatherResponse(buildFakeResponse());
    return;
  }

  var coordinates = 'lat=' + current_Latitude + '&lon=' + current_Longitude;
  var urlWeatherRequest = 'https://api.met.no/weatherapi/locationforecast/2.0/complete?' + coordinates;

  console.log(urlWeatherRequest);

  xhrRequest(urlWeatherRequest, 'GET',
    function (responseText) {
      processWeatherResponse(responseText);
    }
  );

}

function locationSuccess(pos) {

  current_Latitude = pos.coords.latitude;
  current_Longitude = pos.coords.longitude;

  localStorage.setItem(160, current_Latitude);
  localStorage.setItem(161, current_Longitude);

  console.log("location success");
  getIOPoolData();
}


function locationError(err) {
  console.log("Error requesting location!");

  current_Latitude = localStorage.getItem(160);
  current_Longitude = localStorage.getItem(161);
  console.log("GPS data saved");
  console.log(current_Latitude);
  console.log(current_Longitude);

  if (current_Latitude !== null && current_Longitude !== null) {
    const position = {
      coords: {
        latitude: current_Latitude,
        longitude: current_Longitude,
        altitude: null,
        accuracy: 10,
        altitudeAccuracy: null,
        heading: null,
        speed: null
      },
      timestamp: 1692448765123
    };
    locationSuccess(position);
  }

}


function getPosition() {

  console.log("Get position");
  if (bFakePosition == 0) {
    navigator.geolocation.getCurrentPosition(
      locationSuccess,
      locationError,
      { timeout: 15000, maximumAge: 120000 }
    );
  }
  else {
    const position = {
      coords: {
        latitude: 43.1380428,
        longitude: 5.7337657,
        altitude: null,
        accuracy: 10,
        altitudeAccuracy: null,
        heading: null,
        speed: null
      },
      timestamp: 1692448765123
    };
    locationSuccess(position);
  }
}

function getWeather() {
  console.log("getWeather !!");
  var gps = localStorage.getItem(150);
  var city = localStorage.getItem(151);
  getPosition();

}

// Listen for when the watchface is opened
Pebble.addEventListener('ready',
  function () {
    console.log("JS: ready", Date.now());
    try {
      var nowSeconds = Math.floor(Date.now() / 1000);
      Pebble.sendAppMessage({ 200: nowSeconds }, function () {
        console.log('JS: ready message sent');
      }, function (err) {
        console.log('JS: ready send failed', err);
      });
      console.log('JS: ready message queued');
    } catch (err) {
      console.error('JS: ready send threw', err && err.message ? err.message : err);
    }

    console.log("PebbleKit JS ready 123");

    // Auto-trigger one weather fetch on startup so emulator testing shows data without tap.
    try {
      setTimeout(function () {
        console.log('Auto weather fetch on startup');
        getWeather();
      }, 500);
      console.log('JS: startup timer scheduled');
    } catch (err) {
      console.error('JS: startup timer failed', err && err.message ? err.message : err);
    }
  }
);



Pebble.addEventListener('appmessage',
  function () {

    if ((navigator.onLine) || (b_force_internet)) {
      console.log("Appel météo !!");
      getWeather();
    }
  }
);



Pebble.addEventListener('showConfiguration', function () {

  var url = 'http://sichroteph.github.io/Impact/';
  Pebble.openURL(url);
});


Pebble.addEventListener('webviewclosed', function (e) {
  var configData = JSON.parse(decodeURIComponent(e.response));
  console.log('Configuration page returned: ' + JSON.stringify(configData));

  var gps = configData['gps'];
  gps = 1;
  var input_city = configData['input_city'];
  input_city = "";
  var input_api = configData['input_api'];
  input_api = "";

  var input_iopool_token = configData['input_iopool_token'];

  var select_utc = configData['select_utc'];
  var select_goal = configData['select_goal'];
  var select_provider = configData['select_provider'];
  var select_screen = configData['select_screen'];
  var radio_units = configData['radio_units'];
  var radio_refresh = configData['radio_refresh'];
  var toggle_vibration = configData['toggle_vibration'];

  var select_fonts = configData['select_fonts'];

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

  // Ajout de l'option panneau secondaire
  var show_second_panel = (typeof configData['show_second_panel'] === 'undefined') ? true : !!configData['show_second_panel'];
  localStorage.setItem(170, show_second_panel ? 1 : 0); // 170: nouvelle clé pour show_second_panel
  dict['KEY_SHOW_SECOND_PANEL'] = show_second_panel ? 1 : 0;


  localStorage.setItem(150, configData['gps'] ? 1 : 0);
  localStorage.setItem(151, configData['input_city']);
  localStorage.setItem(152, configData['radio_units'] ? 1 : 0);
  localStorage.setItem(153, configData['select_provider']);
  localStorage.setItem(154, configData['input_city']);
  localStorage.setItem(157, configData['input_api']);
  localStorage.setItem(158, configData['input_iopool_token']);


  dict['KEY_GPS'] = configData['gps'] ? 1 : 0;
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
  dict['KEY_TOGGLE_CENTERED'] = configData['toggle_centered'] ? 1 : 0;
  dict['KEY_TOGGLE_MONTH'] = configData['toggle_month'] ? 1 : 0;

  dict['KEY_TOGGLE_BW_ICONS'] = configData['toggle_bw_icons'] ? 1 : 0;
  dict['KEY_TOGGLE_GRADIANT'] = configData['toggle_gradiant'] ? 1 : 0;
  dict['KEY_TOGGLE_RULER_LARGE'] = configData['toggle_ruler_large'] ? 1 : 0;

  dict['KEY_COLOR_RIGHT_BACK_R'] = parseInt(color_right_back.substring(2, 4), 16);
  dict['KEY_COLOR_RIGHT_BACK_G'] = parseInt(color_right_back.substring(4, 6), 16);
  dict['KEY_COLOR_RIGHT_BACK_B'] = parseInt(color_right_back.substring(6, 8), 16);

  dict['KEY_COLOR_LEFT_BACK_R'] = parseInt(color_left_back.substring(2, 4), 16);
  dict['KEY_COLOR_LEFT_BACK_G'] = parseInt(color_left_back.substring(4, 6), 16);
  dict['KEY_COLOR_LEFT_BACK_B'] = parseInt(color_left_back.substring(6, 8), 16);

  dict['KEY_COLOR_HOURS_R'] = parseInt(color_hours.substring(2, 4), 16);
  dict['KEY_COLOR_HOURS_G'] = parseInt(color_hours.substring(4, 6), 16);
  dict['KEY_COLOR_HOURS_B'] = parseInt(color_hours.substring(6, 8), 16);

  dict['KEY_COLOR_RULER_R'] = parseInt(color_ruler.substring(2, 4), 16);
  dict['KEY_COLOR_RULER_G'] = parseInt(color_ruler.substring(4, 6), 16);
  dict['KEY_COLOR_RULER_B'] = parseInt(color_ruler.substring(6, 8), 16);

  dict['KEY_COLOR_LINE_R'] = parseInt(color_line.substring(2, 4), 16);
  dict['KEY_COLOR_LINE_G'] = parseInt(color_line.substring(4, 6), 16);
  dict['KEY_COLOR_LINE_B'] = parseInt(color_line.substring(6, 8), 16);

  dict['KEY_COLOR_2ND_BACK_R'] = parseInt(color_2nd_back.substring(2, 4), 16);
  dict['KEY_COLOR_2ND_BACK_G'] = parseInt(color_2nd_back.substring(4, 6), 16);
  dict['KEY_COLOR_2ND_BACK_B'] = parseInt(color_2nd_back.substring(6, 8), 16);

  dict['KEY_COLOR_2ND_TEMP_R'] = parseInt(color_2nd_temp.substring(2, 4), 16);
  dict['KEY_COLOR_2ND_TEMP_G'] = parseInt(color_2nd_temp.substring(4, 6), 16);
  dict['KEY_COLOR_2ND_TEMP_B'] = parseInt(color_2nd_temp.substring(6, 8), 16);

  dict['KEY_COLOR_TEMPERATURES_R'] = parseInt(color_temperatures.substring(2, 4), 16);
  dict['KEY_COLOR_TEMPERATURES_G'] = parseInt(color_temperatures.substring(4, 6), 16);
  dict['KEY_COLOR_TEMPERATURES_B'] = parseInt(color_temperatures.substring(6, 8), 16);



  Pebble.sendAppMessage(dict, function () {
  }, function () {
  });


});