#include "pebble_process_info.h"
#include "src/resource_ids.auto.h"

const PebbleProcessInfo __pbl_app_info __attribute__ ((section (".pbl_header"))) = {
  .header = "PBLAPP",
  .struct_version = { PROCESS_INFO_CURRENT_STRUCT_VERSION_MAJOR, PROCESS_INFO_CURRENT_STRUCT_VERSION_MINOR },
  .sdk_version = { PROCESS_INFO_CURRENT_SDK_VERSION_MAJOR, PROCESS_INFO_CURRENT_SDK_VERSION_MINOR },
  .process_version = { 1, 15 },
  .load_size = 0xb6b6,
  .offset = 0xb6b6b6b6,
  .crc = 0xb6b6b6b6,
  .name = "Din Clean",
  .company = "CJ",
  .icon_resource_id = RESOURCE_ID_IMAGE_MENU_ICON,
  .sym_table_addr = 0xA7A7A7A7,
  .flags = PROCESS_INFO_WATCH_FACE | PROCESS_INFO_PLATFORM_BASALT,
  .num_reloc_entries = 0xdeadcafe,
  .uuid = { 0x90, 0x40, 0x76, 0x3A, 0x6B, 0x35, 0x49, 0xD1, 0x82, 0xAC, 0x13, 0xCE, 0x02, 0xE3, 0x11, 0x37 },
  .virtual_size = 0xb6b6
};
