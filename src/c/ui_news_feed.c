#include "ui_news_feed.h"
#include <pebble.h>

#define WIDTH 144
#define HEIGHT 168

void ui_draw_news_feed(GContext *ctx, const char *title) {
  graphics_context_set_fill_color(ctx, GColorBlack);
  graphics_fill_rect(ctx, GRect(0, 0, WIDTH, HEIGHT), 0, GCornerNone);

  graphics_context_set_text_color(ctx, GColorWhite);

  // Header
  GFont font_header = fonts_get_system_font(FONT_KEY_GOTHIC_14_BOLD);
  graphics_draw_text(ctx, "REUTERS", font_header, GRect(0, 2, WIDTH, 18),
                     GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter,
                     NULL);

  // Separator line
  graphics_context_set_stroke_color(ctx, GColorWhite);
  graphics_draw_line(ctx, GPoint(10, 20), GPoint(WIDTH - 10, 20));

  // News title - use smaller font for long text
  GFont font_title = fonts_get_system_font(FONT_KEY_GOTHIC_24_BOLD);
  const char *display_text = (title && title[0] != '\0') ? title : "Loading...";

  // Draw title with word wrap
  graphics_draw_text(ctx, display_text, font_title,
                     GRect(4, 20, WIDTH - 8, HEIGHT - 36),
                     GTextOverflowModeWordWrap, GTextAlignmentCenter, NULL);
}
