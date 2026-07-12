import mongoose from 'mongoose';
import { env } from './config/env.js';
import { InstitutionModel } from './models/Institution.js';
import { UserModel } from './models/User.js';

async function run() {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to MongoDB.');
  
  const institutions = await InstitutionModel.find({});
  console.log('\n--- Institutions ---');
  for (const inst of institutions) {
    console.log(`ID: ${inst._id}, LegalName: ${inst.legalName}, Display: ${inst.displayName}, Wallet: ${inst.walletAddress}`);
  }

  const users = await UserModel.find({});
  console.log('\n--- Users ---');
  for (const u of users) {
    console.log(`ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, Wallet: ${u.walletAddress}`);
  }
  
  await mongoose.disconnect();
}

run().catch(console.error);
