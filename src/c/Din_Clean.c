#include <inttypes.h>
#include <pebble.h>
#include <stdbool.h>

// Nouvelle clé pour l'option d'affichage du graphique météo
#define KEY_SHOW_WEATHER 170
#define KEY_SHOW_NEWS 171
#include <pebble.h>

#include "ui_icon_bar.h"
#include "ui_news_feed.h"
#include "ui_time.h"
#include "ui_weather_graph.h"
#include "weather_utils.h"

#ifndef WEATHER_GRAPH_DEBUG_RAIN_SAMPLE
#define WEATHER_GRAPH_DEBUG_RAIN_SAMPLE 0
#endif

// pour afficher les segments
#define FORCE_REFRESH false
#define IS_HOUR_FICTIVE false

#define FICTIVE_HOUR 12
#define FICTIVE_MINUTE 34

#define RULER_XOFFSET 36
#define TEXT_HOUR_OFFSET 56

#define MARK_0 42

#define RULER_SIZE -2
#define MAXRAIN 40

#define LINE_THICK 3

// For the gradiant effect, 1/2 pixels, 1/3 and 1/4
#define GRADIANT 4
#define GRADIANT_X_OFFSET -1
#define GRADIANT_Y_OFFSET -10

// Unified B&W mode for all platforms (aplite style)
#define BLUE_LINE GColorWhite
#define RAIN_COLOR GColorWhite
#define RED_LINE GColorWhite
#define IS_COLOR false

#define STATUS_FONT FONT_KEY_GOTHIC_14

#define KEY_TEMPERATURE 0
#define KEY_WIND_SPEED 3
#define KEY_HUMIDITY 5
#define KEY_TMIN 8
#define KEY_TMAX 9
#define KEY_ICON 10

#define KEY_FORECAST_TEMP1 11
#define KEY_FORECAST_TEMP2 12
#define KEY_FORECAST_TEMP3 13
#define KEY_FORECAST_TEMP4 14
#define KEY_FORECAST_TEMP5 15
#define KEY_FORECAST_H1 16
#define KEY_FORECAST_H2 17
#define KEY_FORECAST_H3 18
#define KEY_FORECAST_RAIN1 21
#define KEY_FORECAST_RAIN2 22
#define KEY_FORECAST_RAIN3 23
#define KEY_FORECAST_RAIN4 24
#define KEY_FORECAST_ICON1 26
#define KEY_FORECAST_ICON2 27
#define KEY_FORECAST_ICON3 28
#define KEY_FORECAST_WIND1 29
#define KEY_FORECAST_WIND2 30
#define KEY_FORECAST_WIND3 31
#define KEY_LOCATION 32

#define KEY_FORECAST_H0 120
#define KEY_FORECAST_WIND0 149

// Detailed rain keys (3 per 3-hour block)
#define KEY_FORECAST_RAIN11 126
#define KEY_FORECAST_RAIN12 127
#define KEY_FORECAST_RAIN21 128
#define KEY_FORECAST_RAIN22 129
#define KEY_FORECAST_RAIN31 130
#define KEY_FORECAST_RAIN32 131
#define KEY_FORECAST_RAIN41 132
#define KEY_FORECAST_RAIN42 133

// Graph winds (4 blocks)
#define KEY_GRAPH_WIND0 240
#define KEY_GRAPH_WIND1 241
#define KEY_GRAPH_WIND2 242
#define KEY_GRAPH_WIND3 243

// Graph hours (3 additional hours, h0 already exists)
#define KEY_GRAPH_H1 250
#define KEY_GRAPH_H2 251
#define KEY_GRAPH_H3 252

#define KEY_RADIO_UNITS 36
#define KEY_RADIO_REFRESH 54
#define KEY_TOGGLE_VIBRATION 37
#define KEY_COLOR_RIGHT_R 39
#define KEY_COLOR_RIGHT_G 40
#define KEY_COLOR_RIGHT_B 41
#define KEY_COLOR_LEFT_R 42
#define KEY_COLOR_LEFT_G 43
#define KEY_COLOR_LEFT_B 44

#define KEY_TOGGLE_BT 103
#define KEY_LAST_REFRESH 55

#define KEY_POOLTEMP 113
#define KEY_POOLPH 114
#define KEY_poolORP 115

// News feed keys
#define KEY_NEWS_TITLE 172
#define KEY_REQUEST_NEWS 173
#define KEY_DOUBLE_TAP 174
#define KEY_NEWS_FEED_URL 175
#define KEY_NEWS_CHANNEL_TITLE 176

// 3-day forecast keys (for ui_weather_days)
#define KEY_DAY1_TEMP 200
#define KEY_DAY1_ICON 201
#define KEY_DAY1_RAIN 202 // mm de pluie
#define KEY_DAY1_WIND 203 // vitesse vent
#define KEY_DAY2_TEMP 204
#define KEY_DAY2_ICON 205
#define KEY_DAY2_RAIN 206
#define KEY_DAY2_WIND 207
#define KEY_DAY3_TEMP 208
#define KEY_DAY3_ICON 209
#define KEY_DAY3_RAIN 210
#define KEY_DAY3_WIND 211

//******************************************************************
//******************************************************************
//******************************************************************

#define WIDTH 144
#define HEIGHT 168

#define XOFFSET 18
#define YOFFSET 0

#define TEXT_DAYW_STATUS_OFFSET_X -3
#define TEXT_DAYW_STATUS_OFFSET_Y 0

#define TEXT_DAY_STATUS_OFFSET_X -1
#define TEXT_DAY_STATUS_OFFSET_Y 6
#define TEXT_MONTH_STATUS_OFFSET_X -3
#define TEXT_MONTH_STATUS_OFFSET_Y 32

#define ICON_BT_X -2
#define ICON_BT_Y 16

#define BAT_STATUS_OFFSET_X 7

#define BAT_STATUS_OFFSET_Y 127
#define ICONW_X 3
#define ICONW_Y 77
#define BAT_PHONE_STATUS_OFFSET_X 0
#define BAT_PHONE_STATUS_OFFSET_Y 57

#define ICON_X 0
#define ICON_Y 30

#define TEXT_TEMP_OFFSET_X -12
#define TEXT_TEMP_OFFSET_Y 75

#define TEXT_HUM_OFFSET_X 2
#define TEXT_HUM_OFFSET_Y 77

#define TEXT_TMIN_OFFSET_X -5
#define TEXT_TMIN_OFFSET_Y 131
#define TEXT_TMAX_OFFSET_X -5
#define TEXT_TMAX_OFFSET_Y 144

#define ICON6_X 0
#define ICON6_Y 101

#define TEXT_WIND_OFFSET_X 10
#define TEXT_WIND_OFFSET_Y 80

// For bluetooth lost notification
#define BT_STATUS_OFFSET_Y -27

#define WEATHER_OFFSET_X -14
#define WEATHER_OFFSET_Y -9

#define MARK_5 12
#define MARK_15 22
#define MARK_30 32

#define QUIET_TIME_START 22
#define QUIET_TIME_END 10

static Window *s_main_window;
static Layer *s_canvas_layer;
static Layer *layer;

static int hour_part_size = 0;

static char week_day[4] = " ";
static char month[4] = " ";
static char mday[4] = " ";
// static char tmin[10] = " ";  // UNUSED - use tmin_val instead
// static char tmax[10] = " ";  // UNUSED - use tmax_val instead
static char weather_temp_char[10] = " ";
// static char weather_hum_char[10] = " ";  // UNUSED - saves 10 bytes
static char minMax[16] = " "; // Reduced from 120 - saves 104 bytes
static char minTemp[8] = " "; // Reduced from 12 - saves 4 bytes
static char maxTemp[8] = " "; // Reduced from 12 - saves 4 bytes

// POOL DATA

char poolTemp[10];
char poolPH[10];
char poolORP[10];
int npoolTemp;
int npoolPH;
int npoolORP;

// WEATHER

static int8_t weather_temp = 0;

static time_t t;
static struct tm now;

static int8_t tmin_val = 0;
static int8_t tmax_val = 0;
static uint8_t wind_speed_val = 0;
static uint8_t humidity = 0;
static uint8_t wind1_val = 0;
static uint8_t wind2_val = 0;
static uint8_t wind3_val = 0;
static int8_t temp1_val = 0;
static int8_t temp2_val = 0;
static int8_t temp3_val = 0;
static int8_t temp4_val = 0;
static int8_t temp5_val = 0;
static uint8_t rain1_val = 0;
static uint8_t rain2_val = 0;
static uint8_t rain3_val = 0;
static uint8_t rain4_val = 0;
time_t last_refresh = 0;
int duration = 3600;
int offline_delay = 600; // +10 minutes pour éviter que les icônes
                         // disparaissent pendant l'appel météo
AppTimer *timer_short;

static char icon[24] = " ";
static char icon1[24] = " ";
static char icon2[24] = " ";
static char icon3[24] = " ";

static char location[20] = " "; // Reduced from 100 - saves 80 bytes
// UNUSED wind/temp/rain char arrays - we use _val int versions - saves 120
// bytes static char wind1[10] = " "; static char wind2[10] = " "; static char
// wind3[10] = " "; static char temp1[10] = " "; static char temp2[10] = " ";
// static char temp3[10] = " ";
// static char temp4[10] = " ";
// static char temp5[10] = " ";
// static char rain1[10] = " ";
// static char rain2[10] = " ";
// static char rain3[10] = " ";
// static char rain4[10] = " ";
static char rain_ico_val;

// Extended hourly forecast data for weather graph (minimized for memory)
static int8_t graph_temps[5] = {10, 10, 10, 10, 10};
static uint8_t graph_rains[12] = {0};
static char graph_icon1[24] = "";
static char graph_icon2[24] = "";
static char graph_icon3[24] = "";
static uint8_t graph_wind_val[4] = {0, 0, 0, 0};
static uint8_t graph_hours[4] = {0, 3, 6, 9};

// 3-day forecast data for ui_weather_days
static char days_temp[3][12] = {"--", "--", "--"};
static char days_icon[3][24] = {"", "", ""};
static char days_rain[3][6] = {"0mm", "0mm", "0mm"};
static char days_wind[3][6] = {"0km/h", "0km/h", "0km/h"};

// News feed data
static char news_title[80] = "";
static char news_channel_title[32] =
    "News Feed"; // Title of the RSS channel/journal
static uint8_t news_display_count = 0;
static uint8_t news_max_count = 5;
static uint16_t news_interval_ms = 1000; // Pause between titles
static AppTimer *news_timer = NULL;
static bool s_news_request_pending = false; // Flag for pending news request

// RSVP (Rapid Serial Visual Presentation)
static char rsvp_word[24] = "";     // Current word being displayed
static uint8_t rsvp_word_index = 0; // Current word position in title
static uint16_t rsvp_wpm_ms =
    160; // 110ms per word (~545 WPM) - Variable de vitesse
static AppTimer *rsvp_timer = NULL;
static bool s_news_splash_active = false; // Show Reuters splash screen
static bool s_news_end_screen = false;    // Show END screen

// Double-tap detection
static time_t last_tap_time = 0;
static uint8_t tap_interval_sec = 2;    // Reduced from 3 to be more precise
static time_t last_news_activation = 0; // Cooldown between news activations
static uint8_t news_activation_cooldown_sec =
    5; // 5s cooldown (reduced from 30s)

// News retry protection
static uint8_t news_retry_count = 0;
static uint8_t news_max_retries = 3;         // Max retries before giving up
static AppTimer *news_global_timeout = NULL; // Global timeout to exit news mode

// Whiteout screen mode (0=graph, 1=news)
typedef enum {
  WHITEOUT_SCREEN_GRAPH = 0,
  WHITEOUT_SCREEN_NEWS = 1
} WhiteoutScreenMode;
static WhiteoutScreenMode s_whiteout_screen = WHITEOUT_SCREEN_GRAPH;

// Packed flags to save memory (was 12 separate bools = 12 bytes, now 2 bytes)
typedef struct {
  uint16_t is_metric : 1;
  uint16_t is_30mn : 1;
  uint16_t is_bt : 1;
  uint16_t is_vibration : 1;
  uint16_t s_whiteout_active : 1;
  uint16_t fontbig_loaded : 1;
  uint16_t first_draw_logged : 1;
  uint16_t is_charging : 1;
  uint16_t is_connected : 1;
  uint16_t show_weather : 1;
  uint16_t show_news : 1;
  uint16_t require_double_tap : 1;
} AppFlags;
static AppFlags flags = {.is_metric = 1,
                         .is_30mn = 1,
                         .is_bt = 0,
                         .is_vibration = 0,
                         .s_whiteout_active = 0,
                         .fontbig_loaded = 0,
                         .first_draw_logged = 0,
                         .is_charging = 0,
                         .is_connected = 0,
                         .show_weather = 1,
                         .show_news = 0,
                         .require_double_tap = 1};

static GColor color_right;
static GColor color_left;
static GColor color_temp;

static GPoint line1_p1 = {0, 84};
static GPoint line1_p2 = {143, 84};
static GPoint line2_p1 = {0, 0};
static GPoint line2_p2 = {0, 0};

static int8_t hour_offset_x = 0;
static int8_t hour_offset_y = 0;
static int8_t status_offset_x = 0;
static int8_t status_offset_y = 0;

static int hour_line_ypos = 84 + YOFFSET;

// For week day
static GFont fontsmall;
// For 2dn screen
static GFont fontsmallbold;
// Dates and temp
static GFont fontmedium;
// Hour display
static GFont fontbig;
static uint16_t fontbig_resource_id = 0;
static void ensure_fontbig_loaded(void);

static uint8_t line_interval = 4;
static uint8_t segment_thickness = 2;

// UNUSED markWidth array - saves 48 bytes
static int8_t labels_12h[28] = {10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8,  9,  10, 11,
                                12, 1,  2,  3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1};
static int8_t labels[28] = {22, 23, 0,  1,  2,  3,  4,  5,  6,  7,
                            8,  9,  10, 11, 12, 13, 14, 15, 16, 17,
                            18, 19, 20, 21, 22, 23, 0,  1};

static uint8_t battery_level = 0;

static void app_focus_changed(bool focused) {
  if (focused) {
    layer_set_hidden(layer, false);
    layer_mark_dirty(layer);
  }
}

static void app_focus_changing(bool focusing) {
  if (focusing) {
    layer_set_hidden(layer, true);
  }
}

// Wrapper around weather_utils_build_icon with pool warning check
static int build_icon_with_pool_check(const char *text_icon) {
  // Pool warning check - override icon if pool values are critical
  if (npoolORP != 0) {
    if ((npoolORP < 650) || (npoolPH < 710)) {
      return RESOURCE_ID_WARNING_W;
    }
  }
  return weather_utils_build_icon(text_icon, true);
}

// UNUSED build_number function - saves ~200 bytes of code
/*
static int build_number(char number) {
  if (number == '0') {
    return RESOURCE_ID_0;
  }
  if (number == '1') {
    return RESOURCE_ID_1;
  }
  if (number == '2') {
    return RESOURCE_ID_2;
  }
  if (number == '3') {
    return RESOURCE_ID_3;
  }
  if (number == '4') {
    return RESOURCE_ID_4;
  }
  if (number == '5') {
    return RESOURCE_ID_5;
  }
  if (number == '6') {
    return RESOURCE_ID_6;
  }
  if (number == '7') {
    return RESOURCE_ID_7;
  }
  if (number == '8') {
    return RESOURCE_ID_8;
  }
  if (number == '9') {
    return RESOURCE_ID_9;
  }
  return RESOURCE_ID_0;
}
*/

int abs(int x) {
  if (x >= 0)
    return x;
  else
    return -x;
}

float my_sqrt(float num) {
  float a, p, e = 0.001, b;

  a = num;
  p = a * a;
  while (p - num >= e) {
    b = (a + (num / a)) / 2;
    a = b;
    p = a * a;
  }
  return a;
}

static void fill_weather_graph_data(WeatherGraphData *out) {
  if (!out) {
    return;
  }

  for (int i = 0; i < 5; i++) {
    out->temps[i] = graph_temps[i];
  }

#if WEATHER_GRAPH_DEBUG_RAIN_SAMPLE
  static const uint8_t s_debug_rain_values[12] = {0,  4,  8, 12, 16, 20,
                                                  24, 16, 8, 4,  0,  10};
  for (int i = 0; i < 12; i++) {
    out->rains[i] = s_debug_rain_values[i];
  }
#else
  for (int i = 0; i < 12; i++) {
    out->rains[i] = graph_rains[i];
  }
#endif

  for (int i = 0; i < 4; i++) {
    out->hours[i] = graph_hours[i];
    snprintf(out->winds[i], sizeof(out->winds[i]), "%d", graph_wind_val[i]);
  }

  // Build icon resource IDs for the 3-day forecast display
  // Use days_icon[0], days_icon[1], days_icon[2] for J+1, J+2, J+3 forecasts
  // Fall back to hourly graph_icon strings only if daily icons are not
  // available

  // Validate days_icon strings (3-day forecast from API)
  bool days_icon0_valid = (days_icon[0][0] != '\0' && days_icon[0][0] != ' ');
  bool days_icon1_valid = (days_icon[1][0] != '\0' && days_icon[1][0] != ' ');
  bool days_icon2_valid = (days_icon[2][0] != '\0' && days_icon[2][0] != ' ');

  // Validate hourly graph_icon strings (fallback)
  bool icon1_valid = (graph_icon1[0] != '\0' && graph_icon1[0] != ' ');
  bool icon2_valid = (graph_icon2[0] != '\0' && graph_icon2[0] != ' ');
  bool icon3_valid = (graph_icon3[0] != '\0' && graph_icon3[0] != ' ');

  // Day 1 (tomorrow): prefer days_icon[0], fallback to graph_icon1
  char *day1_icon_str =
      days_icon0_valid ? days_icon[0] : (icon1_valid ? graph_icon1 : NULL);
  out->icon_ids[0] = weather_utils_build_icon(day1_icon_str, true);

  // Day 2 (after tomorrow): prefer days_icon[1], fallback to graph_icon2
  char *day2_icon_str =
      days_icon1_valid ? days_icon[1] : (icon2_valid ? graph_icon2 : NULL);
  out->icon_ids[1] = weather_utils_build_icon(day2_icon_str, true);

  // Day 3: prefer days_icon[2], fallback to graph_icon3
  char *day3_icon_str =
      days_icon2_valid ? days_icon[2] : (icon3_valid ? graph_icon3 : NULL);
  out->icon_ids[2] = weather_utils_build_icon(day3_icon_str, true);

  // Validate all icon IDs - set to 0 if invalid to prevent crashes
  for (int i = 0; i < 3; i++) {
    if (out->icon_ids[i] < 0 || out->icon_ids[i] > 500) {
      out->icon_ids[i] = 0;
    }
  }

  out->is_metric = flags.is_metric;
}

// Draw weather graph screen (hourly forecast with temperature curve and rain
// bars)

// Static buffer for weather graph data to avoid stack overflow
static WeatherGraphData s_graph_data;

static void update_proc(Layer *layer, GContext *ctx) {

  // Weather screen mode: temporarily unload heavy custom font to free memory
  if (flags.s_whiteout_active) {
    // Unload heavy font if loaded to free memory for weather bitmaps
    if (flags.fontbig_loaded && fontbig_resource_id != 0) {
      fonts_unload_custom_font(fontbig);
      flags.fontbig_loaded = false;
    }

    if (s_whiteout_screen == WHITEOUT_SCREEN_NEWS) {
      ui_draw_news_feed(ctx, rsvp_word, s_news_splash_active, s_news_end_screen,
                        news_channel_title);
    } else {
      fill_weather_graph_data(&s_graph_data);
      ui_draw_weather_graph(ctx, &s_graph_data);
    }
    return;
  }

  // Ensure heavy custom font is loaded only when needed (not in weather graph
  // mode)
  ensure_fontbig_loaded();

  if (!flags.first_draw_logged) {
    flags.first_draw_logged = true;
  }

  // ruler_large is always true now
  line_interval = 5;
  segment_thickness = 3;

  // DRAW DIAL
  GRect rect_text_day = {{TEXT_DAY_STATUS_OFFSET_X + status_offset_x,
                          TEXT_DAY_STATUS_OFFSET_Y + status_offset_y},
                         {RULER_XOFFSET, 150}};
  GRect rect_text_dayw = {{TEXT_DAYW_STATUS_OFFSET_X + status_offset_x,
                           TEXT_DAYW_STATUS_OFFSET_Y + status_offset_y},
                          {RULER_XOFFSET, 150}};
  GRect rect_temp = {{TEXT_TEMP_OFFSET_X + status_offset_x,
                      TEXT_TEMP_OFFSET_Y + status_offset_y},
                     {60, 60}};

  GRect rect_tmin = {{TEXT_TMIN_OFFSET_X, TEXT_TMIN_OFFSET_Y + status_offset_y},
                     {45, 35}};
  GRect rect_tmax = {{TEXT_TMAX_OFFSET_X, TEXT_TMAX_OFFSET_Y + status_offset_y},
                     {45, 35}};

  GRect rect_screen = {{0, 0}, {144, 168}};

  GRect rect_icon = {{ICON_X, ICON_Y + 9}, {35, 35}};
  GRect rect_icon6 = {{ICON6_X, ICON6_Y + 9}, {35, 35}};

  GRect rect_icon_hum1 = {{5, 116}, {7, 10}};
  GRect rect_icon_hum2 = {{14, 116}, {7, 10}};
  GRect rect_icon_hum3 = {{23, 116}, {7, 10}};
  GRect rect_icon_leaf = {{12, 116}, {11, 10}};

  GRect rect_bt_disconect = {
      {ICON_BT_X + status_offset_x, ICON_BT_Y + status_offset_y}, {35, 17}};

  int icon_id;
  int icon_id6;
  rain_ico_val = rain1_val;
  icon_id = build_icon_with_pool_check(icon);
  rain_ico_val = rain3_val;
  icon_id6 = build_icon_with_pool_check(icon2);
  // icon_id = build_icon("01d");
  // icon_id6 = build_icon("01d");

  // Draw background
  graphics_context_set_fill_color(ctx, color_right);
  graphics_fill_rect(ctx, GRect(RULER_XOFFSET, 0, 160, 180), 0, GCornerNone);
  graphics_context_set_fill_color(ctx, color_left);
  graphics_fill_rect(ctx, GRect(0, 0, RULER_XOFFSET, 180), 0, GCornerNone);

  t = time(NULL);
  now = *(localtime(&t));

  const char *locale = i18n_get_system_locale();
  snprintf(week_day, sizeof(week_day), "%s",
           weather_utils_get_weekday_abbrev(locale, now.tm_wday));
  snprintf(month, sizeof(month), "%s",
           weather_utils_get_month_abbrev(locale, now.tm_mon));

  snprintf(mday, sizeof(mday), "%i", now.tm_mday);
  graphics_context_set_text_color(ctx, color_temp);
  rect_text_dayw.origin.x += 2;

  bool has_fresh_weather =
      ((mktime(&now) - last_refresh) < duration + offline_delay);

  snprintf(weather_temp_char, sizeof(weather_temp_char), "%i°", weather_temp);
  snprintf(minMax, sizeof(minMax), "%i %i", tmin_val, tmax_val);
  snprintf(minTemp, sizeof(minMax), "%i°", tmin_val);
  snprintf(maxTemp, sizeof(maxTemp), "%i°", tmax_val);

  // Draw hours FIRST for instant display (only 4 small bitmaps)
  static char heure[10];
  time_t t = time(NULL);
  struct tm now = *(localtime(&t));

  if (clock_is_24h_style() == true) {
    strftime(heure, sizeof(heure), "%H%M", &now);
  } else {
    strftime(heure, sizeof(heure), "%I%M", &now);
  }

  if (IS_HOUR_FICTIVE) {
    snprintf(heure, sizeof(heure), "%i%i", FICTIVE_HOUR, FICTIVE_MINUTE);
  }

  int offset_x = 41;
  int offset_y = 85;
  int num_x = 60;
  int num_y = 1;

  GRect rect_hour_id1 = {{num_x, num_y}, {46, 81}};
  GRect rect_hour_id2 = {{num_x + offset_x, num_y}, {46, 81}};
  GRect rect_minute_id1 = {{num_x, num_y + offset_y}, {46, 81}};
  GRect rect_minute_id2 = {{num_x + offset_x, num_y + offset_y}, {46, 81}};

  TimeRenderData time_data = {.digit_rects = {rect_hour_id1, rect_hour_id2,
                                              rect_minute_id1,
                                              rect_minute_id2}};
  snprintf(time_data.digits, sizeof(time_data.digits), "%s", heure);
  ui_draw_time(ctx, &time_data);

  // Draw icon bar AFTER time (loads many bitmaps, slower)
  IconBarData icon_data = {.fontsmall = fontsmall,
                           .fontsmallbold = fontsmallbold,
                           .fontmedium = fontmedium,
                           .color_temp = color_temp,
                           .week_day = week_day,
                           .mday = mday,
                           .min_temp_text = minTemp,
                           .max_temp_text = maxTemp,
                           .weather_temp_text = weather_temp_char,
                           .has_fresh_weather = has_fresh_weather,
                           .is_connected = flags.is_connected,
                           .is_quiet_time = quiet_time_is_active(),
                           .is_bw_icon = true,
                           .is_metric = flags.is_metric,
                           .humidity = humidity,
                           .wind_speed_val = wind_speed_val,
                           .wind2_val = wind2_val,
                           .met_unit = flags.is_metric ? 20 : 25,
                           .icon_id = icon_id,
                           .icon_id6 = icon_id6,
                           .rect_text_day = rect_text_day,
                           .rect_text_dayw = rect_text_dayw,
                           .rect_temp = rect_temp,
                           .rect_tmin = rect_tmin,
                           .rect_tmax = rect_tmax,
                           .rect_icon = rect_icon,
                           .rect_icon6 = rect_icon6,
                           .rect_icon_hum1 = rect_icon_hum1,
                           .rect_icon_hum2 = rect_icon_hum2,
                           .rect_icon_hum3 = rect_icon_hum3,
                           .rect_icon_leaf = rect_icon_leaf,
                           .rect_bt_disconect = rect_bt_disconect,
                           .rect_screen = rect_screen};

  ui_draw_icon_bar(ctx, &icon_data);
}

static void handle_tick(struct tm *cur, TimeUnits units_changed) {
  t = time(NULL);
  now = *(localtime(&t));
  if (flags.is_vibration) {
    if (now.tm_min == 0 && now.tm_hour >= QUIET_TIME_END &&
        now.tm_hour <= QUIET_TIME_START) {
      vibes_double_pulse();
    }
  }

  // Get weather update every 30 minutes
  if ((flags.is_connected) && (!quiet_time_is_active())) {
    if ((((flags.is_30mn) && (now.tm_min % 30 == 0)) ||
         (now.tm_min % 60 == 0) ||
         ((mktime(&now) - last_refresh) > duration))) {
      // Begin dictionary
      DictionaryIterator *iter;
      app_message_outbox_begin(&iter);
      // Add a key-value pair
      dict_write_uint8(iter, 0, 0);
      // Send the message!
      app_message_outbox_send();
    }
  }

  layer_mark_dirty(layer);
}

static void handle_whiteout_timeout(void *context) {
  flags.s_whiteout_active = false;
  s_whiteout_screen = WHITEOUT_SCREEN_GRAPH;
  timer_short = NULL;
  layer_mark_dirty(layer);
}

// Actually send the news request
static void do_send_news_request(void) {
  DictionaryIterator *iter;
  AppMessageResult result = app_message_outbox_begin(&iter);
  if (result == APP_MSG_OK) {
    dict_write_uint8(iter, KEY_REQUEST_NEWS, 1);
    result = app_message_outbox_send();
    if (result == APP_MSG_OK) {
      s_news_request_pending = false;
    }
    // If send fails, s_news_request_pending stays true for retry in
    // outbox_sent_callback
  }
  // If outbox_begin fails (busy), s_news_request_pending stays true for retry
}

// Request next news title from JS
static void request_news_from_js(void) {
  s_news_request_pending = true;
  do_send_news_request();
}

// Extract next word from news_title starting at rsvp_word_index
// Returns true if a word was found, false if end of title
static bool extract_next_word(void) {
  const char *p = news_title;
  uint8_t word_count = 0;
  uint8_t word_start = 0;
  uint8_t word_len = 0;
  uint8_t i = 0;
  bool in_word = false;

  // Find the word at rsvp_word_index
  while (p[i] != '\0') {
    if (p[i] == ' ' || p[i] == '\t' || p[i] == '\n') {
      if (in_word) {
        if (word_count == rsvp_word_index) {
          // Found our word
          if (word_len > sizeof(rsvp_word) - 1) {
            word_len = sizeof(rsvp_word) - 1;
          }
          memcpy(rsvp_word, &p[word_start], word_len);
          rsvp_word[word_len] = '\0';
          return true;
        }
        word_count++;
        in_word = false;
      }
    } else {
      if (!in_word) {
        word_start = i;
        word_len = 0;
        in_word = true;
      }
      word_len++;
    }
    i++;
  }

  // Handle last word
  if (in_word && word_count == rsvp_word_index) {
    if (word_len > sizeof(rsvp_word) - 1) {
      word_len = sizeof(rsvp_word) - 1;
    }
    memcpy(rsvp_word, &p[word_start], word_len);
    rsvp_word[word_len] = '\0';
    return true;
  }

  return false; // No more words
}

// Forward declaration
static void news_timer_callback(void *context);

// Calculate Spritz-style delay for a word
// Based on OpenSpritz algorithm: longer pause for punctuation and long words
static uint16_t calculate_spritz_delay(const char *word) {
  if (!word || word[0] == '\0') {
    return rsvp_wpm_ms;
  }

  uint16_t delay = rsvp_wpm_ms;
  int len = strlen(word);

  // Check last character for punctuation
  char last_char = word[len - 1];

  // Strong pause for sentence-ending punctuation (. ! ?)
  if (last_char == '.' || last_char == '!' || last_char == '?') {
    delay = rsvp_wpm_ms * 3; // Triple delay for sentence end
  }
  // Medium pause for clause-ending punctuation (, : ; ))
  else if (last_char == ',' || last_char == ':' || last_char == ';' ||
           last_char == ')') {
    delay = rsvp_wpm_ms * 2; // Double delay for clause break
  }
  // Check for opening parenthesis or dash (mid-word pause)
  else {
    for (int i = 0; i < len; i++) {
      if (word[i] == '(' || word[i] == '-') {
        delay = rsvp_wpm_ms + (rsvp_wpm_ms / 2); // 1.5x delay
        break;
      }
    }
  }

  // Extra time for long words (> 8 characters)
  if (len > 8) {
    delay += rsvp_wpm_ms; // Add extra time for long words
  }

  return delay;
}

// RSVP timer callback - displays next word
static void rsvp_timer_callback(void *context) {
  rsvp_timer = NULL;

  if (!flags.s_whiteout_active || s_whiteout_screen != WHITEOUT_SCREEN_NEWS) {
    return;
  }

  rsvp_word_index++;
  if (extract_next_word()) {
    // Show next word
    layer_mark_dirty(layer);
    // Calculate Spritz-style variable delay based on word characteristics
    uint16_t delay = calculate_spritz_delay(rsvp_word);
    rsvp_timer = app_timer_register(delay, rsvp_timer_callback, NULL);
  } else {
    // End of title - pause then request next
    rsvp_word[0] = '\0'; // Clear word
    layer_mark_dirty(layer);
    news_display_count++;

    if (news_display_count >= news_max_count) {
      // Done showing news - show black screen 500ms then END screen
      news_timer = app_timer_register(500, news_timer_callback, NULL);
    } else {
      // Request next news after pause
      news_timer =
          app_timer_register(news_interval_ms, news_timer_callback, NULL);
    }
  }
}

// Global timeout callback - force exit news mode if stuck
static void news_global_timeout_callback(void *context) {
  news_global_timeout = NULL;

  // Force exit news mode
  if (news_timer) {
    app_timer_cancel(news_timer);
    news_timer = NULL;
  }
  if (rsvp_timer) {
    app_timer_cancel(rsvp_timer);
    rsvp_timer = NULL;
  }

  flags.s_whiteout_active = false;
  s_whiteout_screen = WHITEOUT_SCREEN_GRAPH;
  s_news_splash_active = false;
  s_news_end_screen = false;
  news_display_count = 0;
  news_retry_count = 0;
  rsvp_word[0] = '\0';
  layer_mark_dirty(layer);
}

// Timer callback for news rotation (between titles)
static void news_timer_callback(void *context) {
  news_timer = NULL;

  if (!flags.s_whiteout_active || s_whiteout_screen != WHITEOUT_SCREEN_NEWS) {
    news_retry_count = 0;
    return;
  }

  // If splash was active, now request first news
  if (s_news_splash_active) {
    s_news_splash_active = false;
    layer_mark_dirty(layer); // Refresh display after splash ends
  }

  // If END screen was active, now exit news mode
  if (s_news_end_screen) {
    s_news_end_screen = false;
    flags.s_whiteout_active = false;
    s_whiteout_screen = WHITEOUT_SCREEN_GRAPH;
    news_display_count = 0;
    news_retry_count = 0;
    // Cancel global timeout
    if (news_global_timeout) {
      app_timer_cancel(news_global_timeout);
      news_global_timeout = NULL;
    }
    layer_mark_dirty(layer);
    return;
  }

  // Check if we just finished all news (black screen after last word)
  if (news_display_count >= news_max_count) {
    // Show END screen for 1 second
    s_news_end_screen = true;
    layer_mark_dirty(layer);
    news_timer = app_timer_register(1000, news_timer_callback, NULL);
    return;
  }

  // Check retry limit - give up if too many retries
  if (news_retry_count >= news_max_retries) {
    // Too many retries, exit news mode gracefully
    s_news_end_screen = true;
    layer_mark_dirty(layer);
    news_timer = app_timer_register(1000, news_timer_callback, NULL);
    news_retry_count = 0;
    return;
  }

  // Request next news
  news_retry_count++;
  request_news_from_js();
  // Safety timeout (increased to 8s to allow for slow networks)
  news_timer = app_timer_register(8000, news_timer_callback, NULL);
}

// Start RSVP display for current news_title
static void start_rsvp_for_title(void) {
  rsvp_word_index = 0;
  if (extract_next_word()) {
    layer_mark_dirty(layer);
    if (rsvp_timer) {
      app_timer_cancel(rsvp_timer);
    }
    rsvp_timer = app_timer_register(rsvp_wpm_ms, rsvp_timer_callback, NULL);
  }
}

// Start news display sequence
static void start_news_sequence(void) {
  // Check cooldown to prevent rapid re-activation
  time_t now_time = time(NULL);
  if ((now_time - last_news_activation) < news_activation_cooldown_sec) {
    return; // Still in cooldown, ignore
  }
  last_news_activation = now_time;

  flags.s_whiteout_active = true;
  s_whiteout_screen = WHITEOUT_SCREEN_NEWS;
  news_display_count = 0;
  news_retry_count = 0;        // Reset retry counter
  s_news_splash_active = true; // Show splash first
  rsvp_word[0] = '\0';         // Clear word for splash display

  // Cancel any existing timers
  if (timer_short) {
    app_timer_cancel(timer_short);
    timer_short = NULL;
  }
  if (news_timer) {
    app_timer_cancel(news_timer);
    news_timer = NULL;
  }
  if (rsvp_timer) {
    app_timer_cancel(rsvp_timer);
    rsvp_timer = NULL;
  }
  if (news_global_timeout) {
    app_timer_cancel(news_global_timeout);
    news_global_timeout = NULL;
  }

  layer_mark_dirty(layer);

  // Show splash for 3 seconds, then request first news
  news_timer = app_timer_register(1500, news_timer_callback, NULL);

  // Global timeout: exit news mode after 2 minutes max to prevent stuck state
  news_global_timeout =
      app_timer_register(120000, news_global_timeout_callback, NULL);
}

static void handle_wrist_tap(AccelAxisType axis, int32_t direction) {
  const uint16_t timeout_ms = 8000;
  // Neither option enabled: do nothing
  if (!flags.show_weather && !flags.show_news) {
    return;
  }

  // Double-tap detection (only if enabled)
  if (flags.require_double_tap) {
    time_t now = time(NULL);

    if ((now - last_tap_time) > tap_interval_sec) {
      // First tap - just record time
      last_tap_time = now;
      return;
    }

    // Second tap within interval - reset and proceed
    last_tap_time = 0;
  }
  // If single tap mode (require_double_tap == false), skip double-tap check
  // entirely

  // If already showing news, switch to weather (if enabled) or exit
  if (flags.s_whiteout_active && s_whiteout_screen == WHITEOUT_SCREEN_NEWS) {
    if (news_timer) {
      app_timer_cancel(news_timer);
      news_timer = NULL;
    }
    if (rsvp_timer) {
      app_timer_cancel(rsvp_timer);
      rsvp_timer = NULL;
    }
    if (flags.show_weather) {
      s_whiteout_screen = WHITEOUT_SCREEN_GRAPH;
      if (timer_short) {
        app_timer_cancel(timer_short);
      }
      timer_short =
          app_timer_register(timeout_ms, handle_whiteout_timeout, NULL);
      layer_mark_dirty(layer);
    } else {
      flags.s_whiteout_active = false;
      layer_mark_dirty(layer);
    }
    return;
  }

  // If already showing weather, switch to news (if enabled) or exit
  if (flags.s_whiteout_active && s_whiteout_screen == WHITEOUT_SCREEN_GRAPH) {
    if (timer_short) {
      app_timer_cancel(timer_short);
      timer_short = NULL;
    }
    if (flags.show_news) {
      start_news_sequence();
    } else {
      flags.s_whiteout_active = false;
      layer_mark_dirty(layer);
    }
    return;
  }

  // Not showing any panel - show first available
  if (flags.show_weather) {
    flags.s_whiteout_active = true;
    s_whiteout_screen = WHITEOUT_SCREEN_GRAPH;
    if (timer_short) {
      app_timer_cancel(timer_short);
    }
    timer_short = app_timer_register(timeout_ms, handle_whiteout_timeout, NULL);
    layer_mark_dirty(layer);
  } else if (flags.show_news) {
    start_news_sequence();
  }
}

// UNUSED handle_battery - battery_state_service not subscribed - saves ~100
// bytes
/*
static void handle_battery(BatteryChargeState charge) {
  battery_level = charge.charge_percent;
  bool save_state = is_charging;
  is_charging = charge.is_charging;
  if (is_charging != save_state) {
    layer_mark_dirty(layer);
  }
}
*/

static void setHourLinePoints() {

  line1_p1.y = line1_p2.y = hour_line_ypos;
  line2_p1 = line1_p1;
  line2_p2 = line1_p2;
  line2_p1.y++;
  line2_p2.y++;
}

void bt_handler(bool connected) {
  if (connected) {
    flags.is_connected = true;
  } else {
    flags.is_connected = false;
  }
  if (flags.is_bt) {
    vibes_double_pulse();
  }
  layer_mark_dirty(layer);
}

static void initBatteryLevel() {
  BatteryChargeState battery_state = battery_state_service_peek();
  battery_level = battery_state.charge_percent;
}

static void assign_fonts() {

  // Font configuration is now fixed to style 1 (CLEARVIEW_45)
  fontsmall = fonts_get_system_font(FONT_KEY_GOTHIC_14_BOLD);
  fontsmallbold = fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD);
  fontmedium = fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD);
  fontbig = fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD);
  flags.fontbig_loaded = false;
  fontbig_resource_id = RESOURCE_ID_FONT_CLEARVIEW_45;
  hour_offset_x = 1;
  hour_offset_y = 9;
  status_offset_x = 1;
  status_offset_y = 0;
}

static void inbox_received_callback(DictionaryIterator *iterator,
                                    void *context) {
  // Handle news channel title reception
  Tuple *news_channel_tuple = dict_find(iterator, KEY_NEWS_CHANNEL_TITLE);
  if (news_channel_tuple) {
    snprintf(news_channel_title, sizeof(news_channel_title), "%s",
             news_channel_tuple->value->cstring);
    // Refresh splash screen if currently displayed
    if (flags.s_whiteout_active && s_whiteout_screen == WHITEOUT_SCREEN_NEWS &&
        s_news_splash_active) {
      layer_mark_dirty(layer);
    }
    return;
  }

  // Handle news title reception
  Tuple *news_title_tuple = dict_find(iterator, KEY_NEWS_TITLE);
  if (news_title_tuple) {
    snprintf(news_title, sizeof(news_title), "%s",
             news_title_tuple->value->cstring);
    // Reset retry counter on successful reception
    news_retry_count = 0;
    // Cancel safety timer
    if (news_timer) {
      app_timer_cancel(news_timer);
      news_timer = NULL;
    }
    // Start RSVP for this title
    if (flags.s_whiteout_active && s_whiteout_screen == WHITEOUT_SCREEN_NEWS) {
      start_rsvp_for_title();
    }
    return;
  }

  // Gestion de l'option graphique météo
  Tuple *show_weather_tuple = dict_find(iterator, KEY_SHOW_WEATHER);
  if (show_weather_tuple) {
    flags.show_weather = show_weather_tuple->value->int32;
    persist_write_bool(KEY_SHOW_WEATHER, flags.show_weather);
  }

  // Gestion de l'option news feed
  Tuple *show_news_tuple = dict_find(iterator, KEY_SHOW_NEWS);
  if (show_news_tuple) {
    flags.show_news = show_news_tuple->value->int32;
    persist_write_bool(KEY_SHOW_NEWS, flags.show_news);
  }

  // Gestion de l'option double tap
  Tuple *double_tap_tuple = dict_find(iterator, KEY_DOUBLE_TAP);
  if (double_tap_tuple) {
    flags.require_double_tap = double_tap_tuple->value->int32;
    persist_write_bool(KEY_DOUBLE_TAP, flags.require_double_tap);
  }

  // If both options are now disabled and whiteout was active, close it
  if (!flags.show_weather && !flags.show_news && flags.s_whiteout_active) {
    flags.s_whiteout_active = false;
    if (timer_short) {
      app_timer_cancel(timer_short);
      timer_short = NULL;
    }
    layer_mark_dirty(layer);
  }

  // Read tuples for data
  // pour test
  Tuple *radio_tuple = dict_find(iterator, KEY_RADIO_UNITS);
  Tuple *temp_tuple = dict_find(iterator, KEY_TEMPERATURE);

  if (0) {
    handle_wrist_tap(ACCEL_AXIS_X, 1);
  }

  // If all data is available, use it
  if (temp_tuple) {

    // vibes_double_pulse();
    Tuple *wind_speed_tuple = dict_find(iterator, KEY_WIND_SPEED);
    Tuple *humidity_tuple = dict_find(iterator, KEY_HUMIDITY);
    Tuple *tmin_tuple = dict_find(iterator, KEY_TMIN);
    Tuple *tmax_tuple = dict_find(iterator, KEY_TMAX);
    Tuple *icon_tuple = dict_find(iterator, KEY_ICON);

    Tuple *h1_tuple = dict_find(iterator, KEY_FORECAST_H1);
    Tuple *h2_tuple = dict_find(iterator, KEY_FORECAST_H2);
    Tuple *h3_tuple = dict_find(iterator, KEY_FORECAST_H3);
    Tuple *wind1_tuple = dict_find(iterator, KEY_FORECAST_WIND1);
    Tuple *wind2_tuple = dict_find(iterator, KEY_FORECAST_WIND2);
    Tuple *wind3_tuple = dict_find(iterator, KEY_FORECAST_WIND3);
    Tuple *temp1_tuple = dict_find(iterator, KEY_FORECAST_TEMP1);
    Tuple *temp2_tuple = dict_find(iterator, KEY_FORECAST_TEMP2);
    Tuple *temp3_tuple = dict_find(iterator, KEY_FORECAST_TEMP3);
    Tuple *temp4_tuple = dict_find(iterator, KEY_FORECAST_TEMP4);
    Tuple *temp5_tuple = dict_find(iterator, KEY_FORECAST_TEMP5);
    Tuple *icon1_tuple = dict_find(iterator, KEY_FORECAST_ICON1);
    Tuple *icon2_tuple = dict_find(iterator, KEY_FORECAST_ICON2);
    Tuple *icon3_tuple = dict_find(iterator, KEY_FORECAST_ICON3);
    Tuple *rain1_tuple = dict_find(iterator, KEY_FORECAST_RAIN1);
    Tuple *rain2_tuple = dict_find(iterator, KEY_FORECAST_RAIN2);
    Tuple *rain3_tuple = dict_find(iterator, KEY_FORECAST_RAIN3);
    Tuple *rain4_tuple = dict_find(iterator, KEY_FORECAST_RAIN4);

    // Extended hourly forecast tuples - UNUSED (only 5 temps needed)
    // Tuple *temp6_tuple = dict_find(iterator, KEY_FORECAST_TEMP6);
    // Tuple *temp7_tuple = dict_find(iterator, KEY_FORECAST_TEMP7);
    // Tuple *temp8_tuple = dict_find(iterator, KEY_FORECAST_TEMP8);
    // Tuple *temp9_tuple = dict_find(iterator, KEY_FORECAST_TEMP9);

    Tuple *h0_tuple = dict_find(iterator, KEY_FORECAST_H0);
    // UNUSED h4-h8 tuples
    // Tuple *h4_tuple = dict_find(iterator, KEY_FORECAST_H4);
    // Tuple *h5_tuple = dict_find(iterator, KEY_FORECAST_H5);
    // Tuple *h6_tuple = dict_find(iterator, KEY_FORECAST_H6);
    // Tuple *h7_tuple = dict_find(iterator, KEY_FORECAST_H7);
    // Tuple *h8_tuple = dict_find(iterator, KEY_FORECAST_H8);

    // UNUSED rain5-8 tuples (only 12 rain values needed)
    // Tuple *rain5_tuple = dict_find(iterator, KEY_FORECAST_RAIN5);
    // Tuple *rain6_tuple = dict_find(iterator, KEY_FORECAST_RAIN6);
    // Tuple *rain7_tuple = dict_find(iterator, KEY_FORECAST_RAIN7);
    // Tuple *rain8_tuple = dict_find(iterator, KEY_FORECAST_RAIN8);

    // Detailed rain tuples (3 per 3-hour block) - only first 4 blocks used
    Tuple *rain11_tuple = dict_find(iterator, KEY_FORECAST_RAIN11);
    Tuple *rain12_tuple = dict_find(iterator, KEY_FORECAST_RAIN12);
    Tuple *rain21_tuple = dict_find(iterator, KEY_FORECAST_RAIN21);
    Tuple *rain22_tuple = dict_find(iterator, KEY_FORECAST_RAIN22);
    Tuple *rain31_tuple = dict_find(iterator, KEY_FORECAST_RAIN31);
    Tuple *rain32_tuple = dict_find(iterator, KEY_FORECAST_RAIN32);
    Tuple *rain41_tuple = dict_find(iterator, KEY_FORECAST_RAIN41);
    Tuple *rain42_tuple = dict_find(iterator, KEY_FORECAST_RAIN42);
    // UNUSED rain51-82
    // Tuple *rain51_tuple = dict_find(iterator, KEY_FORECAST_RAIN51);
    // Tuple *rain52_tuple = dict_find(iterator, KEY_FORECAST_RAIN52);
    // Tuple *rain61_tuple = dict_find(iterator, KEY_FORECAST_RAIN61);
    // Tuple *rain62_tuple = dict_find(iterator, KEY_FORECAST_RAIN62);
    // Tuple *rain71_tuple = dict_find(iterator, KEY_FORECAST_RAIN71);
    // Tuple *rain72_tuple = dict_find(iterator, KEY_FORECAST_RAIN72);
    // Tuple *rain81_tuple = dict_find(iterator, KEY_FORECAST_RAIN81);
    // Tuple *rain82_tuple = dict_find(iterator, KEY_FORECAST_RAIN82);

    // UNUSED icon4-7 (only 3 icons in graph)
    // Tuple *icon4_tuple = dict_find(iterator, KEY_FORECAST_ICON4);
    // Tuple *icon5_tuple = dict_find(iterator, KEY_FORECAST_ICON5);
    // Tuple *icon6_tuple = dict_find(iterator, KEY_FORECAST_ICON6);
    // Tuple *icon7_tuple = dict_find(iterator, KEY_FORECAST_ICON7);

    Tuple *wind0_tuple = dict_find(iterator, KEY_FORECAST_WIND0);
    // UNUSED wind4-8 (only wind0-3 needed)
    // Tuple *wind4_tuple = dict_find(iterator, KEY_FORECAST_WIND4);
    // Tuple *wind5_tuple = dict_find(iterator, KEY_FORECAST_WIND5);
    // Tuple *wind6_tuple = dict_find(iterator, KEY_FORECAST_WIND6);
    // Tuple *wind7_tuple = dict_find(iterator, KEY_FORECAST_WIND7);
    // Tuple *wind8_tuple = dict_find(iterator, KEY_FORECAST_WIND8);

    // 3-day forecast tuples
    Tuple *day1_temp_tuple = dict_find(iterator, KEY_DAY1_TEMP);
    Tuple *day2_temp_tuple = dict_find(iterator, KEY_DAY2_TEMP);
    Tuple *day3_temp_tuple = dict_find(iterator, KEY_DAY3_TEMP);
    Tuple *day1_icon_tuple = dict_find(iterator, KEY_DAY1_ICON);
    Tuple *day2_icon_tuple = dict_find(iterator, KEY_DAY2_ICON);
    Tuple *day3_icon_tuple = dict_find(iterator, KEY_DAY3_ICON);
    Tuple *day1_rain_tuple = dict_find(iterator, KEY_DAY1_RAIN);
    Tuple *day2_rain_tuple = dict_find(iterator, KEY_DAY2_RAIN);
    Tuple *day3_rain_tuple = dict_find(iterator, KEY_DAY3_RAIN);
    Tuple *day1_wind_tuple = dict_find(iterator, KEY_DAY1_WIND);
    Tuple *day2_wind_tuple = dict_find(iterator, KEY_DAY2_WIND);
    Tuple *day3_wind_tuple = dict_find(iterator, KEY_DAY3_WIND);

    // Récupération des tuples
    Tuple *poolTemp_tuple = dict_find(iterator, KEY_POOLTEMP);
    Tuple *poolPH_tuple = dict_find(iterator, KEY_POOLPH);
    Tuple *poolORP_tuple = dict_find(iterator, KEY_poolORP);

    // Extraction des valeurs
    npoolTemp = (int)poolTemp_tuple->value->int32; // x10
    npoolPH = (int)poolPH_tuple->value->int32;     // x100
    npoolORP = (int)poolORP_tuple->value->int32;   // entier

    // Buffers pour les chaînes

    // Conversion manuelle sans float
    int temp_int = npoolTemp / 10;
    int temp_dec = npoolTemp % 10;

    int ph_int = npoolPH / 100;
    int ph_dec = npoolPH % 100;

    snprintf(poolTemp, sizeof(poolTemp), "%d.%d", temp_int,
             temp_dec);                                          // 1 décimale
    snprintf(poolPH, sizeof(poolPH), "%d.%02d", ph_int, ph_dec); // 2 décimales
    snprintf(poolORP, sizeof(poolORP), "%d", npoolORP); // entier simple

    snprintf(icon, sizeof(icon), "%s", icon_tuple->value->cstring);

    weather_temp = (int)temp_tuple->value->int32;

    tmin_val = (int)tmin_tuple->value->int32;
    tmax_val = (int)tmax_tuple->value->int32;

    wind_speed_val = (int)wind_speed_tuple->value->int32;
    humidity = (int)humidity_tuple->value->int32;

    // Process extended hourly forecast data for weather graph (only 5 temps)
    if (temp1_tuple)
      graph_temps[0] = (int)temp1_tuple->value->int32;
    if (temp2_tuple)
      graph_temps[1] = (int)temp2_tuple->value->int32;
    if (temp3_tuple)
      graph_temps[2] = (int)temp3_tuple->value->int32;
    if (temp4_tuple)
      graph_temps[3] = (int)temp4_tuple->value->int32;
    if (temp5_tuple)
      graph_temps[4] = (int)temp5_tuple->value->int32;
    // temp6-9 not used (array reduced to 5)

    if (h0_tuple)
      graph_hours[0] = (int)h0_tuple->value->int32;
    if (h1_tuple)
      graph_hours[1] = (int)h1_tuple->value->int32;
    if (h2_tuple)
      graph_hours[2] = (int)h2_tuple->value->int32;
    if (h3_tuple)
      graph_hours[3] = (int)h3_tuple->value->int32;

    // h4-h8 not used

    // Rain data (12 segments only)
    if (rain1_tuple)
      graph_rains[0] = (int)rain1_tuple->value->int32;
    if (rain11_tuple)
      graph_rains[1] = (int)rain11_tuple->value->int32;
    if (rain12_tuple)
      graph_rains[2] = (int)rain12_tuple->value->int32;
    if (rain2_tuple)
      graph_rains[3] = (int)rain2_tuple->value->int32;
    if (rain21_tuple)
      graph_rains[4] = (int)rain21_tuple->value->int32;
    if (rain22_tuple)
      graph_rains[5] = (int)rain22_tuple->value->int32;
    if (rain3_tuple)
      graph_rains[6] = (int)rain3_tuple->value->int32;
    if (rain31_tuple)
      graph_rains[7] = (int)rain31_tuple->value->int32;
    if (rain32_tuple)
      graph_rains[8] = (int)rain32_tuple->value->int32;
    if (rain4_tuple)
      graph_rains[9] = (int)rain4_tuple->value->int32;
    if (rain41_tuple)
      graph_rains[10] = (int)rain41_tuple->value->int32;
    if (rain42_tuple)
      graph_rains[11] = (int)rain42_tuple->value->int32;
    // rain5-8 tuples not used (array reduced to 12)

    // Icons for graph
    if (icon1_tuple) {
      snprintf(graph_icon1, sizeof(graph_icon1), "%s",
               icon1_tuple->value->cstring);
      // Also update icon1 for persistence
      snprintf(icon1, sizeof(icon1), "%s", icon1_tuple->value->cstring);
    }
    if (icon2_tuple) {
      snprintf(graph_icon2, sizeof(graph_icon2), "%s",
               icon2_tuple->value->cstring);
      // Also update icon2 for persistence
      snprintf(icon2, sizeof(icon2), "%s", icon2_tuple->value->cstring);
    }
    if (icon3_tuple) {
      snprintf(graph_icon3, sizeof(graph_icon3), "%s",
               icon3_tuple->value->cstring);
      // Also update icon3 for persistence
      snprintf(icon3, sizeof(icon3), "%s", icon3_tuple->value->cstring);
    }
    // icon4-7 not used

    // Winds for graph
    if (wind0_tuple) {
      graph_wind_val[0] = atoi(wind0_tuple->value->cstring);
    }
    if (wind1_tuple) {
      graph_wind_val[1] = atoi(wind1_tuple->value->cstring);
    }
    if (wind2_tuple) {
      graph_wind_val[2] = atoi(wind2_tuple->value->cstring);
    }
    if (wind3_tuple) {
      graph_wind_val[3] = atoi(wind3_tuple->value->cstring);
    }
    // wind4-8 not used

    // Process 3-day forecast data
    if (day1_temp_tuple)
      snprintf(days_temp[0], sizeof(days_temp[0]), "%s",
               day1_temp_tuple->value->cstring);
    if (day2_temp_tuple)
      snprintf(days_temp[1], sizeof(days_temp[1]), "%s",
               day2_temp_tuple->value->cstring);
    if (day3_temp_tuple)
      snprintf(days_temp[2], sizeof(days_temp[2]), "%s",
               day3_temp_tuple->value->cstring);
    if (day1_icon_tuple)
      snprintf(days_icon[0], sizeof(days_icon[0]), "%s",
               day1_icon_tuple->value->cstring);
    if (day2_icon_tuple)
      snprintf(days_icon[1], sizeof(days_icon[1]), "%s",
               day2_icon_tuple->value->cstring);
    if (day3_icon_tuple)
      snprintf(days_icon[2], sizeof(days_icon[2]), "%s",
               day3_icon_tuple->value->cstring);
    if (day1_rain_tuple)
      snprintf(days_rain[0], sizeof(days_rain[0]), "%s",
               day1_rain_tuple->value->cstring);
    if (day2_rain_tuple)
      snprintf(days_rain[1], sizeof(days_rain[1]), "%s",
               day2_rain_tuple->value->cstring);
    if (day3_rain_tuple)
      snprintf(days_rain[2], sizeof(days_rain[2]), "%s",
               day3_rain_tuple->value->cstring);
    if (day1_wind_tuple)
      snprintf(days_wind[0], sizeof(days_wind[0]), "%s",
               day1_wind_tuple->value->cstring);
    if (day2_wind_tuple)
      snprintf(days_wind[1], sizeof(days_wind[1]), "%s",
               day2_wind_tuple->value->cstring);
    if (day3_wind_tuple)
      snprintf(days_wind[2], sizeof(days_wind[2]), "%s",
               day3_wind_tuple->value->cstring);

    last_refresh = mktime(&now);

    persist_write_string(KEY_ICON, icon);
    persist_write_string(KEY_LOCATION, location);

    persist_write_string(KEY_FORECAST_ICON1, icon1);
    persist_write_string(KEY_FORECAST_ICON2, icon2);
    persist_write_string(KEY_FORECAST_ICON3, icon3);

    persist_write_int(KEY_LAST_REFRESH, last_refresh);
    persist_write_int(KEY_TEMPERATURE, weather_temp);
    persist_write_int(KEY_WIND_SPEED, wind_speed_val);
    persist_write_int(KEY_HUMIDITY, humidity);
    persist_write_int(KEY_TMIN, tmin_val);
    persist_write_int(KEY_TMAX, tmax_val);

    persist_write_int(KEY_FORECAST_WIND1, wind1_val);
    persist_write_int(KEY_FORECAST_WIND2, wind2_val);
    persist_write_int(KEY_FORECAST_WIND3, wind3_val);

    persist_write_int(KEY_FORECAST_TEMP1, temp1_val);
    persist_write_int(KEY_FORECAST_TEMP2, temp2_val);
    persist_write_int(KEY_FORECAST_TEMP3, temp3_val);
    persist_write_int(KEY_FORECAST_TEMP4, temp4_val);
    persist_write_int(KEY_FORECAST_TEMP5, temp5_val);

    persist_write_int(KEY_FORECAST_RAIN1, rain1_val);
    persist_write_int(KEY_FORECAST_RAIN2, rain2_val);
    persist_write_int(KEY_FORECAST_RAIN3, rain3_val);
    persist_write_int(KEY_FORECAST_RAIN4, rain4_val);
    // Persist detailed rain bars for the weather graph so they survive restarts
    persist_write_int(KEY_FORECAST_RAIN11, graph_rains[1]);
    persist_write_int(KEY_FORECAST_RAIN12, graph_rains[2]);
    persist_write_int(KEY_FORECAST_RAIN21, graph_rains[4]);
    persist_write_int(KEY_FORECAST_RAIN22, graph_rains[5]);
    persist_write_int(KEY_FORECAST_RAIN31, graph_rains[7]);
    persist_write_int(KEY_FORECAST_RAIN32, graph_rains[8]);
    persist_write_int(KEY_FORECAST_RAIN41, graph_rains[10]);
    persist_write_int(KEY_FORECAST_RAIN42, graph_rains[11]);

    // Persist only the 5 temperatures used for the graph
    persist_write_int(KEY_FORECAST_TEMP1, graph_temps[0]);
    persist_write_int(KEY_FORECAST_TEMP2, graph_temps[1]);
    persist_write_int(KEY_FORECAST_TEMP3, graph_temps[2]);
    persist_write_int(KEY_FORECAST_TEMP4, graph_temps[3]);
    persist_write_int(KEY_FORECAST_TEMP5, graph_temps[4]);

    // Persist all graph winds (4 blocks)
    persist_write_int(KEY_GRAPH_WIND0, graph_wind_val[0]);
    persist_write_int(KEY_GRAPH_WIND1, graph_wind_val[1]);
    persist_write_int(KEY_GRAPH_WIND2, graph_wind_val[2]);
    persist_write_int(KEY_GRAPH_WIND3, graph_wind_val[3]);

    // Persist graph hours (h0 already persisted above)
    persist_write_int(KEY_GRAPH_H1, graph_hours[1]);
    persist_write_int(KEY_GRAPH_H2, graph_hours[2]);
    persist_write_int(KEY_GRAPH_H3, graph_hours[3]);

    persist_write_int(KEY_POOLTEMP, npoolTemp);
    persist_write_int(KEY_POOLPH, npoolPH);
    persist_write_int(KEY_poolORP, npoolORP);

    // Persist extended forecast data for weather graph (minimal)
    persist_write_int(KEY_FORECAST_H0, graph_hours[0]);

    // Persist 3-day forecast data
    persist_write_string(KEY_DAY1_TEMP, days_temp[0]);
    persist_write_string(KEY_DAY2_TEMP, days_temp[1]);
    persist_write_string(KEY_DAY3_TEMP, days_temp[2]);
    persist_write_string(KEY_DAY1_ICON, days_icon[0]);
    persist_write_string(KEY_DAY2_ICON, days_icon[1]);
    persist_write_string(KEY_DAY3_ICON, days_icon[2]);
    persist_write_string(KEY_DAY1_RAIN, days_rain[0]);
    persist_write_string(KEY_DAY2_RAIN, days_rain[1]);
    persist_write_string(KEY_DAY3_RAIN, days_rain[2]);
    persist_write_string(KEY_DAY1_WIND, days_wind[0]);
    persist_write_string(KEY_DAY2_WIND, days_wind[1]);
    persist_write_string(KEY_DAY3_WIND, days_wind[2]);

    layer_mark_dirty(layer);
  }

  // Configuration message received
  if (radio_tuple) {
    Tuple *refresh_tuple = dict_find(iterator, KEY_RADIO_REFRESH);
    Tuple *vibration_tuple = dict_find(iterator, KEY_TOGGLE_VIBRATION);
    Tuple *bt_tuple = dict_find(iterator, KEY_TOGGLE_BT);

    Tuple *color_right_r_tuple = dict_find(iterator, KEY_COLOR_RIGHT_R);
    Tuple *color_right_g_tuple = dict_find(iterator, KEY_COLOR_RIGHT_G);
    Tuple *color_right_b_tuple = dict_find(iterator, KEY_COLOR_RIGHT_B);

    Tuple *color_left_r_tuple = dict_find(iterator, KEY_COLOR_LEFT_R);
    Tuple *color_left_g_tuple = dict_find(iterator, KEY_COLOR_LEFT_G);
    Tuple *color_left_b_tuple = dict_find(iterator, KEY_COLOR_LEFT_B);

    int red;
    int green;
    int blue;

    flags.is_bt = bt_tuple ? bt_tuple->value->int32 : flags.is_bt;
    flags.is_metric =
        radio_tuple ? !(radio_tuple->value->int32) : flags.is_metric;
    flags.is_30mn = refresh_tuple ? refresh_tuple->value->int32 : flags.is_30mn;
    flags.is_vibration =
        vibration_tuple ? vibration_tuple->value->int32 : flags.is_vibration;

    if (color_right_r_tuple && color_right_g_tuple && color_right_b_tuple) {
      red = color_right_r_tuple->value->int32;
      green = color_right_g_tuple->value->int32;
      blue = color_right_b_tuple->value->int32;
      persist_write_int(KEY_COLOR_RIGHT_R, red);
      persist_write_int(KEY_COLOR_RIGHT_G, green);
      persist_write_int(KEY_COLOR_RIGHT_B, blue);
      color_right = GColorFromRGB(red, green, blue);
    }

    if (color_left_r_tuple && color_left_g_tuple && color_left_b_tuple) {
      red = color_left_r_tuple->value->int32;
      green = color_left_g_tuple->value->int32;
      blue = color_left_b_tuple->value->int32;
      persist_write_int(KEY_COLOR_LEFT_R, red);
      persist_write_int(KEY_COLOR_LEFT_G, green);
      persist_write_int(KEY_COLOR_LEFT_B, blue);
      color_left = GColorFromRGB(red, green, blue);
    }

    // Force B&W colors for all platforms (aplite style)
    color_left = GColorBlack;
    color_right = GColorBlack;

    persist_write_bool(KEY_RADIO_UNITS, flags.is_metric);
    persist_write_bool(KEY_RADIO_REFRESH, flags.is_30mn);
    persist_write_bool(KEY_TOGGLE_BT, flags.is_bt);
    persist_write_bool(KEY_TOGGLE_VIBRATION, flags.is_vibration);

    vibes_double_pulse();

    // Request immediate weather update to apply new units
    DictionaryIterator *iter;
    app_message_outbox_begin(&iter);
    dict_write_uint8(iter, 0, 0);
    app_message_outbox_send();
  }
}

// Forward declaration for news request
static void do_send_news_request(void);

static void outbox_failed_callback(DictionaryIterator *iterator,
                                   AppMessageResult reason, void *context) {
  // If news request failed and we're in news mode, keep pending flag for retry
  if (s_news_request_pending && flags.s_whiteout_active &&
      s_whiteout_screen == WHITEOUT_SCREEN_NEWS) {
    // Request will be retried in outbox_sent_callback of next successful
    // message or by the safety timer in news_timer_callback
  }
}

static void outbox_sent_callback(DictionaryIterator *iterator, void *context) {
  // If there's a pending news request, send it now
  if (s_news_request_pending) {
    do_send_news_request();
  }
}

static void init_var() {
  // Initialisation de show_weather
  if (persist_exists(KEY_SHOW_WEATHER)) {
    flags.show_weather = persist_read_bool(KEY_SHOW_WEATHER);
  } else {
    flags.show_weather = true;
  }
  // Initialisation de show_news
  if (persist_exists(KEY_SHOW_NEWS)) {
    flags.show_news = persist_read_bool(KEY_SHOW_NEWS);
  } else {
    flags.show_news = false;
  }
  // Initialisation de require_double_tap
  if (persist_exists(KEY_DOUBLE_TAP)) {
    flags.require_double_tap = persist_read_bool(KEY_DOUBLE_TAP);
  } else {
    flags.require_double_tap = true;
  }
  int i;

  t = time(NULL);
  now = *(localtime(&t));

  fontsmall = fonts_get_system_font(FONT_KEY_GOTHIC_14);
  fontsmallbold = fonts_get_system_font(FONT_KEY_GOTHIC_14_BOLD);
  fontmedium = fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD);
  fontbig = fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD);
  flags.fontbig_loaded = false;
  fontbig_resource_id = RESOURCE_ID_FONT_CLEARVIEW_45;

  if (persist_exists(KEY_RADIO_UNITS) && persist_exists(KEY_RADIO_REFRESH) &&
      persist_exists(KEY_TOGGLE_VIBRATION) && persist_exists(KEY_TOGGLE_BT)) {

    flags.is_metric = persist_read_bool(KEY_RADIO_UNITS);
    flags.is_30mn = persist_read_bool(KEY_RADIO_REFRESH);
    flags.is_bt = persist_read_bool(KEY_TOGGLE_BT);
    flags.is_vibration = persist_read_bool(KEY_TOGGLE_VIBRATION);

    int red, green, blue;
    red = persist_read_int(KEY_COLOR_RIGHT_R);
    green = persist_read_int(KEY_COLOR_RIGHT_G);
    blue = persist_read_int(KEY_COLOR_RIGHT_B);
    color_right = GColorFromRGB(red, green, blue);

    red = persist_read_int(KEY_COLOR_LEFT_R);
    green = persist_read_int(KEY_COLOR_LEFT_G);
    blue = persist_read_int(KEY_COLOR_LEFT_B);
    color_left = GColorFromRGB(red, green, blue);
  } else {
    flags.is_metric = true;
    flags.is_vibration = false;
    flags.is_bt = false;
    flags.is_30mn = true;
    color_right = GColorBlack;
    color_left = GColorBlack;
  }

  if (persist_exists(KEY_LAST_REFRESH) && persist_exists(KEY_TEMPERATURE) &&
      persist_exists(KEY_ICON)) {
    // Core weather data exists - load everything

    last_refresh = persist_read_int(KEY_LAST_REFRESH);

    if (FORCE_REFRESH == 1)
      last_refresh = 0;

    weather_temp = persist_read_int(KEY_TEMPERATURE);
    persist_read_string(KEY_ICON, icon, sizeof(icon));

    // Load optional data with defaults
    wind_speed_val = persist_exists(KEY_WIND_SPEED) ? persist_read_int(KEY_WIND_SPEED) : 0;
    humidity = persist_exists(KEY_HUMIDITY) ? persist_read_int(KEY_HUMIDITY) : 0;
    tmin_val = persist_exists(KEY_TMIN) ? persist_read_int(KEY_TMIN) : 0;
    tmax_val = persist_exists(KEY_TMAX) ? persist_read_int(KEY_TMAX) : 0;

    wind1_val = persist_exists(KEY_FORECAST_WIND1) ? persist_read_int(KEY_FORECAST_WIND1) : 0;
    wind2_val = persist_exists(KEY_FORECAST_WIND2) ? persist_read_int(KEY_FORECAST_WIND2) : 0;
    wind3_val = persist_exists(KEY_FORECAST_WIND3) ? persist_read_int(KEY_FORECAST_WIND3) : 0;

    temp1_val = persist_exists(KEY_FORECAST_TEMP1) ? persist_read_int(KEY_FORECAST_TEMP1) : 0;
    temp2_val = persist_exists(KEY_FORECAST_TEMP2) ? persist_read_int(KEY_FORECAST_TEMP2) : 0;
    temp3_val = persist_exists(KEY_FORECAST_TEMP3) ? persist_read_int(KEY_FORECAST_TEMP3) : 0;
    temp4_val = persist_exists(KEY_FORECAST_TEMP4) ? persist_read_int(KEY_FORECAST_TEMP4) : 0;
    temp5_val = persist_exists(KEY_FORECAST_TEMP5) ? persist_read_int(KEY_FORECAST_TEMP5) : 0;

    rain1_val = persist_exists(KEY_FORECAST_RAIN1) ? persist_read_int(KEY_FORECAST_RAIN1) : 0;
    rain2_val = persist_exists(KEY_FORECAST_RAIN2) ? persist_read_int(KEY_FORECAST_RAIN2) : 0;
    rain3_val = persist_exists(KEY_FORECAST_RAIN3) ? persist_read_int(KEY_FORECAST_RAIN3) : 0;
    rain4_val = persist_exists(KEY_FORECAST_RAIN4) ? persist_read_int(KEY_FORECAST_RAIN4) : 0;

    npoolTemp = persist_exists(KEY_POOLTEMP) ? persist_read_int(KEY_POOLTEMP) : 0;
    npoolPH = persist_exists(KEY_POOLPH) ? persist_read_int(KEY_POOLPH) : 0;
    npoolORP = persist_exists(KEY_poolORP) ? persist_read_int(KEY_poolORP) : 0;

    if (persist_exists(KEY_LOCATION))
      persist_read_string(KEY_LOCATION, location, sizeof(location));
    if (persist_exists(KEY_FORECAST_ICON1))
      persist_read_string(KEY_FORECAST_ICON1, icon1, sizeof(icon1));
    if (persist_exists(KEY_FORECAST_ICON2))
      persist_read_string(KEY_FORECAST_ICON2, icon2, sizeof(icon2));
    if (persist_exists(KEY_FORECAST_ICON3))
      persist_read_string(KEY_FORECAST_ICON3, icon3, sizeof(icon3));

    // CRITICAL: Also initialize graph_icon from persisted icon values
    // Without this, graph_icon1/2/3 remain empty after app restart,
    // causing crashes when displaying the weather graph
    snprintf(graph_icon1, sizeof(graph_icon1), "%s", icon1);
    snprintf(graph_icon2, sizeof(graph_icon2), "%s", icon2);
    snprintf(graph_icon3, sizeof(graph_icon3), "%s", icon3);

    // Restore only the 5 temperatures used for the graph
    graph_temps[0] = persist_read_int(KEY_FORECAST_TEMP1);
    graph_temps[1] = persist_read_int(KEY_FORECAST_TEMP2);
    graph_temps[2] = persist_read_int(KEY_FORECAST_TEMP3);
    graph_temps[3] = persist_read_int(KEY_FORECAST_TEMP4);
    graph_temps[4] = persist_read_int(KEY_FORECAST_TEMP5);

    graph_hours[0] = persist_read_int(KEY_FORECAST_H0);

    // Restore hours from persisted integers (more reliable than string
    // conversion)
    if (persist_exists(KEY_GRAPH_H1)) {
      graph_hours[1] = persist_read_int(KEY_GRAPH_H1);
      graph_hours[2] = persist_read_int(KEY_GRAPH_H2);
      graph_hours[3] = persist_read_int(KEY_GRAPH_H3);
    } else {
      // Fallback default values
      graph_hours[1] = 3;
      graph_hours[2] = 6;
      graph_hours[3] = 9;
    }

    // Restore winds
    if (persist_exists(KEY_GRAPH_WIND0)) {
      graph_wind_val[0] = persist_read_int(KEY_GRAPH_WIND0);
      graph_wind_val[1] = persist_read_int(KEY_GRAPH_WIND1);
      graph_wind_val[2] = persist_read_int(KEY_GRAPH_WIND2);
      graph_wind_val[3] = persist_read_int(KEY_GRAPH_WIND3);
    }

    graph_rains[0] = rain1_val;
    graph_rains[1] = persist_read_int(KEY_FORECAST_RAIN11);
    graph_rains[2] = persist_read_int(KEY_FORECAST_RAIN12);
    graph_rains[3] = rain2_val;
    graph_rains[4] = persist_read_int(KEY_FORECAST_RAIN21);
    graph_rains[5] = persist_read_int(KEY_FORECAST_RAIN22);
    graph_rains[6] = rain3_val;
    graph_rains[7] = persist_read_int(KEY_FORECAST_RAIN31);
    graph_rains[8] = persist_read_int(KEY_FORECAST_RAIN32);
    graph_rains[9] = rain4_val;
    graph_rains[10] = persist_read_int(KEY_FORECAST_RAIN41);
    graph_rains[11] = persist_read_int(KEY_FORECAST_RAIN42);

    // Load 3-day forecast data from persistence
    if (persist_exists(KEY_DAY1_TEMP)) {
      persist_read_string(KEY_DAY1_TEMP, days_temp[0], sizeof(days_temp[0]));
      persist_read_string(KEY_DAY2_TEMP, days_temp[1], sizeof(days_temp[1]));
      persist_read_string(KEY_DAY3_TEMP, days_temp[2], sizeof(days_temp[2]));
      persist_read_string(KEY_DAY1_ICON, days_icon[0], sizeof(days_icon[0]));
      persist_read_string(KEY_DAY2_ICON, days_icon[1], sizeof(days_icon[1]));
      persist_read_string(KEY_DAY3_ICON, days_icon[2], sizeof(days_icon[2]));
      persist_read_string(KEY_DAY1_RAIN, days_rain[0], sizeof(days_rain[0]));
      persist_read_string(KEY_DAY2_RAIN, days_rain[1], sizeof(days_rain[1]));
      persist_read_string(KEY_DAY3_RAIN, days_rain[2], sizeof(days_rain[2]));
      persist_read_string(KEY_DAY1_WIND, days_wind[0], sizeof(days_wind[0]));
      persist_read_string(KEY_DAY2_WIND, days_wind[1], sizeof(days_wind[1]));
      persist_read_string(KEY_DAY3_WIND, days_wind[2], sizeof(days_wind[2]));
    }

  } else {
    last_refresh = 0;
    wind_speed_val = 0;
    tmin_val = 0;
    humidity = 0;
    tmax_val = 0;
    wind1_val = 0;
    wind2_val = 0;
    wind3_val = 0;
    temp1_val = 0;
    temp2_val = 0;
    temp3_val = 0;
    temp4_val = 0;
    temp5_val = 0;
    rain1_val = 0;
    rain2_val = 0;
    rain3_val = 0;
    rain4_val = 0;
    weather_temp = 0;

    snprintf(icon, sizeof(icon), " ");
    snprintf(icon1, sizeof(icon1), " ");
    snprintf(icon2, sizeof(icon2), " ");
    snprintf(icon3, sizeof(icon3), " ");
    snprintf(location, sizeof(location), " ");

    // Initialize graph data to defaults
    for (int i = 0; i < 5; i++) {
      graph_temps[i] = 10; // Default temperature
    }
    for (int i = 0; i < 12; i++) {
      graph_rains[i] = 0;
    }
    snprintf(graph_icon1, sizeof(graph_icon1), " ");
    snprintf(graph_icon2, sizeof(graph_icon2), " ");
    snprintf(graph_icon3, sizeof(graph_icon3), " ");
    for (int i = 0; i < 4; i++) {
      graph_wind_val[i] = 0;
    }
    graph_hours[0] = 0;
    graph_hours[1] = 3;
    graph_hours[2] = 6;
    graph_hours[3] = 9;

    // Initialize days_icon to prevent crashes when accessing uninitialized data
    snprintf(days_icon[0], sizeof(days_icon[0]), " ");
    snprintf(days_icon[1], sizeof(days_icon[1]), " ");
    snprintf(days_icon[2], sizeof(days_icon[2]), " ");
  }

  color_temp = GColorWhite;
  // Force B&W colors for all platforms (aplite style)
  color_left = GColorBlack;
  color_right = GColorBlack;

  assign_fonts();

  BatteryChargeState charge_state = battery_state_service_peek();
  flags.is_charging = charge_state.is_charging;
  flags.is_connected = connection_service_peek_pebble_app_connection();

  // Fixed ruler settings
  line_interval = 4;
  segment_thickness = 2;

  if (!clock_is_24h_style()) {
    for (i = 0; i < 28; i++) {
      labels[i] = labels_12h[i];
    }
  }
  setHourLinePoints();
  initBatteryLevel();

  int hour_size = 12 * line_interval; // 12 marks, one every 5 minutes
  hour_part_size = 26 * hour_size;

  if (flags.is_30mn)
    duration = 1800;
  else
    duration = 3600;
}

static void init() {

  init_var();

  s_main_window = window_create();
  window_stack_push(s_main_window, true);

  s_canvas_layer = window_get_root_layer(s_main_window);
  layer = layer_create(layer_get_bounds(s_canvas_layer));
  layer_set_update_proc(layer, update_proc);
  layer_add_child(s_canvas_layer, layer);

  tick_timer_service_subscribe(MINUTE_UNIT, handle_tick);
  // battery_state_service_subscribe(handle_battery);
  bluetooth_connection_service_subscribe(bt_handler);
  accel_tap_service_subscribe(handle_wrist_tap);

  // JS Messages

  app_message_register_inbox_received(inbox_received_callback);
  app_message_register_outbox_failed(outbox_failed_callback);
  app_message_register_outbox_sent(outbox_sent_callback);

  // Open AppMessage

  app_message_open(650, 50);
  app_focus_service_subscribe_handlers((AppFocusHandlers){
      .did_focus = app_focus_changed, .will_focus = app_focus_changing});

  // Only trigger weather fetch if cache is stale (respects 30/60 min refresh setting)
  t = time(NULL);
  now = *(localtime(&t));
  if ((mktime(&now) - last_refresh) > duration) {
    DictionaryIterator *iter;
    if (app_message_outbox_begin(&iter) == APP_MSG_OK) {
      dict_write_uint8(iter, 0, 0);
      app_message_outbox_send();
    }
  }
}

static void deinit() {

  tick_timer_service_unsubscribe();
  // battery_state_service_unsubscribe();
  bluetooth_connection_service_unsubscribe();
  accel_tap_service_unsubscribe();
  if (timer_short) {
    app_timer_cancel(timer_short);
    timer_short = NULL;
  }
  if (news_timer) {
    app_timer_cancel(news_timer);
    news_timer = NULL;
  }
  if (rsvp_timer) {
    app_timer_cancel(rsvp_timer);
    rsvp_timer = NULL;
  }
  flags.s_whiteout_active = false;
  app_message_deregister_callbacks();

  layer_destroy(layer);
  window_destroy(s_main_window);

  if (flags.fontbig_loaded && fontbig_resource_id != 0) {
    fonts_unload_custom_font(fontbig);
    flags.fontbig_loaded = false;
  }
}

int main(void) {
  init();
  app_event_loop();
  deinit();
}

static void ensure_fontbig_loaded(void) {
  if (fontbig_resource_id != 0 && !flags.fontbig_loaded) {
    fontbig = fonts_load_custom_font(resource_get_handle(fontbig_resource_id));
    flags.fontbig_loaded = true;
  }
}