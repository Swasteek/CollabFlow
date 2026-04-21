const mongoose = require('mongoose');
require('dotenv').config();

async function addRolesToExistingUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const User = require('./models/User');

        // Update all existing users to have 'member' role
        const result = await User.updateMany(
            { role: { $exists: false } }, // Find users without role field
            { $set: { role: 'member' } }  // Set default role
        );

        console.log(`Updated ${result.modifiedCount} users with default role`);

        await mongoose.disconnect();
        console.log('Migration completed');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

addRolesToExistingUsers();