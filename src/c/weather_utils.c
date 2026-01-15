#include "weather_utils.h"

#include <stdio.h>
#include <string.h>

static const char *const s_weekday_lang_fr[] = {
    "DIMANCHE", "LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"};
static const char *const s_weekday_lang_en[] = {
    "SUNDAY",   "MONDAY", "TUESDAY", "WEDNESDAY",
    "THURSDAY", "FRIDAY", "SATURDAY"};
static const char *const s_weekday_lang_de[] = {
    "SONNTAG",    "MONTAG",  "DIENSTAG", "MITTWOCH",
    "DONNERSTAG", "FREITAG", "SAMSTAG"};
static const char *const s_weekday_lang_es[] = {
    "DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"};

// Abbreviated weekday names (3 chars)
static const char *const s_weekday_abbrev_fr[] = {"DIM", "LUN", "MAR", "MER", "JEU", "VEN", "SAM"};
static const char *const s_weekday_abbrev_en[] = {"SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"};
static const char *const s_weekday_abbrev_de[] = {"SON", "MON", "DIE", "MIT", "DON", "FRE", "SAM"};
static const char *const s_weekday_abbrev_es[] = {"DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"};

// Abbreviated month names (3 chars)
static const char *const s_month_abbrev_fr[] = {"JAN", "FEV", "MAR", "AVR", "MAI", "JUI", "JUI", "AOU", "SEP", "OCT", "NOV", "DEC"};
static const char *const s_month_abbrev_en[] = {"JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"};
static const char *const s_month_abbrev_de[] = {"JAN", "FEB", "MÄR", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "AKT", "NOV", "DEZ"};
static const char *const s_month_abbrev_es[] = {"ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"};

static bool prv_locale_matches(const char *locale, const char *prefix) {
  if (!locale || !prefix) {
    return false;
  }
  size_t prefix_len = strlen(prefix);
  return strncmp(locale, prefix, prefix_len) == 0;
}

const char *weather_utils_get_weekday_name(const char *locale, int day_index) {
  if (day_index < 0 || day_index > 6) {
    return "";
  }

  if (prv_locale_matches(locale, "fr")) {
    return s_weekday_lang_fr[day_index];
  }
  if (prv_locale_matches(locale, "de")) {
    return s_weekday_lang_de[day_index];
  }
  if (prv_locale_matches(locale, "es")) {
    return s_weekday_lang_es[day_index];
  }
  return s_weekday_lang_en[day_index];
}

const char *weather_utils_get_weekday_abbrev(const char *locale, int day_index) {
  if (day_index < 0 || day_index > 6) {
    return "";
  }

  if (prv_locale_matches(locale, "fr")) {
    return s_weekday_abbrev_fr[day_index];
  }
  if (prv_locale_matches(locale, "de")) {
    return s_weekday_abbrev_de[day_index];
  }
  if (prv_locale_matches(locale, "es")) {
    return s_weekday_abbrev_es[day_index];
  }
  return s_weekday_abbrev_en[day_index];
}

const char *weather_utils_get_month_abbrev(const char *locale, int month_index) {
  if (month_index < 0 || month_index > 11) {
    return "";
  }

  if (prv_locale_matches(locale, "fr")) {
    return s_month_abbrev_fr[month_index];
  }
  if (prv_locale_matches(locale, "de")) {
    return s_month_abbrev_de[month_index];
  }
  if (prv_locale_matches(locale, "es")) {
    return s_month_abbrev_es[month_index];
  }
  return s_month_abbrev_en[month_index];
}

void weather_utils_create_date_text(const char *locale, int day_index,
                                    char *out_buffer, size_t out_buffer_size) {
  if (!out_buffer || out_buffer_size == 0) {
    return;
  }
  const char *weekday =
      weather_utils_get_weekday_name(locale, day_index >= 0 ? day_index : 0);
  snprintf(out_buffer, out_buffer_size, "%s", weekday);
}

int weather_utils_build_icon(const char *text_icon, bool is_bw_icon) {
  (void)is_bw_icon; // Always use B&W icons

  if (!text_icon || text_icon[0] == '\0' || text_icon[0] == ' ') {
    return RESOURCE_ID_ENSOLEILLE_W;
  }

  if (strcmp(text_icon, "clearsky_day") == 0) {
    return RESOURCE_ID_ENSOLEILLE_W;
  }
  if (strcmp(text_icon, "clearsky_night") == 0) {
    return RESOURCE_ID_NUIT_CLAIRE_W;
  }
  if ((strcmp(text_icon, "fair_day") == 0) ||
      (strcmp(text_icon, "fair_polartwilight") == 0)) {
    return RESOURCE_ID_FAIBLES_PASSAGES_NUAGEUX_W;
  }
  if (strcmp(text_icon, "fair_night") == 0) {
    return RESOURCE_ID_NUIT_BIEN_DEGAGEE_W;
  }
  if (strcmp(text_icon, "wind") == 0) {
    return RESOURCE_ID_WIND;
  }
  if ((strcmp(text_icon, "partlycloudy_day") == 0) ||
      (strcmp(text_icon, "partlycloudy_polartwilight") == 0) ||
      (strncmp(text_icon, "partlycloudy_ni", 15) == 0)) {
    return RESOURCE_ID_DEVELOPPEMENT_NUAGEUX_W;
  }
  if (strcmp(text_icon, "partlycloudy_night") == 0) {
    return RESOURCE_ID_NUIT_AVEC_DEVELOPPEMENT_NUAGEUX_W;
  }
  if (strcmp(text_icon, "cloudy") == 0) {
    return RESOURCE_ID_FORTEMENT_NUAGEUX_W;
  }
  if (strstr(text_icon, "rain") != NULL) {
    return RESOURCE_ID_AVERSES_DE_PLUIE_FORTE_W;
  }
  if (strcmp(text_icon, "rainshowers_night") == 0) {
    return RESOURCE_ID_NUIT_AVEC_AVERSES_W;
  }
  if (strstr(text_icon, "thunder") != NULL) {
    return RESOURCE_ID_FORTEMENT_ORAGEUX_W;
  }
  if ((strstr(text_icon, "snow") != NULL) ||
      (strstr(text_icon, "sleet") != NULL)) {
    return RESOURCE_ID_NEIGE_FORTE_W;
  }
  if (strcmp(text_icon, "fog") == 0) {
    return RESOURCE_ID_BROUILLARD_W;
  }

  return RESOURCE_ID_BT;
}
