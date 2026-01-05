#include <pebble.h>
#include "ui_news_feed.h"

#define WIDTH 144
#define HEIGHT 168

void ui_draw_news_feed(GContext *ctx) {
  graphics_context_set_fill_color(ctx, GColorBlack);
  graphics_fill_rect(ctx, GRect(0, 0, WIDTH, HEIGHT), 0, GCornerNone);

  GFont font = fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD);
  graphics_context_set_text_color(ctx, GColorWhite);

  graphics_draw_text(ctx, "News", font, GRect(0, 60, WIDTH, 40),
                     GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter,
                     NULL);
}
