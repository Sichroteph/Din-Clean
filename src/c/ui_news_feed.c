#include "ui_news_feed.h"
#include <pebble.h>

#define WIDTH 144
#define HEIGHT 168

void ui_draw_news_feed(GContext *ctx, const char *word) {
  graphics_context_set_fill_color(ctx, GColorBlack);
  graphics_fill_rect(ctx, GRect(0, 0, WIDTH, HEIGHT), 0, GCornerNone);

  graphics_context_set_text_color(ctx, GColorWhite);

  // Focal point indicator (small lines to guide the eye)
  graphics_context_set_stroke_color(ctx, GColorWhite);
  int center_y = HEIGHT / 2 - 5;
  graphics_draw_line(ctx, GPoint(5, center_y + 5), GPoint(15, center_y + 5));
  graphics_draw_line(ctx, GPoint(WIDTH - 15, center_y + 5),
                     GPoint(WIDTH - 5, center_y + 5));

  // Word display - large and centered
  const char *display_text = (word && word[0] != '\0') ? word : "";

  // Choose font based on word length
  GFont font;
  int y_offset;
  if (strlen(display_text) <= 6) {
    font = fonts_get_system_font(FONT_KEY_BITHAM_42_BOLD);
    y_offset = HEIGHT / 2 - 30;
  } else if (strlen(display_text) <= 10) {
    font = fonts_get_system_font(FONT_KEY_BITHAM_30_BLACK);
    y_offset = HEIGHT / 2 - 22;
  } else {
    font = fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD);
    y_offset = HEIGHT / 2 - 18;
  }

  graphics_draw_text(ctx, display_text, font, GRect(0, y_offset, WIDTH, 60),
                     GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter,
                     NULL);
}
