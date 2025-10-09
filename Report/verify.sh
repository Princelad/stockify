#!/bin/bash

# Stockify LaTeX Report Structure Verification Script
# This script checks if all required files are present for successful compilation

echo "=== Stockify LaTeX Report Structure Verification ==="
echo ""

# Check if we're in the right directory
if [ ! -f "main.tex" ]; then
    echo "❌ Error: main.tex not found"
    echo "Please run this script from the LaTeX report directory"
    exit 1
fi

echo "✓ Main document found: main.tex"

# Check if chapters directory exists
if [ ! -d "chapters" ]; then
    echo "❌ Error: chapters directory not found"
    exit 1
fi

echo "✓ Chapters directory found"

# List of required chapter files
required_chapters=(
    "00_cover.tex"
    "01_certificates.tex"
    "02_abstract.tex"
    "03_introduction.tex"
    "04_motivation.tex"
    "05_technology_stack.tex"
    "06_system_architecture.tex"
    "07_challenges_solutions.tex"
    "08_testing_validation.tex"
    "09_future_enhancements.tex"
    "10_conclusion.tex"
    "11_references.tex"
    "12_appendices.tex"
)

# Check each required chapter
missing_files=0
echo ""
echo "Checking chapter files:"

for chapter in "${required_chapters[@]}"; do
    if [ -f "chapters/$chapter" ]; then
        echo "✓ $chapter"
    else
        echo "❌ $chapter (MISSING)"
        ((missing_files++))
    fi
done

# Summary
echo ""
if [ $missing_files -eq 0 ]; then
    echo "🎉 All required files are present!"
    echo "Your LaTeX report structure is complete and ready for compilation."
    echo ""
    echo "To compile the report:"
    echo "  Linux/macOS: ./compile.sh"
    echo "  Windows:     compile.bat"
    echo "  Manual:      pdflatex main.tex (run 3 times)"
else
    echo "❌ $missing_files file(s) missing"
    echo "Please ensure all chapter files are present before compilation."
    exit 1
fi

# Check for optional directories
echo ""
echo "Optional components:"

if [ -d "images" ]; then
    image_count=$(find images -type f \( -name "*.pdf" -o -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) | wc -l)
    echo "✓ Images directory found ($image_count image files)"
else
    echo "ℹ Images directory not found (create if you have figures to include)"
fi

# File size check
echo ""
echo "File information:"
total_size=0
for chapter in "${required_chapters[@]}"; do
    if [ -f "chapters/$chapter" ]; then
        size=$(stat -f%z "chapters/$chapter" 2>/dev/null || stat -c%s "chapters/$chapter" 2>/dev/null)
        total_size=$((total_size + size))
    fi
done

echo "✓ Total content size: $(( total_size / 1024 )) KB"

# Check LaTeX installation
echo ""
echo "System requirements:"
if command -v pdflatex &> /dev/null; then
    latex_version=$(pdflatex --version | head -n1)
    echo "✓ LaTeX installation: $latex_version"
else
    echo "❌ pdflatex not found - please install LaTeX distribution"
fi

echo ""
echo "=== Verification Complete ==="