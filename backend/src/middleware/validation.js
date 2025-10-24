const { body, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation Failed',
            errors: errors.array().map(error => ({
                field: error.path,
                message: error.msg,
                value: error.value
            }))
        });
    }

    next();
};


// Validation rules for user registration:
const validateUserRegistration = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required')
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username may only contain letters, numbers, and underscores'),

    body('email')
        .optional()
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
  
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
    body('role')
        .isIn(['admin', 'judge'])
        .withMessage('Role must be either admin or judge'),
  
     body('judgeInfo.company')
        .if(body('role').equals('judge'))
        .notEmpty()
        .withMessage('Company is required for judges')
        .isLength({ max: 100 })
        .withMessage('Company name cannot exceed 100 characters'),
  
    body('judgeInfo.position')
        .if(body('role').equals('judge'))
        .notEmpty()
        .withMessage('Position is required for judges')
        .isLength({ max: 100 })
        .withMessage('Position cannot exceed 100 characters'),

    handleValidationErrors
];

// Validation rules for user login:
const validateUserLogin = [
    body('username')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Username is required if provided'),
    
    body('email')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Email is required if provided')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    
    // Custom validation to ensure either username or email is provided
    body().custom((value) => {
        if (!value.username && !value.email) {
            throw new Error('Either username or email is required');
        }
        return true;
    }),
    
    handleValidationErrors
];

// Validation rules for team creation:
const validateTeamCreation = [
    body('teamName')
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Team name must be between 3 and 100 characters'),
    
    body('teamNumber')
      .isInt({ min: 1, max: 15 })
      .withMessage('Team number must be between 1 and 15'),
    
    body('projectTitle')
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage('Project title must be between 3 and 200 characters'),
    
    body('members')
      .isArray({ min: 3, max: 4 })
      .withMessage('Team must have between 3 and 4 members'),
    
    body('members.*.name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Member name must be between 2 and 100 characters'),
    
    body('members.*.studentNumber')
      .matches(/^\d{8}$/)
      .withMessage('Student number must be exactly 8 digits'),
    
    body('members.*.email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address for each member'),
    
    handleValidationErrors
  ];


  // Validation rules for criteria creation:
  const validateCriteriaCreation = [
    body('name')
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Criteria name must be between 3 and 100 characters'),
    
    body('description')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Description must be between 10 and 500 characters'),
    
    body('maxScore')
      .isInt({ min: 1, max: 100 })
      .withMessage('Maximum score must be between 1 and 100'),
    
    handleValidationErrors
  ];
  
  
    //Validation rules for score submission
  const validateScoreSubmission = [
    body('score')
      .isFloat({ min: 0, max: 100 })
      .withMessage('Score must be between 0 and 100'),
    
    body('comments')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Comments cannot exceed 1000 characters'),
    
    handleValidationErrors
  ];
  
  module.exports = {
    handleValidationErrors,
    validateUserRegistration,
    validateUserLogin,
    validateTeamCreation,
    validateCriteriaCreation,
    validateScoreSubmission
  };