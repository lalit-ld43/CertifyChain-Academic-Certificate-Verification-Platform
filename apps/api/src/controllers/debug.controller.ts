import type { Request, Response } from 'express';
import { randomUUID, createHash } from 'crypto';
import {
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  Memo,
  Keypair,
  Horizon,
} from '@stellar/stellar-sdk';
import { UserModel } from '../models/User.js';
import { InstitutionModel } from '../models/Institution.js';
import { CredentialModel } from '../models/Credential.js';
import { CredentialStatus, UserRole } from '@certifychain/shared';

const studentWallets = [
  'GARPRGWULIHP2L4ZFWVE63BS64K3WWDLIFZFUDYCREFHT62PRFHKXCAW',
  'GAWBTBBI77XRP7G2EW7OPD7OWRIBVQL7IUYGRLRPZAUURCS6HOVVAIJJ',
  'GCL2ZS36ZITWPYE7GD3CH67T4MWMFCYEZMXV4WDR6A7PZQSNR7BPTBMJ',
  'GBF4H5I7EFOZ565ETXS6QXJAVLZJOIYHHRWPUUC77AGEKK3KX6KSG6MW',
  'GBWJAZLPOLKGGHZJOJJAVWZKYCB57PZEZM3CDWYV6SJUIE2MXSTWTG23',
  'GDVLOTDKR4W2UIEVN6NXIQSPP2H3FX2ECVX6Z4FOD3QIODRRILNSFDVX',
  'GB7UFGNEKTWNFWFPZ3SXBCUKPPKEU2CEVVYBE6DFBR3VHZJXW6STFJYW5',
  'GAXTS6BZD55PN4NZNKDGGYLJUKU6DO65X36YPAEICBE6HC2OBHHJOHJX',
  'GD6VUIYWZXOE522RTLLX72BJDHKKVHBPX2TBUNSFHWB5FTB56UJ3AYJ4',
  'GBM5DK4X2B3LRBR6MM6XR336VES57UT3BF4MMCMBLW4RUTC2HZ53EWMM',
];

const institutionTemplates = [
  { legalName: 'Stellar Institute of Technology', displayName: 'SIT', email: 'sit@example.com' },
  { legalName: 'Horizon Academic University', displayName: 'HAU', email: 'hau@example.com' },
  { legalName: 'Soroban Science College', displayName: 'SSC', email: 'ssc@example.com' },
];

const courses = [
  'Bachelor of Science in Blockchain Engineering',
  'Master of Science in Cryptography',
  'Doctorate in Smart Contract Security',
  'Diploma in Distributed Ledger Technologies',
];

export async function bulkIssueDebug(req: Request, res: Response) {
  try {
    const horizon = new Horizon.Server('https://horizon-testnet.stellar.org');
    const results: Array<{
      studentWallet: string;
      institutionName: string;
      issuerWallet: string;
      txHash: string;
      courseName: string;
    }> = [];

    console.log('Starting bulk issuance script on server...');

    // 1. Create or load the 3 institution users and keypairs
    const activeInstitutions: Array<{
      model: any;
      keypair: Keypair;
    }> = [];

    for (const temp of institutionTemplates) {
      // Find or create user
      let user = await UserModel.findOne({ email: temp.email });
      if (!user) {
        user = await UserModel.create({
          name: temp.displayName + ' Admin',
          email: temp.email,
          passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$m6f46xR61q$mockPasswordHash', // mock
          role: UserRole.INSTITUTION,
        });
      }

      // Generate a new random keypair for this institution
      const kp = Keypair.random();

      // Fund the institution wallet using Friendbot
      console.log(`Funding institution wallet ${kp.publicKey()}...`);
      try {
        await fetch(`https://friendbot.stellar.org/?addr=${kp.publicKey()}`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (err) {
        console.error(`Friendbot failed for institution:`, err);
      }

      // Create or update institution record in DB
      let inst = await InstitutionModel.findOne({ ownerUserId: user._id });
      if (!inst) {
        inst = await InstitutionModel.create({
          ownerUserId: user._id,
          legalName: temp.legalName,
          displayName: temp.displayName,
          institutionType: 'University',
          registrationNumber: `REG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          website: `www.${temp.displayName.toLowerCase()}.edu`,
          contactEmail: temp.email,
          description: `A test institution for ${temp.displayName}`,
          country: 'USA',
          address: '123 Test Street, Debug City',
          walletAddress: kp.publicKey(),
          status: 'approved',
        });
      } else {
        inst.walletAddress = kp.publicKey();
        await inst.save();
      }

      activeInstitutions.push({
        model: inst,
        keypair: kp,
      });
    }

    const errors: Array<{ wallet: string; error: string }> = [];

    // 2. Issue certificates to the 10 students
    for (let i = 0; i < studentWallets.length; i++) {
      const studentWallet = studentWallets[i]!;
      if (!studentWallet) continue;

      // Distribute students evenly among the 3 institutions
      const instIndex = i % activeInstitutions.length;
      const activeInst = activeInstitutions[instIndex];
      if (!activeInst) continue;

      const { model: inst, keypair: issuerKp } = activeInst;
      const courseName = courses[i % courses.length]!;

      console.log(
        `Processing student ${i + 1}/10: ${studentWallet} from issuer ${inst.displayName}...`,
      );

      // Fund student wallet if it doesn't exist
      try {
        await horizon.loadAccount(studentWallet);
      } catch (e) {
        try {
          await fetch(`https://friendbot.stellar.org/?addr=${studentWallet}`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (err) {
          // ignore
        }
      }

      // Build & submit the Stellar payment transaction
      let txHash = '';
      try {
        const sourceAccount = await horizon.loadAccount(issuerKp.publicKey());
        const docHash = createHash('sha256').update(randomUUID()).digest('hex');
        const metadataHash = createHash('sha256')
          .update(docHash + studentWallet)
          .digest('hex');

        const tx = new TransactionBuilder(sourceAccount, {
          fee: '100',
          networkPassphrase: Networks.TESTNET,
        })
          .addOperation(
            Operation.payment({
              destination: studentWallet,
              asset: Asset.native(),
              amount: '0.0000001',
            }),
          )
          .addMemo(Memo.hash(metadataHash))
          .setTimeout(120)
          .build();

        tx.sign(issuerKp);
        const submitResult = await horizon.submitTransaction(tx);
        txHash = submitResult.hash;

        // Insert into Database
        const credentialId = randomUUID();
        await CredentialModel.create({
          credentialId,
          studentWalletAddress: studentWallet,
          institutionId: inst._id,
          issuerWalletAddress: issuerKp.publicKey(),
          credentialType: 'DEGREE',
          courseName,
          issueDate: new Date(),
          certificateNumber: `CERT-${inst.displayName}-${1000 + i}`,
          metadataHash: metadataHash as any,
          documentHash: docHash as any,
          issueTxHash: txHash as any,
          status: CredentialStatus.ACTIVE,
          issuedAt: new Date(),
        });

        results.push({
          studentWallet,
          institutionName: inst.displayName || 'Unknown',
          issuerWallet: issuerKp.publicKey(),
          txHash,
          courseName,
        });

        console.log(`Successfully issued! Tx: ${txHash}`);
      } catch (err: any) {
        console.error(`Failed to issue for ${studentWallet}:`, err);
        errors.push({
          wallet: studentWallet,
          error:
            err.response?.data?.extras?.result_codes?.transaction || err.message || String(err),
        });
      }
    }

    res.json({
      success: true,
      message: 'Completed bulk issuance debug endpoint',
      data: results,
      errors: errors,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: {
        message: err.message || 'Failed running bulk issuance debug endpoint',
      },
    });
  }
}
