import { describe, it, expect, beforeAll } from 'vitest';
import { api } from './utils/client';

describe('User API (E2E)', () => {
  let authToken = '';
  const testUser = {
    name: `User Tester ${Date.now()}`,
    email: `user-${Date.now()}@example.com`,
    password: 'password123',
  };

  beforeAll(async () => {
    // Register the user to get a token
    const res = await api('/auth/register', {
      method: 'POST',
      body: testUser,
    });
    authToken = res.data.token;
  });

  it('GET /user - Should fetch the user profile', async () => {
    const res = await api('/user', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log("PROFILE RESPONSE:", res);
    expect(res.message).toBe('Profile fetched successfully');
    expect(res.data.user.name).toBe(testUser.name);
    expect(res.data.user.email).toBe(testUser.email);
  });

  it('PUT /user - Should update the user profile', async () => {
    const updatedName = 'Updated Name 123';
    const res = await api('/user', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${authToken}` },
      body: { name: updatedName },
    });
    expect(res.message).toBe('Profile updated successfully');

    // Verify it was updated
    const fetchRes = await api('/user', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(fetchRes.data.user.name).toBe(updatedName);
  });

  it('GET /user/redirects - Should fetch the user urls (empty initially)', async () => {
    const res = await api('/user/redirects', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.message).toBe('URLs fetched successfully');
    expect(Array.isArray(res.data.items)).toBe(true);
  });
});
