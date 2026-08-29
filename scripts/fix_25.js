const fs = require('fs');

function fixCSV() {
  const lines = fs
    .readFileSync('scripts/invocation_results_25.csv', 'utf8')
    .split('\n')
    .filter(Boolean);
  const inv = lines;
  const frm = fs.readFileSync('scripts/form_responses.csv', 'utf8').split('\n');

  let invIdx = 1; // skip header

  // Rows 31 to 55 (index 31 to 55)
  for (let i = 31; i <= 55 && i < frm.length && invIdx < inv.length; i++) {
    const c = frm[i].split(',');
    const ic = inv[invIdx].split('","');

    if (c.length >= 4 && ic.length >= 6 && inv[invIdx].includes('SUCCESS')) {
      // Correct indices based on splitting by `","`:
      // 0: [wallet_num],"contract_fn
      // 1: label
      // 2: public_key
      // 3: tx_hash
      // 4: tx_link
      // 5: status"

      c[2] = ic[2].replace(/"/g, ''); // Wallet
      c[3] = ic[4].replace(/"/g, ''); // Tx Link

      frm[i] = c.join(',');
      invIdx++;
    } else if (!inv[invIdx].includes('SUCCESS')) {
      invIdx++;
      i--;
    }
  }

  fs.writeFileSync('scripts/form_responses.csv', frm.join('\n'));
  console.log('Fixed mapping for the 25 new wallets in form_responses.csv!');
}

fixCSV();
