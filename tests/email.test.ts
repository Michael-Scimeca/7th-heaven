import { describe, it, expect } from 'vitest';
import { isPublicWebmailDomain, getSendingFromEmail, buildUnsubscribeUrl } from '../src/lib/email';

describe('Email Helper Unit Tests', () => {
  describe('Public Webmail Domain Detection', () => {
    it('should identify unverified public webmail domains requiring Resend fallback', () => {
      expect(isPublicWebmailDomain('band@aol.com')).toBe(true);
      expect(isPublicWebmailDomain('john@gmail.com')).toBe(true);
      expect(isPublicWebmailDomain('user@yahoo.com')).toBe(true);
      expect(isPublicWebmailDomain('test@hotmail.com')).toBe(true);
      expect(isPublicWebmailDomain('fan@comcast.net')).toBe(true);
    });

    it('should allow custom verified domain emails', () => {
      expect(isPublicWebmailDomain('booking@7thheavenband.com')).toBe(false);
      expect(isPublicWebmailDomain('admin@customdomain.io')).toBe(false);
    });

    it('should safely default to onboarding@resend.dev when input is invalid or missing', () => {
      expect(getSendingFromEmail('')).toBe('onboarding@resend.dev');
      expect(getSendingFromEmail(undefined)).toBe('onboarding@resend.dev');
      expect(getSendingFromEmail('fan@aol.com')).toBe('onboarding@resend.dev');
      expect(getSendingFromEmail('info@7thheavenband.com')).toBe('info@7thheavenband.com');
    });
  });

  describe('CAN-SPAM Unsubscribe Link Generator', () => {
    it('should generate valid URL-encoded unsubscribe links', () => {
      const url = buildUnsubscribeUrl('fan+test@gmail.com');
      expect(url).toContain('email=fan%2Btest%40gmail.com');
      expect(url).toContain('/api/newsletter/unsubscribe');
    });
  });
});
