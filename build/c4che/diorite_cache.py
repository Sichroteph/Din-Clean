AR = 'arm-none-eabi-ar'
ARFLAGS = 'rcs'
AS = 'arm-none-eabi-gcc'
BINDIR = '/usr/local/bin'
BLOCK_MESSAGE_KEYS = []
BUILD_DIR = 'diorite'
BUILD_TYPE = 'app'
BUNDLE_BIN_DIR = 'diorite'
BUNDLE_NAME = 'Din-Clean.pbw'
CC = ['arm-none-eabi-gcc']
CCLNK_SRC_F = []
CCLNK_TGT_F = ['-o']
CC_NAME = 'gcc'
CC_SRC_F = []
CC_TGT_F = ['-c', '-o']
CC_VERSION = ('4', '7', '2')
CFLAGS = ['-std=c99', '-mcpu=cortex-m3', '-mthumb', '-ffunction-sections', '-fdata-sections', '-g', '-fPIE', '-Os', '-D_TIME_H_', '-Wall', '-Wextra', '-Werror', '-Wno-unused-parameter', '-Wno-error=unused-function', '-Wno-error=unused-variable']
CFLAGS_MACBUNDLE = ['-fPIC']
CFLAGS_cshlib = ['-fPIC']
CPPPATH_ST = '-I%s'
DEFINES = ['RELEASE', 'PBL_PLATFORM_DIORITE', 'PBL_BW', 'PBL_RECT', 'PBL_MICROPHONE', 'PBL_HEALTH', 'PBL_SMARTSTRAP', 'PBL_DISPLAY_WIDTH=144', 'PBL_DISPLAY_HEIGHT=168', 'PBL_SDK_3']
DEFINES_ST = '-D%s'
DEST_BINFMT = 'elf'
DEST_CPU = 'arm'
DEST_OS = 'linux'
INCLUDES = ['diorite']
LD = 'arm-none-eabi-ld'
LIBDIR = '/usr/local/lib'
LIBPATH_ST = '-L%s'
LIB_DIR = 'node_modules'
LIB_JSON = []
LIB_ST = '-l%s'
LINKFLAGS = ['-mcpu=cortex-m3', '-mthumb', '-Wl,--gc-sections', '-Wl,--warn-common', '-fPIE', '-Os']
LINKFLAGS_MACBUNDLE = ['-bundle', '-undefined', 'dynamic_lookup']
LINKFLAGS_cshlib = ['-shared']
LINKFLAGS_cstlib = ['-Wl,-Bstatic']
LINK_CC = ['arm-none-eabi-gcc']
MESSAGE_KEYS = {u'KEY_TEMPERATURE': 0, u'KEY_COLOR_2ND_TEMP_R': 64, u'KEY_HUMIDITY': 5, u'KEY_INPUT_CITY': 34, u'KEY_SELECT_PROVIDER': 112, u'KEY_FORECAST_ICON1': 26, u'KEY_TOGGLE_GRADIANT': 59, u'KEY_COLOR_RULER_B': 50, u'KEY_FORECAST_ICON2': 27, u'KEY_COLOR_RULER_G': 49, u'KEY_TOGGLE_PC': 111, u'KEY_COLOR_2ND_TEMP_B': 66, u'KEY_ICON': 10, u'KEY_SELECT_GOAL': 69, u'KEY_COLOR_2ND_TEMP_G': 65, u'STATUS_KEY': 100, u'KEY_WIND_SPEED': 3, u'KEY_COLOR_RULER_R': 48, u'KEY_GPS': 33, u'KEY_DESCRIPTION': 2, u'KEY_TOGGLE_VIBRATION': 37, u'MESSAGE_KEY': 101, u'KEY_TMAX': 9, u'KEY_LOCATION': 32, u'KEY_COLOR_RIGHT_G': 40, u'KEY_SELECT_SCREEN': 60, u'KEY_COLOR_HOURS_B': 47, u'KEY_COLOR_RIGHT_B': 41, u'KEY_SUNRISE': 6, u'KEY_COLOR_HOURS_G': 46, u'KEY_FORECAST_RAIN4': 24, u'KEY_FORECAST_RAIN5': 25, u'KEY_FORECAST_RAIN2': 22, u'KEY_FORECAST_RAIN3': 23, u'KEY_TOGGLE_INV': 109, u'KEY_FORECAST_RAIN1': 21, u'KEY_SUNSET': 7, u'KEY_PHONE_BAT': 105, u'KEY_COLOR_HOURS_R': 45, u'KEY_COLOR_RIGHT_R': 39, u'KEY_FORECAST_ICON3': 28, u'KEY_COLOR_LEFT_R': 42, u'KEY_TOGGLE_RULER_LARGE': 67, u'KEY_FORECAST_WIND2': 30, u'KEY_FORECAST_WIND3': 31, u'KEY_TOGGLE_BW_ICONS': 38, u'KEY_FORECAST_WIND1': 29, u'KEY_TMIN': 8, u'KEY_FORECAST_TEMP4': 14, u'KEY_FORECAST_TEMP5': 15, u'KEY_FORECAST_TEMP2': 12, u'KEY_FORECAST_TEMP3': 13, u'KEY_TOGGLE_80': 108, u'KEY_FORECAST_TEMP1': 11, u'KEY_COLOR_LEFT_B': 44, u'KEY_PHONE_CHARGE': 106, u'KEY_LAST_REFRESH': 55, u'KEY_COLOR_LEFT_G': 43, u'KEY_TOGGLE_100': 107, u'KEY_TOGGLE_BT': 103, u'KEY_FORECAST_H1': 16, u'KEY_FORECAST_H3': 18, u'KEY_FORECAST_H2': 17, u'KEY_TOGGLE_CENTERED': 68, u'KEY_SELECT_UTC': 35, u'KEY_TOGGLE_MONTH': 104, u'KEY_RADIO_REFRESH': 54, u'KEY_COLOR_LINE_R': 56, u'KEY_CLOUDS': 4, u'KEY_COLOR_TEMPERATURES_G': 52, u'KEY_COLOR_2ND_BACK_B': 63, u'KEY_COLOR_TEMPERATURES_B': 53, u'KEY_TOGGLE_TG': 110, u'KEY_COLOR_LINE_G': 57, u'KEY_COLOR_2ND_BACK_G': 62, u'KEY_COLOR_LINE_B': 58, u'KEY_RADIO_UNITS': 36, u'KEY_CONDITIONS': 1, u'KEY_SELECT_FONTS': 102, u'KEY_COLOR_2ND_BACK_R': 61, u'KEY_COLOR_TEMPERATURES_R': 51}
MESSAGE_KEYS_DEFINITION = '/home/pebble/pebble-projects/Din-Clean/build/src/message_keys.auto.c'
MESSAGE_KEYS_HEADER = '/home/pebble/pebble-projects/Din-Clean/build/include/message_keys.auto.h'
MESSAGE_KEYS_JSON = '/home/pebble/pebble-projects/Din-Clean/build/js/message_keys.json'
NODE_PATH = '/home/pebble/.pebble-sdk/SDKs/current/node_modules'
PEBBLE_SDK_COMMON = '/home/pebble/.pebble-sdk/SDKs/current/sdk-core/pebble/common'
PEBBLE_SDK_PLATFORM = '/home/pebble/.pebble-sdk/SDKs/current/sdk-core/pebble/diorite'
PEBBLE_SDK_ROOT = '/home/pebble/.pebble-sdk/SDKs/current/sdk-core/pebble'
PLATFORM = {'TAGS': ['diorite', 'bw', 'rect', 'mic', 'strap', 'health', '144w', '168h'], 'MAX_FONT_GLYPH_SIZE': 256, 'ADDITIONAL_TEXT_LINES_FOR_PEBBLE_H': [], 'MAX_APP_BINARY_SIZE': 65536, 'MAX_RESOURCES_SIZE': 1048576, 'MAX_APP_MEMORY_SIZE': 65536, 'MAX_WORKER_MEMORY_SIZE': 10240, 'NAME': 'diorite', 'BUNDLE_BIN_DIR': 'diorite', 'BUILD_DIR': 'diorite', 'MAX_RESOURCES_SIZE_APPSTORE': 262144, 'DEFINES': ['PBL_PLATFORM_DIORITE', 'PBL_BW', 'PBL_RECT', 'PBL_MICROPHONE', 'PBL_HEALTH', 'PBL_SMARTSTRAP', 'PBL_DISPLAY_WIDTH=144', 'PBL_DISPLAY_HEIGHT=168']}
PLATFORM_NAME = 'diorite'
PREFIX = '/usr/local'
PROJECT_INFO = {'appKeys': {u'KEY_TEMPERATURE': 0, u'KEY_COLOR_2ND_TEMP_R': 64, u'KEY_HUMIDITY': 5, u'KEY_INPUT_CITY': 34, u'KEY_SELECT_PROVIDER': 112, u'KEY_FORECAST_ICON1': 26, u'KEY_TOGGLE_GRADIANT': 59, u'KEY_COLOR_RULER_B': 50, u'KEY_FORECAST_ICON2': 27, u'KEY_COLOR_RULER_G': 49, u'KEY_TOGGLE_PC': 111, u'KEY_COLOR_2ND_TEMP_B': 66, u'KEY_ICON': 10, u'KEY_SELECT_GOAL': 69, u'KEY_COLOR_2ND_TEMP_G': 65, u'STATUS_KEY': 100, u'KEY_WIND_SPEED': 3, u'KEY_COLOR_RULER_R': 48, u'KEY_GPS': 33, u'KEY_DESCRIPTION': 2, u'KEY_TOGGLE_VIBRATION': 37, u'MESSAGE_KEY': 101, u'KEY_TMAX': 9, u'KEY_LOCATION': 32, u'KEY_COLOR_RIGHT_G': 40, u'KEY_SELECT_SCREEN': 60, u'KEY_COLOR_HOURS_B': 47, u'KEY_COLOR_RIGHT_B': 41, u'KEY_SUNRISE': 6, u'KEY_COLOR_HOURS_G': 46, u'KEY_FORECAST_RAIN4': 24, u'KEY_FORECAST_RAIN5': 25, u'KEY_FORECAST_RAIN2': 22, u'KEY_FORECAST_RAIN3': 23, u'KEY_TOGGLE_INV': 109, u'KEY_FORECAST_RAIN1': 21, u'KEY_SUNSET': 7, u'KEY_PHONE_BAT': 105, u'KEY_COLOR_HOURS_R': 45, u'KEY_COLOR_RIGHT_R': 39, u'KEY_FORECAST_ICON3': 28, u'KEY_COLOR_LEFT_R': 42, u'KEY_TOGGLE_RULER_LARGE': 67, u'KEY_FORECAST_WIND2': 30, u'KEY_FORECAST_WIND3': 31, u'KEY_TOGGLE_BW_ICONS': 38, u'KEY_FORECAST_WIND1': 29, u'KEY_TMIN': 8, u'KEY_FORECAST_TEMP4': 14, u'KEY_FORECAST_TEMP5': 15, u'KEY_FORECAST_TEMP2': 12, u'KEY_FORECAST_TEMP3': 13, u'KEY_TOGGLE_80': 108, u'KEY_FORECAST_TEMP1': 11, u'KEY_COLOR_LEFT_B': 44, u'KEY_PHONE_CHARGE': 106, u'KEY_LAST_REFRESH': 55, u'KEY_COLOR_LEFT_G': 43, u'KEY_TOGGLE_100': 107, u'KEY_TOGGLE_BT': 103, u'KEY_FORECAST_H1': 16, u'KEY_FORECAST_H3': 18, u'KEY_FORECAST_H2': 17, u'KEY_TOGGLE_CENTERED': 68, u'KEY_SELECT_UTC': 35, u'KEY_TOGGLE_MONTH': 104, u'KEY_RADIO_REFRESH': 54, u'KEY_COLOR_LINE_R': 56, u'KEY_CLOUDS': 4, u'KEY_COLOR_TEMPERATURES_G': 52, u'KEY_COLOR_2ND_BACK_B': 63, u'KEY_COLOR_TEMPERATURES_B': 53, u'KEY_TOGGLE_TG': 110, u'KEY_COLOR_LINE_G': 57, u'KEY_COLOR_2ND_BACK_G': 62, u'KEY_COLOR_LINE_B': 58, u'KEY_RADIO_UNITS': 36, u'KEY_CONDITIONS': 1, u'KEY_SELECT_FONTS': 102, u'KEY_COLOR_2ND_BACK_R': 61, u'KEY_COLOR_TEMPERATURES_R': 51}, u'sdkVersion': u'3', u'projectType': u'native', u'uuid': u'9040763a-6b35-49d1-82ac-13ce02e31137', u'messageKeys': {u'KEY_TEMPERATURE': 0, u'KEY_COLOR_2ND_TEMP_R': 64, u'KEY_HUMIDITY': 5, u'KEY_INPUT_CITY': 34, u'KEY_SELECT_PROVIDER': 112, u'KEY_FORECAST_ICON1': 26, u'KEY_TOGGLE_GRADIANT': 59, u'KEY_COLOR_RULER_B': 50, u'KEY_FORECAST_ICON2': 27, u'KEY_COLOR_RULER_G': 49, u'KEY_TOGGLE_PC': 111, u'KEY_COLOR_2ND_TEMP_B': 66, u'KEY_ICON': 10, u'KEY_SELECT_GOAL': 69, u'KEY_COLOR_2ND_TEMP_G': 65, u'STATUS_KEY': 100, u'KEY_WIND_SPEED': 3, u'KEY_COLOR_RULER_R': 48, u'KEY_GPS': 33, u'KEY_DESCRIPTION': 2, u'KEY_TOGGLE_VIBRATION': 37, u'MESSAGE_KEY': 101, u'KEY_TMAX': 9, u'KEY_LOCATION': 32, u'KEY_COLOR_RIGHT_G': 40, u'KEY_SELECT_SCREEN': 60, u'KEY_COLOR_HOURS_B': 47, u'KEY_COLOR_RIGHT_B': 41, u'KEY_SUNRISE': 6, u'KEY_COLOR_HOURS_G': 46, u'KEY_FORECAST_RAIN4': 24, u'KEY_FORECAST_RAIN5': 25, u'KEY_FORECAST_RAIN2': 22, u'KEY_FORECAST_RAIN3': 23, u'KEY_TOGGLE_INV': 109, u'KEY_FORECAST_RAIN1': 21, u'KEY_SUNSET': 7, u'KEY_PHONE_BAT': 105, u'KEY_COLOR_HOURS_R': 45, u'KEY_COLOR_RIGHT_R': 39, u'KEY_FORECAST_ICON3': 28, u'KEY_COLOR_LEFT_R': 42, u'KEY_TOGGLE_RULER_LARGE': 67, u'KEY_FORECAST_WIND2': 30, u'KEY_FORECAST_WIND3': 31, u'KEY_TOGGLE_BW_ICONS': 38, u'KEY_FORECAST_WIND1': 29, u'KEY_TMIN': 8, u'KEY_FORECAST_TEMP4': 14, u'KEY_FORECAST_TEMP5': 15, u'KEY_FORECAST_TEMP2': 12, u'KEY_FORECAST_TEMP3': 13, u'KEY_TOGGLE_80': 108, u'KEY_FORECAST_TEMP1': 11, u'KEY_COLOR_LEFT_B': 44, u'KEY_PHONE_CHARGE': 106, u'KEY_LAST_REFRESH': 55, u'KEY_COLOR_LEFT_G': 43, u'KEY_TOGGLE_100': 107, u'KEY_TOGGLE_BT': 103, u'KEY_FORECAST_H1': 16, u'KEY_FORECAST_H3': 18, u'KEY_FORECAST_H2': 17, u'KEY_TOGGLE_CENTERED': 68, u'KEY_SELECT_UTC': 35, u'KEY_TOGGLE_MONTH': 104, u'KEY_RADIO_REFRESH': 54, u'KEY_COLOR_LINE_R': 56, u'KEY_CLOUDS': 4, u'KEY_COLOR_TEMPERATURES_G': 52, u'KEY_COLOR_2ND_BACK_B': 63, u'KEY_COLOR_TEMPERATURES_B': 53, u'KEY_TOGGLE_TG': 110, u'KEY_COLOR_LINE_G': 57, u'KEY_COLOR_2ND_BACK_G': 62, u'KEY_COLOR_LINE_B': 58, u'KEY_RADIO_UNITS': 36, u'KEY_CONDITIONS': 1, u'KEY_SELECT_FONTS': 102, u'KEY_COLOR_2ND_BACK_R': 61, u'KEY_COLOR_TEMPERATURES_R': 51}, 'companyName': u'CJ', u'enableMultiJS': False, u'targetPlatforms': [u'aplite', u'basalt', u'chalk', u'diorite'], u'capabilities': [u'location', u'configurable'], 'versionLabel': u'1.16', 'longName': u'Din Clean', u'displayName': u'Din Clean', 'shortName': u'Din Clean', u'watchapp': {u'watchface': True}, u'resources': {u'media': [{u'targetPlatforms': None, u'type': u'bitmap', u'name': u'NEIGE_FORTE_W', u'file': u'images/NEIGE_FORTE_W'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'NUIT_AVEC_AVERSES', u'file': u'images/NUIT_AVEC_AVERSES'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'NUIT_AVEC_AVERSES_W', u'file': u'images/NUIT_AVEC_AVERSES_W'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'NUIT_AVEC_DEVELOPPEMENT_NUAGEUX', u'file': u'images/NUIT_AVEC_DEVELOPPEMENT_NUAGEUX'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'NUIT_AVEC_DEVELOPPEMENT_NUAGEUX_W', u'file': u'images/NUIT_AVEC_DEVELOPPEMENT_NUAGEUX_W'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'NUIT_BIEN_DEGAGEE', u'file': u'images/NUIT_BIEN_DEGAGEE'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'NUIT_BIEN_DEGAGEE_W', u'file': u'images/NUIT_BIEN_DEGAGEE_W'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'NUIT_CLAIRE', u'file': u'images/NUIT_CLAIRE'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'NUIT_CLAIRE_W', u'file': u'images/NUIT_CLAIRE_W'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'NUIT_NUAGEUSE', u'file': u'images/NUIT_NUAGEUSE'}, {u'type': u'font', u'targetPlatforms': None, u'characterRegex': u'[0-9:]', u'name': u'FONT_CLEARVIEW_45', u'file': u'fonts/Clearview_45'}, {u'targetPlatforms': None, u'type': u'font', u'name': u'FONT_SQUARE_13', u'file': u'fonts/SQUARE_16'}, {u'type': u'font', u'targetPlatforms': None, u'characterRegex': u'[0-9]', u'name': u'FONT_SQUARE_25', u'file': u'fonts/SQUARE_25'}, {u'type': u'font', u'targetPlatforms': None, u'characterRegex': u'[0-9:]', u'name': u'FONT_SQUARE_50', u'file': u'fonts/SQUARE_50'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'0', u'file': u'images/0'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'1', u'file': u'images/1'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'2', u'file': u'images/2'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'3', u'file': u'images/3'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'4', u'file': u'images/4'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'5', u'file': u'images/5'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'6', u'file': u'images/6'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'7', u'file': u'images/7'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'8', u'file': u'images/8'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'9', u'file': u'images/9'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'AVERSES_DE_PLUIE_FORTE', u'file': u'images/AVERSES_DE_PLUIE_FORTE'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'AVERSES_DE_PLUIE_FORTE1', u'file': u'images/AVERSES_DE_PLUIE_FORTE1'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'AVERSES_DE_PLUIE_FORTE2', u'file': u'images/AVERSES_DE_PLUIE_FORTE2'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'AVERSES_DE_PLUIE_FORTE_W', u'file': u'images/AVERSES_DE_PLUIE_FORTE_W'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'AVERSES_DE_PLUIE_FORTE_W1', u'file': u'images/AVERSES_DE_PLUIE_FORTE_W1'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'AVERSES_DE_PLUIE_FORTE_W2', u'file': u'images/AVERSES_DE_PLUIE_FORTE_W2'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'BROUILLARD', u'file': u'images/BROUILLARD'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'BROUILLARD_W', u'file': u'images/BROUILLARD_W'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'BT', u'file': u'images/BT'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'BT_DISCONECT', u'file': u'images/BT_DISCONECT'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'COUVERT_AVEC_AVERSES', u'file': u'images/COUVERT_AVEC_AVERSES'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'COUVERT_AVEC_AVERSES_W', u'file': u'images/COUVERT_AVEC_AVERSES_W'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'DEVELOPPEMENT_NUAGEUX', u'file': u'images/DEVELOPPEMENT_NUAGEUX'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'DEVELOPPEMENT_NUAGEUX_W', u'file': u'images/DEVELOPPEMENT_NUAGEUX_W'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'ENSOLEILLE', u'file': u'images/ENSOLEILLE'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'ENSOLEILLE_W', u'file': u'images/ENSOLEILLE_W'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'FAIBLES_PASSAGES_NUAGEUX', u'file': u'images/FAIBLES_PASSAGES_NUAGEUX'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'FAIBLES_PASSAGES_NUAGEUX_W', u'file': u'images/FAIBLES_PASSAGES_NUAGEUX_W'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'FORTEMENT_NUAGEUX', u'file': u'images/FORTEMENT_NUAGEUX'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'FORTEMENT_NUAGEUX_W', u'file': u'images/FORTEMENT_NUAGEUX_W'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'FORTEMENT_ORAGEUX', u'file': u'images/FORTEMENT_ORAGEUX'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'FORTEMENT_ORAGEUX_W', u'file': u'images/FORTEMENT_ORAGEUX_W'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'GRADIANT', u'file': u'images/GRADIANT'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'NEIGE_FORTE', u'file': u'images/NEIGE_FORTE'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'NUIT_NUAGEUSE_W', u'file': u'images/NUIT_NUAGEUSE_W'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'PLUIE_FORTE', u'file': u'images/PLUIE_FORTE'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'PLUIE_FORTE_W', u'file': u'images/PLUIE_FORTE_W'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'POURTOUR', u'file': u'images/POURTOUR'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'POURTOUR2', u'file': u'images/POURTOUR2'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'POURTOURW1', u'file': u'images/POURTOURW1'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'POURTOURW2', u'file': u'images/POURTOURW2'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'POURTOURW3', u'file': u'images/POURTOURW3'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'POURTOURW4', u'file': u'images/POURTOURW4'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'TABLE', u'file': u'images/TABLE'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'TABLE_OG', u'file': u'images/TABLE_OG'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'WIND', u'file': u'images/WIND'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'WIND_S', u'file': u'images/WIND_S'}, {u'type': u'bitmap', u'menuIcon': True, u'targetPlatforms': None, u'name': u'IMAGE_MENU_ICON', u'file': u'images/ruler_icon.png'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'SILENT', u'file': u'images/SILENT'}]}, 'name': u'din_clean'}
REQUESTED_PLATFORMS = [u'aplite', u'basalt', u'chalk', u'diorite']
RESOURCES_JSON = [{u'targetPlatforms': None, u'type': u'bitmap', u'name': u'NEIGE_FORTE_W', u'file': u'images/NEIGE_FORTE_W'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'NUIT_AVEC_AVERSES', u'file': u'images/NUIT_AVEC_AVERSES'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'NUIT_AVEC_AVERSES_W', u'file': u'images/NUIT_AVEC_AVERSES_W'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'NUIT_AVEC_DEVELOPPEMENT_NUAGEUX', u'file': u'images/NUIT_AVEC_DEVELOPPEMENT_NUAGEUX'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'NUIT_AVEC_DEVELOPPEMENT_NUAGEUX_W', u'file': u'images/NUIT_AVEC_DEVELOPPEMENT_NUAGEUX_W'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'NUIT_BIEN_DEGAGEE', u'file': u'images/NUIT_BIEN_DEGAGEE'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'NUIT_BIEN_DEGAGEE_W', u'file': u'images/NUIT_BIEN_DEGAGEE_W'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'NUIT_CLAIRE', u'file': u'images/NUIT_CLAIRE'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'NUIT_CLAIRE_W', u'file': u'images/NUIT_CLAIRE_W'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'NUIT_NUAGEUSE', u'file': u'images/NUIT_NUAGEUSE'}, {u'type': u'font', u'targetPlatforms': None, u'characterRegex': u'[0-9:]', u'name': u'FONT_CLEARVIEW_45', u'file': u'fonts/Clearview_45'}, {u'targetPlatforms': None, u'type': u'font', u'name': u'FONT_SQUARE_13', u'file': u'fonts/SQUARE_16'}, {u'type': u'font', u'targetPlatforms': None, u'characterRegex': u'[0-9]', u'name': u'FONT_SQUARE_25', u'file': u'fonts/SQUARE_25'}, {u'type': u'font', u'targetPlatforms': None, u'characterRegex': u'[0-9:]', u'name': u'FONT_SQUARE_50', u'file': u'fonts/SQUARE_50'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'0', u'file': u'images/0'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'1', u'file': u'images/1'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'2', u'file': u'images/2'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'3', u'file': u'images/3'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'4', u'file': u'images/4'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'5', u'file': u'images/5'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'6', u'file': u'images/6'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'7', u'file': u'images/7'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'8', u'file': u'images/8'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'9', u'file': u'images/9'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'AVERSES_DE_PLUIE_FORTE', u'file': u'images/AVERSES_DE_PLUIE_FORTE'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'AVERSES_DE_PLUIE_FORTE1', u'file': u'images/AVERSES_DE_PLUIE_FORTE1'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'AVERSES_DE_PLUIE_FORTE2', u'file': u'images/AVERSES_DE_PLUIE_FORTE2'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'AVERSES_DE_PLUIE_FORTE_W', u'file': u'images/AVERSES_DE_PLUIE_FORTE_W'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'AVERSES_DE_PLUIE_FORTE_W1', u'file': u'images/AVERSES_DE_PLUIE_FORTE_W1'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'AVERSES_DE_PLUIE_FORTE_W2', u'file': u'images/AVERSES_DE_PLUIE_FORTE_W2'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'BROUILLARD', u'file': u'images/BROUILLARD'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'BROUILLARD_W', u'file': u'images/BROUILLARD_W'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'BT', u'file': u'images/BT'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'BT_DISCONECT', u'file': u'images/BT_DISCONECT'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'COUVERT_AVEC_AVERSES', u'file': u'images/COUVERT_AVEC_AVERSES'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'COUVERT_AVEC_AVERSES_W', u'file': u'images/COUVERT_AVEC_AVERSES_W'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'DEVELOPPEMENT_NUAGEUX', u'file': u'images/DEVELOPPEMENT_NUAGEUX'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'DEVELOPPEMENT_NUAGEUX_W', u'file': u'images/DEVELOPPEMENT_NUAGEUX_W'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'ENSOLEILLE', u'file': u'images/ENSOLEILLE'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'ENSOLEILLE_W', u'file': u'images/ENSOLEILLE_W'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'FAIBLES_PASSAGES_NUAGEUX', u'file': u'images/FAIBLES_PASSAGES_NUAGEUX'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'FAIBLES_PASSAGES_NUAGEUX_W', u'file': u'images/FAIBLES_PASSAGES_NUAGEUX_W'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'FORTEMENT_NUAGEUX', u'file': u'images/FORTEMENT_NUAGEUX'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'FORTEMENT_NUAGEUX_W', u'file': u'images/FORTEMENT_NUAGEUX_W'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'FORTEMENT_ORAGEUX', u'file': u'images/FORTEMENT_ORAGEUX'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'FORTEMENT_ORAGEUX_W', u'file': u'images/FORTEMENT_ORAGEUX_W'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'GRADIANT', u'file': u'images/GRADIANT'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'NEIGE_FORTE', u'file': u'images/NEIGE_FORTE'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'NUIT_NUAGEUSE_W', u'file': u'images/NUIT_NUAGEUSE_W'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'PLUIE_FORTE', u'file': u'images/PLUIE_FORTE'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'PLUIE_FORTE_W', u'file': u'images/PLUIE_FORTE_W'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'POURTOUR', u'file': u'images/POURTOUR'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'POURTOUR2', u'file': u'images/POURTOUR2'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'POURTOURW1', u'file': u'images/POURTOURW1'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'POURTOURW2', u'file': u'images/POURTOURW2'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'POURTOURW3', u'file': u'images/POURTOURW3'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'POURTOURW4', u'file': u'images/POURTOURW4'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'TABLE', u'file': u'images/TABLE'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'TABLE_OG', u'file': u'images/TABLE_OG'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'WIND', u'file': u'images/WIND'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'WIND_S', u'file': u'images/WIND_S'}, {u'type': u'bitmap', u'menuIcon': True, u'targetPlatforms': None, u'name': u'IMAGE_MENU_ICON', u'file': u'images/ruler_icon.png'}, {u'targetPlatforms': None, u'type': u'bitmap', u'name': u'SILENT', u'file': u'images/SILENT'}]
RPATH_ST = '-Wl,-rpath,%s'
SANDBOX = False
SDK_VERSION_MAJOR = 5
SDK_VERSION_MINOR = 86
SHLIB_MARKER = None
SIZE = 'arm-none-eabi-size'
SONAME_ST = '-Wl,-h,%s'
STLIBPATH_ST = '-L%s'
STLIB_MARKER = None
STLIB_ST = '-l%s'
SUPPORTED_PLATFORMS = ['chalk', 'emery', 'basalt', 'diorite', 'aplite']
TARGET_PLATFORMS = ['diorite', 'chalk', 'basalt', 'aplite']
TIMESTAMP = 1721937513
USE_GROUPS = True
VERBOSE = 0
WEBPACK = '/home/pebble/.pebble-sdk/SDKs/current/node_modules/.bin/webpack'
cprogram_PATTERN = '%s'
cshlib_PATTERN = 'lib%s.so'
cstlib_PATTERN = 'lib%s.a'
macbundle_PATTERN = '%s.bundle'
