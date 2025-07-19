// force la météo sur l'émulateur
var b_force_internet = false;
var bFakeData = 0;
var bFakePosition = 0;

var myGoogleAPIKey = '';
var API_URL ="https://api.iopool.com/v1/pools";
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

function convertMpsToMph(mps) {
  const conversionFactor = 2.23694;
  return Math.round(mps * conversionFactor);
}

function celsiusToFahrenheit(celsius) {
  return Math.round((celsius * 9 / 5) + 32);
}


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


function SendStatus(status) {
  var dictionary = {
    "KEY_STATUS": status,
  };

  // Send to watchapp
  Pebble.sendAppMessage(dictionary, function () {
    //console.log("sendAppMessage");
    //console.log('Send successful: ' + JSON.stringify(dictionary));
  }, function () {
    //console.log('Send failed!');
  });
}

var xhrRequest = function (url, type, callback) {
  var xhr = new XMLHttpRequest();

  xhr.onload = function () {
    callback(this.responseText);
  };

  xhr.open(type, url);
  xhr.setRequestHeader('user-Agent', 'Pebble Weather Graph - Christophe.Jeannette@gmail.com');
  xhr.send();
};

var poolTemp;
var poolPH;
var poolORP;


function getIOPoolData() {

  console.log("getIOPoolData");

  //var apiKey = localStorage.getItem("apiKey");

  var apiKey = "501gzIhh3Gw2HI0J7";
  
  poolTemp = 0;
  poolPH = 0;
  poolORP = 0;
  
  if (apiKey) {
    console.log("ok");
    var xhr = new XMLHttpRequest();
    xhr.open("GET", API_URL, true);
    xhr.setRequestHeader("x-api-key", apiKey);
    xhr.onload = function() {
    console.log(xhr.status);
      
      if (xhr.status === 200) {
        var data = JSON.parse(xhr.responseText);
        if (data && data.length > 0 && data[0].latestMeasure) {
          poolTemp = Math.round(data[0].latestMeasure.temperature);
          poolPH = Math.round(data[0].latestMeasure.ph * 100) / 100;
          poolORP = Math.round(data[0].latestMeasure.orp);  

          console.log(poolTemp);
          console.log(poolPH);   
          console.log(poolORP);   
        }
     }
    }
  }
}


function getForecast() {

  
  console.log("getForecast");

  var userAgent2 = "Pebble Weather Graph - Christophe.Jeannette@gmail.com";

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

  if (bFakeData == 1) {
    urlWeatherRequest = "https://jsonplaceholder.typicode.com/posts";
  }
  else {
    var coordinates = 'lat=' + current_Latitude + '&lon=' + current_Longitude;
    urlWeatherRequest = 'https://api.met.no/weatherapi/locationforecast/2.0/complete?' + coordinates;
  }

  console.log(urlWeatherRequest);

  xhrRequest(urlWeatherRequest, 'GET',
    function (responseText) {
      if (bFakeData == 1) {
        responseText = '{"type":"Feature","geometry":{"type":"Point","coordinates":[5.7,43.1,0]},"properties":{"meta":{"updated_at":"2024-12-16T09:18:24Z","units":{"air_pressure_at_sea_level":"hPa","air_temperature":"celsius","air_temperature_max":"celsius","air_temperature_min":"celsius","cloud_area_fraction":"%","cloud_area_fraction_high":"%","cloud_area_fraction_low":"%","cloud_area_fraction_medium":"%","dew_point_temperature":"celsius","fog_area_fraction":"%","precipitation_amount":"mm","relative_humidity":"%","ultraviolet_index_clear_sky":"1","wind_from_direction":"degrees","wind_speed":"m/s"}},"timeseries":[{"time":"2024-12-16T09:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1036.7,"air_temperature":12.7,"cloud_area_fraction":0.0,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":0.0,"cloud_area_fraction_medium":0.0,"dew_point_temperature":4.3,"fog_area_fraction":0.0,"relative_humidity":56.3,"ultraviolet_index_clear_sky":0.6,"wind_from_direction":93.9,"wind_speed":1.8}},"next_12_hours":{"summary":{"symbol_code":"clearsky_day"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"clearsky_day"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"clearsky_day"},"details":{"air_temperature_max":14.0,"air_temperature_min":12.0,"precipitation_amount":0.0}}}},{"time":"2024-12-16T10:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1037.1,"air_temperature":14.0,"cloud_area_fraction":0.0,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":0.0,"cloud_area_fraction_medium":0.0,"dew_point_temperature":4.5,"fog_area_fraction":0.0,"relative_humidity":55.5,"ultraviolet_index_clear_sky":1.1,"wind_from_direction":142.7,"wind_speed":2.8}},"next_12_hours":{"summary":{"symbol_code":"clearsky_day"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"clearsky_day"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"clearsky_day"},"details":{"air_temperature_max":13.9,"air_temperature_min":11.6,"precipitation_amount":0.0}}}},{"time":"2024-12-16T11:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1037.0,"air_temperature":13.9,"cloud_area_fraction":0.0,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":0.0,"cloud_area_fraction_medium":0.0,"dew_point_temperature":6.2,"fog_area_fraction":0.0,"relative_humidity":63.4,"ultraviolet_index_clear_sky":1.4,"wind_from_direction":149.1,"wind_speed":3.3}},"next_12_hours":{"summary":{"symbol_code":"clearsky_day"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"clearsky_day"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"clearsky_day"},"details":{"air_temperature_max":13.8,"air_temperature_min":11.6,"precipitation_amount":0.0}}}},{"time":"2024-12-16T12:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1036.3,"air_temperature":13.8,"cloud_area_fraction":0.0,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":0.0,"cloud_area_fraction_medium":0.0,"dew_point_temperature":7.1,"fog_area_fraction":0.0,"relative_humidity":69.2,"ultraviolet_index_clear_sky":1.3,"wind_from_direction":163.3,"wind_speed":3.7}},"next_12_hours":{"summary":{"symbol_code":"clearsky_day"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"clearsky_day"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"clearsky_day"},"details":{"air_temperature_max":13.2,"air_temperature_min":11.4,"precipitation_amount":0.0}}}},{"time":"2024-12-16T13:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1036.3,"air_temperature":13.2,"cloud_area_fraction":0.0,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":0.0,"cloud_area_fraction_medium":0.0,"dew_point_temperature":7.6,"fog_area_fraction":0.0,"relative_humidity":73.3,"ultraviolet_index_clear_sky":1.0,"wind_from_direction":202.8,"wind_speed":3.9}},"next_12_hours":{"summary":{"symbol_code":"clearsky_day"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"clearsky_day"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"clearsky_day"},"details":{"air_temperature_max":12.6,"air_temperature_min":11.4,"precipitation_amount":0.0}}}},{"time":"2024-12-16T14:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1036.2,"air_temperature":12.6,"cloud_area_fraction":0.0,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":0.0,"cloud_area_fraction_medium":0.0,"dew_point_temperature":7.7,"fog_area_fraction":0.0,"relative_humidity":75.5,"ultraviolet_index_clear_sky":0.5,"wind_from_direction":223.7,"wind_speed":3.4}},"next_12_hours":{"summary":{"symbol_code":"clearsky_day"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"clearsky_day"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"clearsky_day"},"details":{"air_temperature_max":12.0,"air_temperature_min":11.4,"precipitation_amount":0.0}}}},{"time":"2024-12-16T15:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1036.0,"air_temperature":12.0,"cloud_area_fraction":0.0,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":0.0,"cloud_area_fraction_medium":0.0,"dew_point_temperature":7.9,"fog_area_fraction":0.0,"relative_humidity":77.1,"ultraviolet_index_clear_sky":0.2,"wind_from_direction":218.1,"wind_speed":2.8}},"next_12_hours":{"summary":{"symbol_code":"fair_night"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"clearsky_day"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"clearsky_night"},"details":{"air_temperature_max":11.8,"air_temperature_min":11.4,"precipitation_amount":0.0}}}},{"time":"2024-12-16T16:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1036.0,"air_temperature":11.6,"cloud_area_fraction":0.0,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":0.0,"cloud_area_fraction_medium":0.0,"dew_point_temperature":8.1,"fog_area_fraction":0.0,"relative_humidity":78.9,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":239.5,"wind_speed":3.5}},"next_12_hours":{"summary":{"symbol_code":"fair_night"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"clearsky_night"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"clearsky_night"},"details":{"air_temperature_max":12.0,"air_temperature_min":11.4,"precipitation_amount":0.0}}}},{"time":"2024-12-16T17:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1036.3,"air_temperature":11.6,"cloud_area_fraction":0.0,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":0.0,"cloud_area_fraction_medium":0.0,"dew_point_temperature":7.9,"fog_area_fraction":0.0,"relative_humidity":78.4,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":261.5,"wind_speed":4.2}},"next_12_hours":{"summary":{"symbol_code":"fair_night"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"clearsky_night"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"clearsky_night"},"details":{"air_temperature_max":12.2,"air_temperature_min":11.4,"precipitation_amount":0.0}}}},{"time":"2024-12-16T18:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1036.1,"air_temperature":11.4,"cloud_area_fraction":0.0,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":0.0,"cloud_area_fraction_medium":0.0,"dew_point_temperature":7.8,"fog_area_fraction":0.0,"relative_humidity":78.2,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":239.0,"wind_speed":3.7}},"next_12_hours":{"summary":{"symbol_code":"fair_night"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"clearsky_night"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"clearsky_night"},"details":{"air_temperature_max":12.2,"air_temperature_min":11.5,"precipitation_amount":0.0}}}},{"time":"2024-12-16T19:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1036.1,"air_temperature":11.5,"cloud_area_fraction":0.0,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":0.0,"cloud_area_fraction_medium":0.0,"dew_point_temperature":7.6,"fog_area_fraction":0.0,"relative_humidity":76.7,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":257.9,"wind_speed":5.2}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"clearsky_night"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"clearsky_night"},"details":{"air_temperature_max":12.2,"air_temperature_min":11.7,"precipitation_amount":0.0}}}},{"time":"2024-12-16T20:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1036.3,"air_temperature":11.7,"cloud_area_fraction":0.0,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":0.0,"cloud_area_fraction_medium":0.0,"dew_point_temperature":7.5,"fog_area_fraction":0.0,"relative_humidity":75.4,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":279.4,"wind_speed":6.0}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"clearsky_night"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"fair_night"},"details":{"air_temperature_max":12.2,"air_temperature_min":11.6,"precipitation_amount":0.0}}}},{"time":"2024-12-16T21:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1036.2,"air_temperature":11.8,"cloud_area_fraction":0.0,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":0.0,"cloud_area_fraction_medium":0.0,"dew_point_temperature":7.5,"fog_area_fraction":0.0,"relative_humidity":75.1,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":285.3,"wind_speed":5.7}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"clearsky_night"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"fair_night"},"details":{"air_temperature_max":12.2,"air_temperature_min":11.5,"precipitation_amount":0.0}}}},{"time":"2024-12-16T22:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1036.1,"air_temperature":12.0,"cloud_area_fraction":0.0,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":0.0,"cloud_area_fraction_medium":0.0,"dew_point_temperature":7.5,"fog_area_fraction":0.0,"relative_humidity":74.2,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":284.4,"wind_speed":5.0}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"clearsky_night"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{"air_temperature_max":12.2,"air_temperature_min":11.5,"precipitation_amount":0.0}}}},{"time":"2024-12-16T23:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1036.2,"air_temperature":12.2,"cloud_area_fraction":0.0,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":0.0,"cloud_area_fraction_medium":0.0,"dew_point_temperature":7.7,"fog_area_fraction":0.0,"relative_humidity":73.9,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":291.0,"wind_speed":4.5}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"clearsky_night"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{"air_temperature_max":12.8,"air_temperature_min":11.5,"precipitation_amount":0.0}}}},{"time":"2024-12-17T00:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1035.8,"air_temperature":12.1,"cloud_area_fraction":1.6,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":1.6,"cloud_area_fraction_medium":0.0,"dew_point_temperature":8.1,"fog_area_fraction":0.0,"relative_humidity":76.6,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":316.4,"wind_speed":3.5}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"clearsky_night"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{"air_temperature_max":13.6,"air_temperature_min":11.5,"precipitation_amount":0.0}}}},{"time":"2024-12-17T01:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1035.4,"air_temperature":11.9,"cloud_area_fraction":39.1,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":39.1,"cloud_area_fraction_medium":0.0,"dew_point_temperature":8.3,"fog_area_fraction":0.0,"relative_humidity":78.6,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":356.9,"wind_speed":3.6}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{"air_temperature_max":14.0,"air_temperature_min":11.5,"precipitation_amount":0.0}}}},{"time":"2024-12-17T02:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1035.0,"air_temperature":11.6,"cloud_area_fraction":71.1,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":71.1,"cloud_area_fraction_medium":0.0,"dew_point_temperature":8.8,"fog_area_fraction":0.0,"relative_humidity":82.9,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":18.2,"wind_speed":3.5}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{"air_temperature_max":14.2,"air_temperature_min":11.5,"precipitation_amount":0.0}}}},{"time":"2024-12-17T03:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1034.3,"air_temperature":11.5,"cloud_area_fraction":78.1,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":78.1,"cloud_area_fraction_medium":0.0,"dew_point_temperature":10.2,"fog_area_fraction":0.0,"relative_humidity":90.8,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":23.3,"wind_speed":4.1}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{"air_temperature_max":14.4,"air_temperature_min":12.2,"precipitation_amount":0.0}}}},{"time":"2024-12-17T04:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1033.5,"air_temperature":12.2,"cloud_area_fraction":68.0,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":68.0,"cloud_area_fraction_medium":0.0,"dew_point_temperature":10.2,"fog_area_fraction":0.0,"relative_humidity":86.9,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":356.2,"wind_speed":6.0}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{"air_temperature_max":14.6,"air_temperature_min":12.8,"precipitation_amount":0.0}}}},{"time":"2024-12-17T05:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1033.3,"air_temperature":12.8,"cloud_area_fraction":62.5,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":62.5,"cloud_area_fraction_medium":0.0,"dew_point_temperature":10.2,"fog_area_fraction":0.0,"relative_humidity":83.1,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":258.1,"wind_speed":7.1}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{"air_temperature_max":14.7,"air_temperature_min":13.6,"precipitation_amount":0.0}}}},{"time":"2024-12-17T06:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1033.5,"air_temperature":13.6,"cloud_area_fraction":85.2,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":85.2,"cloud_area_fraction_medium":0.0,"dew_point_temperature":10.2,"fog_area_fraction":0.0,"relative_humidity":79.0,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":257.9,"wind_speed":7.4}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"cloudy"},"details":{"air_temperature_max":14.8,"air_temperature_min":14.0,"precipitation_amount":0.0}}}},{"time":"2024-12-17T07:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1033.3,"air_temperature":14.0,"cloud_area_fraction":89.1,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":89.1,"cloud_area_fraction_medium":0.0,"dew_point_temperature":9.6,"fog_area_fraction":0.0,"relative_humidity":74.6,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":246.3,"wind_speed":6.9}},"next_12_hours":{"summary":{"symbol_code":"cloudy"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"cloudy"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"cloudy"},"details":{"air_temperature_max":14.8,"air_temperature_min":14.2,"precipitation_amount":0.0}}}},{"time":"2024-12-17T08:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1033.5,"air_temperature":14.2,"cloud_area_fraction":73.4,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":73.4,"cloud_area_fraction_medium":0.0,"dew_point_temperature":9.6,"fog_area_fraction":0.0,"relative_humidity":73.7,"ultraviolet_index_clear_sky":0.2,"wind_from_direction":242.8,"wind_speed":6.8}},"next_12_hours":{"summary":{"symbol_code":"cloudy"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"cloudy"},"details":{"air_temperature_max":14.8,"air_temperature_min":14.4,"precipitation_amount":0.0}}}},{"time":"2024-12-17T09:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1033.5,"air_temperature":14.4,"cloud_area_fraction":60.2,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":60.2,"cloud_area_fraction_medium":0.0,"dew_point_temperature":9.3,"fog_area_fraction":0.0,"relative_humidity":71.3,"ultraviolet_index_clear_sky":0.5,"wind_from_direction":238.8,"wind_speed":6.7}},"next_12_hours":{"summary":{"symbol_code":"cloudy"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"cloudy"},"details":{"air_temperature_max":14.8,"air_temperature_min":14.5,"precipitation_amount":0.0}}}},{"time":"2024-12-17T10:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1033.4,"air_temperature":14.6,"cloud_area_fraction":97.7,"cloud_area_fraction_high":66.4,"cloud_area_fraction_low":94.5,"cloud_area_fraction_medium":0.0,"dew_point_temperature":9.4,"fog_area_fraction":0.0,"relative_humidity":71.1,"ultraviolet_index_clear_sky":0.9,"wind_from_direction":235.0,"wind_speed":6.7}},"next_12_hours":{"summary":{"symbol_code":"cloudy"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"cloudy"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"cloudy"},"details":{"air_temperature_max":14.8,"air_temperature_min":14.5,"precipitation_amount":0.0}}}},{"time":"2024-12-17T11:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1033.0,"air_temperature":14.7,"cloud_area_fraction":100.0,"cloud_area_fraction_high":100.0,"cloud_area_fraction_low":83.6,"cloud_area_fraction_medium":0.0,"dew_point_temperature":9.6,"fog_area_fraction":0.0,"relative_humidity":71.8,"ultraviolet_index_clear_sky":1.2,"wind_from_direction":233.1,"wind_speed":6.8}},"next_12_hours":{"summary":{"symbol_code":"cloudy"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"cloudy"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{"air_temperature_max":14.8,"air_temperature_min":14.5,"precipitation_amount":0.1}}}},{"time":"2024-12-17T12:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1032.3,"air_temperature":14.8,"cloud_area_fraction":100.0,"cloud_area_fraction_high":100.0,"cloud_area_fraction_low":42.2,"cloud_area_fraction_medium":0.0,"dew_point_temperature":9.6,"fog_area_fraction":0.0,"relative_humidity":71.1,"ultraviolet_index_clear_sky":1.2,"wind_from_direction":231.2,"wind_speed":6.7}},"next_12_hours":{"summary":{"symbol_code":"cloudy"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"cloudy"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{"air_temperature_max":14.7,"air_temperature_min":14.5,"precipitation_amount":0.1}}}},{"time":"2024-12-17T13:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1031.7,"air_temperature":14.7,"cloud_area_fraction":99.2,"cloud_area_fraction_high":99.2,"cloud_area_fraction_low":25.8,"cloud_area_fraction_medium":0.0,"dew_point_temperature":9.8,"fog_area_fraction":0.0,"relative_humidity":72.2,"ultraviolet_index_clear_sky":0.9,"wind_from_direction":222.8,"wind_speed":6.0}},"next_12_hours":{"summary":{"symbol_code":"cloudy"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"cloudy"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{"air_temperature_max":14.7,"air_temperature_min":14.5,"precipitation_amount":0.2}}}},{"time":"2024-12-17T14:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1031.1,"air_temperature":14.5,"cloud_area_fraction":91.4,"cloud_area_fraction_high":85.2,"cloud_area_fraction_low":28.9,"cloud_area_fraction_medium":0.0,"dew_point_temperature":10.3,"fog_area_fraction":0.0,"relative_humidity":75.8,"ultraviolet_index_clear_sky":0.5,"wind_from_direction":216.1,"wind_speed":6.1}},"next_12_hours":{"summary":{"symbol_code":"cloudy"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"cloudy"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"cloudy"},"details":{"air_temperature_max":14.7,"air_temperature_min":14.5,"precipitation_amount":0.3}}}},{"time":"2024-12-17T15:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1030.9,"air_temperature":14.6,"cloud_area_fraction":46.9,"cloud_area_fraction_high":18.7,"cloud_area_fraction_low":33.6,"cloud_area_fraction_medium":0.0,"dew_point_temperature":9.9,"fog_area_fraction":0.0,"relative_humidity":73.3,"ultraviolet_index_clear_sky":0.1,"wind_from_direction":218.6,"wind_speed":6.9}},"next_12_hours":{"summary":{"symbol_code":"cloudy"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"cloudy"},"details":{"air_temperature_max":14.7,"air_temperature_min":14.5,"precipitation_amount":0.4}}}},{"time":"2024-12-17T16:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1030.6,"air_temperature":14.6,"cloud_area_fraction":85.2,"cloud_area_fraction_high":9.4,"cloud_area_fraction_low":84.4,"cloud_area_fraction_medium":0.0,"dew_point_temperature":9.8,"fog_area_fraction":0.0,"relative_humidity":72.8,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":218.8,"wind_speed":7.2}},"next_12_hours":{"summary":{"symbol_code":"cloudy"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"cloudy"},"details":{"air_temperature_max":14.7,"air_temperature_min":14.5,"precipitation_amount":0.4}}}},{"time":"2024-12-17T17:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1030.4,"air_temperature":14.5,"cloud_area_fraction":89.8,"cloud_area_fraction_high":75.0,"cloud_area_fraction_low":73.4,"cloud_area_fraction_medium":0.0,"dew_point_temperature":10.5,"fog_area_fraction":0.0,"relative_humidity":76.7,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":218.1,"wind_speed":7.6}},"next_12_hours":{"summary":{"symbol_code":"cloudy"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"cloudy"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"cloudy"},"details":{"air_temperature_max":14.7,"air_temperature_min":14.5,"precipitation_amount":0.4}}}},{"time":"2024-12-17T18:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1030.3,"air_temperature":14.6,"cloud_area_fraction":96.9,"cloud_area_fraction_high":93.7,"cloud_area_fraction_low":60.9,"cloud_area_fraction_medium":0.0,"dew_point_temperature":10.4,"fog_area_fraction":0.0,"relative_humidity":75.6,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":213.5,"wind_speed":8.0}},"next_12_hours":{"summary":{"symbol_code":"cloudy"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"cloudy"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"cloudy"},"details":{"air_temperature_max":14.7,"air_temperature_min":14.5,"precipitation_amount":0.5}}}},{"time":"2024-12-17T19:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1030.2,"air_temperature":14.7,"cloud_area_fraction":99.2,"cloud_area_fraction_high":95.3,"cloud_area_fraction_low":89.1,"cloud_area_fraction_medium":0.0,"dew_point_temperature":10.2,"fog_area_fraction":0.0,"relative_humidity":74.3,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":212.1,"wind_speed":8.2}},"next_12_hours":{"summary":{"symbol_code":"cloudy"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"lightrain"},"details":{"precipitation_amount":0.1}},"next_6_hours":{"summary":{"symbol_code":"cloudy"},"details":{"air_temperature_max":14.7,"air_temperature_min":14.5,"precipitation_amount":0.5}}}},{"time":"2024-12-17T20:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1030.1,"air_temperature":14.7,"cloud_area_fraction":99.2,"cloud_area_fraction_high":92.2,"cloud_area_fraction_low":90.6,"cloud_area_fraction_medium":0.0,"dew_point_temperature":10.3,"fog_area_fraction":0.0,"relative_humidity":74.9,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":213.8,"wind_speed":8.4}},"next_12_hours":{"summary":{"symbol_code":"cloudy"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"cloudy"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"cloudy"},"details":{"air_temperature_max":14.7,"air_temperature_min":14.5,"precipitation_amount":0.4}}}},{"time":"2024-12-17T21:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1030.2,"air_temperature":14.6,"cloud_area_fraction":100.0,"cloud_area_fraction_high":57.8,"cloud_area_fraction_low":100.0,"cloud_area_fraction_medium":0.0,"dew_point_temperature":10.2,"fog_area_fraction":0.0,"relative_humidity":74.5,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":217.7,"wind_speed":8.6}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"cloudy"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"cloudy"},"details":{"air_temperature_max":14.7,"air_temperature_min":14.4,"precipitation_amount":0.4}}}},{"time":"2024-12-17T22:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1030.1,"air_temperature":14.7,"cloud_area_fraction":100.0,"cloud_area_fraction_high":68.0,"cloud_area_fraction_low":99.2,"cloud_area_fraction_medium":0.0,"dew_point_temperature":10.2,"fog_area_fraction":0.0,"relative_humidity":74.7,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":216.7,"wind_speed":8.3}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"cloudy"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"cloudy"},"details":{"air_temperature_max":14.6,"air_temperature_min":14.3,"precipitation_amount":0.3}}}},{"time":"2024-12-17T23:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1030.1,"air_temperature":14.5,"cloud_area_fraction":100.0,"cloud_area_fraction_high":99.2,"cloud_area_fraction_low":100.0,"cloud_area_fraction_medium":0.0,"dew_point_temperature":9.9,"fog_area_fraction":0.0,"relative_humidity":73.6,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":220.2,"wind_speed":8.2}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"cloudy"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"cloudy"},"details":{"air_temperature_max":14.6,"air_temperature_min":14.1,"precipitation_amount":0.4}}}},{"time":"2024-12-18T00:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1029.9,"air_temperature":14.6,"cloud_area_fraction":100.0,"cloud_area_fraction_high":99.2,"cloud_area_fraction_low":100.0,"cloud_area_fraction_medium":0.0,"dew_point_temperature":9.9,"fog_area_fraction":0.0,"relative_humidity":73.5,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":221.0,"wind_speed":7.9}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"cloudy"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{"air_temperature_max":14.6,"air_temperature_min":14.0,"precipitation_amount":0.4}}}},{"time":"2024-12-18T01:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1029.5,"air_temperature":14.6,"cloud_area_fraction":100.0,"cloud_area_fraction_high":100.0,"cloud_area_fraction_low":97.7,"cloud_area_fraction_medium":14.8,"dew_point_temperature":9.9,"fog_area_fraction":0.0,"relative_humidity":73.1,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":222.5,"wind_speed":7.7}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"cloudy"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{"air_temperature_max":14.6,"air_temperature_min":14.0,"precipitation_amount":0.3}}}},{"time":"2024-12-18T02:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1029.1,"air_temperature":14.6,"cloud_area_fraction":100.0,"cloud_area_fraction_high":100.0,"cloud_area_fraction_low":82.8,"cloud_area_fraction_medium":21.1,"dew_point_temperature":10.1,"fog_area_fraction":0.0,"relative_humidity":74.6,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":226.6,"wind_speed":7.4}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"cloudy"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{"air_temperature_max":14.4,"air_temperature_min":13.9,"precipitation_amount":0.3}}}},{"time":"2024-12-18T03:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1028.6,"air_temperature":14.4,"cloud_area_fraction":94.5,"cloud_area_fraction_high":90.6,"cloud_area_fraction_low":39.8,"cloud_area_fraction_medium":0.0,"dew_point_temperature":10.3,"fog_area_fraction":0.0,"relative_humidity":76.1,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":230.1,"wind_speed":6.7}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"cloudy"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{"air_temperature_max":14.3,"air_temperature_min":13.9,"precipitation_amount":0.3}}}},{"time":"2024-12-18T04:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1028.2,"air_temperature":14.3,"cloud_area_fraction":61.7,"cloud_area_fraction_high":5.5,"cloud_area_fraction_low":59.4,"cloud_area_fraction_medium":0.0,"dew_point_temperature":10.3,"fog_area_fraction":0.0,"relative_humidity":76.7,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":232.1,"wind_speed":6.6}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{"air_temperature_max":14.1,"air_temperature_min":13.9,"precipitation_amount":0.2}}}},{"time":"2024-12-18T05:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1028.1,"air_temperature":14.1,"cloud_area_fraction":75.0,"cloud_area_fraction_high":51.6,"cloud_area_fraction_low":50.0,"cloud_area_fraction_medium":0.0,"dew_point_temperature":10.5,"fog_area_fraction":0.0,"relative_humidity":79.1,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":234.2,"wind_speed":5.9}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{"air_temperature_max":14.1,"air_temperature_min":13.9,"precipitation_amount":0.2}}}},{"time":"2024-12-18T06:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1028.1,"air_temperature":14.0,"cloud_area_fraction":81.2,"cloud_area_fraction_high":57.8,"cloud_area_fraction_low":55.5,"cloud_area_fraction_medium":0.0,"dew_point_temperature":10.6,"fog_area_fraction":0.0,"relative_humidity":80.2,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":238.4,"wind_speed":5.3}},"next_12_hours":{"summary":{"symbol_code":"fair_day"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{"air_temperature_max":14.1,"air_temperature_min":13.9,"precipitation_amount":0.1}}}},{"time":"2024-12-18T07:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1028.1,"air_temperature":14.0,"cloud_area_fraction":81.2,"cloud_area_fraction_high":47.7,"cloud_area_fraction_low":62.5,"cloud_area_fraction_medium":0.0,"dew_point_temperature":10.4,"fog_area_fraction":0.0,"relative_humidity":78.7,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":241.5,"wind_speed":5.2}},"next_12_hours":{"summary":{"symbol_code":"fair_day"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{"air_temperature_max":14.1,"air_temperature_min":13.9,"precipitation_amount":0.1}}}},{"time":"2024-12-18T08:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1028.4,"air_temperature":13.9,"cloud_area_fraction":46.9,"cloud_area_fraction_high":2.3,"cloud_area_fraction_low":45.3,"cloud_area_fraction_medium":0.0,"dew_point_temperature":10.5,"fog_area_fraction":0.0,"relative_humidity":79.2,"ultraviolet_index_clear_sky":0.2,"wind_from_direction":246.7,"wind_speed":5.0}},"next_12_hours":{"summary":{"symbol_code":"fair_day"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{"air_temperature_max":14.1,"air_temperature_min":13.9,"precipitation_amount":0.0}}}},{"time":"2024-12-18T09:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1028.7,"air_temperature":14.1,"cloud_area_fraction":50.0,"cloud_area_fraction_high":2.3,"cloud_area_fraction_low":48.4,"cloud_area_fraction_medium":0.0,"dew_point_temperature":10.3,"fog_area_fraction":0.0,"relative_humidity":77.8,"ultraviolet_index_clear_sky":0.6,"wind_from_direction":249.4,"wind_speed":4.8}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{"air_temperature_max":14.1,"air_temperature_min":13.5,"precipitation_amount":0.0}}}},{"time":"2024-12-18T10:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1028.8,"air_temperature":14.1,"cloud_area_fraction":82.0,"cloud_area_fraction_high":53.1,"cloud_area_fraction_low":60.9,"cloud_area_fraction_medium":0.0,"dew_point_temperature":10.1,"fog_area_fraction":0.0,"relative_humidity":76.7,"ultraviolet_index_clear_sky":1.0,"wind_from_direction":249.8,"wind_speed":4.8}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"fair_day"},"details":{"air_temperature_max":14.1,"air_temperature_min":13.3,"precipitation_amount":0.0}}}},{"time":"2024-12-18T11:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1028.1,"air_temperature":14.0,"cloud_area_fraction":51.6,"cloud_area_fraction_high":19.5,"cloud_area_fraction_low":39.8,"cloud_area_fraction_medium":0.0,"dew_point_temperature":10.0,"fog_area_fraction":0.0,"relative_humidity":76.2,"ultraviolet_index_clear_sky":1.4,"wind_from_direction":240.0,"wind_speed":4.3}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"fair_day"},"details":{"air_temperature_max":14.1,"air_temperature_min":13.2,"precipitation_amount":0.0}}}},{"time":"2024-12-18T12:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1027.3,"air_temperature":14.1,"cloud_area_fraction":48.4,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":48.4,"cloud_area_fraction_medium":0.0,"dew_point_temperature":10.0,"fog_area_fraction":0.0,"relative_humidity":76.5,"ultraviolet_index_clear_sky":1.3,"wind_from_direction":240.0,"wind_speed":4.2}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"fair_day"},"details":{"air_temperature_max":14.1,"air_temperature_min":13.1,"precipitation_amount":0.0}}}},{"time":"2024-12-18T13:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1026.6,"air_temperature":14.1,"cloud_area_fraction":34.4,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":34.4,"cloud_area_fraction_medium":0.0,"dew_point_temperature":10.0,"fog_area_fraction":0.0,"relative_humidity":77.0,"ultraviolet_index_clear_sky":1.0,"wind_from_direction":246.2,"wind_speed":3.9}},"next_1_hours":{"summary":{"symbol_code":"fair_day"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"fair_day"},"details":{"air_temperature_max":13.9,"air_temperature_min":13.1,"precipitation_amount":0.0}}}},{"time":"2024-12-18T14:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1026.1,"air_temperature":13.9,"cloud_area_fraction":29.7,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":29.7,"cloud_area_fraction_medium":0.0,"dew_point_temperature":9.9,"fog_area_fraction":0.0,"relative_humidity":77.2,"ultraviolet_index_clear_sky":0.5,"wind_from_direction":256.1,"wind_speed":3.4}},"next_1_hours":{"summary":{"symbol_code":"fair_day"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"fair_day"},"details":{"air_temperature_max":13.5,"air_temperature_min":13.0,"precipitation_amount":0.0}}}},{"time":"2024-12-18T15:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1025.8,"air_temperature":13.5,"cloud_area_fraction":3.1,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":2.3,"cloud_area_fraction_medium":0.8,"dew_point_temperature":9.7,"fog_area_fraction":0.0,"relative_humidity":77.2,"ultraviolet_index_clear_sky":0.2,"wind_from_direction":266.9,"wind_speed":2.7}},"next_1_hours":{"summary":{"symbol_code":"clearsky_day"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"fair_night"},"details":{"air_temperature_max":13.3,"air_temperature_min":12.5,"precipitation_amount":0.0}}}},{"time":"2024-12-18T16:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1025.6,"air_temperature":13.3,"cloud_area_fraction":5.5,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":5.5,"cloud_area_fraction_medium":0.0,"dew_point_temperature":9.6,"fog_area_fraction":0.0,"relative_humidity":77.8,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":265.3,"wind_speed":2.7}},"next_1_hours":{"summary":{"symbol_code":"clearsky_night"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{"air_temperature_max":13.2,"air_temperature_min":11.9,"precipitation_amount":0.0}}}},{"time":"2024-12-18T17:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1025.4,"air_temperature":13.2,"cloud_area_fraction":10.2,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":10.2,"cloud_area_fraction_medium":0.0,"dew_point_temperature":9.6,"fog_area_fraction":0.0,"relative_humidity":78.2,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":261.8,"wind_speed":2.9}},"next_1_hours":{"summary":{"symbol_code":"clearsky_night"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{"air_temperature_max":13.1,"air_temperature_min":11.8,"precipitation_amount":0.0}}}},{"time":"2024-12-18T18:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1025.6,"air_temperature":13.1,"cloud_area_fraction":10.9,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":10.9,"cloud_area_fraction_medium":0.0,"dew_point_temperature":9.6,"fog_area_fraction":0.0,"relative_humidity":78.4,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":267.2,"wind_speed":3.2}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{}},"next_1_hours":{"summary":{"symbol_code":"clearsky_night"},"details":{"precipitation_amount":0.0}},"next_6_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{"air_temperature_max":13.1,"air_temperature_min":11.5,"precipitation_amount":0.0}}}},{"time":"2024-12-18T19:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1025.6,"air_temperature":13.1,"cloud_area_fraction":45.3,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":45.3,"cloud_area_fraction_medium":0.0,"dew_point_temperature":9.6,"fog_area_fraction":0.0,"relative_humidity":78.5,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":274.1,"wind_speed":3.3}},"next_1_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{"precipitation_amount":0.0}}}},{"time":"2024-12-18T20:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1025.4,"air_temperature":13.0,"cloud_area_fraction":71.1,"cloud_area_fraction_high":2.3,"cloud_area_fraction_low":71.1,"cloud_area_fraction_medium":0.0,"dew_point_temperature":9.6,"fog_area_fraction":0.8,"relative_humidity":79.6,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":286.5,"wind_speed":3.2}},"next_1_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{"precipitation_amount":0.0}}}},{"time":"2024-12-18T21:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1025.0,"air_temperature":12.5,"cloud_area_fraction":77.3,"cloud_area_fraction_high":32.8,"cloud_area_fraction_low":65.6,"cloud_area_fraction_medium":0.0,"dew_point_temperature":9.6,"fog_area_fraction":0.0,"relative_humidity":81.5,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":316.4,"wind_speed":2.2}},"next_1_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{"precipitation_amount":0.0}}}},{"time":"2024-12-18T22:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1024.6,"air_temperature":11.9,"cloud_area_fraction":96.1,"cloud_area_fraction_high":91.4,"cloud_area_fraction_low":66.4,"cloud_area_fraction_medium":0.0,"dew_point_temperature":10.1,"fog_area_fraction":5.5,"relative_humidity":87.8,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":46.5,"wind_speed":1.3}},"next_1_hours":{"summary":{"symbol_code":"cloudy"},"details":{"precipitation_amount":0.0}}}},{"time":"2024-12-18T23:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1024.0,"air_temperature":11.8,"cloud_area_fraction":98.4,"cloud_area_fraction_high":94.5,"cloud_area_fraction_low":85.2,"cloud_area_fraction_medium":0.0,"dew_point_temperature":10.6,"fog_area_fraction":64.1,"relative_humidity":91.3,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":85.6,"wind_speed":2.1}},"next_1_hours":{"summary":{"symbol_code":"fog"},"details":{"precipitation_amount":0.0}}}},{"time":"2024-12-19T00:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1023.3,"air_temperature":11.5,"cloud_area_fraction":97.7,"cloud_area_fraction_high":86.7,"cloud_area_fraction_low":71.1,"cloud_area_fraction_medium":0.0,"dew_point_temperature":11.0,"fog_area_fraction":68.0,"relative_humidity":96.0,"ultraviolet_index_clear_sky":0.0,"wind_from_direction":86.0,"wind_speed":3.2}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{}},"next_6_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{"air_temperature_max":13.8,"air_temperature_min":11.6,"precipitation_amount":0.2}}}},{"time":"2024-12-19T06:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1017.7,"air_temperature":13.8,"cloud_area_fraction":98.4,"cloud_area_fraction_high":96.9,"cloud_area_fraction_low":48.4,"cloud_area_fraction_medium":0.0,"dew_point_temperature":11.6,"relative_humidity":86.8,"wind_from_direction":115.9,"wind_speed":5.4}},"next_12_hours":{"summary":{"symbol_code":"cloudy"},"details":{}},"next_6_hours":{"summary":{"symbol_code":"cloudy"},"details":{"air_temperature_max":14.4,"air_temperature_min":13.7,"precipitation_amount":0.3}}}},{"time":"2024-12-19T12:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1011.4,"air_temperature":14.4,"cloud_area_fraction":89.8,"cloud_area_fraction_high":0.8,"cloud_area_fraction_low":61.7,"cloud_area_fraction_medium":78.1,"dew_point_temperature":12.2,"relative_humidity":87.2,"wind_from_direction":71.9,"wind_speed":7.4}},"next_12_hours":{"summary":{"symbol_code":"lightrainshowers_day"},"details":{}},"next_6_hours":{"summary":{"symbol_code":"cloudy"},"details":{"air_temperature_max":14.7,"air_temperature_min":14.3,"precipitation_amount":0.2}}}},{"time":"2024-12-19T18:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1009.1,"air_temperature":14.4,"cloud_area_fraction":80.5,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":11.7,"cloud_area_fraction_medium":79.7,"dew_point_temperature":11.1,"relative_humidity":80.8,"wind_from_direction":281.8,"wind_speed":2.9}},"next_12_hours":{"summary":{"symbol_code":"lightrainshowers_night"},"details":{}},"next_6_hours":{"summary":{"symbol_code":"rainshowers_night"},"details":{"air_temperature_max":14.5,"air_temperature_min":10.8,"precipitation_amount":1.0}}}},{"time":"2024-12-20T00:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1009.8,"air_temperature":10.8,"cloud_area_fraction":1.6,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":0.8,"cloud_area_fraction_medium":0.8,"dew_point_temperature":5.4,"relative_humidity":69.2,"wind_from_direction":309.7,"wind_speed":14.9}},"next_12_hours":{"summary":{"symbol_code":"fair_day"},"details":{}},"next_6_hours":{"summary":{"symbol_code":"clearsky_night"},"details":{"air_temperature_max":10.8,"air_temperature_min":8.3,"precipitation_amount":0.0}}}},{"time":"2024-12-20T06:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1010.7,"air_temperature":8.3,"cloud_area_fraction":15.6,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":14.8,"cloud_area_fraction_medium":0.8,"dew_point_temperature":3.3,"relative_humidity":70.6,"wind_from_direction":313.0,"wind_speed":16.8}},"next_12_hours":{"summary":{"symbol_code":"fair_day"},"details":{}},"next_6_hours":{"summary":{"symbol_code":"fair_day"},"details":{"air_temperature_max":9.0,"air_temperature_min":8.1,"precipitation_amount":0.0}}}},{"time":"2024-12-20T12:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1011.4,"air_temperature":8.7,"cloud_area_fraction":24.2,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":23.4,"cloud_area_fraction_medium":0.8,"dew_point_temperature":3.3,"relative_humidity":68.7,"wind_from_direction":320.9,"wind_speed":19.1}},"next_12_hours":{"summary":{"symbol_code":"clearsky_day"},"details":{}},"next_6_hours":{"summary":{"symbol_code":"fair_day"},"details":{"air_temperature_max":9.2,"air_temperature_min":8.2,"precipitation_amount":0.0}}}},{"time":"2024-12-20T18:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1017.4,"air_temperature":8.2,"cloud_area_fraction":7.0,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":7.0,"cloud_area_fraction_medium":0.0,"dew_point_temperature":2.7,"relative_humidity":68.5,"wind_from_direction":324.6,"wind_speed":13.8}},"next_12_hours":{"summary":{"symbol_code":"clearsky_night"},"details":{}},"next_6_hours":{"summary":{"symbol_code":"clearsky_night"},"details":{"air_temperature_max":8.2,"air_temperature_min":6.4,"precipitation_amount":0.0}}}},{"time":"2024-12-21T00:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1020.5,"air_temperature":6.4,"cloud_area_fraction":0.0,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":0.0,"cloud_area_fraction_medium":0.0,"dew_point_temperature":2.1,"relative_humidity":74.1,"wind_from_direction":327.7,"wind_speed":9.4}},"next_12_hours":{"summary":{"symbol_code":"fair_day"},"details":{}},"next_6_hours":{"summary":{"symbol_code":"clearsky_night"},"details":{"air_temperature_max":6.5,"air_temperature_min":6.0,"precipitation_amount":0.0}}}},{"time":"2024-12-21T06:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1022.1,"air_temperature":6.2,"cloud_area_fraction":3.1,"cloud_area_fraction_high":3.1,"cloud_area_fraction_low":0.0,"cloud_area_fraction_medium":0.0,"dew_point_temperature":2.0,"relative_humidity":74.8,"wind_from_direction":339.3,"wind_speed":3.9}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{}},"next_6_hours":{"summary":{"symbol_code":"clearsky_day"},"details":{"air_temperature_max":11.2,"air_temperature_min":6.2,"precipitation_amount":0.0}}}},{"time":"2024-12-21T12:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1024.0,"air_temperature":11.2,"cloud_area_fraction":95.3,"cloud_area_fraction_high":95.3,"cloud_area_fraction_low":0.0,"cloud_area_fraction_medium":0.0,"dew_point_temperature":1.6,"relative_humidity":56.9,"wind_from_direction":290.1,"wind_speed":3.4}},"next_12_hours":{"summary":{"symbol_code":"fair_day"},"details":{}},"next_6_hours":{"summary":{"symbol_code":"cloudy"},"details":{"air_temperature_max":11.2,"air_temperature_min":9.1,"precipitation_amount":0.0}}}},{"time":"2024-12-21T18:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1024.4,"air_temperature":9.3,"cloud_area_fraction":0.0,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":0.0,"cloud_area_fraction_medium":0.0,"dew_point_temperature":3.3,"relative_humidity":66.6,"wind_from_direction":339.3,"wind_speed":4.8}},"next_12_hours":{"summary":{"symbol_code":"clearsky_night"},"details":{}},"next_6_hours":{"summary":{"symbol_code":"clearsky_night"},"details":{"air_temperature_max":9.3,"air_temperature_min":7.8,"precipitation_amount":0.0}}}},{"time":"2024-12-22T00:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1025.2,"air_temperature":7.8,"cloud_area_fraction":0.0,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":0.0,"cloud_area_fraction_medium":0.0,"dew_point_temperature":2.4,"relative_humidity":68.9,"wind_from_direction":329.6,"wind_speed":5.5}},"next_12_hours":{"summary":{"symbol_code":"clearsky_day"},"details":{}},"next_6_hours":{"summary":{"symbol_code":"clearsky_night"},"details":{"air_temperature_max":7.8,"air_temperature_min":7.4,"precipitation_amount":0.0}}}},{"time":"2024-12-22T06:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1024.9,"air_temperature":7.5,"cloud_area_fraction":0.0,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":0.0,"cloud_area_fraction_medium":0.0,"dew_point_temperature":3.6,"relative_humidity":75.9,"wind_from_direction":316.8,"wind_speed":4.9}},"next_12_hours":{"summary":{"symbol_code":"clearsky_day"},"details":{}},"next_6_hours":{"summary":{"symbol_code":"clearsky_day"},"details":{"air_temperature_max":11.0,"air_temperature_min":7.5,"precipitation_amount":0.0}}}},{"time":"2024-12-22T12:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1024.9,"air_temperature":11.0,"cloud_area_fraction":0.0,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":0.0,"cloud_area_fraction_medium":0.0,"dew_point_temperature":5.4,"relative_humidity":68.9,"wind_from_direction":295.8,"wind_speed":7.6}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{}},"next_6_hours":{"summary":{"symbol_code":"clearsky_day"},"details":{"air_temperature_max":12.1,"air_temperature_min":10.8,"precipitation_amount":0.0}}}},{"time":"2024-12-22T18:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1023.5,"air_temperature":11.8,"cloud_area_fraction":50.8,"cloud_area_fraction_high":50.0,"cloud_area_fraction_low":0.8,"cloud_area_fraction_medium":0.0,"dew_point_temperature":8.4,"relative_humidity":79.5,"wind_from_direction":305.3,"wind_speed":9.2}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{}},"next_6_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{"air_temperature_max":11.8,"air_temperature_min":10.4,"precipitation_amount":0.0}}}},{"time":"2024-12-23T00:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1021.9,"air_temperature":11.2,"cloud_area_fraction":60.9,"cloud_area_fraction_high":52.3,"cloud_area_fraction_low":9.4,"cloud_area_fraction_medium":13.3,"dew_point_temperature":7.3,"relative_humidity":77.0,"wind_from_direction":304.9,"wind_speed":10.7}},"next_12_hours":{"summary":{"symbol_code":"fair_day"},"details":{}},"next_6_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{"air_temperature_max":12.8,"air_temperature_min":11.2,"precipitation_amount":0.0}}}},{"time":"2024-12-23T06:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1019.6,"air_temperature":11.5,"cloud_area_fraction":16.4,"cloud_area_fraction_high":14.8,"cloud_area_fraction_low":2.3,"cloud_area_fraction_medium":0.8,"dew_point_temperature":6.1,"relative_humidity":69.7,"wind_from_direction":302.5,"wind_speed":12.1}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{}},"next_6_hours":{"summary":{"symbol_code":"fair_day"},"details":{"air_temperature_max":11.5,"air_temperature_min":10.4,"precipitation_amount":0.0}}}},{"time":"2024-12-23T12:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1020.9,"air_temperature":11.2,"cloud_area_fraction":56.2,"cloud_area_fraction_high":53.9,"cloud_area_fraction_low":5.5,"cloud_area_fraction_medium":0.0,"dew_point_temperature":5.7,"relative_humidity":68.3,"wind_from_direction":301.8,"wind_speed":14.4}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{}},"next_6_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{"air_temperature_max":11.5,"air_temperature_min":10.5,"precipitation_amount":0.0}}}},{"time":"2024-12-23T18:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1022.3,"air_temperature":10.5,"cloud_area_fraction":94.5,"cloud_area_fraction_high":94.5,"cloud_area_fraction_low":0.0,"cloud_area_fraction_medium":0.0,"dew_point_temperature":4.5,"relative_humidity":66.5,"wind_from_direction":308.3,"wind_speed":13.2}},"next_12_hours":{"summary":{"symbol_code":"cloudy"},"details":{}},"next_6_hours":{"summary":{"symbol_code":"cloudy"},"details":{"air_temperature_max":10.5,"air_temperature_min":9.5,"precipitation_amount":0.0}}}},{"time":"2024-12-24T00:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1024.4,"air_temperature":9.6,"cloud_area_fraction":88.3,"cloud_area_fraction_high":88.3,"cloud_area_fraction_low":0.8,"cloud_area_fraction_medium":0.0,"dew_point_temperature":4.8,"relative_humidity":72.1,"wind_from_direction":317.3,"wind_speed":10.9}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{}},"next_6_hours":{"summary":{"symbol_code":"cloudy"},"details":{"air_temperature_max":12.1,"air_temperature_min":9.6,"precipitation_amount":0.0}}}},{"time":"2024-12-24T06:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1022.0,"air_temperature":12.1,"cloud_area_fraction":96.1,"cloud_area_fraction_high":96.1,"cloud_area_fraction_low":12.5,"cloud_area_fraction_medium":0.0,"dew_point_temperature":7.0,"relative_humidity":70.9,"wind_from_direction":315.2,"wind_speed":11.8}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{}},"next_6_hours":{"summary":{"symbol_code":"cloudy"},"details":{"air_temperature_max":14.3,"air_temperature_min":11.8,"precipitation_amount":0.0}}}},{"time":"2024-12-24T12:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1022.3,"air_temperature":14.3,"cloud_area_fraction":60.9,"cloud_area_fraction_high":57.0,"cloud_area_fraction_low":8.6,"cloud_area_fraction_medium":1.6,"dew_point_temperature":8.8,"relative_humidity":72.8,"wind_from_direction":289.5,"wind_speed":12.1}},"next_12_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{}},"next_6_hours":{"summary":{"symbol_code":"partlycloudy_day"},"details":{"air_temperature_max":14.3,"air_temperature_min":13.5,"precipitation_amount":0.0}}}},{"time":"2024-12-24T18:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1022.7,"air_temperature":13.7,"cloud_area_fraction":76.6,"cloud_area_fraction_high":75.0,"cloud_area_fraction_low":6.2,"cloud_area_fraction_medium":0.0,"dew_point_temperature":9.3,"relative_humidity":74.8,"wind_from_direction":302.8,"wind_speed":9.8}},"next_12_hours":{"summary":{"symbol_code":"fair_night"},"details":{}},"next_6_hours":{"summary":{"symbol_code":"partlycloudy_night"},"details":{"air_temperature_max":13.7,"air_temperature_min":13.1,"precipitation_amount":0.0}}}},{"time":"2024-12-25T00:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1023.7,"air_temperature":13.1,"cloud_area_fraction":2.3,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":2.3,"cloud_area_fraction_medium":0.0,"dew_point_temperature":9.0,"relative_humidity":76.0,"wind_from_direction":313.1,"wind_speed":6.3}},"next_12_hours":{"summary":{"symbol_code":"clearsky_day"},"details":{}},"next_6_hours":{"summary":{"symbol_code":"clearsky_night"},"details":{"air_temperature_max":13.1,"air_temperature_min":12.5,"precipitation_amount":0.0}}}},{"time":"2024-12-25T06:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1023.9,"air_temperature":12.7,"cloud_area_fraction":1.6,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":1.6,"cloud_area_fraction_medium":0.8,"dew_point_temperature":9.3,"relative_humidity":79.7,"wind_from_direction":332.2,"wind_speed":4.2}},"next_6_hours":{"summary":{"symbol_code":"clearsky_day"},"details":{"air_temperature_max":17.1,"air_temperature_min":12.5,"precipitation_amount":0.0}}}},{"time":"2024-12-25T12:00:00Z","data":{"instant":{"details":{"air_pressure_at_sea_level":1023.4,"air_temperature":17.1,"cloud_area_fraction":3.1,"cloud_area_fraction_high":0.0,"cloud_area_fraction_low":3.1,"cloud_area_fraction_medium":0.0,"dew_point_temperature":10.8,"relative_humidity":71.8,"wind_from_direction":302.1,"wind_speed":11.1}}}}]}}';

      }
      // responseText contains a JSON object with weather info
       
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

      console.log(humidity);

      if (units == 1) {
        rTemperature = celsiusToFahrenheit(rTemperature);
        tmin = celsiusToFahrenheit(tmin);
        tmax = celsiusToFahrenheit(tmax);
      }

      tmax = Math.round(tmax);
      tmin = Math.round(tmin);
      var temperature = Math.round(rTemperature);
      var wind = Math.round(jsonWeather.properties.timeseries[0].data.instant.details.wind_speed);
     
      console.log(units);
      console.log(wind);
     
  
      if (units == 1) {
        // mph convertion
        wind = convertMpsToMph(wind);
      }
     
      if (bFakeData == 1){
        wind = 666;
        tmin = 20;
        tmax = 10;
        temperature = 28;
        humidity = 50;
      }

      var icon = jsonWeather.properties.timeseries[0].data.next_12_hours.summary.symbol_code;

      console.log(icon);

      getIOPoolData();


      // testenvoi layer
      // Assemble dictionary using our keys
      var dictionary = {
        "KEY_TEMPERATURE": temperature,
        "KEY_HUMIDITY": humidity,

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

        "KEY_LOCATION": "",

      };

      // Send to Pebble
      Pebble.sendAppMessage(dictionary,
        function (e) {
          console.log("Weather info sent to Pebble successfully!");
        },
        function (e) {
          console.log("Error sending weather info to Pebble!");
        }
      );


    }
  );

}

function locationSuccess(pos) {

  current_Latitude = pos.coords.latitude;
  current_Longitude = pos.coords.longitude;

  localStorage.setItem(160, current_Latitude);
  localStorage.setItem(161, current_Longitude);

  console.log("location success");
  
  getForecast();
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
        latitude: current_Latitude,        // Remplacez par la latitude réelle
        longitude: current_Longitude,        // Remplacez par la longitude réelle
        altitude: null,              // Peut être null si non disponible
        accuracy: 10,                // Précision en mètres
        altitudeAccuracy: null,      // Peut être null si non disponible
        heading: null,               // Peut être null si l'appareil est stationnaire
        speed: null                  // Peut être null si non disponible
      },
      timestamp: 1692448765123        // Timestamp en millisecondes depuis l'époque Unix
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
    )
  }
  else {
    const position = {
      coords: {
        latitude: 43.1380428,        // Remplacez par la latitude réelle
        longitude: 5.7337657,        // Remplacez par la longitude réelle
        altitude: null,              // Peut être null si non disponible
        accuracy: 10,                // Précision en mètres
        altitudeAccuracy: null,      // Peut être null si non disponible
        heading: null,               // Peut être null si l'appareil est stationnaire
        speed: null                  // Peut être null si non disponible
      },
      timestamp: 1692448765123        // Timestamp en millisecondes depuis l'époque Unix
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
  function (e) {
    // console.log("avant battery init");
    //Battery_Init();

    console.log("PebbleKit JS ready!");
  }
);



Pebble.addEventListener('appmessage',
  function (e) {
    if ((navigator.onLine) || (b_force_internet)) {
      console.log("Appel météo !!");
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
  gps = 1;
  var input_city = configData['input_city'];
  input_city = ""
  var input_api = configData['input_api'];
  input_api = ""
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
