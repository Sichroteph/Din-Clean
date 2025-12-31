#pragma once

#include <pebble.h>

typedef struct {
  int8_t temps[5];   // -127 to 127 is enough for temps
  uint8_t rains[12]; // 0-255 is enough for rain values
  uint8_t hours[4];  // 0-23 is enough for hours
  int icon_ids[3];
  char winds[4][20];
  bool is_metric;
} WeatherGraphData;

void ui_draw_weather_graph(GContext *ctx, const WeatherGraphData *data);
void ui_weather_graph_set_vertical_offset(int offset_y);
