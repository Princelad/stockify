@echo off
REM Stockify LaTeX Report Compilation Script for Windows
REM This script compiles the LaTeX report and cleans up auxiliary files

echo === Stockify LaTeX Report Compilation ===
echo Starting compilation process...

REM Check if main.tex exists
if not exist "main.tex" (
    echo Error: main.tex not found in current directory
    echo Please run this script from the LaTeX report directory
    pause
    exit /b 1
)

REM Check if pdflatex is available
where pdflatex >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: pdflatex not found
    echo Please install a LaTeX distribution (MiKTeX, TeX Live, etc.^)
    pause
    exit /b 1
)

echo Compiling LaTeX document (Pass 1/3^)...
pdflatex -interaction=nonstopmode main.tex > compile.log 2>&1

if %errorlevel% neq 0 (
    echo Error in first compilation pass. Check compile.log for details.
    type compile.log | findstr /C:"Error" /C:"!" /N
    pause
    exit /b 1
)

echo Compiling LaTeX document (Pass 2/3^)...
pdflatex -interaction=nonstopmode main.tex >> compile.log 2>&1

if %errorlevel% neq 0 (
    echo Error in second compilation pass. Check compile.log for details.
    type compile.log | findstr /C:"Error" /C:"!" /N
    pause
    exit /b 1
)

echo Compiling LaTeX document (Pass 3/3^)...
pdflatex -interaction=nonstopmode main.tex >> compile.log 2>&1

if %errorlevel% neq 0 (
    echo Error in third compilation pass. Check compile.log for details.
    type compile.log | findstr /C:"Error" /C:"!" /N
    pause
    exit /b 1
)

echo Compilation successful!

REM Check if PDF was created
if exist "main.pdf" (
    echo ✓ PDF generated successfully: main.pdf
    
    REM Get file size
    for %%I in (main.pdf) do echo ✓ File size: %%~zI bytes
) else (
    echo Error: PDF was not generated
    pause
    exit /b 1
)

REM Clean up auxiliary files
echo Cleaning up auxiliary files...
del /Q *.aux *.toc *.lof *.lot *.out *.fls *.fdb_latexmk *.synctex.gz *.nav *.snm *.vrb 2>nul

REM Keep compile.log for reference
echo ✓ Compilation log saved as: compile.log

echo.
echo === Compilation Complete ===
echo Your Stockify project report is ready: main.pdf
echo.
echo To view the PDF, double-click on main.pdf or run:
echo   start main.pdf
echo.
pause