const Product = require("../models/Product");
const LabelTemplate = require("../models/LabelTemplate");
const generatePDFService = require("../services/labelPDFService");
const mongoose = require("mongoose");
const { ok, fail } = require("../utils/responder");

/**
 * GET LABEL TEMPLATES
 * Purpose: Get all label templates (default + user custom)
 */
const getTemplates = async (req, res) => {
  try {
    // Default templates (built-in)
    const defaultTemplates = [
      {
        id: "template1",
        name: "Standard Product Label",
        size: '2" x 1"',
        fields: ["name", "price", "barcode"],
        layout: "single",
        isDefault: true,
        settings: {
          fontSize: 10,
          fontFamily: "Arial",
          backgroundColor: "#ffffff",
          textColor: "#000000",
          showBorder: true,
        },
      },
      {
        id: "template2",
        name: "Detailed Product Label",
        size: '3" x 2"',
        fields: ["name", "sku", "price", "category", "barcode"],
        layout: "single",
        isDefault: true,
        settings: {
          fontSize: 11,
          fontFamily: "Arial",
          backgroundColor: "#ffffff",
          textColor: "#000000",
          showBorder: true,
        },
      },
      {
        id: "template3",
        name: "Price Tag Only",
        size: '1.5" x 1"',
        fields: ["name", "price"],
        layout: "grid",
        isDefault: true,
        settings: {
          fontSize: 12,
          fontFamily: "Arial Bold",
          backgroundColor: "#ffffff",
          textColor: "#000000",
          showBorder: false,
        },
      },
      {
        id: "template4",
        name: "Barcode Label",
        size: '2" x 0.75"',
        fields: ["name", "sku", "barcode"],
        layout: "single",
        isDefault: true,
        settings: {
          fontSize: 8,
          fontFamily: "Arial",
          backgroundColor: "#ffffff",
          textColor: "#000000",
          showBorder: false,
        },
      },
    ];

    // User custom templates
    const userFilter = { createdBy: req.user._id, isActive: true };
    const customTemplates = await LabelTemplate.find(userFilter).sort({
      createdAt: -1,
    });

    const formattedCustomTemplates = customTemplates.map((template) => ({
      id: template._id.toString(),
      name: template.name,
      size: template.size,
      fields: template.fields,
      layout: template.layout,
      isDefault: false,
      isCustom: true,
      settings: template.settings || {},
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    }));

    return ok(
      res,
      {
        templates: [...defaultTemplates, ...formattedCustomTemplates],
        defaultCount: defaultTemplates.length,
        customCount: formattedCustomTemplates.length,
      },
      "Label templates retrieved successfully"
    );
  } catch (error) {
    console.error("Error fetching label templates:", error);
    return fail(res, error, "Failed to fetch label templates");
  }
};

/**
 * CREATE LABEL TEMPLATE
 * Purpose: Create a new custom label template
 */
const createTemplate = async (req, res) => {
  try {
    const { name, size, fields, layout, settings } = req.body;

    // Validate required fields
    if (!name || !size || !fields || !layout) {
      return fail(
        res,
        null,
        "Missing required fields: name, size, fields, layout",
        400
      );
    }

    // Check if template name already exists for this user
    const existingTemplate = await LabelTemplate.findOne({
      name,
      createdBy: req.user._id,
      isActive: true,
    });

    if (existingTemplate) {
      return fail(res, null, "A template with this name already exists", 400);
    }

    const template = new LabelTemplate({
      name,
      size,
      fields,
      layout,
      settings: settings || {
        fontSize: 10,
        fontFamily: "Arial",
        backgroundColor: "#ffffff",
        textColor: "#000000",
        showBorder: true,
      },
      createdBy: req.user._id,
    });

    await template.save();

    return ok(
      res,
      {
        template: {
          id: template._id.toString(),
          name: template.name,
          size: template.size,
          fields: template.fields,
          layout: template.layout,
          isDefault: false,
          isCustom: true,
          settings: template.settings,
          createdAt: template.createdAt,
          updatedAt: template.updatedAt,
        },
      },
      "Label template created successfully",
      201
    );
  } catch (error) {
    console.error("Error creating label template:", error);
    return fail(res, error, "Failed to create label template");
  }
};

/**
 * UPDATE LABEL TEMPLATE
 * Purpose: Update an existing custom template
 */
const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, size, fields, layout, settings } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return fail(res, null, "Invalid template ID", 400);
    }

    const template = await LabelTemplate.findOne({
      _id: id,
      createdBy: req.user._id,
      isActive: true,
    });

    if (!template) {
      return fail(res, null, "Template not found or access denied", 404);
    }

    // Update fields
    if (name) template.name = name;
    if (size) template.size = size;
    if (fields) template.fields = fields;
    if (layout) template.layout = layout;
    if (settings) template.settings = { ...template.settings, ...settings };

    await template.save();

    return ok(
      res,
      {
        template: {
          id: template._id.toString(),
          name: template.name,
          size: template.size,
          fields: template.fields,
          layout: template.layout,
          isDefault: false,
          isCustom: true,
          settings: template.settings,
          createdAt: template.createdAt,
          updatedAt: template.updatedAt,
        },
      },
      "Label template updated successfully"
    );
  } catch (error) {
    console.error("Error updating label template:", error);
    return fail(res, error, "Failed to update label template");
  }
};

/**
 * DELETE LABEL TEMPLATE
 * Purpose: Soft delete a custom template
 */
const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return fail(res, null, "Invalid template ID", 400);
    }

    const template = await LabelTemplate.findOne({
      _id: id,
      createdBy: req.user._id,
      isActive: true,
    });

    if (!template) {
      return fail(res, null, "Template not found or access denied", 404);
    }

    // Soft delete
    template.isActive = false;
    await template.save();

    return ok(res, null, "Label template deleted successfully");
  } catch (error) {
    console.error("Error deleting label template:", error);
    return fail(res, error, "Failed to delete label template");
  }
};

/**
 * GENERATE LABELS
 * Purpose: Generate label data for preview/printing
 */
const generateLabels = async (req, res) => {
  try {
    const { templateId, products, customText, quantity = 1 } = req.body;

    if (!templateId) {
      return fail(res, null, "Template ID is required", 400);
    }

    // Get template (default or custom)
    let template;
    if (templateId.startsWith("template")) {
      // Default template - get from built-in templates
      const defaultTemplates = {
        template1: {
          id: "template1",
          name: "Standard Product Label",
          size: '2" x 1"',
          fields: ["name", "price", "barcode"],
          layout: "single",
          isDefault: true,
          settings: {
            fontSize: 10,
            fontFamily: "Arial",
            backgroundColor: "#ffffff",
            textColor: "#000000",
            showBorder: true,
          },
        },
        template2: {
          id: "template2",
          name: "Detailed Product Label",
          size: '3" x 2"',
          fields: ["name", "sku", "price", "category", "barcode"],
          layout: "single",
          isDefault: true,
          settings: {
            fontSize: 11,
            fontFamily: "Arial",
            backgroundColor: "#ffffff",
            textColor: "#000000",
            showBorder: true,
          },
        },
        template3: {
          id: "template3",
          name: "Price Tag Only",
          size: '1.5" x 1"',
          fields: ["name", "price"],
          layout: "grid",
          isDefault: true,
          settings: {
            fontSize: 12,
            fontFamily: "Arial",
            backgroundColor: "#ffffff",
            textColor: "#000000",
            showBorder: false,
          },
        },
      };

      template = defaultTemplates[templateId];
    } else {
      // Custom template
      const customTemplate = await LabelTemplate.findOne({
        _id: templateId,
        createdBy: req.user._id,
        isActive: true,
      });

      if (customTemplate) {
        template = {
          id: customTemplate._id.toString(),
          name: customTemplate.name,
          size: customTemplate.size,
          fields: customTemplate.fields,
          layout: customTemplate.layout,
          settings: customTemplate.settings,
        };
      }
    }

    if (!template) {
      return fail(res, null, "Template not found", 404);
    }

    let labelData = [];

    if (products && products.length > 0) {
      // Product labels - Include barcode field in selection
      const productData = await Product.find({
        _id: { $in: products },
        createdBy: req.user._id,
        isActive: true,
      }).select(
        "name sku sellingPrice wholesalePrice category currentStock supplier barcode"
      );

      if (productData.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No products found",
        });
      }

      // Generate labels for each product
      for (const product of productData) {
        for (let i = 0; i < quantity; i++) {
          const labelContent = {};

          template.fields.forEach((field) => {
            switch (field) {
              case "name":
                labelContent.name = product.name;
                break;
              case "sku":
                labelContent.sku = product.sku;
                break;
              case "price":
                labelContent.price = `₹${
                  product.sellingPrice?.toLocaleString() || "N/A"
                }`;
                break;
              case "wholesalePrice":
                labelContent.wholesalePrice = `₹${
                  product.wholesalePrice?.toLocaleString() || "N/A"
                }`;
                break;
              case "category":
                labelContent.category = product.category || "Uncategorized";
                break;
              case "barcode":
                labelContent.barcode = product.barcode || product.sku; // Use product barcode or fallback to SKU
                break;
              case "stock":
                labelContent.stock = product.currentStock || 0;
                break;
            }
          });

          labelData.push({
            type: "product",
            productId: product._id,
            productName: product.name,
            content: labelContent,
            template: template,
          });
        }
      }
    } else if (customText) {
      // Custom text labels
      for (let i = 0; i < quantity; i++) {
        labelData.push({
          type: "custom",
          content: { customText },
          template: template,
        });
      }
    } else {
      return fail(res, null, "Either products or custom text is required", 400);
    }

    return ok(
      res,
      {
        labels: labelData,
        template: template,
        totalLabels: labelData.length,
        summary: {
          templateName: template.name,
          templateSize: template.size,
          labelCount: labelData.length,
          productsCount: products ? products.length : 0,
          customLabelsCount: customText ? quantity : 0,
        },
      },
      "Labels generated successfully"
    );
  } catch (error) {
    console.error("Error generating labels:", error);
    return fail(res, error, "Failed to generate labels");
  }
};

/**
 * GENERATE LABEL PDF
 * Purpose: Generate printable PDF labels
 */
const generateLabelPDF = async (req, res) => {
  try {
    const {
      templateId,
      products,
      customText,
      quantity = 1,
      options = {},
    } = req.body;

    if (!templateId) {
      return res.status(400).json({
        success: false,
        message: "Template ID is required",
      });
    }

    // Get template (default or custom)
    let template;
    if (templateId.startsWith("template")) {
      // Default template - get from built-in templates
      const defaultTemplates = {
        template1: {
          id: "template1",
          name: "Standard Product Label",
          size: '2" x 1"',
          fields: ["name", "price", "barcode"],
          layout: "single",
        },
        template2: {
          id: "template2",
          name: "Detailed Product Label",
          size: '3" x 2"',
          fields: ["name", "sku", "price", "category", "barcode"],
          layout: "single",
        },
        template3: {
          id: "template3",
          name: "Price Tag Only",
          size: '1.5" x 1"',
          fields: ["name", "price"],
          layout: "grid",
        },
        template4: {
          id: "template4",
          name: "Barcode Label",
          size: '2" x 0.75"',
          fields: ["name", "sku", "barcode"],
          layout: "single",
        },
      };
      template = defaultTemplates[templateId];
    } else {
      // Custom template
      const customTemplate = await LabelTemplate.findOne({
        _id: templateId,
        createdBy: req.user._id,
        isActive: true,
      });

      if (customTemplate) {
        template = {
          id: customTemplate._id.toString(),
          name: customTemplate.name,
          size: customTemplate.size,
          fields: customTemplate.fields,
          layout: customTemplate.layout,
          settings: customTemplate.settings,
        };
      }
    }

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    let labelData = [];

    if (products && products.length > 0) {
      // Product labels - Include barcode field in selection
      const productData = await Product.find({
        _id: { $in: products },
        createdBy: req.user._id,
        isActive: true,
      }).select(
        "name sku sellingPrice wholesalePrice category currentStock supplier barcode"
      );

      if (productData.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No products found",
        });
      }

      // Generate labels for each product
      for (const product of productData) {
        for (let i = 0; i < quantity; i++) {
          const labelContent = {};

          template.fields.forEach((field) => {
            switch (field) {
              case "name":
                labelContent.name = product.name;
                break;
              case "sku":
                labelContent.sku = product.sku;
                break;
              case "price":
                labelContent.price = `₹${
                  product.sellingPrice?.toLocaleString() || "N/A"
                }`;
                break;
              case "wholesalePrice":
                labelContent.wholesalePrice = `₹${
                  product.wholesalePrice?.toLocaleString() || "N/A"
                }`;
                break;
              case "category":
                labelContent.category = product.category || "Uncategorized";
                break;
              case "barcode":
                labelContent.barcode = product.barcode || product.sku; // Use product barcode or fallback to SKU
                break;
              case "stock":
                labelContent.stock = product.currentStock || 0;
                break;
            }
          });

          labelData.push({
            type: "product",
            productId: product._id,
            productName: product.name,
            content: labelContent,
            template: template,
          });
        }
      }
    } else if (customText) {
      // Custom text labels
      for (let i = 0; i < quantity; i++) {
        labelData.push({
          type: "custom",
          content: { customText },
          template: template,
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Either products or custom text is required",
      });
    }

    console.log("Generated label data:", {
      labelCount: labelData.length,
      templateId: templateId,
      hasProducts: !!products,
      hasCustomText: !!customText,
    });

    // Generate PDF using the label service
    const pdfBuffer = await generatePDFService.generateLabelsPDF(
      labelData,
      template,
      options
    );

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error("PDF generation failed - empty buffer");
    }

    console.log("PDF generated successfully, size:", pdfBuffer.length);

    // Set appropriate headers for PDF download
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="labels-${Date.now()}.pdf"`,
      "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF labels:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate PDF labels",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

module.exports = {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  generateLabels,
  generateLabelPDF,
};
