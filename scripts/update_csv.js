const fs = require('fs');
const csv = require('csv-parser');

async function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function updateCSV() {
  const formResponsesContent = fs.readFileSync('scripts/form_responses.csv', 'utf8').split('\n');
  const invocations = await readCSV('scripts/invocation_results_15.csv');

  // We update rows 31 to 45 (indices 31 to 45 because index 0 is header)
  for (let i = 0; i < invocations.length; i++) {
    const inv = invocations[i];
    if (inv.status !== 'SUCCESS') continue;

    const rowIdx = 31 + i;
    if (rowIdx < formResponsesContent.length) {
      const cols = formResponsesContent[rowIdx].split(',');
      // Wallet is col 2, TX link is col 3
      if (cols.length >= 4) {
        cols[2] = inv.public_key;
        cols[3] = inv.tx_link;
        formResponsesContent[rowIdx] = cols.join(',');
      }
    }
  }

  fs.writeFileSync('scripts/form_responses.csv', formResponsesContent.join('\n'));
  console.log('Updated form_responses.csv with the new 15 wallets!');
}

updateCSV().catch(console.error);
