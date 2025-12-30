#pragma once

#include <pebble.h>

typedef struct {
  char digits[5];
  GRect digit_rects[4];
} TimeRenderData;

void ui_draw_time(GContext *ctx, const TimeRenderData *data);
