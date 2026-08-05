import { describe, it, expect } from 'vitest';
import {
  sanitizeInput,
  normalizePhoneNumber,
  hasAdminAccess,
  validateSecurityHeaders,
  RECOMMENDED_SECURITY_HEADERS,
} from '../src/lib/security';

describe('Website Security Unit Tests', () => {
  describe('XSS Input Sanitization', () => {
    it('should strip script tags from user inputs', () => {
      const malicious = '<script>alert("xss")</script>Hello World';
      const clean = sanitizeInput(malicious);
      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('</script>');
      expect(clean).toContain('Hello World');
    });

    it('should sanitize inline event handlers', () => {
      const malicious = '<img src="x" onerror="alert(1)">';
      const clean = sanitizeInput(malicious);
      expect(clean).not.toContain('onerror=');
    });

    it('should strip javascript: pseudo-protocol URLs', () => {
      const malicious = 'javascript:doEvilThings()';
      const clean = sanitizeInput(malicious);
      expect(clean).not.toContain('javascript:');
    });

    it('should escape HTML angle brackets', () => {
      const raw = '<b>Bold</b>';
      const clean = sanitizeInput(raw);
      expect(clean).toBe('&lt;b&gt;Bold&lt;/b&gt;');
    });
  });

  describe('Phone Number Normalization & Validation', () => {
    it('should convert 10-digit US phone numbers to +1 E.164 format', () => {
      expect(normalizePhoneNumber('(555) 123-4567')).toBe('+15551234567');
      expect(normalizePhoneNumber('555-123-4567')).toBe('+15551234567');
      expect(normalizePhoneNumber('555.123.4567')).toBe('+15551234567');
    });

    it('should handle numbers already including country code', () => {
      expect(normalizePhoneNumber('15551234567')).toBe('+15551234567');
      expect(normalizePhoneNumber('+15551234567')).toBe('+15551234567');
    });

    it('should return empty string for null or empty phone inputs', () => {
      expect(normalizePhoneNumber(null)).toBe('');
      expect(normalizePhoneNumber(undefined)).toBe('');
      expect(normalizePhoneNumber('')).toBe('');
    });
  });

  describe('Role-Based Access Authorization', () => {
    it('should grant access to admin role regardless of email', () => {
      // Email bypass was removed — role column is the only authority
      expect(hasAdminAccess('admin')).toBe(true);
      expect(hasAdminAccess('owner')).toBe(true);
    });

    it('should grant access to admin, owner, and manager roles', () => {
      expect(hasAdminAccess('admin')).toBe(true);
      expect(hasAdminAccess('OWNER')).toBe(true);
      expect(hasAdminAccess('Stage Manager')).toBe(true);
    });

    it('should deny access to regular user roles', () => {
      expect(hasAdminAccess('fan')).toBe(false);
      expect(hasAdminAccess('SERVER')).toBe(false);
      expect(hasAdminAccess(null)).toBe(false);
    });
  });

  describe('Security Headers Compliance', () => {
    it('should validate complete security headers configuration', () => {
      const result = validateSecurityHeaders(RECOMMENDED_SECURITY_HEADERS);
      expect(result.isValid).toBe(true);
      expect(result.missing).toHaveLength(0);
    });

    it('should report missing security headers', () => {
      const incompleteHeaders = {
        'Content-Security-Policy': "default-src 'self'",
      };
      const result = validateSecurityHeaders(incompleteHeaders);
      expect(result.isValid).toBe(false);
      expect(result.missing).toContain('X-Frame-Options');
      expect(result.missing).toContain('X-Content-Type-Options');
    });
  });
});
