"use strict";

export const validatePhone = (value, next) => {
    if (value && (value.length > 0)) {
        let pattern = /^\d{3}-\d{3}-\d{4}$/;
        if (!pattern.test(value)) {
            next(`phone: Phone '${value}' must match format 999-999-9999`);
        }
    }
    return next();
}

