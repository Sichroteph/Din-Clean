#include <pebble.h>

#include "ui_weather_graph.h"
#include "weather_utils.h"

#define WIDTH 144
#define HEIGHT 168
#define WEATHER_OFFSET_X -14
#define WEATHER_OFFSET_Y -55
#define MAXRAIN 40
#define LINE_THICK 3

#ifdef PBL_COLOR
#define BLUE_LINE GColorElectricBlue
#define RED_LINE GColorRed
#define RAIN_COLOR GColorCobaltBlue
#else
#define BLUE_LINE GColorWhite
#define RED_LINE GColorWhite
#define RAIN_COLOR GColorWhite
#endif

static int s_weather_graph_offset_y = WEATHER_OFFSET_Y;

void ui_weather_graph_set_vertical_offset(int offset_y) {
  s_weather_graph_offset_y = offset_y;
}

void ui_draw_weather_graph(GContext *ctx, const WeatherGraphData *d) {
  if (!d) {
    return;
  }

  GFont statusfontdate = fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD);
  GFont statusfontsmall = fonts_get_system_font(FONT_KEY_GOTHIC_14);

  graphics_context_set_fill_color(ctx, GColorBlack);
  graphics_fill_rect(ctx, GRect(0, 0, WIDTH, HEIGHT), 0, GCornerNone);

  const int offset_y = s_weather_graph_offset_y;

  // On Aplite, draw simple lines instead of bitmap to save heap memory
  graphics_context_set_stroke_color(ctx, GColorWhite);
  graphics_draw_line(ctx, GPoint(23, 59 + offset_y),
                     GPoint(144, 59 + offset_y));
  graphics_draw_line(ctx, GPoint(23, 120 + offset_y),
                     GPoint(144, 120 + offset_y));

  GRect rect_h0 = {{6 + WEATHER_OFFSET_X, 116 + offset_y}, {60, 40}};
  GRect rect_h1 = {{37 + WEATHER_OFFSET_X, 116 + offset_y}, {60, 40}};
  GRect rect_h2 = {{68 + WEATHER_OFFSET_X, 116 + offset_y}, {60, 40}};
  GRect rect_h3 = {{97 + WEATHER_OFFSET_X, 116 + offset_y}, {60, 40}};

  GRect rect_wind0 = {{6 + WEATHER_OFFSET_X, 144 + offset_y}, {60, 40}};
  GRect rect_wind1 = {{37 + WEATHER_OFFSET_X, 144 + offset_y}, {60, 40}};
  GRect rect_wind2 = {{68 + WEATHER_OFFSET_X, 144 + offset_y}, {60, 40}};
  GRect rect_wind3 = {{99 + WEATHER_OFFSET_X, 144 + offset_y}, {60, 40}};

  GRect rect_wind_unit = {{56, rect_wind3.origin.y + 24}, {28, 40}};

  GRect rect_t1 = {{-25 + WEATHER_OFFSET_X, 51 + offset_y}, {60, 20}};
  GRect rect_t12 = {{-25 + WEATHER_OFFSET_X, 73 + offset_y}, {60, 20}};
  GRect rect_t2 = {{-25 + WEATHER_OFFSET_X, 95 + offset_y}, {60, 20}};
  GRect rect_patch = {{WEATHER_OFFSET_X, 150 + offset_y}, {80, 20}};

  char h0_buffer[6] = " ";
  char h1_buffer[6] = " ";
  char h2_buffer[6] = " ";
  char h3_buffer[6] = " ";

  int hour_style = clock_is_24h_style() ? 24 : 12;

  snprintf(h0_buffer, sizeof(h0_buffer), "%i", d->hours[0] % hour_style);
  snprintf(h1_buffer, sizeof(h1_buffer), "%i", d->hours[1] % hour_style);
  snprintf(h2_buffer, sizeof(h2_buffer), "%i", d->hours[2] % hour_style);
  snprintf(h3_buffer, sizeof(h3_buffer), "%i", d->hours[3] % hour_style);

  graphics_context_set_text_color(ctx, GColorWhite);

  graphics_context_set_fill_color(ctx, RAIN_COLOR);
  for (int i_segments = 0; i_segments < 12; i_segments++) {
    int rain_pixel = 45 * d->rains[i_segments] / MAXRAIN;
    if (rain_pixel > 45) {
      rain_pixel = 45;
    }

#ifdef PBL_COLOR
    graphics_fill_rect(ctx,
                       GRect(37 + WEATHER_OFFSET_X + i_segments * 10,
                             76 + 45 - rain_pixel + offset_y, 10, rain_pixel),
                       0, GCornerNone);
#else
    for (int i = 0; i < 10; i = i + 2) {
      graphics_fill_rect(ctx,
                         GRect(37 + WEATHER_OFFSET_X + i + i_segments * 10,
                               76 + 45 - rain_pixel + offset_y, 1, rain_pixel),
                         0, GCornerNone);
    }
#endif
  }

  int ttmin = d->temps[0];
  int ttmax = d->temps[0];
  for (int k = 0; k < 5; k++) {
    if (ttmin >= d->temps[k]) {
      ttmin = d->temps[k];
    }
    if (ttmax < d->temps[k]) {
      ttmax = d->temps[k];
    }
  }

  int echelle = 1;
  while (ttmin < ttmax - echelle * 3) {
    echelle++;
  }

  static char t1[8];
  static char t12[8];
  static char t2[8];
  int tmoy = (int)((ttmax + ttmin) / 2);

  snprintf(t1, sizeof(t1), "%i", ttmax);
  snprintf(t12, sizeof(t12), "%i", tmoy);
  snprintf(t2, sizeof(t2), "%i", ttmin);

  graphics_draw_text(ctx, t1, statusfontdate, rect_t1,
                     GTextOverflowModeWordWrap, GTextAlignmentRight, NULL);
  graphics_draw_text(ctx, t12, statusfontdate, rect_t12,
                     GTextOverflowModeWordWrap, GTextAlignmentRight, NULL);
  graphics_draw_text(ctx, t2, statusfontdate, rect_t2,
                     GTextOverflowModeWordWrap, GTextAlignmentRight, NULL);

  float f;
  f = 76 + (ttmax - d->temps[0]) * 15 / echelle;
  int y1 = (int)f;
  f = 76 + (ttmax - d->temps[1]) * 15 / echelle;
  int y2 = (int)f;
  f = 76 + (ttmax - d->temps[2]) * 15 / echelle;
  int y3 = (int)f;
  f = 76 + (ttmax - d->temps[3]) * 15 / echelle;
  int y4 = (int)f;
  f = 76 + (ttmax - d->temps[4]) * 15 / echelle;
  int y5 = (int)f;

  graphics_context_set_stroke_width(ctx, LINE_THICK);
  int freezing_temp = d->is_metric ? 0 : 32;
  int decallage_y = -7;

  if ((d->temps[0] < freezing_temp) && (d->temps[1] < freezing_temp))
    graphics_context_set_stroke_color(ctx, BLUE_LINE);
  else
    graphics_context_set_stroke_color(ctx, RED_LINE);
  graphics_draw_line(
      ctx, GPoint(37 + WEATHER_OFFSET_X, y1 + offset_y + decallage_y),
      GPoint(67 + WEATHER_OFFSET_X, y2 + offset_y + decallage_y));

  if ((d->temps[1] < freezing_temp) && (d->temps[2] < freezing_temp))
    graphics_context_set_stroke_color(ctx, BLUE_LINE);
  else
    graphics_context_set_stroke_color(ctx, RED_LINE);
  graphics_draw_line(
      ctx, GPoint(67 + WEATHER_OFFSET_X, y2 + offset_y + decallage_y),
      GPoint(97 + WEATHER_OFFSET_X, y3 + offset_y + decallage_y));

  if ((d->temps[2] < freezing_temp) && (d->temps[3] < freezing_temp))
    graphics_context_set_stroke_color(ctx, BLUE_LINE);
  else
    graphics_context_set_stroke_color(ctx, RED_LINE);
  graphics_draw_line(
      ctx, GPoint(97 + WEATHER_OFFSET_X, y3 + offset_y + decallage_y),
      GPoint(127 + WEATHER_OFFSET_X, y4 + offset_y + decallage_y));

  if ((d->temps[3] < freezing_temp) && (d->temps[4] < freezing_temp))
    graphics_context_set_stroke_color(ctx, BLUE_LINE);
  else
    graphics_context_set_stroke_color(ctx, RED_LINE);
  graphics_draw_line(
      ctx, GPoint(127 + WEATHER_OFFSET_X, y4 + offset_y + decallage_y),
      GPoint(157 + WEATHER_OFFSET_X, y5 + offset_y + decallage_y));

  graphics_context_set_compositing_mode(ctx, GCompOpSet);

  graphics_context_set_fill_color(ctx, GColorBlack);
  graphics_fill_rect(ctx, rect_patch, 0, GCornerNone);

  graphics_draw_text(ctx, h0_buffer, statusfontdate, rect_h0,
                     GTextOverflowModeWordWrap, GTextAlignmentCenter, NULL);
  graphics_draw_text(ctx, h1_buffer, statusfontdate, rect_h1,
                     GTextOverflowModeWordWrap, GTextAlignmentCenter, NULL);
  graphics_draw_text(ctx, h2_buffer, statusfontdate, rect_h2,
                     GTextOverflowModeWordWrap, GTextAlignmentCenter, NULL);
  graphics_draw_text(ctx, h3_buffer, statusfontdate, rect_h3,
                     GTextOverflowModeWordWrap, GTextAlignmentCenter, NULL);

  graphics_draw_text(ctx, d->winds[0], statusfontsmall, rect_wind0,
                     GTextOverflowModeWordWrap, GTextAlignmentCenter, NULL);
  graphics_draw_text(ctx, d->winds[1], statusfontsmall, rect_wind1,
                     GTextOverflowModeWordWrap, GTextAlignmentCenter, NULL);
  graphics_draw_text(ctx, d->winds[2], statusfontsmall, rect_wind2,
                     GTextOverflowModeWordWrap, GTextAlignmentCenter, NULL);
  graphics_draw_text(ctx, d->winds[3], statusfontsmall, rect_wind3,
                     GTextOverflowModeWordWrap, GTextAlignmentCenter, NULL);

  const char *wind_unit = d->is_metric ? "km/h" : "mph";
  graphics_draw_text(ctx, wind_unit, statusfontsmall, rect_wind_unit,
                     GTextOverflowModeWordWrap, GTextAlignmentRight, NULL);

  GRect rect_tomorrow_icon = {{4, HEIGHT - 40}, {36, 36}};

  GBitmap *pourtour = gbitmap_create_with_resource(RESOURCE_ID_POURTOUR2);

  if (pourtour) {
    graphics_draw_bitmap_in_rect(ctx, pourtour, rect_tomorrow_icon);
    gbitmap_destroy(pourtour);
  }

  APP_LOG(APP_LOG_LEVEL_INFO, "GRAPH: try tomorrow icon %d", d->icon_ids[1]);
  GBitmap *tomorrow_icon = gbitmap_create_with_resource(d->icon_ids[1]);
  if (tomorrow_icon) {
    graphics_draw_bitmap_in_rect(ctx, tomorrow_icon, rect_tomorrow_icon);
    gbitmap_destroy(tomorrow_icon);
    APP_LOG(APP_LOG_LEVEL_INFO, "GRAPH: tomorrow icon drawn");
  } else {
    APP_LOG(APP_LOG_LEVEL_WARNING, "GRAPH: tomorrow icon load failed");
  }
}
