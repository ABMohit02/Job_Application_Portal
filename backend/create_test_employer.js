const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createEmployer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'employer_test@example.com';
    const password = 'password123';

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        console.log('Test Employer already exists:', email);
        process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name: 'Test Employer',
      email,
      password: hashedPassword,
      role: 'employer',
      company: 'Test Company Inc.'
    });

    await user.save();
    console.log('Successfully created Test Employer account!');
    console.log('Email:', email);
    console.log('Password:', password);

  } catch (err) {
    console.error('Creation failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

createEmployer();
