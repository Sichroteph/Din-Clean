# Din Clean - Weather Watchface for Pebble

![Din Clean Banner](docs/images/banner.png)

**Din Clean** is a modern and refined watchface for Pebble smartwatches, combining exceptional readability with comprehensive and detailed weather information.

---

## Screenshots

![Main Screen](docs/images/screenshot_main.png)

*Monday 5th, extremely strong wind with sunny weather. Current temperature: 28°C. Comfortable humidity shown by the leaf icon. Min/Max: 10°/20°C.*

![Forecast Graph](docs/images/screenshot_graph.png)

*Sample forecast data showing rain expected on Wednesday and snow on Thursday. A cold front is expected around 5pm, dropping the temperature by 10 degrees with heavy rain.*

---

## Key Features

### Time Display
- Large digits for instant reading
- Custom Clearview font for optimal legibility
- Automatic 12h/24h format based on system settings
- Design inspired by the classic **Din Time** watchface

### Real-time Weather
- Current temperature with weather icon
- Daily Min/Max temperatures
- Visual humidity indicators (water drops)
- Visual dryness indicators (cactus icons)
- Wind speed with corner-based visual indicators
- Data via **MET Norway API** (accurate and free — **no API key required!**)

### Forecast Graph (tap to access)
- Temperature curve over 12 hours
- Hourly precipitation bars
- Wind speed per time slot
- 3-day forecast with weather icons

### Smart Indicators
- Bluetooth connection status
- Quiet time mode indicator
- Localized day and date (EN, FR, DE, ES)

### IOPool Integration (optional)
- Visual alerts when pool water parameters are out of range
- Triggered automatically when ORP < 650 or pH < 7.10
- Requires IOPool API token in settings

---

## Design Philosophy: Maximum Readability

Din Clean was designed with **readability as the top priority**. This is why a strict **black and white** color scheme was chosen — no distracting colors, just pure contrast for instant information at a glance. The clean monochrome design ensures your watch remains legible in any lighting condition, from bright sunlight to dim environments.

The main time display is inspired by **Din Time**, a beloved watchface that is no longer maintained. Din Clean pays homage to its elegant typography while adding comprehensive weather features and modern API support.

---

## User Guide: Understanding the Visual Indicators

### Humidity & Dryness Icons

The main screen displays up to 3 small icons indicating the current humidity level. Here's how to interpret them:

| Icons Displayed | Humidity Level | Meaning |
|-----------------|----------------|---------|
| ![Leaf](docs/images/leaf_icon.png) Leaf (1 icon) | 40% – 60% | **Comfort zone** – Ideal humidity level |
| ![Drop](docs/images/humidity_icon.png) 1 drop | 60% – 69% | Slightly humid |
| ![Drop](docs/images/humidity_icon.png)![Drop](docs/images/humidity_icon.png) 2 drops | 70% – 79% | Humid |
| ![Drop](docs/images/humidity_icon.png)![Drop](docs/images/humidity_icon.png)![Drop](docs/images/humidity_icon.png) 3 drops | 80%+ | Very humid / Rainy conditions |
| ![Cactus](docs/images/cactus_icon.png) 1 cactus | 31% – 40% | Slightly dry |
| ![Cactus](docs/images/cactus_icon.png)![Cactus](docs/images/cactus_icon.png) 2 cacti | 21% – 30% | Dry – Consider hydrating! |
| ![Cactus](docs/images/cactus_icon.png)![Cactus](docs/images/cactus_icon.png)![Cactus](docs/images/cactus_icon.png) 3 cacti | ≤20% | Very dry – Extremely low humidity |


---

### Weather Graph: Precipitation Bars

When you tap on the watch to display the forecast graph, you'll see precipitation bars alongside the temperature curve.

**Rain Scale:**
- **A full bar represents 40mm of rain** for that hour
- Each bar shows the expected precipitation amount proportionally
- This helps you quickly assess rainfall intensity:
  - Small bar (~5mm): Light rain
  - Medium bar (~15-20mm): Moderate rain
  - Full bar (40mm): Heavy rain / storms

---

### Wind Speed: Corner Indicators

The main weather icon is surrounded by a decorative border. As wind speed increases, **corners of this border light up** to provide a quick visual indicator of wind intensity:

| Wind Level | Icon | Metric | Imperial |
|------------|------|--------|----------|
| No wind | ![No wind](docs/images/wind_0.png) | ≤5 km/h | ≤11 mph |
| Light breeze | ![Light](docs/images/wind_1.png) | >5 km/h | >11 mph |
| Moderate wind | ![Moderate](docs/images/wind_2.png) | >10 km/h | >22 mph |
| Fresh wind | ![Fresh](docs/images/wind_3.png) | >15 km/h | >33 mph |
| Strong wind | ![Strong](docs/images/wind_4.png) | >20 km/h | >44 mph |

This allows you to quickly assess wind conditions at a glance without reading numerical values.

---

### IOPool Visual Alerts

For pool owners with IOPool smart probes, Din Clean provides **automatic visual alerts** when water parameters fall outside safe ranges:

**Alert triggers:**
- ORP < 650 (disinfection effectiveness issue)
- pH < 7.10 (water too acidic)

When these conditions are detected, a visual indicator appears on the watchface to notify you that pool maintenance may be required.

*Note: This feature requires an IOPool API token configured in the watchface settings.*

---

## No API Key Required!

Unlike many weather watchfaces, **Din Clean uses the MET Norway API**, which is:
- **Completely free** — No subscription needed
- **No API key required** — Works out of the box
- **Highly accurate** — Powered by the Norwegian Meteorological Institute
- **Worldwide coverage** — Works anywhere in the world

Just install, allow location access, and enjoy!

---

## Compatibility

- **Pebble Classic (Aplite)**
- **Pebble Time / Time Steel (Basalt)**
- **Pebble 2 (Diorite)**

**Requirements:** Pebble app with location access enabled for weather data.

---

## Technical Highlights

- **Modular architecture** for maintainability
- **Optimized memory usage** with lazy loading
- **~50-70% image compression** compared to original resources
- **Offline fallback** with cached weather data
- **Multi-language support** (EN, FR, DE, ES)

---

**Link:** [Pebble App Store - Coming Soon]

*Feedback and bug reports welcome!*

---
