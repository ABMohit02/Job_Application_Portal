const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function diagnose() {
  try {
    console.log('1. Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'diagnostic_' + Date.now() + '@example.com';
    const password = 'password123';

    console.log(`2. Hashing password for ${email}...`);
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ Password hashed');

    console.log('3. Creating User instance...');
    const user = new User({
      name: 'Diagnostic User',
      email: email,
      password: hashedPassword,
      role: 'user'
    });
    console.log('✅ User instance created locally');

    console.log('4. Saving user to database...');
    await user.save();
    console.log('✅ User saved successfully!');

    console.log('5. Verifying user can be found...');
    const found = await User.findOne({ email });
    if (found) {
      console.log('✅ User found in database');
    } else {
      console.log('❌ User NOT found after save');
    }

    // Cleanup
    await User.deleteOne({ email });
    console.log('✅ Diagnostic user deleted');

  } catch (err) {
    console.error('❌ DIAGNOSTIC FAILED!');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    if (err.errors) {
      console.error('Validation Errors:', Object.keys(err.errors).map(k => `${k}: ${err.errors[k].message}`).join(', '));
    }
    console.error('Stack Trace:', err.stack);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

diagnose();
