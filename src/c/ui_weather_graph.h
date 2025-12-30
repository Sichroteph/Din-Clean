#pragma once

#include <pebble.h>

typedef struct {
  int temps[5];
  int rains[12];
  int hours[4];
  int icon_ids[3];
  char winds[4][8];
  bool is_metric;
} WeatherGraphData;

void ui_draw_weather_graph(GContext *ctx, const WeatherGraphData *data);
