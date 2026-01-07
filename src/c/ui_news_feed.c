#include "ui_news_feed.h"
#include <pebble.h>

#define WIDTH 144
#define HEIGHT 168

// Spritz constants
#define SPRITZ_PIVOT_X (WIDTH / 2)             // X position of the pivot point
#define SPRITZ_WORD_Y (HEIGHT / 2 + 10)        // Y position of word center
#define SPRITZ_LINE_TOP_Y (SPRITZ_WORD_Y - 22) // Y of line above word
#define SPRITZ_LINE_BOTTOM_Y (SPRITZ_WORD_Y + 30) // Y of line below word
#define SPRITZ_LINE_LENGTH 20  // Length of vertical guide lines
#define SPRITZ_CIRCLE_RADIUS 5 // Radius of pivot indicator circle

// Calculate the optimal recognition point (ORP) / pivot letter index
// Based on Spritz algorithm from OpenSpritz
static int get_pivot_index(int word_length) {
  if (word_length <= 0)
    return 0;

  switch (word_length) {
  case 1:
    return 0; // first letter (index 0)
  case 2:
  case 3:
  case 4:
  case 5:
    return 1; // second letter (index 1)
  case 6:
  case 7:
  case 8:
  case 9:
    return 2; // third letter (index 2)
  case 10:
  case 11:
  case 12:
  case 13:
    return 3; // fourth letter (index 3)
  default:
    return 4; // fifth letter (index 4)
  }
}

// Get the width of a string segment using the given font
static int get_text_width(GContext *ctx, const char *text, int length,
                          GFont font) {
  if (length <= 0 || !text)
    return 0;

  // Create a temporary buffer for the substring
  char temp[32];
  int copy_len = (length < 31) ? length : 31;
  memcpy(temp, text, copy_len);
  temp[copy_len] = '\0';

  GSize size = graphics_text_layout_get_content_size(
      temp, font, GRect(0, 0, 500, 50), GTextOverflowModeTrailingEllipsis,
      GTextAlignmentLeft);
  return size.w;
}

// Get the width of a single character
static int get_char_width(GContext *ctx, char c, GFont font) {
  char temp[2] = {c, '\0'};
  GSize size = graphics_text_layout_get_content_size(
      temp, font, GRect(0, 0, 100, 50), GTextOverflowModeTrailingEllipsis,
      GTextAlignmentLeft);
  return size.w;
}

// Draw splash screen with channel title
static void draw_splash_screen(GContext *ctx, const char *channel_title) {
  // Background
  graphics_context_set_fill_color(ctx, GColorBlack);
  graphics_fill_rect(ctx, GRect(0, 0, WIDTH, HEIGHT), 0, GCornerNone);

  graphics_context_set_text_color(ctx, GColorWhite);
  graphics_context_set_stroke_color(ctx, GColorWhite);

  // Channel title - large centered (dynamic from RSS feed)
  const char *title = (channel_title && channel_title[0] != '\0') ? channel_title : "News Feed";
  
  // Use smaller font if title is long
  GFont title_font;
  int title_y = 55;
  if (strlen(title) > 20) {
    title_font = fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD);
    title_y = 50;
  } else if (strlen(title) > 12) {
    title_font = fonts_get_system_font(FONT_KEY_GOTHIC_24_BOLD);
    title_y = 52;
  } else {
    title_font = fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD);
  }
  
  graphics_draw_text(ctx, title, title_font,
                     GRect(5, title_y, WIDTH - 10, 60), GTextOverflowModeWordWrap,
                     GTextAlignmentCenter, NULL);

  // Horizontal line separator
  int line_y = 105;
  graphics_draw_line(ctx, GPoint(20, line_y), GPoint(WIDTH - 20, line_y));
  graphics_draw_line(ctx, GPoint(20, line_y + 1),
                     GPoint(WIDTH - 20, line_y + 1));

  // "Loading..." - subtitle
  GFont font_sub = fonts_get_system_font(FONT_KEY_GOTHIC_18);
  graphics_draw_text(ctx, "Loading...", font_sub, GRect(0, 115, WIDTH, 22),
                     GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter,
                     NULL);

  // Small decorative dots
  for (int i = 0; i < 3; i++) {
    graphics_fill_circle(ctx, GPoint(WIDTH / 2 - 10 + i * 10, 148), 2);
  }
}

// Draw Spritz-style RSVP word display with pivot letter highlighting
static void draw_rsvp_word(GContext *ctx, const char *word) {
  // Background
  graphics_context_set_fill_color(ctx, GColorBlack);
  graphics_fill_rect(ctx, GRect(0, 0, WIDTH, HEIGHT), 0, GCornerNone);

  graphics_context_set_stroke_color(ctx, GColorWhite);

  // Draw the horizontal guide lines above and below the word (always visible)
  int line_half_width = 60; // Half width of the horizontal line
  graphics_draw_line(
      ctx, GPoint(SPRITZ_PIVOT_X - line_half_width, SPRITZ_LINE_TOP_Y),
      GPoint(SPRITZ_PIVOT_X + line_half_width, SPRITZ_LINE_TOP_Y));

  graphics_draw_line(
      ctx, GPoint(SPRITZ_PIVOT_X - line_half_width, SPRITZ_LINE_BOTTOM_Y),
      GPoint(SPRITZ_PIVOT_X + line_half_width, SPRITZ_LINE_BOTTOM_Y));

  // Draw a small circle on the top line at the pivot position (pivot indicator)
  graphics_context_set_stroke_color(ctx, GColorWhite);
  graphics_draw_circle(ctx, GPoint(SPRITZ_PIVOT_X, SPRITZ_LINE_TOP_Y),
                       SPRITZ_CIRCLE_RADIUS);

  // Handle empty or null word
  if (!word || word[0] == '\0') {
    return;
  }

  // Calculate word length (handle UTF-8 by counting bytes for now)
  int word_length = strlen(word);
  if (word_length == 0)
    return;

  // Get the pivot index based on Spritz algorithm
  int pivot_idx = get_pivot_index(word_length);

  // Font for word display
  GFont font = fonts_get_system_font(FONT_KEY_GOTHIC_28);

  // Calculate widths for positioning
  // Width of text before pivot letter
  int pre_pivot_width = get_text_width(ctx, word, pivot_idx, font);
  // Width of the pivot letter itself
  int pivot_char_width = get_char_width(ctx, word[pivot_idx], font);

  // Calculate X position so pivot letter is centered at SPRITZ_PIVOT_X
  // The pivot letter's center should be at SPRITZ_PIVOT_X
  int word_x = SPRITZ_PIVOT_X - pre_pivot_width - (pivot_char_width / 2) +
               2; // +2 offset

  // Y position for text
  int text_y = SPRITZ_WORD_Y - 16; // Adjust for font baseline

  // Create buffers for the three parts of the word
  char pre_pivot[32] = "";
  char pivot_char[2] = "";
  char post_pivot[32] = "";

  // Split the word into parts
  if (pivot_idx > 0) {
    int copy_len = (pivot_idx < 31) ? pivot_idx : 31;
    memcpy(pre_pivot, word, copy_len);
    pre_pivot[copy_len] = '\0';
  }

  pivot_char[0] = word[pivot_idx];
  pivot_char[1] = '\0';

  if (pivot_idx + 1 < word_length) {
    int remaining = word_length - pivot_idx - 1;
    int copy_len = (remaining < 31) ? remaining : 31;
    memcpy(post_pivot, &word[pivot_idx + 1], copy_len);
    post_pivot[copy_len] = '\0';
  }

  // Draw the three parts of the word
  int current_x = word_x;

  // Part 1: Text before pivot (white)
  if (pre_pivot[0] != '\0') {
    graphics_context_set_text_color(ctx, GColorWhite);
    graphics_draw_text(ctx, pre_pivot, font, GRect(current_x, text_y, 200, 40),
                       GTextOverflowModeTrailingEllipsis, GTextAlignmentLeft,
                       NULL);
    current_x += pre_pivot_width;
  }

  // Part 2: Pivot letter (with bold effect for emphasis)
  // Note: Color disabled for testing - using bold effect for all displays
  graphics_context_set_text_color(ctx, GColorWhite);

  // Draw pivot letter multiple times with offsets to create strong bold effect
  graphics_draw_text(ctx, pivot_char, font, GRect(current_x, text_y, 50, 40),
                     GTextOverflowModeTrailingEllipsis, GTextAlignmentLeft,
                     NULL);

  graphics_draw_text(
      ctx, pivot_char, font, GRect(current_x + 1, text_y, 50, 40),
      GTextOverflowModeTrailingEllipsis, GTextAlignmentLeft, NULL);
  graphics_draw_text(
      ctx, pivot_char, font, GRect(current_x, text_y + 1, 50, 40),
      GTextOverflowModeTrailingEllipsis, GTextAlignmentLeft, NULL);

  graphics_draw_text(
      ctx, pivot_char, font, GRect(current_x + 1, text_y + 1, 50, 40),
      GTextOverflowModeTrailingEllipsis, GTextAlignmentLeft, NULL);

  current_x += pivot_char_width;

  // Part 3: Text after pivot (white)
  if (post_pivot[0] != '\0') {
    graphics_context_set_text_color(ctx, GColorWhite);
    graphics_draw_text(ctx, post_pivot, font, GRect(current_x, text_y, 200, 40),
                       GTextOverflowModeTrailingEllipsis, GTextAlignmentLeft,
                       NULL);
  }
}

void ui_draw_news_feed(GContext *ctx, const char *word, bool show_splash,
                       bool show_end, const char *channel_title) {
  if (show_splash) {
    draw_splash_screen(ctx, channel_title);
  } else if (show_end) {
    // Show END screen - similar to RSVP but with END text
    graphics_context_set_fill_color(ctx, GColorBlack);
    graphics_fill_rect(ctx, GRect(0, 0, WIDTH, HEIGHT), 0, GCornerNone);
    graphics_context_set_text_color(ctx, GColorWhite);

    GFont font = fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD);
    graphics_draw_text(ctx, "END", font, GRect(0, HEIGHT / 2 - 10, WIDTH, 40),
                       GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter,
                       NULL);
  } else {
    draw_rsvp_word(ctx, word);
  }
}
