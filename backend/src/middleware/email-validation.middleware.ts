import { RequestHandler } from 'express';
import { body, validationResult } from 'express-validator';

const reportValidationErrors: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: errors.array()[0].msg });
    return;
  }
  next();
};

export const validateRequiredEmail: RequestHandler[] = [
  body('email')
    .isString()
    .withMessage('Enter a valid email address')
    .bail()
    .trim()
    .isEmail()
    .withMessage('Enter a valid email address'),
  reportValidationErrors,
];

export const validateOptionalEmail: RequestHandler[] = [
  body('email')
    .optional()
    .isString()
    .withMessage('Enter a valid email address')
    .bail()
    .trim()
    .isEmail()
    .withMessage('Enter a valid email address'),
  reportValidationErrors,
];
