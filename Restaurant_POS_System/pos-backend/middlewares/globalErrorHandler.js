const config = require("../config/config");

const globalErrorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    const code = err.code || (statusCode >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR");
    return res.status(statusCode).json({
        status: statusCode,
        code,
        message: err.message || "Request failed",
        errorStack: config.nodeEnv === "development" ? err.stack : "",
        requestId: req.requestId,
        timestamp: new Date().toISOString()
    })
}

module.exports = globalErrorHandler;