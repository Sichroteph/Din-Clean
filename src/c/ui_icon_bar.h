#pragma once

#include <pebble.h>

typedef struct {
  GFont fontsmall;
  GFont fontsmallbold;
  GFont fontmedium;
  GColor color_temp;
  const char *week_day;
  const char *mday;
  const char *min_temp_text;
  const char *max_temp_text;
  const char *weather_temp_text;
  bool has_fresh_weather;
  bool is_connected;
  bool is_quiet_time;
  bool is_bw_icon;
  bool is_color;
  bool is_round;
  bool is_metric;
  int humidity;
  int wind_speed_val;
  int wind2_val;
  int met_unit;
  int icon_id;
  int icon_id6;
  GRect rect_text_day;
  GRect rect_text_dayw;
  GRect rect_temp;
  GRect rect_tmin;
  GRect rect_tmax;
  GRect rect_icon;
  GRect rect_icon6;
  GRect rect_icon_hum1;
  GRect rect_icon_hum2;
  GRect rect_icon_hum3;
  GRect rect_icon_leaf;
  GRect rect_bt_disconect;
  GRect rect_screen;
} IconBarData;

void ui_draw_icon_bar(GContext *ctx, const IconBarData *data);
