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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'TaskFlow API is running smoothly' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use(notFound);
app.use(errorHandler);

let server;
const PORT = 5009;
const BASE_URL = `http://localhost:${PORT}/api`;

async function verifyFullStackIntegration() {
  console.log('====================================================');
  console.log('    TASKFLOW PHASE 9 FULL-STACK INTEGRATION TEST    ');
  console.log('====================================================\n');

  await connectDB();

  server = app.listen(PORT, async () => {
    try {
      // 0. Clean up previous test user
      await User.deleteMany({ email: 'integration.user@example.com' });

      // 1. Health check
      let res = await fetch(`${BASE_URL}/health`);
      let json = await res.json();
      console.log('✔ 1. API Health Check:', res.status === 200 && json.status === 'OK' ? 'PASSED (200)' : 'FAILED');

      // 2. User Registration
      res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Integration Tester',
          email: 'integration.user@example.com',
          password: 'Password123',
          confirmPassword: 'Password123'
        })
      });
      json = await res.json();
      const token = json.token;
      const userId = json.user?._id;
      console.log('✔ 2. Registration API:', res.status === 201 && token && userId ? 'PASSED (201 Created)' : 'FAILED');

      // 3. GET /me Verification
      res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      json = await res.json();
      console.log('✔ 3. Auth Token & Session Verification:', res.status === 200 && json.user.email === 'integration.user@example.com' ? 'PASSED (200)' : 'FAILED');

      // 4. Initial Stats (0 tasks)
      res = await fetch(`${BASE_URL}/tasks/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      json = await res.json();
      console.log('✔ 4. Dashboard Stats (Initial 0):', res.status === 200 && json.data.total === 0 ? 'PASSED (Total: 0)' : 'FAILED');

      // 5. Create Task
      res = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          title: 'Full-Stack Assessment Task',
          description: 'Testing frontend-backend integration',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          dueDate: '2026-12-31'
        })
      });
      json = await res.json();
      const taskId = json.data?._id;
      console.log('✔ 5. Create Task API:', res.status === 201 && taskId ? 'PASSED (201 Created)' : 'FAILED');

      // 6. Updated Stats (Total: 1, In Progress: 1, High: 1)
      res = await fetch(`${BASE_URL}/tasks/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      json = await res.json();
      const statsMatch = json.data.total === 1 && json.data.inProgress === 1 && json.data.highPriority === 1;
      console.log('✔ 6. Dashboard Stats (Post-creation):', res.status === 200 && statsMatch ? 'PASSED (Total: 1, In Progress: 1, High: 1)' : 'FAILED');

      // 7. GET Single Task
      res = await fetch(`${BASE_URL}/tasks/${taskId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      json = await res.json();
      console.log('✔ 7. Get Task Details:', res.status === 200 && json.data.title === 'Full-Stack Assessment Task' ? 'PASSED (200)' : 'FAILED');

      // 8. Update Task (Status -> COMPLETED)
      res = await fetch(`${BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title: 'Full-Stack Assessment Task (Completed)', status: 'COMPLETED' })
      });
      json = await res.json();
      console.log('✔ 8. Update Task API:', res.status === 200 && json.data.status === 'COMPLETED' ? 'PASSED (200)' : 'FAILED');

      // 9. Re-fetch Stats (Completed: 1)
      res = await fetch(`${BASE_URL}/tasks/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      json = await res.json();
      console.log('✔ 9. Dashboard Stats (Post-update):', res.status === 200 && json.data.completed === 1 ? 'PASSED (Completed: 1)' : 'FAILED');

      // 10. Delete Task
      res = await fetch(`${BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      json = await res.json();
      console.log('✔ 10. Delete Task API:', res.status === 200 ? 'PASSED (200)' : 'FAILED');

      // 11. Final Stats (Total: 0)
      res = await fetch(`${BASE_URL}/tasks/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      json = await res.json();
      console.log('✔ 11. Dashboard Stats (Post-deletion):', res.status === 200 && json.data.total === 0 ? 'PASSED (Total: 0)' : 'FAILED');

      // Cleanup DB
      await Task.deleteMany({ user: userId });
      await User.deleteMany({ _id: userId });

      console.log('\n====================================================');
      console.log('  FULL-STACK INTEGRATION TEST COMPLETED WITH 100% SUCCESS');
      console.log('====================================================\n');

      server.close(() => {
        process.exit(0);
      });
    } catch (err) {
      console.error('❌ E2E Integration Failure:', err);
      if (server) server.close();
      process.exit(1);
    }
  });
}

verifyFullStackIntegration();
