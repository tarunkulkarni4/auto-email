require('dotenv').config({ path: '../backend/.env' });
const mongoose = require('mongoose');
const UserProfile = require('../backend/models/UserProfile');

const checkDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('Connecting to:', uri);
    await mongoose.connect(uri);
    
    const count = await UserProfile.countDocuments();
    console.log(`\nFound ${count} profiles in db.`);
    
    const profiles = await UserProfile.find();
    profiles.forEach((p, i) => {
      console.log(`\n--- Profile ${i+1} ---`);
      console.log('ID:', p._id);
      console.log('Name:', p.name);
      console.log('Email:', p.email);
      console.log('Resume:', p.resumeOriginalName || 'None');
    });
    
    // Clean up extras
    if (count > 1) {
       console.log('\nDeleting all but the newest profile...');
       const newest = await UserProfile.findOne().sort({ updatedAt: -1 });
       await UserProfile.deleteMany({ _id: { $ne: newest._id } });
       console.log('Cleanup done. Remaining profile:', newest.name);
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
  }
};

checkDB();
