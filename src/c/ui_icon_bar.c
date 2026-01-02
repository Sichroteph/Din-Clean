#include <pebble.h>

#include "ui_icon_bar.h"

// Keep a single instance of the background bitmap to avoid repeated allocations
// (helps when memory is tight on-device).
static GBitmap *s_background = NULL;
static bool s_logged_bg_heap = false;

static void draw_humidity_icons(GContext *ctx, const IconBarData *d) {
  if (d->humidity <= 0) {
    return;
  }

  if (d->humidity > 40 && d->humidity < 60) {
    GBitmap *leaf = gbitmap_create_with_resource(RESOURCE_ID_LEAF);
    graphics_draw_bitmap_in_rect(ctx, leaf, d->rect_icon_leaf);
    gbitmap_destroy(leaf);
  }

  if (d->humidity >= 80) {
    GBitmap *hum3 = gbitmap_create_with_resource(RESOURCE_ID_HUMIDITY);
    graphics_draw_bitmap_in_rect(ctx, hum3, d->rect_icon_hum3);
    gbitmap_destroy(hum3);
  }

  if (d->humidity >= 70) {
    GBitmap *hum2 = gbitmap_create_with_resource(RESOURCE_ID_HUMIDITY);
    graphics_draw_bitmap_in_rect(ctx, hum2, d->rect_icon_hum2);
    gbitmap_destroy(hum2);
  }

  if (d->humidity >= 60) {
    GBitmap *hum1 = gbitmap_create_with_resource(RESOURCE_ID_HUMIDITY);
    graphics_draw_bitmap_in_rect(ctx, hum1, d->rect_icon_hum1);
    gbitmap_destroy(hum1);
  }

  if (d->humidity <= 40) {
    GBitmap *dry1 = gbitmap_create_with_resource(RESOURCE_ID_DRY);
    graphics_draw_bitmap_in_rect(ctx, dry1, d->rect_icon_hum1);
    gbitmap_destroy(dry1);
  }

  if (d->humidity <= 30) {
    GBitmap *dry2 = gbitmap_create_with_resource(RESOURCE_ID_DRY);
    graphics_draw_bitmap_in_rect(ctx, dry2, d->rect_icon_hum2);
    gbitmap_destroy(dry2);
  }

  if (d->humidity <= 20) {
    GBitmap *dry3 = gbitmap_create_with_resource(RESOURCE_ID_DRY);
    graphics_draw_bitmap_in_rect(ctx, dry3, d->rect_icon_hum3);
    gbitmap_destroy(dry3);
  }
}

static void draw_wind_overlays(GContext *ctx, const IconBarData *d) {
  if (d->wind_speed_val > d->met_unit) {
    GBitmap *w1 = gbitmap_create_with_resource(RESOURCE_ID_POURTOURW1);
    graphics_draw_bitmap_in_rect(ctx, w1, d->rect_icon);
    gbitmap_destroy(w1);
  }

  if (d->wind_speed_val > d->met_unit * 2) {
    GBitmap *w2 = gbitmap_create_with_resource(RESOURCE_ID_POURTOURW2);
    graphics_draw_bitmap_in_rect(ctx, w2, d->rect_icon);
    gbitmap_destroy(w2);
  }

  if (d->wind_speed_val > d->met_unit * 3) {
    GBitmap *w3 = gbitmap_create_with_resource(RESOURCE_ID_POURTOURW3);
    graphics_draw_bitmap_in_rect(ctx, w3, d->rect_icon);
    gbitmap_destroy(w3);
  }

  if (d->wind_speed_val > d->met_unit * 4) {
    GBitmap *w4 = gbitmap_create_with_resource(RESOURCE_ID_POURTOURW4);
    graphics_draw_bitmap_in_rect(ctx, w4, d->rect_icon);
    gbitmap_destroy(w4);
  }
}

void ui_draw_icon_bar(GContext *ctx, const IconBarData *d) {
  if (!d) {
    return;
  }

  graphics_context_set_compositing_mode(ctx, GCompOpSet);
  graphics_context_set_text_color(ctx, d->color_temp);

  // Connection / quiet time status
  if (!d->is_quiet_time) {
    graphics_draw_text(ctx, d->week_day, d->fontsmall, d->rect_text_dayw,
                       GTextOverflowModeWordWrap, GTextAlignmentCenter, NULL);
    if (d->is_connected) {
      graphics_draw_text(ctx, d->mday, d->fontmedium, d->rect_text_day,
                         GTextOverflowModeWordWrap, GTextAlignmentCenter, NULL);
    } else {
      GBitmap *bt = gbitmap_create_with_resource(RESOURCE_ID_BT_DISCONECT);
      graphics_draw_bitmap_in_rect(ctx, bt, d->rect_bt_disconect);
      gbitmap_destroy(bt);
    }
  } else {
    graphics_draw_text(ctx, d->week_day, d->fontsmall, d->rect_text_dayw,
                       GTextOverflowModeWordWrap, GTextAlignmentCenter, NULL);
    GBitmap *silent = gbitmap_create_with_resource(RESOURCE_ID_SILENT);
    graphics_draw_bitmap_in_rect(ctx, silent, d->rect_bt_disconect);
    gbitmap_destroy(silent);
  }

  if (!d->has_fresh_weather) {
    return;
  }

  // Draw background sized to the resource to avoid stretching
  GBitmap *background = gbitmap_create_with_resource(RESOURCE_ID_BACKGROUND);
  if (background) {
    GRect bounds = gbitmap_get_bounds(background);
    GRect draw_rect = {
        .origin = d->rect_screen.origin,
        .size = bounds.size,
    };
    graphics_draw_bitmap_in_rect(ctx, background, draw_rect);
    gbitmap_destroy(background);
  }

  draw_humidity_icons(ctx, d);

  GBitmap *icon = gbitmap_create_with_resource(d->icon_id);
  graphics_draw_bitmap_in_rect(ctx, icon, d->rect_icon);
  gbitmap_destroy(icon);

  draw_wind_overlays(ctx, d);

  // Wind indicators for all platforms (no round check)
  if (d->wind2_val > d->met_unit) {
    GBitmap *w1 = gbitmap_create_with_resource(RESOURCE_ID_POURTOURW1);
    graphics_draw_bitmap_in_rect(ctx, w1, d->rect_icon6);
    gbitmap_destroy(w1);
  }

  if (d->wind2_val > d->met_unit * 2) {
    GBitmap *w2 = gbitmap_create_with_resource(RESOURCE_ID_POURTOURW2);
    graphics_draw_bitmap_in_rect(ctx, w2, d->rect_icon6);
    gbitmap_destroy(w2);
  }

  if (d->wind2_val > d->met_unit * 3) {
    GBitmap *w3 = gbitmap_create_with_resource(RESOURCE_ID_POURTOURW3);
    graphics_draw_bitmap_in_rect(ctx, w3, d->rect_icon6);
    gbitmap_destroy(w3);
  }

  if (d->wind2_val > d->met_unit * 4) {
    GBitmap *w4 = gbitmap_create_with_resource(RESOURCE_ID_POURTOURW4);
    graphics_draw_bitmap_in_rect(ctx, w4, d->rect_icon6);
    gbitmap_destroy(w4);
  }

  graphics_draw_text(ctx, d->weather_temp_text, d->fontmedium, d->rect_temp,
                     GTextOverflowModeWordWrap, GTextAlignmentCenter, NULL);
  graphics_draw_text(ctx, d->min_temp_text, d->fontsmallbold, d->rect_tmin,
                     GTextOverflowModeWordWrap, GTextAlignmentCenter, NULL);
  graphics_draw_text(ctx, d->max_temp_text, d->fontsmallbold, d->rect_tmax,
                     GTextOverflowModeWordWrap, GTextAlignmentCenter, NULL);
}
