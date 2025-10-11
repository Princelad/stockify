/**
 * Unified API response helpers.
 * Ensures consistent { success, data?, message?, error? } shape.
 */

/**
 * Send a success response.
 * @param {import('express').Response} res
 * @param {unknown} data
 * @param {string} [message]
 * @param {number} [status=200]
 */
function ok(res, data, message, status = 200) {
  return res.status(status).json({ success: true, data, message });
}

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {Error|object|string} error
 * @param {string} [message]
 * @param {number} [status=500]
 */
function fail(res, error, message, status = 500) {
  const isProd = process.env.NODE_ENV === "production";
  const normalized =
    typeof error === "string"
      ? { message: error }
      : error instanceof Error
      ? { message: error.message, stack: isProd ? undefined : error.stack }
      : error;

  return res.status(status).json({
    success: false,
    message: message || normalized?.message || "Something went wrong",
    error: isProd ? undefined : normalized,
  });
}

module.exports = { ok, fail };
