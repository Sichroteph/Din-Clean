#include <pebble.h>

#include "ui_weather_graph.h"
#include "weather_utils.h"

#define WIDTH 144
#define HEIGHT 168
#define WEATHER_OFFSET_X -14
#define WEATHER_OFFSET_Y -60
#define MAXRAIN 40
#define LINE_THICK 3

// Force black & white mode on all platforms for memory safety and consistency
#define BLUE_LINE GColorWhite
#define RED_LINE GColorWhite
#define RAIN_COLOR GColorWhite

static int s_weather_graph_offset_y = WEATHER_OFFSET_Y;

void ui_weather_graph_set_vertical_offset(int offset_y) {
  s_weather_graph_offset_y = offset_y;
}

// Helper: Draw horizontal reference lines (dotted) at 25%, 50%, 75% of graph
// height
static void draw_reference_lines(GContext *ctx, int offset_x, int offset_y) {
  // Graph area: Y from 76 to 76+45 = 121 (relative to offset_y)
  // With temperature curve offset (decallage_y = -7), effective area is 69-114
  const int graph_top = 69;    // 76 - 7 (decallage_y)
  const int graph_height = 45; // Height of the graph area
  const int graph_left = 37;   // Left edge of graph
  const int graph_right = 157; // Right edge of graph

  graphics_context_set_stroke_width(ctx, 1);
  graphics_context_set_stroke_color(ctx, GColorWhite);

  // Calculate Y positions for 25%, 50%, 75%
  int y_25 = graph_top + (graph_height * 25 / 100) - 4; // 25% from top
  int y_50 = graph_top + (graph_height * 50 / 100);     // 50% (middle)
  int y_75 = graph_top + (graph_height * 75 / 100) + 4; // 75% from top

  // Draw dotted lines using short line segments (more efficient than individual
  // pixels) Pattern: 2 pixels on, 3 pixels off
  for (int x = graph_left + offset_x; x <= graph_right + offset_x; x += 5) {
    int x_end = x + 1;
    if (x_end > graph_right + offset_x) {
      x_end = graph_right + offset_x;
    }
    // 25% line
    graphics_draw_line(ctx, GPoint(x, y_25 + offset_y),
                       GPoint(x_end, y_25 + offset_y));
    // 50% line (middle)
    graphics_draw_line(ctx, GPoint(x, y_50 + offset_y),
                       GPoint(x_end, y_50 + offset_y));
    // 75% line
    graphics_draw_line(ctx, GPoint(x, y_75 + offset_y),
                       GPoint(x_end, y_75 + offset_y));
  }
}

// Helper: Draw rain bars - reduces main function stack usage
static void draw_rain_bars(GContext *ctx, const WeatherGraphData *d,
                           int offset_x, int offset_y) {
  graphics_context_set_fill_color(ctx, RAIN_COLOR);
  for (int i_segments = 0; i_segments < 12; i_segments++) {
    int rain_pixel = 45 * d->rains[i_segments] / MAXRAIN;
    if (rain_pixel > 45) {
      rain_pixel = 45;
    }
    for (int i = 0; i < 10; i = i + 2) {
      graphics_fill_rect(ctx,
                         GRect(37 + offset_x + i + i_segments * 10,
                               76 + 45 - rain_pixel + offset_y, 1, rain_pixel),
                         0, GCornerNone);
    }
  }
}

// Helper: Draw temperature labels - reduces main function stack usage
static void draw_temp_labels(GContext *ctx, int ttmax, int ttmin, int offset_x,
                             int offset_y) {
  static char t1[8];
  static char t12[8];
  static char t2[8];
  int tmoy = (int)((ttmax + ttmin) / 2);

  snprintf(t1, sizeof(t1), "%i", ttmax);
  snprintf(t12, sizeof(t12), "%i", tmoy);
  snprintf(t2, sizeof(t2), "%i", ttmin);

  graphics_context_set_text_color(ctx, GColorWhite);

  // Each temperature uses its own font size based on its individual length
  // Use smaller font if the value has 3 or more characters (e.g., -10)
  GFont font_t1 = (strlen(t1) >= 3)
                      ? fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD)
                      : fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD);
  
  GFont font_t12 = (strlen(t12) >= 3)
                       ? fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD)
                       : fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD);
  
  GFont font_t2 = (strlen(t2) >= 3)
                      ? fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD)
                      : fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD);

  // Adjust Y offset for negative temperatures (descend by 4 pixels)
  int y_offset_t1 = (ttmax < 0) ? 4 : 0;
  int y_offset_t12 = (tmoy < 0) ? 4 : 0;
  int y_offset_t2 = (ttmin < 0) ? 4 : 0;

  graphics_draw_text(
      ctx, t1, font_t1, GRect(-25 + offset_x, 51 + offset_y + y_offset_t1, 60, 20),
      GTextOverflowModeTrailingEllipsis, GTextAlignmentRight, NULL);

  graphics_draw_text(
      ctx, t12, font_t12, GRect(-25 + offset_x, 73 + offset_y + y_offset_t12, 60, 20),
      GTextOverflowModeTrailingEllipsis, GTextAlignmentRight, NULL);

  graphics_draw_text(
      ctx, t2, font_t2, GRect(-25 + offset_x, 95 + offset_y + y_offset_t2, 60, 20),
      GTextOverflowModeTrailingEllipsis, GTextAlignmentRight, NULL);
}

// Helper: Draw hour and wind labels - reduces main function stack usage
static void draw_hour_wind_labels(GContext *ctx, const WeatherGraphData *d,
                                  const char *h0, const char *h1,
                                  const char *h2, const char *h3, int offset_x,
                                  int offset_y) {
  GFont statusfontdate = fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD);
  GFont statusfontsmall = fonts_get_system_font(FONT_KEY_GOTHIC_14);

  graphics_context_set_compositing_mode(ctx, GCompOpSet);
  graphics_context_set_fill_color(ctx, GColorBlack);
  graphics_fill_rect(ctx, GRect(offset_x, 150 + offset_y, 80, 20), 0,
                     GCornerNone);

  graphics_context_set_text_color(ctx, GColorWhite);
  graphics_draw_text(
      ctx, h0, statusfontdate, GRect(11 + offset_x, 116 + offset_y, 60, 40),
      GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter, NULL);
  graphics_draw_text(
      ctx, h1, statusfontdate, GRect(42 + offset_x, 116 + offset_y, 60, 40),
      GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter, NULL);
  graphics_draw_text(
      ctx, h2, statusfontdate, GRect(73 + offset_x, 116 + offset_y, 60, 40),
      GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter, NULL);
  graphics_draw_text(
      ctx, h3, statusfontdate, GRect(102 + offset_x, 116 + offset_y, 60, 40),
      GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter, NULL);

  // Draw "W." label to indicate the row shows wind values
  graphics_draw_text(
      ctx, "W.", statusfontsmall, GRect(3, 144 + offset_y, 20, 40),
      GTextOverflowModeTrailingEllipsis, GTextAlignmentLeft, NULL);

  graphics_draw_text(ctx, d->winds[0], statusfontsmall,
                     GRect(11 + offset_x, 144 + offset_y, 60, 40),
                     GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter,
                     NULL);
  graphics_draw_text(ctx, d->winds[1], statusfontsmall,
                     GRect(42 + offset_x, 144 + offset_y, 60, 40),
                     GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter,
                     NULL);
  graphics_draw_text(ctx, d->winds[2], statusfontsmall,
                     GRect(73 + offset_x, 144 + offset_y, 60, 40),
                     GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter,
                     NULL);
  graphics_draw_text(ctx, d->winds[3], statusfontsmall,
                     GRect(102 + offset_x, 144 + offset_y, 60, 40),
                     GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter,
                     NULL);
}

void ui_draw_weather_graph(GContext *ctx, const WeatherGraphData *d) {
  if (!d) {
    return;
  }

  graphics_context_set_fill_color(ctx, GColorBlack);
  graphics_fill_rect(ctx, GRect(0, 0, WIDTH, HEIGHT), 0, GCornerNone);

  const int offset_y = s_weather_graph_offset_y;
  const int offset_x = WEATHER_OFFSET_X;

  static char h0_buffer[6];
  static char h1_buffer[6];
  static char h2_buffer[6];
  static char h3_buffer[6];

  int hour_style = clock_is_24h_style() ? 24 : 12;

  snprintf(h0_buffer, sizeof(h0_buffer), "%i", d->hours[0] % hour_style);
  snprintf(h1_buffer, sizeof(h1_buffer), "%i", d->hours[1] % hour_style);
  snprintf(h2_buffer, sizeof(h2_buffer), "%i", d->hours[2] % hour_style);
  snprintf(h3_buffer, sizeof(h3_buffer), "%i", d->hours[3] % hour_style);

  // Draw horizontal reference lines (dotted) at 25%, 50%, 75%
  draw_reference_lines(ctx, offset_x, offset_y);

  // Draw rain bars using helper function (reduces stack)
  draw_rain_bars(ctx, d, offset_x, offset_y);

  // Calculate temperature range
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
  // Protect against division issues if all temps are the same
  if (echelle <= 0) {
    echelle = 1;
  }

  // Draw temperature labels using helper function (reduces stack)
  draw_temp_labels(ctx, ttmax, ttmin, offset_x, offset_y);

  // Calculate y positions for temperature curve
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

  // Segment 1: y1 → y2
  if ((d->temps[0] < freezing_temp) && (d->temps[1] < freezing_temp))
    graphics_context_set_stroke_color(ctx, BLUE_LINE);
  else
    graphics_context_set_stroke_color(ctx, RED_LINE);
  graphics_draw_line(ctx, GPoint(37 + offset_x, y1 + offset_y + decallage_y),
                     GPoint(67 + offset_x, y2 + offset_y + decallage_y));

  // Segment 2: y2 → y3
  if ((d->temps[1] < freezing_temp) && (d->temps[2] < freezing_temp))
    graphics_context_set_stroke_color(ctx, BLUE_LINE);
  else
    graphics_context_set_stroke_color(ctx, RED_LINE);
  graphics_draw_line(ctx, GPoint(67 + offset_x, y2 + offset_y + decallage_y),
                     GPoint(97 + offset_x, y3 + offset_y + decallage_y));

  // Segment 3: y3 → y4
  if ((d->temps[2] < freezing_temp) && (d->temps[3] < freezing_temp))
    graphics_context_set_stroke_color(ctx, BLUE_LINE);
  else
    graphics_context_set_stroke_color(ctx, RED_LINE);
  graphics_draw_line(ctx, GPoint(97 + offset_x, y3 + offset_y + decallage_y),
                     GPoint(127 + offset_x, y4 + offset_y + decallage_y));

  // Segment 4: y4 → y5
  if ((d->temps[3] < freezing_temp) && (d->temps[4] < freezing_temp))
    graphics_context_set_stroke_color(ctx, BLUE_LINE);
  else
    graphics_context_set_stroke_color(ctx, RED_LINE);
  graphics_draw_line(ctx, GPoint(127 + offset_x, y4 + offset_y + decallage_y),
                     GPoint(157 + offset_x, y5 + offset_y + decallage_y));

  // Draw hour and wind labels using helper function (reduces stack)
  draw_hour_wind_labels(ctx, d, h0_buffer, h1_buffer, h2_buffer, h3_buffer,
                        offset_x, offset_y);

  const GRect base_rect = {{14, HEIGHT - 38}, {36, 36}};
  const int spacing = 40;
  const int icon_count = sizeof(d->icon_ids) / sizeof(d->icon_ids[0]);

  GFont statusfontsmall = fonts_get_system_font(FONT_KEY_GOTHIC_14);

  const char *locale = i18n_get_system_locale();
  time_t now = time(NULL);
  struct tm *current_time = localtime(&now);
  int today_wday = current_time ? current_time->tm_wday : 0;

  // MEMORY OPTIMIZATION: Draw pourtour for ALL icons first, then destroy it
  // This avoids holding pourtour in memory while loading weather icons
#ifdef RESOURCE_ID_POURTOUR2
  GBitmap *pourtour = gbitmap_create_with_resource(RESOURCE_ID_POURTOUR2);
#else
  GBitmap *pourtour = gbitmap_create_with_resource(RESOURCE_ID_POURTOURW1);
#endif

  if (pourtour) {
    for (int day = 1; day <= 3; day++) {
      GRect icon_rect = base_rect;
      icon_rect.origin.x += (day - 1) * spacing;
      graphics_draw_bitmap_in_rect(ctx, pourtour, icon_rect);
    }
    gbitmap_destroy(pourtour);
    pourtour = NULL;
  } else {
    // Skip icon rendering entirely if we can't even load the border
    // This prevents cascading memory failures
    goto draw_frame;
  }

  // Now draw weekday labels and weather icons (pourtour is freed)
  for (int day = 1; day <= 3; day++) {

    GRect icon_rect = base_rect;
    icon_rect.origin.x += (day - 1) * spacing;

    int day_wday = (today_wday + day) % 7;
    const char *weekday_name = weather_utils_get_weekday_name(locale, day_wday);
    char weekday_abbrev[4] = "";
    if (weekday_name && weekday_name[0] != '\0') {
      snprintf(weekday_abbrev, sizeof(weekday_abbrev), "%.3s", weekday_name);
      GRect label_rect = {{icon_rect.origin.x - 1, icon_rect.origin.y - 16},
                          {icon_rect.size.w, 12}};
      graphics_draw_text(ctx, weekday_abbrev, statusfontsmall, label_rect,
                         GTextOverflowModeTrailingEllipsis,
                         GTextAlignmentCenter, NULL);
    }

    int icon_index = day - 1;
    int icon_resource = (icon_index < icon_count) ? d->icon_ids[icon_index] : 0;

    // Validate resource ID before attempting to load bitmap
    // Invalid resource IDs (0, negative, or very large values) can cause
    // crashes
    if (icon_resource > 0 && icon_resource < 500) {
      GBitmap *day_icon = gbitmap_create_with_resource(icon_resource);
      if (day_icon) {
        graphics_draw_bitmap_in_rect(ctx, day_icon, icon_rect);
        gbitmap_destroy(day_icon);
      } else {
        // Memory allocation failed - stop trying to load more icons
        break;
      }
    }
  }

draw_frame:

  graphics_context_set_stroke_width(ctx, 1);
  graphics_context_set_stroke_color(ctx, GColorWhite);
  graphics_draw_line(ctx, GPoint(23, 1), GPoint(143, 1));
  graphics_draw_line(ctx, GPoint(23, 1), GPoint(23, 122 + offset_y));
  graphics_draw_line(ctx, GPoint(143, 1), GPoint(143, 122 + offset_y));

  graphics_draw_line(ctx, GPoint(23, 122 + offset_y),
                     GPoint(143, 122 + offset_y));

  graphics_context_set_fill_color(ctx, GColorWhite);
  for (int x = 0; x <= 143; x += 6) {
    graphics_fill_circle(ctx, GPoint(x, 168 + offset_y), 1);
  }
}
