#pragma once

#include <pebble.h>

typedef struct {
  int8_t temps[5];     // -127 to 127 is enough for temps
  uint8_t rains[12];   // 0-255 is enough for rain values
  uint8_t hours[4];    // 0-23 is enough for hours
  int icon_ids[3];
  char winds[4][8];
  bool is_metric;
  // 2-day forecast at bottom
  int day_icon_ids[2];    // Icons for next 2 days
  char day_temps[2][10];  // "5°/12°" format
  uint8_t day_of_week[2]; // Day index (0-6)
} WeatherGraphData;

void ui_draw_weather_graph(GContext *ctx, const WeatherGraphData *data);
