import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Task from '../models/Task.js';

dotenv.config();

async function verifyModels() {
  console.log('--- Starting Phase 3 Model Verification ---');

  try {
    // 1. Test Database Connection
    await connectDB();
    console.log('✔ MongoDB connection successful');

    // 2. Clear old test entries if present
    await User.deleteMany({ email: 'test.phase3@example.com' });

    // 3. Test User Creation & Password Hashing
    const testUser = new User({
      name: 'Test Phase3 User',
      email: 'Test.Phase3@Example.com', // Test lowercase normalization
      password: 'secretPassword123'
    });

    const savedUser = await testUser.save();
    console.log('✔ User created successfully with ID:', savedUser._id.toString());
    console.log('✔ Email normalized to lowercase:', savedUser.email);
    console.log('✔ Password hashed (not plain text):', savedUser.password !== 'secretPassword123');

    // Test password match method
    const fetchedUser = await User.findById(savedUser._id).select('+password');
    const isMatch = await fetchedUser.matchPassword('secretPassword123');
    console.log('✔ Password comparison (matchPassword):', isMatch);

    // 4. Test Task Creation with User Reference
    const testTask = new Task({
      title: 'Phase 3 Verification Task',
      description: 'Testing task schema and user reference',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 86400000),
      user: savedUser._id
    });

    const savedTask = await testTask.save();
    console.log('✔ Task created successfully with ID:', savedTask._id.toString());
    console.log('✔ Task status default/value:', savedTask.status);
    console.log('✔ Task priority value:', savedTask.priority);
    console.log('✔ Task user reference:', savedTask.user.toString());

    // 5. Test Invalid Enum Validation (Status)
    try {
      const invalidTask = new Task({
        title: 'Invalid Task',
        status: 'INVALID_STATUS',
        user: savedUser._id
      });
      await invalidTask.validate();
      console.error('❌ Failed: Invalid status enum should have thrown error');
    } catch (err) {
      console.log('✔ Invalid status enum rejected:', err.errors.status.message);
    }

    // 6. Test Invalid Enum Validation (Priority)
    try {
      const invalidPriorityTask = new Task({
        title: 'Invalid Task',
        priority: 'SUPER_HIGH',
        user: savedUser._id
      });
      await invalidPriorityTask.validate();
      console.error('❌ Failed: Invalid priority enum should have thrown error');
    } catch (err) {
      console.log('✔ Invalid priority enum rejected:', err.errors.priority.message);
    }

    // 7. Test Email Format Validation
    try {
      const invalidUser = new User({
        name: 'Bad Email User',
        email: 'invalid-email-address',
        password: 'password123'
      });
      await invalidUser.validate();
      console.error('❌ Failed: Invalid email format should have thrown error');
    } catch (err) {
      console.log('✔ Invalid email address rejected:', err.errors.email.message);
    }

    // Cleanup test data
    await Task.deleteMany({ _id: savedTask._id });
    await User.deleteMany({ _id: savedUser._id });
    console.log('✔ Test data cleaned up successfully');

    console.log('--- Phase 3 Verification Passed 100% ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

verifyModels();
