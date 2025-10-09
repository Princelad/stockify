#!/bin/bash

# LaTeX Project Cleanup Script
# This script removes backup files and LaTeX auxiliary files

echo "=== LaTeX Project Cleanup ==="
echo "Cleaning up backup files and auxiliary files..."

# Remove backup chapter files
echo "Removing backup chapter files..."
rm -f chapters/*_backup*.tex
rm -f chapters/*_old*.tex
rm -f chapters/*_temp*.tex

# Remove LaTeX auxiliary files
echo "Removing LaTeX auxiliary files..."
rm -f *.aux *.log *.toc *.lof *.lot *.out *.fls *.fdb_latexmk *.synctex.gz
rm -f *.nav *.snm *.vrb *.bbl *.blg *.idx *.ind *.ilg *.glo *.gls

# Keep only essential files
echo ""
echo "✓ Cleanup complete!"
echo ""
echo "Remaining files:"
echo "Main directory:"
ls -1 | grep -E '\.(tex|pdf|md|sh|bat)$'
echo ""
echo "Chapters directory:"
ls -1 chapters/ | grep -v backup

echo ""
echo "Clean directory structure maintained!"