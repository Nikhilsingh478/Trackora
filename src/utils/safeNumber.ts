/**
 * Utility functions to safely handle numeric operations and prevent NaN
 */

export function safeNumber(value: any, defaultValue: number = 0): number {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  
  const num = typeof value === 'number' ? value : parseFloat(value);
  return isNaN(num) || !isFinite(num) ? defaultValue : num;
}

export function isValidNumber(value: any): boolean {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  const num = typeof value === 'number' ? value : parseFloat(value);
  return !isNaN(num) && isFinite(num);
}

export function safePercentage(numerator: any, denominator: any): number {
  const num = safeNumber(numerator, 0);
  const denom = safeNumber(denominator, 0);
  
  if (denom === 0) return 0;
  
  const result = Math.round((num / denom) * 100);
  return safeNumber(result, 0);
}

export function safeAverage(values: any[]): number {
  if (!Array.isArray(values) || values.length === 0) return 0;
  
  const validValues = values.map(v => safeNumber(v, 0)).filter(v => v > 0);
  if (validValues.length === 0) return 0;
  
  const sum = validValues.reduce((acc, val) => acc + val, 0);
  const avg = sum / validValues.length;
  
  return safeNumber(avg, 0);
}

export function safeSum(values: any[]): number {
  if (!Array.isArray(values)) return 0;
  return values.reduce((acc, val) => acc + safeNumber(val, 0), 0);
}

export function safeDivide(numerator: any, denominator: any, defaultValue: number = 0): number {
  const num = safeNumber(numerator, 0);
  const denom = safeNumber(denominator, 0);
  
  if (denom === 0) return defaultValue;
  
  const result = num / denom;
  return safeNumber(result, defaultValue);
}
