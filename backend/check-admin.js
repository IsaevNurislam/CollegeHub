const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

db.get("SELECT * FROM users WHERE studentId = '000001'", (err, user) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    return;
  }

  if (!user) {
    console.log('No admin user found');
    db.close();
    return;
  }

  console.log('\n✅ Admin user found:');
  console.log('StudentID:', user.studentId);
  console.log('Name:', user.name);
  console.log('Hash (first 20 chars):', user.password.substring(0, 20) + '...');
  console.log('Hash length:', user.password.length);

  const testPassword = 'Admin@2025';
  const matches = bcrypt.compareSync(testPassword, user.password);
  
  console.log('\nPassword Test:');
  console.log('Test password:', testPassword);
  console.log('Match result:', matches);
  
  if (matches) {
    console.log('\n✅ Password matches! Login should work.');
  } else {
    console.log('\n❌ Password does NOT match! Hash mismatch.');
  }

  db.close();
});
