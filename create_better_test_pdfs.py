from reportlab.lib.pagesizes import letter, A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
import os

# Create uploads/pdfs directory if it doesn't exist
os.makedirs('backend/uploads/pdfs', exist_ok=True)

def create_simple_text_pdf():
    """Create a simple text-based PDF using basic canvas operations"""
    filename = 'backend/uploads/pdfs/simple_product_list.pdf'
    
    # Use A4 for better compatibility
    c = canvas.Canvas(filename, pagesize=A4)
    width, height = A4
    
    # Set up simple text content
    y = height - 50
    
    # Title
    c.setFont("Helvetica-Bold", 18)
    c.drawString(50, y, "Product Inventory List")
    y -= 40
    
    # Product entries with clear structure
    c.setFont("Helvetica", 12)
    
    products = [
        "Product Name: Samsung Galaxy Smartphone",
        "SKU: SAM-GAL-001",
        "Price: $899.99",
        "Quantity: 25 units",
        "Category: Electronics",
        "",
        "Product Name: Apple MacBook Pro",
        "SKU: APL-MBP-512",
        "Price: $2499.00", 
        "Quantity: 10 units",
        "Category: Computers",
        "",
        "Product Name: Sony Wireless Headphones",
        "SKU: SNY-WH-1000",
        "Price: $299.99",
        "Quantity: 50 units", 
        "Category: Audio"
    ]
    
    for line in products:
        c.drawString(50, y, line)
        y -= 20
        if y < 100:  # Start new page if needed
            c.showPage()
            y = height - 50
    
    # Save the PDF
    c.save()
    print(f"Created simple PDF: {filename}")
    return filename

def create_table_format_pdf():
    """Create a properly formatted PDF with table structure"""
    filename = 'backend/uploads/pdfs/product_table.pdf'
    
    doc = SimpleDocTemplate(filename, pagesize=A4)
    elements = []
    
    # Title
    styles = getSampleStyleSheet()
    title = Paragraph("Product Catalog", styles['Title'])
    elements.append(title)
    elements.append(Spacer(1, 20))
    
    # Create table data
    data = [
        ['Product Name', 'SKU', 'Price', 'Stock', 'Category'],
        ['Dell Laptop XPS 13', 'DEL-XPS13-256', '$1299.00', '15', 'Computers'],
        ['iPhone 15 Pro', 'APL-IP15P-128', '$999.00', '30', 'Mobile'],
        ['HP Printer LaserJet', 'HP-LJ-P1102', '$199.99', '8', 'Office Equipment'],
        ['Logitech Mouse MX Master', 'LOG-MX-MST3', '$99.99', '25', 'Accessories']
    ]
    
    # Create table
    table = Table(data, colWidths=[2.5*inch, 1.5*inch, 1*inch, 0.8*inch, 1.2*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(table)
    
    # Build PDF
    doc.build(elements)
    print(f"Created table PDF: {filename}")
    return filename

# Create both types of test PDFs
if __name__ == "__main__":
    simple_pdf = create_simple_text_pdf()
    table_pdf = create_table_format_pdf()
    
    print("Created test PDFs:")
    print(f"1. Simple text format: {simple_pdf}")
    print(f"2. Table format: {table_pdf}")