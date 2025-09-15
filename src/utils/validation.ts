export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message?: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export const validateField = (value: any, rule: ValidationRule): string | null => {
  // Required validation
  if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return rule.message || 'This field is required';
  }

  // Skip other validations if field is empty and not required
  if (!value || (typeof value === 'string' && !value.trim())) {
    return null;
  }

  const stringValue = String(value);

  // Min length validation
  if (rule.minLength && stringValue.length < rule.minLength) {
    return rule.message || `Minimum ${rule.minLength} characters required`;
  }

  // Max length validation
  if (rule.maxLength && stringValue.length > rule.maxLength) {
    return rule.message || `Maximum ${rule.maxLength} characters allowed`;
  }

  // Pattern validation
  if (rule.pattern && !rule.pattern.test(stringValue)) {
    return rule.message || 'Invalid format';
  }

  // Custom validation
  if (rule.custom && !rule.custom(value)) {
    return rule.message || 'Invalid value';
  }

  return null;
};

export const validateForm = (data: Record<string, any>, schema: ValidationSchema): ValidationErrors => {
  const errors: ValidationErrors = {};

  Object.keys(schema).forEach(field => {
    const error = validateField(data[field], schema[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};

// Common validation patterns
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  studentId: /^[A-Z0-9]{6,12}$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
};

// Pre-defined validation schemas
export const authValidationSchema: ValidationSchema = {
  email: {
    required: true,
    pattern: validationPatterns.email,
    message: 'Please enter a valid email address'
  },
  password: {
    required: true,
    minLength: 6,
    message: 'Password must be at least 6 characters long'
  },
  full_name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    message: 'Full name must be between 2 and 50 characters'
  },
  student_id: {
    pattern: validationPatterns.studentId,
    message: 'Student ID must be 6-12 characters (letters and numbers only)'
  }
};

export const sessionValidationSchema: ValidationSchema = {
  class_name: {
    required: true,
    minLength: 3,
    maxLength: 100,
    message: 'Class name must be between 3 and 100 characters'
  },
  location: {
    maxLength: 200,
    message: 'Location must be less than 200 characters'
  }
};

export const activityValidationSchema: ValidationSchema = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 100,
    message: 'Title must be between 3 and 100 characters'
  },
  description: {
    maxLength: 500,
    message: 'Description must be less than 500 characters'
  },
  duration_minutes: {
    custom: (value) => !value || (Number(value) >= 5 && Number(value) <= 480),
    message: 'Duration must be between 5 and 480 minutes'
  }
};