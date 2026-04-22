const axios = require('axios');

async function testPostJob() {
  const baseURL = 'http://localhost:5001';
  
  try {
    // 1. Login to get token
    console.log('Attempting login...');
    const loginRes = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'employer_test@example.com',
      password: 'password123'
    });
    
    const token = loginRes.data.token;
    console.log('Login successful. Token received.');

    // 2. Post a new job
    console.log('Posting a new job...');
    const jobData = {
      title: 'AI/Machine Learning Engineer (API Test)',
      description: 'Test job created via automated script.',
      company: 'FutureAI Labs',
      location: 'Mountain View, CA',
      jobType: 'Full-time',
      experience: '4+ years',
      salary: { min: 150000, max: 200000 },
      skills: ['Python', 'PyTorch', 'TensorFlow']
    };

    const postRes = await axios.post(`${baseURL}/api/jobs`, jobData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (postRes.status === 201) {
      console.log('SUCCESS: Job posted successfully via API!');
      console.log('Job ID:', postRes.data.job._id);
    } else {
      console.error('FAILED: Unexpected status code:', postRes.status);
    }

  } catch (err) {
    console.error('TEST FAILED:', err.response?.data || err.message);
  }
}

testPostJob();
