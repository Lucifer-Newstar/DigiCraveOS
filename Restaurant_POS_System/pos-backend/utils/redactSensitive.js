const redactSensitiveText = (value) => String(value || "").replace(/(password|token|secret|authorization)\s*[:=]\s*[^,\s]+/gi, "$1=[REDACTED]");

module.exports = { redactSensitiveText };
