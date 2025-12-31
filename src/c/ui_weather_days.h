#pragma once

#include <pebble.h>

// Structure légère pour les données de prévision 3 jours (texte uniquement)
typedef struct {
  uint8_t day_of_week[3];   // Jour de la semaine (0-6)
  char day_temp[3][12];     // "5° / 12°" format compact
  char day_icon[3][16];     // Nom de l'icône météo
  char day_rain[3][6];      // "2.5mm" format texte
  char day_wind[3][6];      // "15km/h" format texte  
  char pebble_lang[4];      // Langue système (compact)
} WeatherDaysData;

// Fonction de dessin de l'écran des prévisions journalières (version légère)
void ui_draw_weather_days(GContext *ctx, const WeatherDaysData *data);

// Fonction de dessin de l'écran des prévisions journalières (version légère)
void ui_draw_weather_days(GContext *ctx, const WeatherDaysData *data);
