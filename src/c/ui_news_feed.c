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
  graphics_draw_line(ctx, GPoint(5, center_y + 6), GPoint(15, center_y + 6));
  graphics_draw_line(ctx, GPoint(WIDTH - 15, center_y + 6),
                     GPoint(WIDTH - 5, center_y + 6));

  // Word display - large and centered, never wrapped
  const char *display_text = (word && word[0] != '\0') ? word : "";

  GFont font = fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD);
  int y_offset = HEIGHT / 2 - 20;

  // Use a very wide rect centered on screen to prevent wrapping
  // Text will overflow left/right but stay on one line
  int wide_width = 500;
  int x_offset = (WIDTH - wide_width) / 2; // Centers the wide rect

  graphics_draw_text(
      ctx, display_text, font, GRect(x_offset, y_offset, wide_width, 40),
      GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter, NULL);
}

void ui_draw_news_feed(GContext *ctx, const char *word, bool show_splash,
                       bool show_end) {
  if (show_splash) {
    draw_splash_screen(ctx);
  } else if (show_end) {
    // Show END screen - similar to RSVP but with END text
    graphics_context_set_fill_color(ctx, GColorBlack);
    graphics_fill_rect(ctx, GRect(0, 0, WIDTH, HEIGHT), 0, GCornerNone);
    graphics_context_set_text_color(ctx, GColorWhite);

    GFont font = fonts_get_system_font(FONT_KEY_BITHAM_42_BOLD);
    graphics_draw_text(ctx, "END", font, GRect(0, HEIGHT / 2 - 25, WIDTH, 50),
                       GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter,
                       NULL);
  } else {
    draw_rsvp_word(ctx, word);
  }
}
