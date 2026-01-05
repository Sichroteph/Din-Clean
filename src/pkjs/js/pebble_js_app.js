// force la météo sur l'émulateur
var b_force_internet = false;
var bFakeData = 0;
var bFakePosition = 0;

var myGoogleAPIKey = '';

var phone_bat = 100;

var KEY_CONFIG = 157;
var KEY_LAST_UPDATE = 158;

var bIsImperial;

// RSS News cache
var newsCache = [];
var newsCacheTime = 0;
var newsIndex = 0;
var NEWS_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in ms
var RSS_URL = "https://rss.app/feeds/SdI37Q5uDrVQuAOr.xml";

function fetchAndSendNews() {
  var now = Date.now();
  
  // Check if cache is still valid
  if (newsCache.length > 0 && (now - newsCacheTime) < NEWS_CACHE_DURATION) {
    // Use cached data, increment index
    newsIndex = (newsIndex + 1) % newsCache.length;
    sendNewsTitle(newsCache[newsIndex]);
    return;
  }
  
  // Cache expired or empty, fetch new data
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    if (xhr.status === 200) {
      var titles = [];
      var text = xhr.responseText;
      // Parse titles from XML using regex
      var regex = /<title>\s*<!\[CDATA\[\s*([^\]]+?)\s*\]\]>\s*<\/title>/g;
      var match;
      while ((match = regex.exec(text)) !== null) {
        var title = match[1].trim();
        if (title && title.length > 0) {
          titles.push(title);
        }
      }
      // Also try without CDATA
      var regex2 = /<title>([^<]+)<\/title>/g;
      while ((match = regex2.exec(text)) !== null) {
        var title = match[1].trim();
        if (title && title.length > 0 && titles.indexOf(title) === -1) {
          titles.push(title);
        }
      }
      
      if (titles.length > 0) {
        newsCache = titles;
        newsCacheTime = now;
        newsIndex = 0;
        sendNewsTitle(newsCache[newsIndex]);
      } else {
        sendNewsTitle("No news available");
      }
    } else {
      sendNewsTitle("News fetch failed");
    }
  };
  xhr.onerror = function() {
    sendNewsTitle("Network error");
  };
  xhr.open("GET", RSS_URL, true);
  xhr.send();
}

function sendNewsTitle(title) {
  // Truncate to 100 chars max for Pebble memory
  if (title.length > 100) {
    title = title.substring(0, 97) + "...";
  }
  var dict = { "KEY_NEWS_TITLE": title };
  Pebble.sendAppMessage(dict, function() {}, function() {});
}

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

  // Icônes variées : matin clair → nuageux → pluie → orage → neige → brouillard → clair
  var icons = [
    "clearsky_day", "fair_day", "partlycloudy_day", "cloudy",
    "rainshowers_day", "rain", "heavyrain", "heavyrainandthunder",
    "sleet", "snow", "fog", "partlycloudy_day",
    "fair_day", "clearsky_day", "clearsky_night", "fair_night",
    "partlycloudy_night", "cloudy", "rainshowers_night", "lightrainshowers_night",
    "clearsky_night", "fair_night", "partlycloudy_night", "cloudy", "clearsky_night"
  ];

  for (var i = 0; i <= 24; i++) {
    var temp, rainAmount;

    if (i <= 12) {
      // Sur les 12 premières heures : courbe en U (commence haut, descend, remonte)
      var t = i / 12.0; // normaliser 0-1 sur 12h
      // Température : commence à 18°C, descend à 8°C à 6h, remonte à 18°C à 12h
      temp = 18 - 10 * Math.sin(Math.PI * t);

      // Pluie : cloche avec pic à 6h (milieu de 12h)
      rainAmount = 2.0 * Math.sin(Math.PI * t); // Max 2mm à t=0.5 (6h)
    } else {
      // Après 12h : stabiliser les valeurs
      temp = 18;
      rainAmount = 0;
    }

    // Vitesse du vent : varie légèrement
    var windSpeed = 2 + 3 * Math.sin(Math.PI * i / 12.0);

    timeseries.push({
      time: new Date(baseTime + (i * 3600000)).toISOString(),
      data: {
        instant: {
          details: {
            air_temperature: Math.round(temp * 10) / 10,
            relative_humidity: 50 + Math.round(10 * Math.sin(Math.PI * i / 12.0)),
            wind_speed: Math.round(windSpeed * 10) / 10,
            wind_from_direction: (180 + (i * 15)) % 360
          }
        },
        next_12_hours: {
          summary: { symbol_code: icons[i] },
          details: {}
        },
        next_1_hours: {
          summary: { symbol_code: icons[i] },
          details: { precipitation_amount: Math.round(rainAmount * 100) / 100 }
        },
        next_6_hours: {
          summary: { symbol_code: icons[i] },
          details: {
            air_temperature_max: Math.round(temp + 2),
            air_temperature_min: Math.round(temp - 2),
            precipitation_amount: Math.round(rainAmount * 6 * 100) / 100
          }
        }
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
    var temp = jsonWeather.properties.timeseries[i].data.instant.details.air_temperature;
    if (temp < tmin) {
      tmin = temp;
    }
    if (temp > tmax) {
      tmax = temp;
    }
  }

  var rTemperature = jsonWeather.properties.timeseries[0].data.instant.details.air_temperature;
  var humidity = Math.round(jsonWeather.properties.timeseries[0].data.instant.details.relative_humidity);

  if (units == 1) {
    rTemperature = celsiusToFahrenheit(rTemperature);
    tmin = celsiusToFahrenheit(tmin);
    tmax = celsiusToFahrenheit(tmax);
  } else {
    rTemperature = Math.round(rTemperature);
    tmin = Math.round(tmin);
    tmax = Math.round(tmax);
  }

  var temperature = Math.round(rTemperature);
  tmax = Math.round(tmax);
  tmin = Math.round(tmin);
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

      var tempI = jsonWeather.properties.timeseries[j].data.instant.details.air_temperature;
      if (units_setting == 1) {
        tempI = celsiusToFahrenheit(tempI);
      } else {
        tempI = Math.round(tempI);
      }
      hourlyTemperatures['hour' + j] = Math.round(tempI);

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
        dayTemp = (tMax + tMin) / 2;
      } else {
        dayTemp = dayData.instant.details.air_temperature;
      }
      if (units == 1) {
        dayTemp = celsiusToFahrenheit(dayTemp);
      } else {
        dayTemp = Math.round(dayTemp);
      }
      day_temps[d] = Math.round(dayTemp) + "°";

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

  console.log("Hours being sent: H0=" + hourly_time.hour0 + " H1=" + hourly_time.hour3 + " H2=" + hourly_time.hour6 + " H3=" + hourly_time.hour9);
  console.log("Temps being sent: T1=" + hourlyTemperatures.hour0 + " T2=" + hourlyTemperatures.hour3 + " T3=" + hourlyTemperatures.hour6 + " T4=" + hourlyTemperatures.hour9 + " T5=" + hourlyTemperatures.hour12);

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
  function (e) {
    // Check if this is a news request (KEY_REQUEST_NEWS = 173)
    if (e.payload && (e.payload.KEY_REQUEST_NEWS !== undefined || e.payload[173] !== undefined)) {
      fetchAndSendNews();
      return;
    }

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

  // Variables actuellement retournées par la page de configuration:
  // input_iopool_token, radio_units, radio_refresh, toggle_vibration, toggle_bt,
  // color_right_back, color_left_back, show_weather

  var input_iopool_token = configData['input_iopool_token'];
  var radio_units = configData['radio_units'];
  var radio_refresh = configData['radio_refresh'];
  var toggle_vibration = configData['toggle_vibration'];
  var toggle_bt = configData['toggle_bt'];
  var color_right_back = configData['color_right_back'];
  var color_left_back = configData['color_left_back'];

  var dict = {};

  // Ajout de l'option graphique météo
  var show_weather = (typeof configData['show_weather'] === 'undefined') ? true : !!configData['show_weather'];
  localStorage.setItem(170, show_weather ? 1 : 0);
  dict['KEY_SHOW_WEATHER'] = show_weather ? 1 : 0;

  // Ajout de l'option news feed
  var show_news = !!configData['show_news'];
  localStorage.setItem(171, show_news ? 1 : 0);
  dict['KEY_SHOW_NEWS'] = show_news ? 1 : 0;

  localStorage.setItem(152, radio_units ? 1 : 0);
  localStorage.setItem(158, input_iopool_token);

  dict['KEY_RADIO_UNITS'] = radio_units ? 1 : 0;
  dict['KEY_RADIO_REFRESH'] = radio_refresh ? 1 : 0;
  dict['KEY_TOGGLE_VIBRATION'] = toggle_vibration ? 1 : 0;
  dict['KEY_TOGGLE_BT'] = toggle_bt ? 1 : 0;

  function safeColorComponent(hex, start, end) {
    if (typeof hex === 'string' && hex.length >= end) {
      return parseInt(hex.substring(start, end), 16);
    }
    return 0;
  }

  dict['KEY_COLOR_RIGHT_BACK_R'] = safeColorComponent(color_right_back, 2, 4);
  dict['KEY_COLOR_RIGHT_BACK_G'] = safeColorComponent(color_right_back, 4, 6);
  dict['KEY_COLOR_RIGHT_BACK_B'] = safeColorComponent(color_right_back, 6, 8);

  dict['KEY_COLOR_LEFT_BACK_R'] = safeColorComponent(color_left_back, 2, 4);
  dict['KEY_COLOR_LEFT_BACK_G'] = safeColorComponent(color_left_back, 4, 6);
  dict['KEY_COLOR_LEFT_BACK_B'] = safeColorComponent(color_left_back, 6, 8);

  Pebble.sendAppMessage(dict, function () {
  }, function () {
  });

});