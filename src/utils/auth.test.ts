import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, generateOtp } from './auth.js';

test('hashPassword hashes input consistently and verifyPassword validates', () => {
  const hash = hashPassword('mySecretPass123');
  assert.ok(hash !== 'mySecretPass123');
  assert.equal(verifyPassword('mySecretPass123', hash), true);
  assert.equal(verifyPassword('wrongPass', hash), false);
});

test('generateOtp produces a 6-digit numeric string', () => {
  const otp = generateOtp();
  assert.equal(otp.length, 6);
  assert.ok(/^\d{6}$/.test(otp));
});
