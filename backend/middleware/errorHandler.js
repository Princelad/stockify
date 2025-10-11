// Centralized 404 and error handling middleware
// Ensures consistent response shape and hides internals in production

/** @type {import('express').RequestHandler} */
const notFound = (_req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
};

/** @type {import('express').ErrorRequestHandler} */
const errorHandler = (err, _req, res, _next) => {
  const isProd = process.env.NODE_ENV === "production";
  const status = err.status || err.statusCode || 500;

  // Joi validation errors
  if (err && (err.isJoi || err.name === "ValidationError")) {
    const details =
      err.details ||
      (err.errors
        ? Object.values(err.errors).map((e) => e.message)
        : undefined);
    return res.status(400).json({
      success: false,
      message: "Validation error",
      error: isProd ? undefined : details,
    });
  }

  // CORS specific handling
  if (err && err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS policy violation",
      error: isProd ? undefined : "Origin not allowed",
    });
  }

  // Generic error
  return res.status(status).json({
    success: false,
    message: err?.message || "Internal server error",
    error: isProd ? undefined : { stack: err?.stack, ...err },
  });
};

module.exports = { notFound, errorHandler };
