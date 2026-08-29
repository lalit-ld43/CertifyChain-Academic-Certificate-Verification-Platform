const fs = require('fs');
const csv = require('csv-parser');

async function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    if (!fs.existsSync(filePath)) return resolve(results);
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function prepare30() {
  const inv30 = await readCSV('scripts/invocation_results_30.csv');
  // Ensure uniqueness
  const uniqueWalletsMap = new Map();
  for (const inv of inv30) {
    if (inv.public_key && inv.tx_link) {
      uniqueWalletsMap.set(inv.public_key, inv);
    }
  }
  const uniqueWallets = Array.from(uniqueWalletsMap.values());
  console.log(`Gathered ${uniqueWallets.length} UNIQUE wallets from the first 30 invocations.`);

  const formResponsesContent = fs.readFileSync('scripts/form_responses.csv', 'utf8').split('\n');
  let updatedCount = 0;

  for (let i = 1; i < formResponsesContent.length && updatedCount < 30; i++) {
    const line = formResponsesContent[i].trim();
    if (!line) continue;

    if (updatedCount < uniqueWallets.length) {
      const cols = line.split(',');
      if (cols.length >= 4) {
        cols[2] = uniqueWallets[updatedCount].public_key;
        cols[3] = uniqueWallets[updatedCount].tx_link;
        formResponsesContent[i] = cols.join(',');
        updatedCount++;
      }
    }
  }

  fs.writeFileSync('scripts/form_responses.csv', formResponsesContent.join('\n'));
  console.log(
    `Successfully updated first ${updatedCount} rows in form_responses.csv with the 30 unique wallets!`,
  );
}

prepare30().catch(console.error);
