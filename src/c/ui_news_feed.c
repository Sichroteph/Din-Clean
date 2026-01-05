#include "ui_news_feed.h"
#include <pebble.h>

#define WIDTH 144
#define HEIGHT 168

// Draw splash screen with Reuters branding
static void draw_splash_screen(GContext *ctx) {
  // Background
  graphics_context_set_fill_color(ctx, GColorBlack);
  graphics_fill_rect(ctx, GRect(0, 0, WIDTH, HEIGHT), 0, GCornerNone);

  graphics_context_set_text_color(ctx, GColorWhite);
  graphics_context_set_stroke_color(ctx, GColorWhite);

  // "REUTERS" - large centered title
  graphics_draw_text(ctx, "REUTERS",
                     fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD),
                     GRect(0, 45, WIDTH, 35), GTextOverflowModeTrailingEllipsis,
                     GTextAlignmentCenter, NULL);

  // Horizontal line separator
  int line_y = 85;
  graphics_draw_line(ctx, GPoint(20, line_y), GPoint(WIDTH - 20, line_y));
  graphics_draw_line(ctx, GPoint(20, line_y + 1),
                     GPoint(WIDTH - 20, line_y + 1));

  // "Breaking International News" - subtitle
  GFont font_sub = fonts_get_system_font(FONT_KEY_GOTHIC_18);
  graphics_draw_text(ctx, "Breaking", font_sub, GRect(0, 95, WIDTH, 22),
                     GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter,
                     NULL);
  graphics_draw_text(
      ctx, "International News", font_sub, GRect(0, 115, WIDTH, 22),
      GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter, NULL);

  // Small decorative dots
  for (int i = 0; i < 3; i++) {
    graphics_fill_circle(ctx, GPoint(WIDTH / 2 - 10 + i * 10, 148), 2);
  }
}

// Draw RSVP word display
static void draw_rsvp_word(GContext *ctx, const char *word) {
  // Background
  graphics_context_set_fill_color(ctx, GColorBlack);
  graphics_fill_rect(ctx, GRect(0, 0, WIDTH, HEIGHT), 0, GCornerNone);

  graphics_context_set_text_color(ctx, GColorWhite);
  graphics_context_set_stroke_color(ctx, GColorWhite);

  // Focal point indicator (small lines to guide the eye)
  int center_y = HEIGHT / 2 - 5;
  graphics_draw_line(ctx, GPoint(5, center_y), GPoint(15, center_y));
  graphics_draw_line(ctx, GPoint(WIDTH - 15, center_y),
                     GPoint(WIDTH - 5, center_y));

  // Word display - large and centered
  const char *display_text = (word && word[0] != '\0') ? word : "";

  // Choose font based on word length
  GFont font;
  int y_offset;
  /*
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
*/
  font = fonts_get_system_font(FONT_KEY_BITHAM_30_BLACK);
  graphics_draw_text(ctx, display_text, font, GRect(0, y_offset, WIDTH, 60),
                     GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter,
                     NULL);
}

void ui_draw_news_feed(GContext *ctx, const char *word, bool show_splash) {
  if (show_splash) {
    draw_splash_screen(ctx);
  } else {
    draw_rsvp_word(ctx, word);
  }
}
