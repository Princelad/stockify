#!/bin/bash

# Stockify LaTeX Report Compilation Script
# This script compiles the LaTeX report and cleans up auxiliary files

echo "=== Stockify LaTeX Report Compilation ==="
echo "Starting compilation process..."

# Check if main.tex exists
if [ ! -f "main.tex" ]; then
    echo "Error: main.tex not found in current directory"
    echo "Please run this script from the LaTeX report directory"
    exit 1
fi

# Check if pdflatex is available
if ! command -v pdflatex &> /dev/null; then
    echo "Error: pdflatex not found"
    echo "Please install a LaTeX distribution (TeX Live, MiKTeX, etc.)"
    exit 1
fi

echo "Compiling LaTeX document (Pass 1/3)..."
pdflatex -interaction=nonstopmode main.tex > compile.log 2>&1

if [ $? -ne 0 ]; then
    echo "Error in first compilation pass. Check compile.log for details."
    tail -20 compile.log
    exit 1
fi

echo "Compiling LaTeX document (Pass 2/3)..."
pdflatex -interaction=nonstopmode main.tex >> compile.log 2>&1

if [ $? -ne 0 ]; then
    echo "Error in second compilation pass. Check compile.log for details."
    tail -20 compile.log
    exit 1
fi

echo "Compiling LaTeX document (Pass 3/3)..."
pdflatex -interaction=nonstopmode main.tex >> compile.log 2>&1

if [ $? -ne 0 ]; then
    echo "Error in third compilation pass. Check compile.log for details."
    tail -20 compile.log
    exit 1
fi

echo "Compilation successful!"

# Check if PDF was created
if [ -f "main.pdf" ]; then
    echo "✓ PDF generated successfully: main.pdf"
    
    # Get file size
    size=$(du -h main.pdf | cut -f1)
    echo "✓ File size: $size"
    
    # Get page count (if pdfinfo is available)
    if command -v pdfinfo &> /dev/null; then
        pages=$(pdfinfo main.pdf | grep "Pages:" | awk '{print $2}')
        echo "✓ Page count: $pages pages"
    fi
else
    echo "Error: PDF was not generated"
    exit 1
fi

# Clean up auxiliary files
echo "Cleaning up auxiliary files..."
rm -f *.aux *.log *.toc *.lof *.lot *.out *.fls *.fdb_latexmk *.synctex.gz *.nav *.snm *.vrb

# Keep compile.log for reference
echo "✓ Compilation log saved as: compile.log"

echo ""
echo "=== Compilation Complete ==="
echo "Your Stockify project report is ready: main.pdf"
echo ""
echo "To view the PDF:"
echo "  Linux:   xdg-open main.pdf"
echo "  macOS:   open main.pdf"
echo "  Windows: start main.pdf"
echo ""