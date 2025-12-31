#pragma once

#include <pebble.h>
#include <stdbool.h>
#include <stddef.h>

int weather_utils_build_icon(const char *text_icon, bool is_bw_icon);
const char *weather_utils_get_weekday_name(const char *locale,
                                           int day_index);
void weather_utils_create_date_text(const char *locale, int day_index,
                                    char *out_buffer,
                                    size_t out_buffer_size);
