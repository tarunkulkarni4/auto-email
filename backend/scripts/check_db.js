require('dotenv').config({ path: '../backend/.env' });
const mongoose = require('mongoose');
const UserProfile = require('../backend/models/UserProfile');

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const count = await UserProfile.countDocuments();
    console.log('User profiles count:', count);
    
    const profiles = await UserProfile.find();
    console.log('Profiles:', JSON.stringify(profiles, null, 2));
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
};

checkDB();
