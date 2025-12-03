#!/usr/bin/env node
/**
 * Seed Admin User Script
 * Usage: node backend/seed-admin.js
 * 
 * This script creates the admin user directly in the SQLite database.
 * Use this when you need to bootstrap the database without using the API.
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.sqlite');

console.log('🔄 Seeding admin user...');
console.log('Database path:', DB_PATH);

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
    process.exit(1);
  }
  console.log('✓ Connected to database');
});

const studentId = '000001';
const password = 'Admin@2025';
const name = 'Админ Колледжа';
const role = 'Администратор';
const avatar = 'АК';

// Hash the password
const hash = bcrypt.hashSync(password, 10);

console.log('\nAdmin details:');
console.log('  studentId:', studentId);
console.log('  password:', password);
console.log('  name:', name);
console.log('  hash (first 20 chars):', hash.substring(0, 20) + '...');

// Delete existing admin if any
db.run('DELETE FROM users WHERE studentId = ?', [studentId], (err) => {
  if (err) {
    console.error('❌ Error deleting old admin:', err.message);
    db.close();
    process.exit(1);
  }
  console.log('✓ Old admin user deleted (if existed)');

  // Insert new admin
  db.run(
    `INSERT INTO users (studentId, name, role, avatar, password, isAdmin, joinedClubs, joinedProjects)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [studentId, name, role, avatar, hash, 1, '[]', '[]'],
    (err) => {
      if (err) {
        console.error('❌ Error inserting admin:', err.message);
        db.close();
        process.exit(1);
      }
      console.log('✅ Admin user created successfully!');

      // Verify
      db.get(
        'SELECT studentId, name, password FROM users WHERE studentId = ?',
        [studentId],
        (err, row) => {
          if (err || !row) {
            console.error('❌ Verification failed:', err?.message);
            db.close();
            process.exit(1);
          }

          const matches = bcrypt.compareSync(password, row.password);
          console.log('\n✓ Verification:');
          console.log('  User found:', row.name);
          console.log('  Password hash valid:', matches ? '✅ YES' : '❌ NO');

          if (matches) {
            console.log('\n✅ You can now login with:');
            console.log('  studentId: ' + studentId);
            console.log('  password: ' + password);
          }

          db.close();
          process.exit(matches ? 0 : 1);
        }
      );
    }
  );
});
