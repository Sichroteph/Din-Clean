#include <pebble.h>

#include "ui_weather_graph.h"

#define WIDTH 144
#define HEIGHT 168
#define WEATHER_OFFSET_X -14
#define WEATHER_OFFSET_Y -9
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

static int clamp_int(int value, int min, int max) {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

void ui_draw_weather_graph(GContext *ctx, const WeatherGraphData *d) {
  if (!d) {
    return;
  }

  GFont statusfontdate = fonts_get_system_font(FONT_KEY_GOTHIC_14);
  GFont statusfontsmall = fonts_get_system_font(FONT_KEY_GOTHIC_14);

  graphics_context_set_fill_color(ctx, GColorBlack);
  graphics_fill_rect(ctx, GRect(0, 0, WIDTH, HEIGHT), 0, GCornerNone);

  GBitmap *background =
      gbitmap_create_with_resource(RESOURCE_ID_GRILLE_WEATHER);
  if (background) {
    graphics_draw_bitmap_in_rect(ctx, background, GRect(23, 49, 121, 61));
    gbitmap_destroy(background);
  }

  int var_weath_ofF_y = WEATHER_OFFSET_Y;

  GRect rect_h0 = {{6 + WEATHER_OFFSET_X, 116 + var_weath_ofF_y}, {60, 40}};
  GRect rect_h1 = {{37 + WEATHER_OFFSET_X, 116 + var_weath_ofF_y}, {60, 40}};
  GRect rect_h2 = {{68 + WEATHER_OFFSET_X, 116 + var_weath_ofF_y}, {60, 40}};
  GRect rect_h3 = {{97 + WEATHER_OFFSET_X, 116 + var_weath_ofF_y}, {60, 40}};

  GRect rect_wind0 = {{6 + WEATHER_OFFSET_X, 144 + var_weath_ofF_y}, {60, 40}};
  GRect rect_wind1 = {{37 + WEATHER_OFFSET_X, 144 + var_weath_ofF_y}, {60, 40}};
  GRect rect_wind2 = {{68 + WEATHER_OFFSET_X, 144 + var_weath_ofF_y}, {60, 40}};
  GRect rect_wind3 = {{97 + WEATHER_OFFSET_X, 144 + var_weath_ofF_y}, {60, 40}};

  GRect rect_t1 = {{-25 + WEATHER_OFFSET_X, 51 + var_weath_ofF_y}, {60, 20}};
  GRect rect_t12 = {{-25 + WEATHER_OFFSET_X, 73 + var_weath_ofF_y}, {60, 20}};
  GRect rect_t2 = {{-25 + WEATHER_OFFSET_X, 95 + var_weath_ofF_y}, {60, 20}};
  GRect rect_patch = {{WEATHER_OFFSET_X, 150 + var_weath_ofF_y}, {80, 20}};

  char h0_buffer[20] = " ";
  char h1_buffer[20] = " ";
  char h2_buffer[20] = " ";
  char h3_buffer[20] = " ";

  int hour_style = clock_is_24h_style() ? 24 : 12;

  snprintf(h0_buffer, sizeof(h0_buffer), "%i", d->hours[0] % hour_style);
  snprintf(h1_buffer, sizeof(h1_buffer), "%i", d->hours[1] % hour_style);
  snprintf(h2_buffer, sizeof(h2_buffer), "%i", d->hours[2] % hour_style);
  snprintf(h3_buffer, sizeof(h3_buffer), "%i", d->hours[3] % hour_style);

  graphics_context_set_text_color(ctx, GColorWhite);

  graphics_context_set_fill_color(ctx, RAIN_COLOR);
  for (int i_segments = 0; i_segments < 12; i_segments++) {
    const int rain_val = clamp_int(d->rains[i_segments], 0, MAXRAIN);
    int rain_pixel = 45 * rain_val / MAXRAIN;
    if (rain_pixel > 45) {
      rain_pixel = 45;
    }

#ifdef PBL_COLOR
    graphics_fill_rect(ctx,
                       GRect(37 + WEATHER_OFFSET_X + i_segments * 10,
                             76 + 45 - rain_pixel + var_weath_ofF_y, 10,
                             rain_pixel),
                       0, GCornerNone);
#else
    for (int i = 0; i < 10; i = i + 2) {
      graphics_fill_rect(ctx,
                         GRect(37 + WEATHER_OFFSET_X + i + i_segments * 10,
                               76 + 45 - rain_pixel + var_weath_ofF_y, 1,
                               rain_pixel),
                         0, GCornerNone);
    }
#endif
  }

  int ttmin = clamp_int(d->temps[0], -60, 80);
  int ttmax = clamp_int(d->temps[0], -60, 80);
  for (int k = 0; k < 5; k++) {
    const int t = clamp_int(d->temps[k], -60, 80);
    if (ttmin >= t) {
      ttmin = t;
    }
    if (ttmax < t) {
      ttmax = t;
    }
  }

  // Log the temperature span shown on the graph for debugging zero displays
  APP_LOG(APP_LOG_LEVEL_INFO,
          "Weather graph temps range: [%d..%d] values %d,%d,%d,%d,%d", ttmin,
          ttmax, d->temps[0], d->temps[1], d->temps[2], d->temps[3],
          d->temps[4]);

  int echelle = 1;
  while (ttmin < ttmax - echelle * 3) {
    echelle++;
  }
  if (echelle <= 0) {
    echelle = 1;
  }

  static char t1[20];
  static char t12[20];
  static char t2[20];
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
  f = 76 + (ttmax - clamp_int(d->temps[0], -60, 80)) * 15 / echelle;
  int y1 = (int)f;
  f = 76 + (ttmax - clamp_int(d->temps[1], -60, 80)) * 15 / echelle;
  int y2 = (int)f;
  f = 76 + (ttmax - clamp_int(d->temps[2], -60, 80)) * 15 / echelle;
  int y3 = (int)f;
  f = 76 + (ttmax - clamp_int(d->temps[3], -60, 80)) * 15 / echelle;
  int y4 = (int)f;
  f = 76 + (ttmax - clamp_int(d->temps[4], -60, 80)) * 15 / echelle;
  int y5 = (int)f;

  graphics_context_set_stroke_width(ctx, LINE_THICK);
  int freezing_temp = d->is_metric ? 0 : 32;
  int decallage_y = -7;

  if ((d->temps[0] < freezing_temp) && (d->temps[1] < freezing_temp))
    graphics_context_set_stroke_color(ctx, BLUE_LINE);
  else
    graphics_context_set_stroke_color(ctx, RED_LINE);
  graphics_draw_line(
      ctx, GPoint(37 + WEATHER_OFFSET_X, y1 + var_weath_ofF_y + decallage_y),
      GPoint(67 + WEATHER_OFFSET_X, y2 + var_weath_ofF_y + decallage_y));

  if ((d->temps[1] < freezing_temp) && (d->temps[2] < freezing_temp))
    graphics_context_set_stroke_color(ctx, BLUE_LINE);
  else
    graphics_context_set_stroke_color(ctx, RED_LINE);
  graphics_draw_line(
      ctx, GPoint(67 + WEATHER_OFFSET_X, y2 + var_weath_ofF_y + decallage_y),
      GPoint(97 + WEATHER_OFFSET_X, y3 + var_weath_ofF_y + decallage_y));

  if ((d->temps[2] < freezing_temp) && (d->temps[3] < freezing_temp))
    graphics_context_set_stroke_color(ctx, BLUE_LINE);
  else
    graphics_context_set_stroke_color(ctx, RED_LINE);
  graphics_draw_line(
      ctx, GPoint(97 + WEATHER_OFFSET_X, y3 + var_weath_ofF_y + decallage_y),
      GPoint(127 + WEATHER_OFFSET_X, y4 + var_weath_ofF_y + decallage_y));

  if ((d->temps[3] < freezing_temp) && (d->temps[4] < freezing_temp))
    graphics_context_set_stroke_color(ctx, BLUE_LINE);
  else
    graphics_context_set_stroke_color(ctx, RED_LINE);
  graphics_draw_line(
      ctx, GPoint(127 + WEATHER_OFFSET_X, y4 + var_weath_ofF_y + decallage_y),
      GPoint(157 + WEATHER_OFFSET_X, y5 + var_weath_ofF_y + decallage_y));

  GRect rect_icon1 = {{67 - 18 + WEATHER_OFFSET_X, 25 + var_weath_ofF_y},
                      {36, 36}};
  GRect rect_icon2 = {{97 - 18 + WEATHER_OFFSET_X, 25 + var_weath_ofF_y},
                      {36, 36}};
  GRect rect_icon3 = {{127 - 18 + WEATHER_OFFSET_X, 25 + var_weath_ofF_y},
                      {36, 36}};

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

  // Draw icons only when resource ids look valid to avoid crashes
  const int icon_ids[3] = {d->icon_ids[0], d->icon_ids[1], d->icon_ids[2]};
  GRect icon_rects[3] = {rect_icon1, rect_icon2, rect_icon3};
  for (int i = 0; i < 3; i++) {
    if (icon_ids[i] > 0) {
      GBitmap *icon_bmp = gbitmap_create_with_resource(icon_ids[i]);
      if (icon_bmp) {
        graphics_draw_bitmap_in_rect(ctx, icon_bmp, icon_rects[i]);
        gbitmap_destroy(icon_bmp);
      } else {
        APP_LOG(APP_LOG_LEVEL_WARNING, "Weather graph icon load failed id=%d",
                icon_ids[i]);
      }
    } else {
      APP_LOG(APP_LOG_LEVEL_WARNING, "Weather graph icon skipped invalid id=%d",
              icon_ids[i]);
    }
  }
}
