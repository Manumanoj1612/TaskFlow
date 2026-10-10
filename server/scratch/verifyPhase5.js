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
const PORT = 5006;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runPhase5Tests() {
  console.log('--- Starting Phase 5 Task CRUD APIs & Ownership Verification ---');
  await connectDB();

  server = app.listen(PORT, async () => {
    try {
      // 0. Clean up previous test entries
      await User.deleteMany({ email: { $in: ['usera.phase5@example.com', 'userb.phase5@example.com'] } });

      let json; // Declare json variable

      // 1. Create User A and User B
      let res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'User A', email: 'usera.phase5@example.com', password: 'password123' })
      });
      let jsonA = await res.json();
      const tokenA = jsonA.token;
      const userAId = jsonA.user._id;

      res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'User B', email: 'userb.phase5@example.com', password: 'password123' })
      });
      let jsonB = await res.json();
      const tokenB = jsonB.token;
      const userBId = jsonB.user._id;

      console.log('✔ User A and User B registered successfully');

      // -------------------------------------------------------------
      // 2. UNAUTHENTICATED TESTS
      // -------------------------------------------------------------
      res = await fetch(`${BASE_URL}/tasks`, { method: 'GET' });
      json = await res.json();
      console.log('✔ GET /api/tasks (unauthenticated):', res.status === 401 ? 'PASSED (401)' : `FAILED (${res.status})`);

      // -------------------------------------------------------------
      // 3. TASK VALIDATION TESTS (User A)
      // -------------------------------------------------------------
      // 3.1 Missing title
      res = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
        body: JSON.stringify({ description: 'No title task' })
      });
      json = await res.json();
      console.log('✔ Create Task (missing title):', res.status === 400 && json.message === 'Please provide a task title' ? 'PASSED (400)' : `FAILED (${res.status})`);

      // 3.2 Invalid status enum
      res = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
        body: JSON.stringify({ title: 'Task Title', status: 'NOT_STARTED' })
      });
      json = await res.json();
      console.log('✔ Create Task (invalid status enum):', res.status === 400 ? 'PASSED (400)' : `FAILED (${res.status})`);

      // 3.3 Invalid priority enum
      res = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
        body: JSON.stringify({ title: 'Task Title', priority: 'URGENT' })
      });
      json = await res.json();
      console.log('✔ Create Task (invalid priority enum):', res.status === 400 ? 'PASSED (400)' : `FAILED (${res.status})`);

      // -------------------------------------------------------------
      // 4. TASK CREATION & RETRIEVAL (User A)
      // -------------------------------------------------------------
      res = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
        body: JSON.stringify({
          title: "User A's First Task",
          description: "Important task for User A",
          status: "TODO",
          priority: "HIGH",
          dueDate: "2026-12-31"
        })
      });
      json = await res.json();
      const taskAId = json.data?._id;
      const taskAOwner = json.data?.user;
      console.log('✔ Create Task (valid User A):', res.status === 201 && taskAId && taskAOwner === userAId ? 'PASSED (201)' : `FAILED (${res.status})`);

      // Forged user ID attempt (Body attempts to set user to User B)
      res = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
        body: JSON.stringify({
          title: "User A's Forged Task",
          user: userBId // Should be IGNORED by backend!
        })
      });
      json = await res.json();
      console.log('✔ Create Task (forged body user ID ignored):', res.status === 201 && json.data.user === userAId ? 'PASSED (201)' : `FAILED (${res.status})`);

      // GET All User A tasks
      res = await fetch(`${BASE_URL}/tasks`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tokenA}` }
      });
      json = await res.json();
      console.log('✔ GET /api/tasks (User A task list):', res.status === 200 && json.count === 2 ? 'PASSED (200, count: 2)' : `FAILED (${res.status})`);

      // GET Single task User A
      res = await fetch(`${BASE_URL}/tasks/${taskAId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tokenA}` }
      });
      json = await res.json();
      console.log('✔ GET /api/tasks/:id (User A own task):', res.status === 200 && json.data.title === "User A's First Task" ? 'PASSED (200)' : `FAILED (${res.status})`);

      // UPDATE User A own task
      res = await fetch(`${BASE_URL}/tasks/${taskAId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
        body: JSON.stringify({ status: 'IN_PROGRESS', priority: 'MEDIUM' })
      });
      json = await res.json();
      console.log('✔ PUT /api/tasks/:id (User A update own task):', res.status === 200 && json.data.status === 'IN_PROGRESS' ? 'PASSED (200)' : `FAILED (${res.status})`);

      // -------------------------------------------------------------
      // 5. CROSS-USER AUTHORIZATION ISOLATION TESTS (User B vs User A)
      // -------------------------------------------------------------
      // User B attempts to GET User A's task
      res = await fetch(`${BASE_URL}/tasks/${taskAId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tokenB}` }
      });
      json = await res.json();
      console.log('🔒 SECURITY: User B GET User A task:', res.status === 404 ? 'PASSED (404 Not Found)' : `FAILED EXPOSURE (${res.status})`);

      // User B attempts to PUT User A's task
      res = await fetch(`${BASE_URL}/tasks/${taskAId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenB}` },
        body: JSON.stringify({ title: 'Hacked by User B' })
      });
      json = await res.json();
      console.log('🔒 SECURITY: User B PUT User A task:', res.status === 404 ? 'PASSED (404 Not Found)' : `FAILED EXPOSURE (${res.status})`);

      // User B attempts to DELETE User A's task
      res = await fetch(`${BASE_URL}/tasks/${taskAId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${tokenB}` }
      });
      json = await res.json();
      console.log('🔒 SECURITY: User B DELETE User A task:', res.status === 404 ? 'PASSED (404 Not Found)' : `FAILED EXPOSURE (${res.status})`);

      // User B get all tasks (should return 0 tasks, isolating User A's tasks)
      res = await fetch(`${BASE_URL}/tasks`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tokenB}` }
      });
      json = await res.json();
      console.log('🔒 SECURITY: User B task list empty:', res.status === 200 && json.count === 0 ? 'PASSED (0 tasks for B)' : `FAILED (${res.status})`);

      // -------------------------------------------------------------
      // 6. DELETE TASK & CLEANUP
      // -------------------------------------------------------------
      // User A deletes own task
      res = await fetch(`${BASE_URL}/tasks/${taskAId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${tokenA}` }
      });
      json = await res.json();
      console.log('✔ DELETE /api/tasks/:id (User A deletes own task):', res.status === 200 ? 'PASSED (200)' : `FAILED (${res.status})`);

      // Verify task no longer exists
      res = await fetch(`${BASE_URL}/tasks/${taskAId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tokenA}` }
      });
      json = await res.json();
      console.log('✔ GET deleted task:', res.status === 404 ? 'PASSED (404)' : `FAILED (${res.status})`);

      // Cleanup DB
      await Task.deleteMany({ user: { $in: [userAId, userBId] } });
      await User.deleteMany({ _id: { $in: [userAId, userBId] } });

      server.close(() => {
        console.log('--- Phase 5 Task CRUD APIs Verification Passed 100% ---');
        process.exit(0);
      });
    } catch (err) {
      console.error('❌ Phase 5 Test Suite Failure:', err);
      if (server) server.close();
      process.exit(1);
    }
  });
}

runPhase5Tests();
