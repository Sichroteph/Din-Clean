// force la météo sur l'émulateur
var b_force_internet = false;
var bFakeData = 0;
var bFakePosition = 0;

var myGoogleAPIKey = '';

var phone_bat = 100;

var KEY_CONFIG = 157;
var KEY_LAST_UPDATE = 158;

var bIsImperial;
var windSpeedUnit; // 'kmh' or 'ms' for metric mode

// RSS News cache
var newsCache = [];
var newsCacheTime = 0;
var newsIndex = 0;
var NEWS_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in ms
var DEFAULT_RSS_URL = "https://rss.app/feeds/SdI37Q5uDrVQuAOr.xml";
var newsChannelTitle = "News Feed"; // Title of the RSS channel/journal

// Function to decode HTML entities (for accented characters)
function decodeHtmlEntities(text) {
  var txt = document.createElement('textarea');
  txt.innerHTML = text;
  return txt.value;
}

// Function to get the current RSS URL from localStorage or default
function getRssUrl() {
  var storedUrl = localStorage.getItem(175); // KEY_NEWS_FEED_URL = 175
  return (storedUrl && storedUrl.length > 0) ? storedUrl : DEFAULT_RSS_URL;
}

// Throttle protection for news requests
var lastNewsRequestTime = 0;
var NEWS_REQUEST_THROTTLE = 1000; // Minimum 1 second between requests
var newsXhrPending = false; // Prevent concurrent XHR requests

function fetchAndSendNews() {
  var now = Date.now();

  // Throttle: ignore requests that come too fast
  if ((now - lastNewsRequestTime) < NEWS_REQUEST_THROTTLE) {
    console.log("News request throttled");
    return;
  }
  lastNewsRequestTime = now;

  // Check if cache is still valid
  if (newsCache.length > 0 && (now - newsCacheTime) < NEWS_CACHE_DURATION) {
    // Use cached data, increment index
    newsIndex = (newsIndex + 1) % newsCache.length;
    sendNewsTitle(newsCache[newsIndex]);
    // Also send channel title in case it's needed
    sendNewsChannelTitle(newsChannelTitle);
    return;
  }

  // Prevent concurrent XHR requests
  if (newsXhrPending) {
    console.log("News XHR already pending, using cache or error");
    if (newsCache.length > 0) {
      newsIndex = (newsIndex + 1) % newsCache.length;
      sendNewsTitle(newsCache[newsIndex]);
    } else {
      sendNewsTitle("Loading...");
    }
    return;
  }

  // Cache expired or empty, fetch new data
  newsXhrPending = true;
  var xhr = new XMLHttpRequest();

  // Timeout for XHR request (10 seconds)
  xhr.timeout = 10000;
  xhr.ontimeout = function () {
    newsXhrPending = false;
    console.log("News XHR timeout");
    sendNewsTitle("Timeout");
  };

  xhr.onload = function () {
    newsXhrPending = false;
    if (xhr.status === 200) {
      var titles = [];
      var text = xhr.responseText;

      // Extract channel title (first title in the feed - the journal name)
      var channelTitleMatch = text.match(/<channel>[\s\S]*?<title>\s*(?:<!\[CDATA\[)?\s*([^\]<]+?)\s*(?:\]\]>)?\s*<\/title>/);
      if (channelTitleMatch && channelTitleMatch[1]) {
        newsChannelTitle = decodeHtmlEntities(channelTitleMatch[1].trim());
        // Send channel title to watch immediately
        sendNewsChannelTitle(newsChannelTitle);
      }

      // Parse titles from XML using regex
      var regex = /<title>\s*<!\[CDATA\[\s*([^\]]+?)\s*\]\]>\s*<\/title>/g;
      var match;
      var isFirst = true;
      while ((match = regex.exec(text)) !== null) {
        var title = decodeHtmlEntities(match[1].trim());
        if (title && title.length > 0) {
          if (isFirst) {
            isFirst = false; // Skip first title (channel title)
          } else {
            titles.push(title);
          }
        }
      }
      // Also try without CDATA
      var regex2 = /<title>([^<]+)<\/title>/g;
      isFirst = true;
      while ((match = regex2.exec(text)) !== null) {
        var title = decodeHtmlEntities(match[1].trim());
        if (title && title.length > 0 && titles.indexOf(title) === -1) {
          if (isFirst) {
            isFirst = false; // Skip first title (channel title)
          } else {
            titles.push(title);
          }
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
  xhr.onerror = function () {
    newsXhrPending = false;
    sendNewsTitle("Network error");
  };
  xhr.open("GET", getRssUrl(), true);
  xhr.overrideMimeType('text/xml; charset=utf-8');
  xhr.send();
}

function sendNewsTitle(title) {
  // Truncate to 100 chars max for Pebble memory
  if (title.length > 100) {
    title = title.substring(0, 97) + "...";
  }
  // Use numeric key 172 for KEY_NEWS_TITLE
  var dict = { 172: title };
  Pebble.sendAppMessage(dict, function () { }, function () { });
}

function sendNewsChannelTitle(channelTitle) {
  // Truncate to 50 chars max for Pebble memory
  if (channelTitle.length > 50) {
    channelTitle = channelTitle.substring(0, 47) + "...";
  }
  // Use numeric key 176 for KEY_NEWS_CHANNEL_TITLE
  var dict = { 176: channelTitle };
  Pebble.sendAppMessage(dict, function () { }, function () { });
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

// Weather fetch retry configuration
var weatherRetryCount = 0;
var weatherMaxRetries = 3;
var weatherRetryDelayMs = 10000; // 10 seconds between retries (3 retries in ~30s max)
var weatherRetryTimer = null;
var weatherXhrPending = false;

var xhrRequest = function (url, type, callback, errorCallback) {
  var xhr = new XMLHttpRequest();

  // Timeout after 15 seconds
  xhr.timeout = 15000;

  xhr.onload = function () {
    callback(this.responseText);
  };

  xhr.onerror = function (err) {
    console.error('XHR failed', err);
    if (errorCallback) errorCallback('network_error');
  };

  xhr.ontimeout = function () {
    console.error('XHR timeout after 15s');
    if (errorCallback) errorCallback('timeout');
  };

  xhr.open(type, url);
  xhr.send();
};

// WMO Weather Code to MET Norway symbol_code mapping
// WMO codes: https://open-meteo.com/en/docs (weather_code field)
// Maps to MET Norway icon names for compatibility with existing build_icon() in C
function wmoCodeToSymbolCode(wmoCode, isNight) {
  var dayNight = isNight ? '_night' : '_day';

  switch (wmoCode) {
    case 0:  // Clear sky
      return 'clearsky' + dayNight;
    case 1:  // Mainly clear
      return 'fair' + dayNight;
    case 2:  // Partly cloudy
      return 'partlycloudy' + dayNight;
    case 3:  // Overcast
      return 'cloudy';
    case 45: // Fog
    case 48: // Depositing rime fog
      return 'fog';
    case 51: // Drizzle: Light
      return 'lightrain';
    case 53: // Drizzle: Moderate
      return 'rain';
    case 55: // Drizzle: Dense
      return 'rain';
    case 56: // Freezing Drizzle: Light
      return 'sleet';
    case 57: // Freezing Drizzle: Dense
      return 'sleet';
    case 61: // Rain: Slight
      return 'lightrainshowers' + dayNight;
    case 63: // Rain: Moderate
      return 'rain';
    case 65: // Rain: Heavy
      return 'heavyrain';
    case 66: // Freezing Rain: Light
      return 'sleet';
    case 67: // Freezing Rain: Heavy
      return 'heavysleet';
    case 71: // Snow fall: Slight
      return 'lightsnow';
    case 73: // Snow fall: Moderate
      return 'snow';
    case 75: // Snow fall: Heavy
      return 'heavysnow';
    case 77: // Snow grains
      return 'snow';
    case 80: // Rain showers: Slight
      return 'lightrainshowers' + dayNight;
    case 81: // Rain showers: Moderate
      return 'rainshowers' + dayNight;
    case 82: // Rain showers: Violent
      return 'heavyrainshowers' + dayNight;
    case 85: // Snow showers: Slight
      return 'lightsnowshowers' + dayNight;
    case 86: // Snow showers: Heavy
      return 'heavysnowshowers' + dayNight;
    case 95: // Thunderstorm: Slight or moderate
      return 'rainandthunder';
    case 96: // Thunderstorm with slight hail
      return 'rainandthunder';
    case 99: // Thunderstorm with heavy hail
      return 'heavyrainandthunder';
    default:
      return 'partlycloudy' + dayNight;
  }
}

// Check if current hour is night time (between sunset and sunrise)
function isNightTime(hour) {
  // Approximate: night is between 21:00 and 6:00
  return hour >= 21 || hour < 6;
}

// Process Open-Meteo API response and convert to the same dictionary format as MET Norway
function processOpenMeteoResponse(responseText) {
  var json = JSON.parse(responseText);

  var hourly = json.hourly;
  var units = localStorage.getItem(152);

  // Current conditions (first hour)
  var currentTemp = hourly.temperature_2m[0];
  var currentHumidity = Math.round(hourly.relative_humidity_2m[0]);
  var currentWindSpeed = hourly.wind_gusts_10m[0]; // Wind gusts in km/h from API
  var currentWmoCode = hourly.weather_code[0];

  // Get current hour to determine day/night for icon
  var now = new Date();
  var currentHour = now.getHours();
  var isNight = isNightTime(currentHour);
  var icon = wmoCodeToSymbolCode(currentWmoCode, isNight);

  // Calculate min/max for next 24 hours
  var tmin = 1000;
  var tmax = -1000;
  for (var i = 0; i <= 24 && i < hourly.temperature_2m.length; i++) {
    var temp = hourly.temperature_2m[i];
    if (temp < tmin) tmin = temp;
    if (temp > tmax) tmax = temp;
  }

  var rTemperature = currentTemp;
  var humidity = currentHumidity;

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

  var windSpeedUnit = localStorage.getItem(181) || 'kmh';
  var wind;
  if (units == 1) {
    // Convert km/h to mph
    wind = Math.round(currentWindSpeed * 0.621371);
  } else if (windSpeedUnit === 'ms') {
    // Convert km/h to m/s
    wind = Math.round(currentWindSpeed / 3.6);
  } else {
    // Keep in km/h
    wind = Math.round(currentWindSpeed);
  }

  // Hourly data extraction
  // Calculate offset to start from current hour (API returns data from midnight)
  var now = new Date();
  var currentHour = now.getHours();
  var hourOffset = currentHour; // Start from current hour in API data

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

  // Extract hourly data starting from current hour
  for (var j = 0; j <= 24; j++) {
    var apiIndex = hourOffset + j; // Index in API data (current hour + offset)
    if (apiIndex >= hourly.time.length) break;

    // Process every 3 hours for main forecast
    if ((j % 3) === 0) {
      // Calculate local hour from current time
      var localHour = (currentHour + j) % 24;
      hourly_time['hour' + j] = localHour;

      var tempI = hourly.temperature_2m[apiIndex];
      if (units_setting == 1) {
        tempI = celsiusToFahrenheit(tempI);
      } else {
        tempI = Math.round(tempI);
      }
      hourlyTemperatures['hour' + j] = Math.round(tempI);

      var windSpeedKmh = hourly.wind_gusts_10m[apiIndex]; // Use wind gusts
      var windValue;
      if (units_setting == 1) {
        windValue = Math.round(windSpeedKmh * 0.621371);
      } else if (windSpeedUnit === 'ms') {
        windValue = Math.round(windSpeedKmh / 3.6);
      } else {
        windValue = Math.round(windSpeedKmh);
      }
      hourlyWind['hour' + j] = windValue + "\n";

      // Icon for this hour
      var hourIsNight = isNightTime(localHour);
      hourly_icons['hour' + j] = wmoCodeToSymbolCode(hourly.weather_code[apiIndex], hourIsNight);
    }

    // Precipitation for each hour (scaled same as MET Norway processing)
    if (j < 24) {
      hourlyRain['hour' + j] = Math.round((hourly.precipitation[apiIndex] || 0) * 20);
    }
  }

  // --- 3-day forecast data extraction using DAILY data ---
  // Use daily forecast data for accurate day-by-day predictions
  // Index 1 = tomorrow, 2 = day after tomorrow, 3 = J+3 (index 0 = today, skip it)
  var day_temps = ["", "", ""];
  var day_icons = ["", "", ""];
  var day_rains = ["", "", ""];
  var day_winds = ["", "", ""];

  var daily = json.daily;
  if (daily && daily.time && daily.time.length > 3) {
    // Use daily data (more accurate for multi-day forecast)
    for (var d = 0; d < 3; d++) {
      var dayIdx = d + 1; // Skip today (index 0), start from tomorrow (index 1)
      if (dayIdx < daily.time.length) {
        // Temperature (average of max and min)
        var tempMax = daily.temperature_2m_max[dayIdx];
        var tempMin = daily.temperature_2m_min[dayIdx];
        var dayTemp = (tempMax + tempMin) / 2;
        if (units == 1) {
          dayTemp = celsiusToFahrenheit(dayTemp);
        } else {
          dayTemp = Math.round(dayTemp);
        }
        day_temps[d] = Math.round(dayTemp) + "°";

        // Icon from daily weather code (daytime)
        var wmoCode = daily.weather_code[dayIdx];
        var rainSum = daily.precipitation_sum[dayIdx] || 0;

        // Smart icon selection: if WMO code is "overcast" (3) but significant rain is expected,
        // override to show rain icon instead of cloudy
        if (wmoCode === 3 && rainSum > 2) {
          day_icons[d] = 'rain';
        } else {
          day_icons[d] = wmoCodeToSymbolCode(wmoCode, false);
        }

        day_rains[d] = Math.round(rainSum) + "mm";

        // Wind gusts max for the day
        var dayWindKmh = daily.wind_gusts_10m_max[dayIdx];
        var dayWind;
        if (units == 1) {
          dayWind = Math.round(dayWindKmh * 0.621371);
          day_winds[d] = dayWind + "mph";
        } else if (windSpeedUnit === 'ms') {
          dayWind = Math.round(dayWindKmh / 3.6);
          day_winds[d] = dayWind + "m/s";
        } else {
          dayWind = Math.round(dayWindKmh);
          day_winds[d] = dayWind + "kmh";
        }
      }
    }
  } else {
    // Fallback to hourly data if daily not available
    var dayOffsets = [24, 48, 72];
    for (var d = 0; d < 3; d++) {
      var idx = dayOffsets[d];
      if (idx < hourly.temperature_2m.length) {
        var dayTemp = hourly.temperature_2m[idx];
        if (units == 1) {
          dayTemp = celsiusToFahrenheit(dayTemp);
        } else {
          dayTemp = Math.round(dayTemp);
        }
        day_temps[d] = Math.round(dayTemp) + "°";
        day_icons[d] = wmoCodeToSymbolCode(hourly.weather_code[idx], false);
        var rainSum = 0;
        for (var r = 0; r < 6 && (idx + r) < hourly.precipitation.length; r++) {
          rainSum += (hourly.precipitation[idx + r] || 0);
        }
        day_rains[d] = Math.round(rainSum) + "mm";
        var dayWind = Math.round(hourly.wind_speed_10m[idx]);
        if (units == 1) {
          dayWind = Math.round(hourly.wind_speed_10m[idx] * 0.621371);
        }
        day_winds[d] = dayWind + (units == 1 ? "mph" : "km/h");
      }
    }
  }

  // Calculate hours from current time (simpler and more reliable than API extraction)
  var now = new Date();
  var currentHour = now.getHours();
  var h0 = currentHour;
  var h1 = (currentHour + 3) % 24;
  var h2 = (currentHour + 6) % 24;
  var h3 = (currentHour + 9) % 24;

  if (units_setting == 1) {
    h0 = h0 % 12; if (h0 === 0) h0 = 12;
    h1 = h1 % 12; if (h1 === 0) h1 = 12;
    h2 = h2 % 12; if (h2 === 0) h2 = 12;
    h3 = h3 % 12; if (h3 === 0) h3 = 12;
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
    "KEY_FORECAST_H0": h0,
    "KEY_FORECAST_H1": h1,
    "KEY_FORECAST_H2": h2,
    "KEY_FORECAST_H3": h3,
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
      console.log("Open-Meteo weather info sent to Pebble successfully!");
      prefetchNewsCache();
    },
    function () {
      console.log("Error sending Open-Meteo weather info to Pebble!");
    }
  );
}

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
  var windSpeedMps = jsonWeather.properties.timeseries[0].data.instant.details.wind_speed;
  var windSpeedUnit = localStorage.getItem(181) || 'kmh';

  var wind;
  if (units == 1) {
    wind = convertMpsToMph(windSpeedMps);
  } else if (windSpeedUnit === 'ms') {
    wind = Math.round(windSpeedMps);
  } else {
    wind = Math.round(windSpeedMps * 3.6);
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
      } else if (windSpeedUnit === 'ms') {
        windValue = Math.round(windSpeedMps);
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

  // Override with fake data for testing negative temperatures
  if (bFakeData == 1) {
    hourlyTemperatures.hour0 = -12;
    hourlyTemperatures.hour3 = -4;
    hourlyTemperatures.hour6 = 2;
    hourlyTemperatures.hour9 = 10;
    hourlyTemperatures.hour12 = 16;
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
      var dayWindMps = dayData.instant.details.wind_speed;
      var dayWind;
      if (units == 1) {
        dayWind = convertMpsToMph(dayWindMps);
        day_winds[d] = dayWind + "mph";
      } else if (windSpeedUnit === 'ms') {
        dayWind = Math.round(dayWindMps);
        day_winds[d] = dayWind + "m/s";
      } else {
        dayWind = Math.round(dayWindMps * 3.6);
        day_winds[d] = dayWind + "kmh";
      }
    }
  }

  console.log("Hours being sent: H0=" + hourly_time.hour0 + " H1=" + hourly_time.hour3 + " H2=" + hourly_time.hour6 + " H3=" + hourly_time.hour9);
  console.log("Temps being sent: T1=" + hourlyTemperatures.hour0 + " T2=" + hourlyTemperatures.hour3 + " T3=" + hourlyTemperatures.hour6 + " T4=" + hourlyTemperatures.hour9 + " T5=" + hourlyTemperatures.hour12);

  // Calculate hours from current time (simpler and more reliable than API extraction)
  var now = new Date();
  var currentHour = now.getHours();
  var h0 = currentHour;
  var h1 = (currentHour + 3) % 24;
  var h2 = (currentHour + 6) % 24;
  var h3 = (currentHour + 9) % 24;

  if (units_setting == 1) {
    h0 = h0 % 12;
    if (h0 === 0) h0 = 12;
    h1 = h1 % 12;
    if (h1 === 0) h1 = 12;
    h2 = h2 % 12;
    if (h2 === 0) h2 = 12;
    h3 = h3 % 12;
    if (h3 === 0) h3 = 12;
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
    "KEY_FORECAST_H0": h0,
    "KEY_FORECAST_H1": h1,
    "KEY_FORECAST_H2": h2,
    "KEY_FORECAST_H3": h3,
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
      // Pre-fetch news for later use
      prefetchNewsCache();
    },
    function () {
      console.log("Error sending weather info to Pebble!");
    }
  );
}

// Pre-fetch news and store in cache (no sending)
function prefetchNewsCache() {
  var now = Date.now();
  if (newsCache.length > 0 && (now - newsCacheTime) < NEWS_CACHE_DURATION) {
    console.log("News cache already valid");
    return;
  }

  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.status === 200) {
      var titles = [];
      var text = xhr.responseText;
      var regex = /<title>\s*<!\[CDATA\[\s*([^\]]+?)\s*\]\]>\s*<\/title>/g;
      var match;
      while ((match = regex.exec(text)) !== null) {
        var title = match[1].trim();
        if (title && title.length > 0) {
          titles.push(title);
        }
      }
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
        console.log("News cache prefetched: " + titles.length + " titles");
      }
    }
  };
  xhr.open("GET", RSS_URL, true);
  xhr.send();
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


// Called when weather fetch succeeds - reset retry state
function onWeatherFetchSuccess() {
  weatherRetryCount = 0;
  weatherXhrPending = false;
  if (weatherRetryTimer) {
    clearTimeout(weatherRetryTimer);
    weatherRetryTimer = null;
  }
  console.log("Weather fetch successful, retry count reset");
}

// Called when weather fetch fails - schedule retry if under limit
function onWeatherFetchError(reason) {
  weatherXhrPending = false;
  weatherRetryCount++;
  console.log("Weather fetch failed (" + reason + "), retry " + weatherRetryCount + "/" + weatherMaxRetries);

  if (weatherRetryCount < weatherMaxRetries) {
    console.log("Scheduling retry in " + weatherRetryDelayMs + "ms");
    weatherRetryTimer = setTimeout(function () {
      weatherRetryTimer = null;
      getForecast();
    }, weatherRetryDelayMs);
  } else {
    console.log("Max retries reached, giving up until next scheduled refresh");
    weatherRetryCount = 0; // Reset for next scheduled attempt
  }
}

function getForecast() {

  console.log("getForecast");

  // Prevent concurrent requests
  if (weatherXhrPending) {
    console.log("Weather XHR already pending, skipping");
    return;
  }

  if (bFakeData == 1) {
    console.log("Using offline fake weather sample");
    processWeatherResponse(buildFakeResponse());
    onWeatherFetchSuccess();
    return;
  }

  weatherXhrPending = true;

  // Check which API to use (default to Open-Meteo with AROME model for France)
  var weatherApi = localStorage.getItem(180) || 'openmeteo';
  console.log("Using weather API: " + weatherApi);

  if (weatherApi === 'openmeteo') {
    // Open-Meteo API with Météo-France AROME model (1.5km resolution, excellent for France)
    var urlOpenMeteo = 'https://api.open-meteo.com/v1/meteofrance?' +
      'latitude=' + current_Latitude + '&longitude=' + current_Longitude +
      '&hourly=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_gusts_10m' +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_gusts_10m_max' +
      '&forecast_days=4&timezone=auto';

    console.log(urlOpenMeteo);

    xhrRequest(urlOpenMeteo, 'GET',
      function (responseText) {
        try {
          processOpenMeteoResponse(responseText);
          onWeatherFetchSuccess();
        } catch (e) {
          console.error("Error processing Open-Meteo response: " + e);
          onWeatherFetchError('parse_error');
        }
      },
      onWeatherFetchError
    );
  } else {
    // MET Norway API (fallback)
    var coordinates = 'lat=' + current_Latitude + '&lon=' + current_Longitude;
    var urlWeatherRequest = 'https://api.met.no/weatherapi/locationforecast/2.0/complete?' + coordinates;

    console.log(urlWeatherRequest);

    xhrRequest(urlWeatherRequest, 'GET',
      function (responseText) {
        try {
          processWeatherResponse(responseText);
          onWeatherFetchSuccess();
        } catch (e) {
          console.error("Error processing MET Norway response: " + e);
          onWeatherFetchError('parse_error');
        }
      },
      onWeatherFetchError
    );
  }
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

        // Also fetch news once to get channel title if news is enabled
        var show_news = localStorage.getItem(171);
        if (show_news === '1' || show_news === 1) {
          console.log('Auto news fetch on startup to get channel title');
          fetchAndSendNews();
        }
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

  var url = 'https://sichroteph.github.io/Din-Clean/';
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
  dict[170] = show_weather ? 1 : 0;

  // Ajout de l'option news feed
  var show_news = !!configData['show_news'];
  localStorage.setItem(171, show_news ? 1 : 0);
  dict[171] = show_news ? 1 : 0;

  // Ajout de l'URL du flux RSS personnalisé
  var news_feed_url = configData['input_news_feed_url'] || DEFAULT_RSS_URL;
  var old_url = localStorage.getItem(175);
  localStorage.setItem(175, news_feed_url);
  // Reset news cache when URL changes to force refresh
  newsCache = [];
  newsCacheTime = 0;
  newsChannelTitle = "Loading..."; // Reset channel title
  // If URL changed and news is enabled, fetch immediately to update channel title
  if (old_url !== news_feed_url && show_news) {
    console.log("RSS URL changed, fetching new feed immediately");
    // Send "Loading..." title immediately
    sendNewsChannelTitle(newsChannelTitle);
    setTimeout(function () {
      fetchAndSendNews();
    }, 500); // Small delay to ensure settings are saved
  }

  // Ajout de l'option double tap
  var double_tap = (typeof configData['double_tap'] === 'undefined') ? true : !!configData['double_tap'];
  localStorage.setItem(174, double_tap ? 1 : 0);
  dict[174] = double_tap ? 1 : 0;

  // Weather API selection (Open-Meteo or MET Norway)
  var weather_api = configData['weather_api'] || 'openmeteo';
  localStorage.setItem(180, weather_api);
  console.log("Weather API set to: " + weather_api);

  localStorage.setItem(152, radio_units ? 1 : 0);
  localStorage.setItem(158, input_iopool_token);

  // Wind speed unit for metric mode (kmh or ms)
  var wind_speed_unit = configData['wind_speed_unit'] || 'kmh';
  localStorage.setItem(181, wind_speed_unit);
  console.log("Wind speed unit set to: " + wind_speed_unit);

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
    // Refresh weather data after configuration changes (e.g., API provider, units)
    console.log("Configuration sent successfully, fetching weather data");
    setTimeout(function () {
      getWeather();
    }, 500);
  }, function () {
    console.log("Failed to send configuration");
  });

});