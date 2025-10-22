// Application constants and configuration

// User roles
export const USER_ROLES = {
    ADMIN: 'admin',
    JUDGE: 'judge'
  };
  
  // User role labels
  export const USER_ROLE_LABELS = {
    [USER_ROLES.ADMIN]: 'Administrator',
    [USER_ROLES.JUDGE]: 'Judge'
  };
  
  // Team member roles
  export const TEAM_MEMBER_ROLES = {
    LEADER: 'leader',
    MEMBER: 'member'
  };
  
  // Team member role labels
  export const TEAM_MEMBER_ROLE_LABELS = {
    [TEAM_MEMBER_ROLES.LEADER]: 'Team Leader',
    [TEAM_MEMBER_ROLES.MEMBER]: 'Member'
  };
  
  // Round status
  export const ROUND_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    OPEN: 'open',
    CLOSED: 'closed'
  };
  
  // Round status labels
  export const ROUND_STATUS_LABELS = {
    [ROUND_STATUS.ACTIVE]: 'Active',
    [ROUND_STATUS.INACTIVE]: 'Inactive',
    [ROUND_STATUS.OPEN]: 'Open',
    [ROUND_STATUS.CLOSED]: 'Closed'
  };
  
  // Score status
  export const SCORE_STATUS = {
    DRAFT: 'draft',
    SUBMITTED: 'submitted'
  };
  
  // Score status labels
  export const SCORE_STATUS_LABELS = {
    [SCORE_STATUS.DRAFT]: 'Draft',
    [SCORE_STATUS.SUBMITTED]: 'Submitted'
  };
  
  // Pagination
  export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    LIMIT_OPTIONS: [5, 10, 25, 50, 100]
  };
  
  // Date formats
  export const DATE_FORMATS = {
    DISPLAY: 'MMM dd, yyyy',
    DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
    API: 'yyyy-MM-dd',
    API_WITH_TIME: 'yyyy-MM-dd HH:mm:ss'
  };
  
  // Validation rules
  export const VALIDATION_RULES = {
    PASSWORD_MIN_LENGTH: 6,
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 30,
    TEAM_NAME_MIN_LENGTH: 3,
    TEAM_NAME_MAX_LENGTH: 100,
    PROJECT_TITLE_MIN_LENGTH: 3,
    PROJECT_TITLE_MAX_LENGTH: 200,
    DESCRIPTION_MAX_LENGTH: 1000,
    COMMENTS_MAX_LENGTH: 1000,
    STUDENT_NUMBER_LENGTH: 8,
    MAX_TEAM_MEMBERS: 4,
    MIN_TEAM_MEMBERS: 3,
    MAX_JUDGES_PER_TEAM: 3,
    MAX_SCORE: 100,
    MIN_SCORE: 0
  };
  
  // API endpoints
  export const API_ENDPOINTS = {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      PROFILE: '/auth/me',
      USERS: '/auth/users',
      STATS: '/auth/stats'
    },
    TEAMS: {
      BASE: '/teams',
      ASSIGN_JUDGE: '/teams/:id/assign-judge',
      UNASSIGN_JUDGE: '/teams/:id/unassign-judge',
      PARTICIPATION: '/teams/:id/participation',
      STATS: '/teams/stats'
    },
    CRITERIA: {
      BASE: '/criteria',
      STATUS: '/criteria/:id/status',
      MOST_USED: '/criteria/stats/most-used',
      STATS: '/criteria/stats'
    },
    ROUNDS: {
      BASE: '/rounds',
      ACTIVE: '/rounds/active',
      CLOSE: '/rounds/:id/close',
      REOPEN: '/rounds/:id/reopen',
      STATS: '/rounds/stats'
    },
    SCORES: {
      BASE: '/scores',
      MY_SCORES: '/scores/my-scores',
      TEAM_SCORES: '/scores/team/:teamId',
      TEAM_SUMMARY: '/scores/summary/:teamId',
      ROUND_SCORES: '/scores/round/:roundId',
      SUBMIT: '/scores/:id/submit',
      STATS: '/scores/stats'
    },
    ASSIGNMENT: {
      ASSIGN: '/assignment/assign',
      STATS: '/assignment/stats',
      OPTIMIZE: '/assignment/optimize'
    }
  };
  
  // Local storage keys
  export const STORAGE_KEYS = {
    TOKEN: 'token',
    USER: 'user',
    THEME: 'theme',
    LANGUAGE: 'language'
  };
  
  // Toast messages
  export const TOAST_MESSAGES = {
    SUCCESS: {
      LOGIN: 'Login successful!',
      LOGOUT: 'Logged out successfully!',
      REGISTER: 'User registered successfully!',
      UPDATE: 'Updated successfully!',
      DELETE: 'Deleted successfully!',
      CREATE: 'Created successfully!',
      SUBMIT: 'Submitted successfully!',
      SAVE: 'Saved successfully!'
    },
    ERROR: {
      LOGIN: 'Login failed. Please check your credentials.',
      LOGOUT: 'Logout failed.',
      REGISTER: 'Registration failed.',
      UPDATE: 'Update failed.',
      DELETE: 'Delete failed.',
      CREATE: 'Creation failed.',
      SUBMIT: 'Submission failed.',
      SAVE: 'Save failed.',
      NETWORK: 'Network error. Please check your connection.',
      UNAUTHORIZED: 'You are not authorized to perform this action.',
      VALIDATION: 'Please check your input and try again.'
    },
    INFO: {
      LOADING: 'Loading...',
      PROCESSING: 'Processing...',
      SAVING: 'Saving...',
      SUBMITTING: 'Submitting...'
    }
  };
  
  // Table columns
  export const TABLE_COLUMNS = {
    USERS: [
      { key: 'username', label: 'Username', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
      { key: 'role', label: 'Role', sortable: true },
      { key: 'isActive', label: 'Status', sortable: true },
      { key: 'createdAt', label: 'Created', sortable: true },
      { key: 'actions', label: 'Actions', sortable: false }
    ],
    TEAMS: [
      { key: 'teamNumber', label: 'Team #', sortable: true },
      { key: 'teamName', label: 'Team Name', sortable: true },
      { key: 'projectTitle', label: 'Project Title', sortable: true },
      { key: 'members', label: 'Members', sortable: false },
      { key: 'assignedJudges', label: 'Judges', sortable: false },
      { key: 'isParticipating', label: 'Status', sortable: true },
      { key: 'actions', label: 'Actions', sortable: false }
    ],
    CRITERIA: [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'description', label: 'Description', sortable: false },
      { key: 'maxScore', label: 'Max Score', sortable: true },
      { key: 'weight', label: 'Weight', sortable: true },
      { key: 'usageCount', label: 'Usage', sortable: true },
      { key: 'isActive', label: 'Status', sortable: true },
      { key: 'actions', label: 'Actions', sortable: false }
    ],
    ROUNDS: [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'description', label: 'Description', sortable: false },
      { key: 'startDate', label: 'Start Date', sortable: true },
      { key: 'endDate', label: 'End Date', sortable: true },
      { key: 'isOpen', label: 'Status', sortable: true },
      { key: 'criteria', label: 'Criteria', sortable: false },
      { key: 'actions', label: 'Actions', sortable: false }
    ]
  };
  
  // Form field types
  export const FORM_FIELD_TYPES = {
    TEXT: 'text',
    EMAIL: 'email',
    PASSWORD: 'password',
    NUMBER: 'number',
    TEXTAREA: 'textarea',
    SELECT: 'select',
    CHECKBOX: 'checkbox',
    RADIO: 'radio',
    DATE: 'date',
    DATETIME: 'datetime-local'
  };
  
  // Chart colors
  export const CHART_COLORS = {
    PRIMARY: '#0E1E3B',
    SECONDARY: '#935E28',
    SUCCESS: '#28A745',
    WARNING: '#FFC107',
    DANGER: '#DC3545',
    INFO: '#17A2B8',
    LIGHT: '#F8F9FA',
    DARK: '#212529'
  };
  
  // Animation durations
  export const ANIMATION_DURATION = {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  };
  
  // Breakpoints
  export const BREAKPOINTS = {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px'
  };
  
  export default {
    USER_ROLES,
    USER_ROLE_LABELS,
    TEAM_MEMBER_ROLES,
    TEAM_MEMBER_ROLE_LABELS,
    ROUND_STATUS,
    ROUND_STATUS_LABELS,
    SCORE_STATUS,
    SCORE_STATUS_LABELS,
    PAGINATION,
    DATE_FORMATS,
    VALIDATION_RULES,
    API_ENDPOINTS,
    STORAGE_KEYS,
    TOAST_MESSAGES,
    TABLE_COLUMNS,
    FORM_FIELD_TYPES,
    CHART_COLORS,
    ANIMATION_DURATION,
    BREAKPOINTS
  };