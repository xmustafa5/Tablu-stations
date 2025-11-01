import { hashPassword, comparePassword } from '../../utils/password';

describe('Password Utilities', () => {
  const plainPassword = 'MySecurePassword123!';

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const hashedPassword = await hashPassword(plainPassword);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword.length).toBeGreaterThan(0);
      expect(hashedPassword).toMatch(/^\$2[aby]\$/); // bcrypt hash format
    });

    it('should generate different hashes for the same password', async () => {
      const hash1 = await hashPassword(plainPassword);
      const hash2 = await hashPassword(plainPassword);

      expect(hash1).not.toBe(hash2); // Due to salt
    });

    it('should hash different passwords differently', async () => {
      const hash1 = await hashPassword('password1');
      const hash2 = await hashPassword('password2');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password and hash', async () => {
      const hashedPassword = await hashPassword(plainPassword);
      const isMatch = await comparePassword(plainPassword, hashedPassword);

      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const hashedPassword = await hashPassword(plainPassword);
      const isMatch = await comparePassword('WrongPassword123!', hashedPassword);

      expect(isMatch).toBe(false);
    });

    it('should return false for invalid hash', async () => {
      const isMatch = await comparePassword(plainPassword, 'invalid-hash');

      expect(isMatch).toBe(false);
    });

    it('should be case-sensitive', async () => {
      const hashedPassword = await hashPassword('Password123');
      const isMatch = await comparePassword('password123', hashedPassword);

      expect(isMatch).toBe(false);
    });

    it('should handle empty strings', async () => {
      const hashedPassword = await hashPassword('');
      const isMatch = await comparePassword('', hashedPassword);

      expect(isMatch).toBe(true);
    });
  });

  describe('Security', () => {
    it('should produce hashes of reasonable length', async () => {
      const hashedPassword = await hashPassword(plainPassword);

      // Bcrypt hashes are typically 60 characters
      expect(hashedPassword.length).toBe(60);
    });

    it('should handle long passwords', async () => {
      const longPassword = 'a'.repeat(100);
      const hashedPassword = await hashPassword(longPassword);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword.length).toBe(60);

      const isMatch = await comparePassword(longPassword, hashedPassword);
      expect(isMatch).toBe(true);
    });

    it('should handle special characters', async () => {
      const specialPassword = '!@#$%^&*()_+-={}[]|\\:";\'<>?,./ ';
      const hashedPassword = await hashPassword(specialPassword);
      const isMatch = await comparePassword(specialPassword, hashedPassword);

      expect(isMatch).toBe(true);
    });

    it('should handle unicode characters', async () => {
      const unicodePassword = 'пароль密码🔐';
      const hashedPassword = await hashPassword(unicodePassword);
      const isMatch = await comparePassword(unicodePassword, hashedPassword);

      expect(isMatch).toBe(true);
    });
  });
});
