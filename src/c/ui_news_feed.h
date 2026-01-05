#pragma once

#include <pebble.h>

void ui_draw_news_feed(GContext *ctx, const char *word, bool show_splash,
                       bool show_end);
