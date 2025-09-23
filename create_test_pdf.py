from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
import os

# Create uploads/pdfs directory if it doesn't exist
os.makedirs('backend/uploads/pdfs', exist_ok=True)

# Create a structured product invoice PDF
filename = 'backend/uploads/pdfs/test_product_invoice.pdf'
c = canvas.Canvas(filename, pagesize=letter)
width, height = letter

# Header
c.setFont('Helvetica-Bold', 16)
c.drawString(100, height - 100, 'PRODUCT INVOICE')

c.setFont('Helvetica', 10)
c.drawString(100, height - 120, 'Invoice #: INV-2024-001')
c.drawString(100, height - 135, 'Date: January 15, 2024')

# Product details section
y = height - 180
c.setFont('Helvetica-Bold', 12)
c.drawString(100, y, 'Product Details:')

# Product information
products = [
    {'name': 'Samsung Galaxy S24 Ultra', 'sku': 'SGS24U-256', 'price': 89999, 'qty': 5},
    {'name': 'Apple iPhone 15 Pro Max', 'sku': 'APL15PM-512', 'price': 134900, 'qty': 3},
    {'name': 'Google Pixel 8 Pro', 'sku': 'GP8P-128', 'price': 84999, 'qty': 7}
]

c.setFont('Helvetica', 10)
y -= 30

for product in products:
    c.drawString(100, y, f'Product: {product["name"]}')
    c.drawString(100, y-15, f'SKU: {product["sku"]}')
    c.drawString(300, y-15, f'Price: ₹{product["price"]:,}')
    c.drawString(450, y-15, f'Quantity: {product["qty"]} units')
    y -= 50

# Add some pattern variations
y -= 20
c.setFont('Helvetica-Bold', 11)
c.drawString(100, y, 'Additional Items:')
y -= 20
c.setFont('Helvetica', 10)
c.drawString(100, y, 'Item: Wireless Headphones | Code: WH-2024 | Rate: ₹4999 | Stock: 15')
y -= 15
c.drawString(100, y, 'Item: Bluetooth Speaker | Code: BS-SND-X1 | Cost: $89.99 | Qty: 25 pcs')

# Total section
y -= 40
c.setFont('Helvetica-Bold', 12)
c.drawString(100, y, 'Total Amount: ₹1,234,567')

c.save()
print(f'Created test PDF: {filename}')