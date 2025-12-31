// ui_weather_days.c - Version légère (texte uniquement, 1 icône par jour)
#include "ui_weather_days.h"
#include <pebble.h>

#define WIDTH 144
#define HEIGHT 168
#define ROW_HEIGHT 48

// Traduction des jours (version courte)
static const char *weekday_fr[] = {"DIM", "LUN", "MAR", "MER",
                                   "JEU", "VEN", "SAM"};
static const char *weekday_en[] = {"SUN", "MON", "TUE", "WED",
                                   "THU", "FRI", "SAT"};

static const char *get_day_name(int day_index, const char *lang) {
  if (day_index < 0 || day_index > 6)
    return "???";
  if (lang[0] == 'f' && lang[1] == 'r')
    return weekday_fr[day_index];
  return weekday_en[day_index];
}

#ifdef PBL_COLOR
// Build icon ID from text (version simplifiée, BW uniquement pour économiser
// mémoire)
static int build_icon_id(const char *text_icon) {
  if (!text_icon || text_icon[0] == '\0' || text_icon[0] == ' ') {
    return RESOURCE_ID_ENSOLEILLE_W;
  }
  if (strstr(text_icon, "clear") != NULL)
    return RESOURCE_ID_ENSOLEILLE_W;
  if (strstr(text_icon, "fair") != NULL)
    return RESOURCE_ID_FAIBLES_PASSAGES_NUAGEUX_W;
  if (strstr(text_icon, "partly") != NULL)
    return RESOURCE_ID_DEVELOPPEMENT_NUAGEUX_W;
  if (strstr(text_icon, "cloudy") != NULL)
    return RESOURCE_ID_FORTEMENT_NUAGEUX_W;
  if (strstr(text_icon, "rain") != NULL)
    return RESOURCE_ID_AVERSES_DE_PLUIE_FORTE_W;
  if (strstr(text_icon, "thunder") != NULL)
    return RESOURCE_ID_FORTEMENT_ORAGEUX_W;
  if (strstr(text_icon, "snow") != NULL || strstr(text_icon, "sleet") != NULL) {
    return RESOURCE_ID_NEIGE_FORTE_W;
  }
  if (strstr(text_icon, "fog") != NULL)
    return RESOURCE_ID_BROUILLARD_W;
  return RESOURCE_ID_ENSOLEILLE_W;
}
#endif

// Dessiner une ligne de prévision pour un jour
static void draw_day_row(GContext *ctx, const WeatherDaysData *d, int idx,
                         int y) {
  GFont font_day = fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD);
  GFont font_info = fonts_get_system_font(FONT_KEY_GOTHIC_14);

  const char *day_name = get_day_name(d->day_of_week[idx], d->pebble_lang);

  // Nom du jour (gauche)
  graphics_context_set_text_color(ctx, GColorWhite);
  graphics_draw_text(ctx, day_name, font_day, GRect(4, y, 40, 20),
                     GTextOverflowModeWordWrap, GTextAlignmentLeft, NULL);

#ifdef PBL_COLOR
  // Icône météo (centre) - 24x24 - Only on color platforms to save heap on
  // Aplite
  int icon_id = build_icon_id(d->day_icon[idx]);
  GBitmap *icon = gbitmap_create_with_resource(icon_id);
  if (icon) {
    graphics_context_set_compositing_mode(ctx, GCompOpSet);
    graphics_draw_bitmap_in_rect(ctx, icon, GRect(46, y - 2, 24, 24));
    gbitmap_destroy(icon);
  }
#endif

  // Température (droite de l'icône)
  graphics_draw_text(ctx, d->day_temp[idx], font_info, GRect(72, y + 2, 70, 18),
                     GTextOverflowModeWordWrap, GTextAlignmentLeft, NULL);

  // Ligne 2: pluie et vent
  char line2[16];
  snprintf(line2, sizeof(line2), "%s  %s", d->day_rain[idx], d->day_wind[idx]);
  graphics_draw_text(ctx, line2, font_info, GRect(4, y + 22, WIDTH - 8, 18),
                     GTextOverflowModeWordWrap, GTextAlignmentCenter, NULL);
}

// Fonction principale de dessin
void ui_draw_weather_days(GContext *ctx, const WeatherDaysData *d) {
  if (!d)
    return;

  // Fond noir
  graphics_context_set_fill_color(ctx, GColorBlack);
  graphics_fill_rect(ctx, GRect(0, 0, WIDTH, HEIGHT), 0, GCornerNone);

  // Titre
  GFont font_title = fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD);
  graphics_context_set_text_color(ctx, GColorWhite);
  graphics_draw_text(ctx, "3 JOURS", font_title, GRect(0, 0, WIDTH, 22),
                     GTextOverflowModeWordWrap, GTextAlignmentCenter, NULL);

  // Ligne de séparation sous le titre
  graphics_context_set_stroke_color(ctx, GColorDarkGray);
  graphics_draw_line(ctx, GPoint(0, 24), GPoint(WIDTH, 24));

  // Les 3 jours
  for (int i = 0; i < 3; i++) {
    int y_start = 28 + (i * ROW_HEIGHT);
    draw_day_row(ctx, d, i, y_start);

    // Ligne de séparation entre les jours
    if (i < 2) {
      graphics_draw_line(ctx, GPoint(0, y_start + ROW_HEIGHT - 4),
                         GPoint(WIDTH, y_start + ROW_HEIGHT - 4));
    }
  }
}
