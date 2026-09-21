const config = require("../config/config");
const { redactSensitiveText } = require("../utils/redactSensitive");

const globalErrorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    const code = err.code || ({ 400: "VALIDATION_ERROR", 401: "AUTHENTICATION_ERROR", 403: "AUTHORIZATION_ERROR" }[statusCode] || (statusCode >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR"));
    return res.status(statusCode).json({
        status: statusCode,
        code,
        message: redactSensitiveText(err.message || "Request failed"),
        errorStack: config.nodeEnv === "development" ? err.stack : "",
        requestId: req.requestId,
        timestamp: new Date().toISOString()
    })
}

module.exports = globalErrorHandler;