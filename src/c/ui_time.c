#include <pebble.h>
#include <string.h>

#include "ui_time.h"

static int build_number(char number) {
  switch (number) {
  case '0':
    return RESOURCE_ID_0;
  case '1':
    return RESOURCE_ID_1;
  case '2':
    return RESOURCE_ID_2;
  case '3':
    return RESOURCE_ID_3;
  case '4':
    return RESOURCE_ID_4;
  case '5':
    return RESOURCE_ID_5;
  case '6':
    return RESOURCE_ID_6;
  case '7':
    return RESOURCE_ID_7;
  case '8':
    return RESOURCE_ID_8;
  case '9':
    return RESOURCE_ID_9;
  default:
    return RESOURCE_ID_0;
  }
}

void ui_draw_time(GContext *ctx, const TimeRenderData *data) {
  if (!data) {
    return;
  }

  const char *digits = data->digits;
  if (!digits || strlen(digits) < 4) {
    return;
  }

  const GRect *rects = data->digit_rects;
  int resources[4] = {build_number(digits[0]), build_number(digits[1]),
                      build_number(digits[2]), build_number(digits[3])};

  for (int i = 0; i < 4; i++) {
    GBitmap *bitmap = gbitmap_create_with_resource(resources[i]);
    graphics_draw_bitmap_in_rect(ctx, bitmap, rects[i]);
    gbitmap_destroy(bitmap);
  }
}
