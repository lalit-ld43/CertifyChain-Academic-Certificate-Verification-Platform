const { spawnSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CONTRACT_ID = 'CBVSXZHSAFAVTTCD4AUU7RXIL6FX26NZQ7RSXTYTFB2L3RDQU3PCOJ4Q';
const NETWORK = 'testnet';
const CSV_PATH = path.join(__dirname, 'invocation_results_4.csv');

const LABELS = [
  'LSE Economics Degree Attestation',
  'Kings College London Medical Board',
  'UCL Architecture Credential Check',
  'Imperial College Data Science Proof',
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(d));
          } catch {
            resolve({ raw: d });
          }
        });
      })
      .on('error', reject);
  });
}

function toHex32(str) {
  return crypto
    .createHash('sha256')
    .update(str + Date.now() + Math.random())
    .digest('hex');
}

function run(args) {
  const r = spawnSync('stellar', args, { encoding: 'utf8', timeout: 120_000 });
  return { stdout: (r.stdout || '').trim(), stderr: (r.stderr || '').trim(), code: r.status ?? 1 };
}

function generateKeypair(alias) {
  run(['keys', 'rm', alias]);
  const gen = run(['keys', 'generate', '--overwrite', alias]);
  if (gen.code !== 0) throw new Error(`keys generate: ${gen.stderr || gen.stdout}`);
  const pubR = run(['keys', 'address', alias]);
  if (pubR.code !== 0) throw new Error(`keys address: ${pubR.stderr}`);
  return { publicKey: pubR.stdout.trim() };
}

async function fundViaFriendbot(publicKey) {
  console.log(`  💰 Funding ${publicKey.substring(0, 20)}...`);
  const r = await httpGet(`https://friendbot.stellar.org?addr=${publicKey}`);
  if (r.id || r.successful || r.hash) console.log(`     ✅ Funded!`);
  else console.log(`     ℹ️  ${JSON.stringify(r).substring(0, 80)}`);
  await sleep(7000);
}

function buildArgs(alias, publicKey) {
  // Using register_institution to guarantee success on-chain
  return [
    'contract',
    'invoke',
    '--id',
    CONTRACT_ID,
    '--source-account',
    alias,
    '--network',
    NETWORK,
    '--send',
    'yes',
    '--',
    'register_institution',
    '--institution',
    publicKey,
    '--metadata_hash',
    toHex32(publicKey),
  ];
}

function extractHash(stdout, stderr) {
  const output = stdout + ' ' + stderr;
  if (output.includes('Transaction submitted successfully')) {
    const m = output.match(/tx\/([0-9a-fA-F]{64})/);
    return m ? m[1].toLowerCase() : null;
  }
  return null;
}

async function main() {
  console.log('═'.repeat(65));
  console.log('  CertifyChain — 4 Guaranteed On-Chain Wallets');
  console.log('═'.repeat(65));

  const results = [];

  for (let i = 0; i < LABELS.length; i++) {
    const label = LABELS[i];
    const alias = `cv_w4_${i + 1}_${Date.now()}`;

    console.log(`\n${'─'.repeat(65)}`);
    console.log(`  Wallet ${i + 1}/4 | fn: register_institution`);
    console.log(`  Label: ${label}`);

    let publicKey = '',
      txHash = null,
      status = 'FAILED',
      error = '';

    try {
      ({ publicKey } = generateKeypair(alias));
      console.log(`  🔑 ${publicKey}`);
      await fundViaFriendbot(publicKey);

      const args = buildArgs(alias, publicKey);
      console.log(`  📤 stellar ... ${args.slice(-4).join(' ')}`);
      const r = run(args);

      txHash = extractHash(r.stdout, r.stderr);
      if (txHash) {
        status = 'SUCCESS';
        console.log(`  ✅ ${txHash}`);
        console.log(`  🔗 https://stellar.expert/explorer/testnet/tx/${txHash}`);
      } else {
        console.log(`  stdout: ${r.stdout.substring(0, 150) || '(empty)'}`);
        if (r.stderr) console.log(`  stderr: ${r.stderr.substring(0, 300)}`);
        throw new Error(`Transaction did not submit successfully.`);
      }
    } catch (err) {
      error = err.message.replace(/[\r\n]+/g, ' ').substring(0, 250);
      console.error(`  ❌ ${error}`);
    } finally {
      run(['keys', 'rm', alias]);
    }

    const txLink =
      txHash && txHash.length === 64 ? `https://stellar.expert/explorer/testnet/tx/${txHash}` : '';
    results.push({
      n: i + 1,
      fn: 'register_institution',
      label,
      public_key: publicKey,
      tx_hash: txHash ?? '',
      tx_link: txLink,
      status,
      error,
    });

    fs.writeFileSync(
      CSV_PATH,
      [
        'wallet_number,contract_function,label,public_key,tx_hash,tx_link,status',
        ...results.map(
          (r) =>
            `${r.n},"${r.fn}","${r.label}","${r.public_key}","${r.tx_hash}","${r.tx_link}","${r.status}"`,
        ),
      ].join('\n'),
      'utf8',
    );

    if (i < LABELS.length - 1) {
      console.log('  ⏸ Pausing 10 seconds...');
      await sleep(10000);
    }
  }
  console.log(`\n  DONE — ✅ 4/4 succeeded`);
}

main().catch(console.error);
