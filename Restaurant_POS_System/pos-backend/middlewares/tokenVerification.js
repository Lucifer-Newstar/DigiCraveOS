const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = require("../models/userModel");
const Customer = require("../models/customerModel");


const isVerifiedUser = async (req, res, next) => {
    try{

        const { accessToken } = req.cookies;
        
        if(!accessToken){
            const error = createHttpError(401, "Please provide token!");
            return next(error);
        }

        const decodeToken = jwt.verify(accessToken, config.accessTokenSecret);

        // Reject customer tokens on staff endpoints.
        if (decodeToken.type === "customer") {
            return next(createHttpError(403, "Staff access only!"));
        }

        const user = await User.findById(decodeToken._id);
        if(!user){
            const error = createHttpError(401, "User not exist!");
            return next(error);
        }

        req.user = user;
        next();

    }catch (error) {
        const err = createHttpError(401, "Invalid Token!");
        next(err);
    }
}

// Verifies a customer (Guest) session from the separate "customerToken" cookie.
const isVerifiedCustomer = async (req, res, next) => {
    try {
        const { customerToken } = req.cookies;
        if (!customerToken) {
            return next(createHttpError(401, "Please log in!"));
        }

        const decoded = jwt.verify(customerToken, config.accessTokenSecret);
        if (decoded.type !== "customer") {
            return next(createHttpError(403, "Customer access only!"));
        }

        const customer = await Customer.findById(decoded._id);
        if (!customer) {
            return next(createHttpError(401, "Customer not found!"));
        }

        req.customer = customer;
        next();
    } catch (error) {
        next(createHttpError(401, "Invalid Token!"));
    }
}

// Role-based access control.
// Usage: router.post("/", isVerifiedUser, restrictTo("Admin"), handler)
// Must run AFTER isVerifiedUser (relies on req.user being set).
const restrictTo = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            const error = createHttpError(
                403,
                "You do not have permission to perform this action!"
            );
            return next(error);
        }
        next();
    };
};

module.exports = { isVerifiedUser, isVerifiedCustomer, restrictTo };