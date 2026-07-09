import { body, param, query, validationResult } from 'express-validator';

/**
 * Middleware to check validation results and return errors.
 */
export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

/**
 * Validation schemas for different endpoints.
 */
export const validateSubmission = [
  body('name1')
    .trim()
    .notEmpty().withMessage('Name 1 is required')
    .isLength({ min: 1, max: 100 }).withMessage('Name 1 must be between 1 and 100 characters')
    .escape(),
  body('name2')
    .trim()
    .notEmpty().withMessage('Name 2 is required')
    .isLength({ min: 1, max: 100 }).withMessage('Name 2 must be between 1 and 100 characters')
    .escape(),
  body('campaignId')
    .trim()
    .notEmpty().withMessage('Campaign ID is required')
    .escape(),
  body('visitorId')
    .trim()
    .notEmpty().withMessage('Visitor ID is required'),
  body('sessionId')
    .trim()
    .notEmpty().withMessage('Session ID is required'),
  body('score')
    .isNumeric().withMessage('Score must be a number'),
  body('result')
    .trim()
    .notEmpty().withMessage('Result is required'),
  body('aiConfidence')
    .isNumeric().withMessage('AI Confidence must be a number'),
  handleValidation,
];

export const validateVisitorTrack = [
  body('visitorId')
    .trim()
    .notEmpty().withMessage('Visitor ID is required'),
  body('campaignId')
    .trim()
    .notEmpty().withMessage('Campaign ID is required'),
  body('sessionId')
    .trim()
    .notEmpty().withMessage('Session ID is required'),
  handleValidation,
];

export const validateLogin = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .escape(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidation,
];

export const validateCampaignCreate = [
  body('campaignId')
    .trim()
    .notEmpty().withMessage('Campaign ID is required')
    .matches(/^[a-z0-9-]+$/).withMessage('Campaign ID must be lowercase alphanumeric with hyphens only')
    .escape(),
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title must be under 200 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required'),
  handleValidation,
];

export const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidation,
];
