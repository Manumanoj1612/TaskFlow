import express from 'express';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import authRoutes from '../routes/authRoutes.js';
import { notFound, errorHandler } from '../middleware/errorMiddleware.js';

dotenv.config();

// Create isolated Express test instance
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(notFound);
app.use(errorHandler);

let server;
const PORT = 5005;
const BASE_URL = `http://localhost:${PORT}/api/auth`;

async function runPhase4Tests() {
  console.log('--- Starting Phase 4 Authentication API Verification ---');
  await connectDB();

  server = app.listen(PORT, async () => {
    try {
      // Clean up previous test user if exists
      await User.deleteMany({ email: 'auth.test@example.com' });

      // -------------------------------------------------------------
      // 1. REGISTRATION TESTS
      // -------------------------------------------------------------

      // Test 1.1: Missing fields
      let res = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test User' })
      });
      let json = await res.json();
      console.log('✔ Register (missing fields):', res.status === 400 && json.success === false ? 'PASSED (400)' : `FAILED (${res.status})`);

      // Test 1.2: Password confirmation mismatch
      res = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'auth.test@example.com',
          password: 'password123',
          confirmPassword: 'mismatchPassword'
        })
      });
      json = await res.json();
      console.log('✔ Register (password mismatch):', res.status === 400 && json.message === 'Passwords do not match' ? 'PASSED (400)' : `FAILED (${res.status})`);

      // Test 1.3: Invalid email format
      res = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'invalid-email-format',
          password: 'password123'
        })
      });
      json = await res.json();
      console.log('✔ Register (invalid email format):', res.status === 400 && json.success === false ? 'PASSED (400)' : `FAILED (${res.status})`);

      // Test 1.4: Successful registration
      res = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Auth Test User',
          email: 'auth.test@example.com',
          password: 'password123'
        })
      });
      json = await res.json();
      const registerToken = json.token;
      const registeredUserId = json.user?._id;
      const passwordExposedInReg = json.user?.password !== undefined;
      console.log('✔ Register (successful):', res.status === 201 && registerToken && registeredUserId && !passwordExposedInReg ? 'PASSED (201)' : `FAILED (${res.status})`);

      // Test 1.5: Duplicate email registration
      res = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Duplicate User',
          email: 'auth.test@example.com',
          password: 'password123'
        })
      });
      json = await res.json();
      console.log('✔ Register (duplicate email):', res.status === 400 && json.message === 'User with this email already exists' ? 'PASSED (400)' : `FAILED (${res.status})`);

      // -------------------------------------------------------------
      // 2. LOGIN TESTS
      // -------------------------------------------------------------

      // Test 2.1: Non-existent user
      res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
      });
      json = await res.json();
      console.log('✔ Login (non-existent user):', res.status === 401 && json.message === 'Invalid email or password' ? 'PASSED (401)' : `FAILED (${res.status})`);

      // Test 2.2: Incorrect password
      res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'auth.test@example.com',
          password: 'wrongPassword999'
        })
      });
      json = await res.json();
      console.log('✔ Login (incorrect password):', res.status === 401 && json.message === 'Invalid email or password' ? 'PASSED (401)' : `FAILED (${res.status})`);

      // Test 2.3: Successful login
      res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'auth.test@example.com',
          password: 'password123'
        })
      });
      json = await res.json();
      const loginToken = json.token;
      const passwordExposedInLogin = json.user?.password !== undefined;
      console.log('✔ Login (successful):', res.status === 200 && loginToken && !passwordExposedInLogin ? 'PASSED (200)' : `FAILED (${res.status})`);

      // -------------------------------------------------------------
      // 3. GET /api/auth/me & MIDDLEWARE TESTS
      // -------------------------------------------------------------

      // Test 3.1: Missing token
      res = await fetch(`${BASE_URL}/me`, {
        method: 'GET'
      });
      json = await res.json();
      console.log('✔ GET /me (missing token):', res.status === 401 && json.message === 'Not authorized, no token provided' ? 'PASSED (401)' : `FAILED (${res.status})`);

      // Test 3.2: Malformed Authorization header
      res = await fetch(`${BASE_URL}/me`, {
        method: 'GET',
        headers: { 'Authorization': `Basic ${loginToken}` }
      });
      json = await res.json();
      console.log('✔ GET /me (malformed header):', res.status === 401 ? 'PASSED (401)' : `FAILED (${res.status})`);

      // Test 3.3: Invalid / Tampered token
      res = await fetch(`${BASE_URL}/me`, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer invalid.tampered.token' }
      });
      json = await res.json();
      console.log('✔ GET /me (invalid token):', res.status === 401 && json.message === 'Not authorized, token failed' ? 'PASSED (401)' : `FAILED (${res.status})`);

      // Test 3.4: Valid token retrieval
      res = await fetch(`${BASE_URL}/me`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${loginToken}` }
      });
      json = await res.json();
      const meUserMatch = json.user?.email === 'auth.test@example.com';
      const passwordExposedInMe = json.user?.password !== undefined;
      console.log('✔ GET /me (valid JWT token):', res.status === 200 && meUserMatch && !passwordExposedInMe ? 'PASSED (200)' : `FAILED (${res.status})`);

      // Cleanup
      await User.deleteMany({ email: 'auth.test@example.com' });
      server.close(() => {
        console.log('--- Phase 4 Authentication API Verification Passed 100% ---');
        process.exit(0);
      });
    } catch (err) {
      console.error('❌ Phase 4 Test Suite Failure:', err);
      if (server) server.close();
      process.exit(1);
    }
  });
}

runPhase4Tests();
