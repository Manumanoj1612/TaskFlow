import express from 'express';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Task from '../models/Task.js';
import authRoutes from '../routes/authRoutes.js';
import taskRoutes from '../routes/taskRoutes.js';
import { notFound, errorHandler } from '../middleware/errorMiddleware.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use(notFound);
app.use(errorHandler);

let server;
const PORT = 5008;
const BASE_URL = `http://localhost:${PORT}/api`;

const testResults = [];

function recordTest(category, name, passed, details = '') {
  testResults.push({ category, name, passed, details });
  const statusSymbol = passed ? '✔ PASSED' : '❌ FAILED';
  console.log(`[${category}] ${name}: ${statusSymbol} ${details ? `(${details})` : ''}`);
}

async function runPhase7MasterTestSuite() {
  console.log('====================================================');
  console.log('       TASKFLOW PHASE 7 MASTER BACKEND TEST SUITE   ');
  console.log('====================================================\n');

  await connectDB();

  server = app.listen(PORT, async () => {
    try {
      // Cleanup previous test users
      await User.deleteMany({ email: { $in: ['usera.phase7@example.com', 'userb.phase7@example.com', 'temp.phase7@example.com'] } });

      let res, json;

      // ===================================================
      // 1. AUTHENTICATION TESTS
      // ===================================================

      // 1.1 Register: Valid
      res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'User A Phase7', email: 'usera.phase7@example.com', password: 'password123' })
      });
      json = await res.json();
      const tokenA = json.token;
      const userAId = json.user?._id;
      const noPasswordInReg = json.user?.password === undefined;
      recordTest('AUTH', 'Register - Valid user', res.status === 201 && tokenA && noPasswordInReg, '201 Created');

      // 1.2 Register: User B
      res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'User B Phase7', email: 'userb.phase7@example.com', password: 'password123' })
      });
      json = await res.json();
      const tokenB = json.token;
      const userBId = json.user?._id;
      recordTest('AUTH', 'Register - User B creation', res.status === 201 && tokenB, '201 Created');

      // 1.3 Register: Missing name
      res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'noname@example.com', password: 'password123' })
      });
      recordTest('AUTH', 'Register - Missing name', res.status === 400, '400 Bad Request');

      // 1.4 Register: Missing email
      res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'No Email', password: 'password123' })
      });
      recordTest('AUTH', 'Register - Missing email', res.status === 400, '400 Bad Request');

      // 1.5 Register: Missing password
      res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'No Password', email: 'nopassword@example.com' })
      });
      recordTest('AUTH', 'Register - Missing password', res.status === 400, '400 Bad Request');

      // 1.6 Register: Invalid email format
      res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Bad Email', email: 'invalid-email-format', password: 'password123' })
      });
      recordTest('AUTH', 'Register - Invalid email format', res.status === 400, '400 Bad Request');

      // 1.7 Register: Duplicate email
      res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Duplicate User', email: 'usera.phase7@example.com', password: 'password123' })
      });
      recordTest('AUTH', 'Register - Duplicate email', res.status === 400, '400 Bad Request');

      // 1.8 Register: Password confirmation mismatch
      res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Mismatch', email: 'mismatch@example.com', password: 'password123', confirmPassword: 'wrong123' })
      });
      recordTest('AUTH', 'Register - Password mismatch', res.status === 400, '400 Bad Request');

      // 1.9 Login: Valid credentials
      res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'usera.phase7@example.com', password: 'password123' })
      });
      json = await res.json();
      const loginTokenA = json.token;
      const noPasswordInLogin = json.user?.password === undefined;
      recordTest('AUTH', 'Login - Valid credentials', res.status === 200 && loginTokenA && noPasswordInLogin, '200 OK');

      // 1.10 Login: Incorrect password
      res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'usera.phase7@example.com', password: 'wrongPassword99' })
      });
      recordTest('AUTH', 'Login - Incorrect password', res.status === 401, '401 Unauthorized');

      // 1.11 Login: Non-existent email
      res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'nonexistent@example.com', password: 'password123' })
      });
      recordTest('AUTH', 'Login - Non-existent email', res.status === 401, '401 Unauthorized');

      // 1.12 Login: Missing credentials
      res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'usera.phase7@example.com' })
      });
      recordTest('AUTH', 'Login - Missing credentials', res.status === 400, '400 Bad Request');

      // 1.13 GET /me: Valid JWT
      res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${tokenA}` }
      });
      json = await res.json();
      const meMatch = json.user?.email === 'usera.phase7@example.com' && json.user?.password === undefined;
      recordTest('AUTH', 'GET /me - Valid JWT token', res.status === 200 && meMatch, '200 OK');

      // 1.14 GET /me: Missing JWT
      res = await fetch(`${BASE_URL}/auth/me`);
      recordTest('AUTH', 'GET /me - Missing token', res.status === 401, '401 Unauthorized');

      // 1.15 GET /me: Invalid JWT
      res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { 'Authorization': 'Bearer invalid.jwt.token' }
      });
      recordTest('AUTH', 'GET /me - Invalid token', res.status === 401, '401 Unauthorized');

      // 1.16 GET /me: Malformed header
      res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Basic ${tokenA}` }
      });
      recordTest('AUTH', 'GET /me - Malformed header format', res.status === 401, '401 Unauthorized');

      // ===================================================
      // 2. TASK CRUD TESTS
      // ===================================================

      // 2.1 Create Task: Valid (User A)
      res = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
        body: JSON.stringify({ title: 'Task A1', description: 'Desc A1', status: 'TODO', priority: 'HIGH' })
      });
      json = await res.json();
      const taskA1Id = json.data?._id;
      recordTest('TASK_CRUD', 'Create Task - Valid task', res.status === 201 && taskA1Id && json.data.user === userAId, '201 Created');

      // Create additional tasks for User A (Total 5 tasks for User A)
      await fetch(`${BASE_URL}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` }, body: JSON.stringify({ title: 'Task A2', status: 'TODO', priority: 'MEDIUM' }) });
      await fetch(`${BASE_URL}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` }, body: JSON.stringify({ title: 'Task A3', status: 'IN_PROGRESS', priority: 'HIGH' }) });
      await fetch(`${BASE_URL}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` }, body: JSON.stringify({ title: 'Task A4', status: 'IN_PROGRESS', priority: 'LOW' }) });
      await fetch(`${BASE_URL}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` }, body: JSON.stringify({ title: 'Task A5', status: 'COMPLETED', priority: 'MEDIUM' }) });

      // Create 10 tasks for User B (Total 10 tasks for User B)
      for (let i = 1; i <= 10; i++) {
        await fetch(`${BASE_URL}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenB}` },
          body: JSON.stringify({ title: `Task B${i}`, status: i <= 5 ? 'TODO' : 'COMPLETED', priority: i % 2 === 0 ? 'HIGH' : 'LOW' })
        });
      }

      // 2.2 Create Task: Missing title
      res = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
        body: JSON.stringify({ description: 'No title' })
      });
      recordTest('TASK_CRUD', 'Create Task - Missing title', res.status === 400, '400 Bad Request');

      // 2.3 Create Task: Invalid status
      res = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
        body: JSON.stringify({ title: 'Bad Status', status: 'INVALID_STATUS' })
      });
      recordTest('TASK_CRUD', 'Create Task - Invalid status enum', res.status === 400, '400 Bad Request');

      // 2.4 Create Task: Invalid priority
      res = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
        body: JSON.stringify({ title: 'Bad Priority', priority: 'INVALID_PRIORITY' })
      });
      recordTest('TASK_CRUD', 'Create Task - Invalid priority enum', res.status === 400, '400 Bad Request');

      // 2.5 Create Task: No authentication
      res = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Unauth Task' })
      });
      recordTest('TASK_CRUD', 'Create Task - No authentication', res.status === 401, '401 Unauthorized');

      // 2.6 GET All Tasks: Authenticated User A (5 tasks)
      res = await fetch(`${BASE_URL}/tasks`, {
        headers: { 'Authorization': `Bearer ${tokenA}` }
      });
      json = await res.json();
      recordTest('TASK_CRUD', 'GET /tasks - Authenticated user task list', res.status === 200 && json.count === 5, '200 OK, count: 5');

      // 2.7 GET All Tasks: Unauthenticated
      res = await fetch(`${BASE_URL}/tasks`);
      recordTest('TASK_CRUD', 'GET /tasks - Unauthenticated', res.status === 401, '401 Unauthorized');

      // 2.8 GET Single Task: Valid own task
      res = await fetch(`${BASE_URL}/tasks/${taskA1Id}`, {
        headers: { 'Authorization': `Bearer ${tokenA}` }
      });
      json = await res.json();
      recordTest('TASK_CRUD', 'GET /tasks/:id - Valid own task', res.status === 200 && json.data.title === 'Task A1', '200 OK');

      // 2.9 GET Single Task: Invalid ObjectId
      res = await fetch(`${BASE_URL}/tasks/invalid-object-id-123`, {
        headers: { 'Authorization': `Bearer ${tokenA}` }
      });
      recordTest('TASK_CRUD', 'GET /tasks/:id - Invalid ObjectId format', res.status === 400, '400 Bad Request');

      // 2.10 GET Single Task: Non-existent task ID
      res = await fetch(`${BASE_URL}/tasks/60d5ecb8b3b3a32f88e1a1a1`, {
        headers: { 'Authorization': `Bearer ${tokenA}` }
      });
      recordTest('TASK_CRUD', 'GET /tasks/:id - Non-existent task ID', res.status === 404, '404 Not Found');

      // 2.11 PUT Task: Update own task (Task A1 status updated to IN_PROGRESS)
      res = await fetch(`${BASE_URL}/tasks/${taskA1Id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
        body: JSON.stringify({ title: 'Task A1 Updated', status: 'IN_PROGRESS' })
      });
      json = await res.json();
      recordTest('TASK_CRUD', 'PUT /tasks/:id - Update own task', res.status === 200 && json.data.title === 'Task A1 Updated' && json.data.status === 'IN_PROGRESS', '200 OK');

      // 2.12 PUT Task: Invalid ObjectId
      res = await fetch(`${BASE_URL}/tasks/invalid-object-id-123`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
        body: JSON.stringify({ title: 'Task Title' })
      });
      recordTest('TASK_CRUD', 'PUT /tasks/:id - Invalid ObjectId format', res.status === 400, '400 Bad Request');

      // 2.13 PUT Task: Non-existent task
      res = await fetch(`${BASE_URL}/tasks/60d5ecb8b3b3a32f88e1a1a1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
        body: JSON.stringify({ title: 'Task Title' })
      });
      recordTest('TASK_CRUD', 'PUT /tasks/:id - Non-existent task', res.status === 404, '404 Not Found');

      // 2.14 DELETE Task: Invalid ObjectId
      res = await fetch(`${BASE_URL}/tasks/invalid-object-id-123`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${tokenA}` }
      });
      recordTest('TASK_CRUD', 'DELETE /tasks/:id - Invalid ObjectId format', res.status === 400, '400 Bad Request');

      // 2.15 DELETE Task: Non-existent task
      res = await fetch(`${BASE_URL}/tasks/60d5ecb8b3b3a32f88e1a1a1`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${tokenA}` }
      });
      recordTest('TASK_CRUD', 'DELETE /tasks/:id - Non-existent task', res.status === 404, '404 Not Found');

      // ===================================================
      // 3. AUTHORIZATION & DATA ISOLATION TESTS
      // ===================================================

      // 3.1 User B attempts to GET User A's task
      res = await fetch(`${BASE_URL}/tasks/${taskA1Id}`, {
        headers: { 'Authorization': `Bearer ${tokenB}` }
      });
      recordTest('SECURITY', 'User B GET User A task (cross-user isolation)', res.status === 404, '404 Not Found');

      // 3.2 User B attempts to PUT User A's task
      res = await fetch(`${BASE_URL}/tasks/${taskA1Id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenB}` },
        body: JSON.stringify({ title: 'Hacked Title' })
      });
      recordTest('SECURITY', 'User B PUT User A task (cross-user isolation)', res.status === 404, '404 Not Found');

      // 3.3 User B attempts to DELETE User A's task
      res = await fetch(`${BASE_URL}/tasks/${taskA1Id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${tokenB}` }
      });
      recordTest('SECURITY', 'User B DELETE User A task (cross-user isolation)', res.status === 404, '404 Not Found');

      // 3.4 Forged body user ID attempt
      res = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
        body: JSON.stringify({ title: 'Forged Task', user: userBId })
      });
      json = await res.json();
      recordTest('SECURITY', 'Forged body user ID bound strictly to token owner', res.status === 201 && json.data.user === userAId, 'Bound to User A');

      // Delete the forged task
      await fetch(`${BASE_URL}/tasks/${json.data._id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${tokenA}` } });

      // ===================================================
      // 4. STATISTICS API TESTS
      // ===================================================

      // 4.1 User A stats (5 tasks: 1 TODO, 3 IN_PROGRESS, 1 COMPLETED, 2 HIGH priority)
      res = await fetch(`${BASE_URL}/tasks/stats`, {
        headers: { 'Authorization': `Bearer ${tokenA}` }
      });
      json = await res.json();
      const statsA = json.data;
      const statsAPassed = statsA.total === 5 && statsA.todo === 1 && statsA.inProgress === 3 && statsA.completed === 1 && statsA.highPriority === 2;
      recordTest('STATS', 'User A stats accuracy (5 tasks)', res.status === 200 && statsAPassed, `Total: ${statsA.total}, TODO: ${statsA.todo}, IN_PROGRESS: ${statsA.inProgress}`);

      // 4.2 User B stats (10 tasks)
      res = await fetch(`${BASE_URL}/tasks/stats`, {
        headers: { 'Authorization': `Bearer ${tokenB}` }
      });
      json = await res.json();
      const statsB = json.data;
      const statsBPassed = statsB.total === 10 && statsB.todo === 5 && statsB.completed === 5 && statsB.highPriority === 5;
      recordTest('STATS', 'User B stats accuracy (10 tasks - User A isolated)', res.status === 200 && statsBPassed, `Total: ${statsB.total}, Expected: 10`);

      // 4.3 Unauthenticated stats request
      res = await fetch(`${BASE_URL}/tasks/stats`);
      recordTest('STATS', 'GET /tasks/stats - Unauthenticated', res.status === 401, '401 Unauthorized');

      // ===================================================
      // 5. DELETE & CLEANUP TESTS
      // ===================================================

      // 5.1 User A deletes task A1
      res = await fetch(`${BASE_URL}/tasks/${taskA1Id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${tokenA}` }
      });
      recordTest('TASK_CRUD', 'DELETE /tasks/:id - Delete own task', res.status === 200, '200 OK');

      // Cleanup remaining test tasks & users
      await Task.deleteMany({ user: { $in: [userAId, userBId] } });
      await User.deleteMany({ _id: { $in: [userAId, userBId] } });

      // ===================================================
      // TEST RESULTS SUMMARY
      // ===================================================
      const totalTests = testResults.length;
      const passedTests = testResults.filter(t => t.passed).length;
      const failedTests = testResults.filter(t => !t.passed).length;

      console.log('\n====================================================');
      console.log(`  MASTER TEST SUITE SUMMARY: ${passedTests}/${totalTests} PASSED`);
      console.log('====================================================\n');

      server.close(() => {
        if (failedTests === 0) {
          console.log('🎉 ALL BACKEND TESTS PASSED WITH 100% SUCCESS!');
          process.exit(0);
        } else {
          console.error(`❌ ${failedTests} TESTS FAILED!`);
          process.exit(1);
        }
      });
    } catch (err) {
      console.error('❌ Unexpected Master Test Suite Crash:', err);
      if (server) server.close();
      process.exit(1);
    }
  });
}

runPhase7MasterTestSuite();
