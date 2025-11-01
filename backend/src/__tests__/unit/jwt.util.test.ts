import { generateToken, verifyToken, decodeToken, TokenPayload } from '../../utils/jwt';
import jwt from 'jsonwebtoken';

describe('JWT Utilities', () => {
  const mockPayload: TokenPayload = {
    userId: 'user-123',
    email: 'test@example.com',
  };

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include payload in the token', () => {
      const token = generateToken(mockPayload);
      const decoded = jwt.decode(token) as TokenPayload;

      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded).toHaveProperty('iat'); // issued at
      expect(decoded).toHaveProperty('exp'); // expiration
    });
  });

  describe('verifyToken', () => {
    it('should verify and return payload for valid token', () => {
      const token = generateToken(mockPayload);
      const verified = verifyToken(token);

      expect(verified.userId).toBe(mockPayload.userId);
      expect(verified.email).toBe(mockPayload.email);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => verifyToken(invalidToken)).toThrow('Invalid or expired token');
    });

    it('should throw error for expired token', () => {
      // Create a token that expires immediately
      const expiredToken = jwt.sign(
        mockPayload,
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '0s' }
      );

      // Wait a tiny bit to ensure it expires
      setTimeout(() => {
        expect(() => verifyToken(expiredToken)).toThrow('Invalid or expired token');
      }, 100);
    });

    it('should throw error for token with wrong secret', () => {
      const tokenWithWrongSecret = jwt.sign(mockPayload, 'wrong-secret', { expiresIn: '15m' });

      expect(() => verifyToken(tokenWithWrongSecret)).toThrow('Invalid or expired token');
    });
  });

  describe('decodeToken', () => {
    it('should decode token without verification', () => {
      const token = generateToken(mockPayload);
      const decoded = decodeToken(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(mockPayload.userId);
      expect(decoded?.email).toBe(mockPayload.email);
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'completely.invalid.token';
      const decoded = decodeToken(invalidToken);

      expect(decoded).toBeNull();
    });

    it('should decode expired token (without verification)', () => {
      const expiredToken = jwt.sign(
        mockPayload,
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '0s' }
      );

      const decoded = decodeToken(expiredToken);

      // Decode should work even for expired tokens
      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(mockPayload.userId);
    });
  });
});
