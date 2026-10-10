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
const PORT = 5007;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runPhase6Tests() {
  console.log('--- Starting Phase 6 Statistics API Verification ---');
  await connectDB();

  server = app.listen(PORT, async () => {
    try {
      // 0. Clean up test users
      await User.deleteMany({ email: { $in: ['usera.stats@example.com', 'userb.stats@example.com'] } });

      let json;

      // 1. Unauthenticated request
      let res = await fetch(`${BASE_URL}/tasks/stats`, { method: 'GET' });
      json = await res.json();
      console.log('✔ GET /api/tasks/stats (unauthenticated):', res.status === 401 ? 'PASSED (401)' : `FAILED (${res.status})`);

      // 2. Register User A and User B
      res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Stats User A', email: 'usera.stats@example.com', password: 'password123' })
      });
      let jsonA = await res.json();
      const tokenA = jsonA.token;
      const userAId = jsonA.user._id;

      res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Stats User B', email: 'userb.stats@example.com', password: 'password123' })
      });
      let jsonB = await res.json();
      const tokenB = jsonB.token;
      const userBId = jsonB.user._id;

      // 3. Authenticated user with 0 tasks
      res = await fetch(`${BASE_URL}/tasks/stats`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tokenA}` }
      });
      json = await res.json();
      const emptyStatsMatch = json.data.total === 0 && json.data.todo === 0 && json.data.inProgress === 0 && json.data.completed === 0 && json.data.highPriority === 0;
      console.log('✔ GET /api/tasks/stats (0 tasks):', res.status === 200 && emptyStatsMatch ? 'PASSED (all 0s)' : `FAILED (${res.status})`);

      // 4. Create tasks for User A
      // Task 1: TODO, LOW
      await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
        body: JSON.stringify({ title: 'Task 1', status: 'TODO', priority: 'LOW' })
      });

      // Task 2: TODO, HIGH
      await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
        body: JSON.stringify({ title: 'Task 2', status: 'TODO', priority: 'HIGH' })
      });

      // Task 3: IN_PROGRESS, HIGH
      await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
        body: JSON.stringify({ title: 'Task 3', status: 'IN_PROGRESS', priority: 'HIGH' })
      });

      // Task 4: COMPLETED, MEDIUM
      await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
        body: JSON.stringify({ title: 'Task 4', status: 'COMPLETED', priority: 'MEDIUM' })
      });

      // 5. Query stats for User A
      res = await fetch(`${BASE_URL}/tasks/stats`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tokenA}` }
      });
      json = await res.json();
      const statsA = json.data;
      const statsAMatch = statsA.total === 4 && statsA.todo === 2 && statsA.inProgress === 1 && statsA.completed === 1 && statsA.highPriority === 2;
      console.log('✔ GET /api/tasks/stats (User A 4 tasks):', res.status === 200 && statsAMatch ? 'PASSED' : `FAILED (${JSON.stringify(statsA)})`);

      // 6. Create task for User B (COMPLETED, HIGH)
      await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenB}` },
        body: JSON.stringify({ title: 'User B Task', status: 'COMPLETED', priority: 'HIGH' })
      });

      // 7. Query stats for User B
      res = await fetch(`${BASE_URL}/tasks/stats`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tokenB}` }
      });
      json = await res.json();
      const statsB = json.data;
      const statsBMatch = statsB.total === 1 && statsB.todo === 0 && statsB.inProgress === 0 && statsB.completed === 1 && statsB.highPriority === 1;
      console.log('🔒 SECURITY: GET /api/tasks/stats (User B isolated):', res.status === 200 && statsBMatch ? 'PASSED (User B stats isolated)' : `FAILED (${JSON.stringify(statsB)})`);

      // 8. Re-query stats for User A to confirm isolation remained intact
      res = await fetch(`${BASE_URL}/tasks/stats`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tokenA}` }
      });
      json = await res.json();
      const statsAUnchanged = json.data.total === 4 && json.data.highPriority === 2;
      console.log('🔒 SECURITY: User A stats unchanged after User B actions:', res.status === 200 && statsAUnchanged ? 'PASSED' : `FAILED`);

      // Cleanup
      await Task.deleteMany({ user: { $in: [userAId, userBId] } });
      await User.deleteMany({ _id: { $in: [userAId, userBId] } });

      server.close(() => {
        console.log('--- Phase 6 Statistics API Verification Passed 100% ---');
        process.exit(0);
      });
    } catch (err) {
      console.error('❌ Phase 6 Test Suite Failure:', err);
      if (server) server.close();
      process.exit(1);
    }
  });
}

runPhase6Tests();
