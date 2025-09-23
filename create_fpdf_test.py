from fpdf import FPDF
import os

# Create uploads/pdfs directory if it doesn't exist
os.makedirs('backend/uploads/pdfs', exist_ok=True)

def create_simple_fpdf():
    """Create a simple PDF using FPDF library (more basic, less likely to have XRef issues)"""
    
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font('Arial', 'B', 16)
    
    # Title
    pdf.cell(0, 10, 'Product Inventory List', 0, 1, 'C')
    pdf.ln(10)
    
    # Products
    products = [
        "Product Name: Samsung Galaxy S24 Ultra",
        "SKU: SAM-S24U-512GB",  
        "Price: $1199.99",
        "Quantity: 25 units",
        "Category: Electronics",
        "",
        "Product Name: Apple MacBook Pro M3",
        "SKU: APL-MBP-M3-16",
        "Price: $2499.00",
        "Quantity: 10 units", 
        "Category: Computers",
        "",
        "Product Name: Sony WH-1000XM5 Headphones",
        "SKU: SNY-WH1000XM5-BK",
        "Price: $399.99",
        "Quantity: 50 units",
        "Category: Audio Equipment"
    ]
    
    pdf.set_font('Arial', '', 12)
    
    for line in products:
        if line:
            pdf.cell(0, 8, line, 0, 1)
        else:
            pdf.ln(5)
    
    filename = 'backend/uploads/pdfs/fpdf_product_list.pdf'
    pdf.output(filename)
    print(f"Created FPDF test file: {filename}")
    return filename

if __name__ == "__main__":
    try:
        create_simple_fpdf()
    except ImportError:
        print("fpdf2 not installed. Installing...")
        import subprocess
        subprocess.run(["pip", "install", "fpdf2"])
        create_simple_fpdf()