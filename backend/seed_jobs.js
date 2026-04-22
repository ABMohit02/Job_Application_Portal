const mongoose = require('mongoose');
const Job = require('./models/Job');
const User = require('./models/User');
require('dotenv').config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find an existing user to mark as 'postedBy'
    let user = await User.findOne({ role: 'employer' });
    if (!user) {
        user = await User.findOne({ role: 'admin' });
    }
    if (!user) {
        user = await User.findOne();
    }

    if (!user) {
        console.error('No users found in DB. Please register a user first.');
        process.exit(1);
    }

    console.log('Using user for seeding:', user.email);

    // Clear existing jobs to start fresh
    await Job.deleteMany({});
    console.log('Cleared existing jobs.');

    const jobs = [
      {
        title: 'Senior Accountant',
        description: 'Manage financial records, prepare tax returns, and ensure compliance with regulations.',
        company: 'FinancePro Solutions',
        location: 'Chicago, IL',
        jobType: 'Full-time',
        experience: '5+ years',
        salary: { min: 75000, max: 95000 },
        skills: ['Accounting', 'Audit', 'Tax', 'Excel'],
        postedBy: user._id,
        isActive: true
      },
      {
        title: 'Software Designer / UI/UX',
        description: 'Design intuitive user interfaces and user experiences for complex software products.',
        company: 'DesignFlow Inc.',
        location: 'Remote',
        jobType: 'Contract',
        experience: '3 years',
        salary: { min: 80000, max: 120000 },
        skills: ['Figma', 'Sketch', 'Adobe XD', 'Prototyping'],
        postedBy: user._id,
        isActive: true
      },
      {
        title: 'Full-stack Developer',
        description: 'Develop and maintain web applications using MERN stack.',
        company: 'TechCorp',
        location: 'New York, NY',
        jobType: 'Full-time',
        experience: '2-4 years',
        salary: { min: 90000, max: 130000 },
        skills: ['MongoDB', 'Express', 'React', 'Node.js'],
        postedBy: user._id,
        isActive: true
      },
      {
        title: 'Marketing Specialist',
        description: 'Plan and execute digital marketing campaigns across various social media platforms.',
        company: 'GrowthGenius',
        location: 'Austin, TX',
        jobType: 'Full-time',
        experience: '2 years',
        salary: { min: 60000, max: 80000 },
        skills: ['SEO', 'Google Ads', 'Content Strategy', 'Analytics'],
        postedBy: user._id,
        isActive: true
      },
      {
        title: 'Data Analyst',
        description: 'Analyze large datasets to extract actionable insights for business decision-making.',
        company: 'Insight Analytics',
        location: 'San Francisco, CA',
        jobType: 'Internship',
        experience: 'Entry-level',
        salary: { min: 30000, max: 45000 },
        skills: ['SQL', 'Python', 'Tableau', 'Statistics'],
        postedBy: user._id,
        isActive: true
      },
      {
        title: 'HR Manager',
        description: 'Oversee recruitment, employee relations, and company culture initiatives.',
        company: 'PeopleFirst',
        location: 'Seattle, WA',
        jobType: 'Full-time',
        experience: '7+ years',
        salary: { min: 85000, max: 110000 },
        skills: ['Recruitment', 'Conflict Resolution', 'HRIS', 'Leadership'],
        postedBy: user._id,
        isActive: true
      },
      {
        title: 'Junior Frontend Developer',
        description: 'Help build beautiful user interfaces for our customer-facing applications.',
        company: 'WebWorks',
        location: 'Remote',
        jobType: 'Full-time',
        experience: '1 year',
        salary: { min: 50000, max: 70000 },
        skills: ['HTML', 'CSS', 'JavaScript', 'Vue.js'],
        postedBy: user._id,
        isActive: true
      },
      {
        title: 'Financial Analyst',
        description: 'Analyze financial data and provide recommendations for investment and budgeting.',
        company: 'Global Bank',
        location: 'London, UK',
        jobType: 'Full-time',
        experience: '3 years',
        salary: { min: 65000, max: 85000 },
        skills: ['Finance', 'Modeling', 'Excel', 'Bloomberg'],
        postedBy: user._id,
        isActive: true
      }
    ];

    await Job.insertMany(jobs);
    console.log(`Successfully seeded ${jobs.length} test jobs!`);

  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
