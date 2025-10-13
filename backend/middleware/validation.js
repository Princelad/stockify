const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const validateRegister = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  next();
};

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  next();
};

const productSchema = Joi.object({
  name: Joi.string().required().trim(),
  description: Joi.string().optional().allow("").trim(),
  sku: Joi.string().required().trim(),
  category: Joi.string().required().trim(),
  brand: Joi.string().optional().allow("").trim(),
  costPrice: Joi.number().required().min(0),
  sellingPrice: Joi.number().required().min(0),
  wholesalePrice: Joi.number().optional().min(0),
  currentStock: Joi.number().required().min(0).default(0),
  minStockLevel: Joi.number().required().min(0).default(10),
  maxStockLevel: Joi.number().optional().min(0),
  supplierId: Joi.string().optional().allow("").trim(),
  supplier: Joi.object({
    name: Joi.string().optional().allow(""),
    contact: Joi.string().optional().allow(""),
    email: Joi.string().email().optional().allow(""),
    address: Joi.string().optional().allow(""),
  }).optional(),
  barcode: Joi.string().optional().allow("").trim(),
  weight: Joi.number().optional().min(0),
  dimensions: Joi.object({
    length: Joi.number().optional(),
    width: Joi.number().optional(),
    height: Joi.number().optional(),
  }).optional(),
  isActive: Joi.boolean().optional().default(true),
  images: Joi.array().items(Joi.string()).optional(),
});

const validateProduct = (req, res, next) => {
  const { error } = productSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  // Clean empty supplierId to prevent MongoDB ObjectId cast errors
  if (req.body.supplierId === "" || req.body.supplierId === null) {
    delete req.body.supplierId;
  }

  next();
};

const returnSchema = Joi.object({
  saleId: Joi.string().required().trim(),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required().trim(),
        quantityReturned: Joi.number().required().min(1),
        reason: Joi.string()
          .valid(
            "defective",
            "wrong-item",
            "customer-changed-mind",
            "damaged",
            "expired",
            "other"
          )
          .required(),
      })
    )
    .required()
    .min(1),
  refundMethod: Joi.string()
    .valid("cash", "card", "upi", "netbanking", "store-credit")
    .default("cash"),
  notes: Joi.string().optional().allow("").trim(),
});

const validateReturn = (req, res, next) => {
  const { error } = returnSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateProduct,
  validateReturn,
};
