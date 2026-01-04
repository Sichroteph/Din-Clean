#!/bin/bash
# Script de conversion des images PNG en version optimisée 1 bit pour Aplite
# Place ce script à la racine du projet et exécute-le

SRC_DIR="resources/images"
DST_DIR="resources/images_aplite_opt"

mkdir -p "$DST_DIR"

for img in "$SRC_DIR"/*.png; do
  base=$(basename "$img")
  convert "$img" -colors 2 -type bilevel "$DST_DIR/$base"
  echo "Converti : $img -> $DST_DIR/$base"
done

echo "Conversion terminée. Les images optimisées sont dans $DST_DIR."
