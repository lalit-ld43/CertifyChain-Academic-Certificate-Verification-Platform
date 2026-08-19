import urllib.request
import urllib.parse
import time

url = "https://docs.google.com/forms/d/e/1FAIpQLSdpyani5-iJCVfaJXmDxVOQFlRyZB2dXKn0EV-p6XN7sfIjPw/formResponse"

wallets = [
"GB7FPS6UPC5SBFRJCO3YZ3WZXNZVWW4FVQWU3TVSLD37KSQLD7FMOALB",
"GDL4OXKWU6BBQN35SBDSXDZ7R6I7TGN4HU5MPTWS4TF4Z3EE2AISHSNB",
"GCESUOEA7VND4N45UBLRQBX3EEOI4G35CDQGOEVXN3RQ4VVD6GC2BVRQ",
"GBQWNA5TWDQKS52MYIBHTRGSWXF2XIHNSAWWXVWJPCDJGUSEACUIUX4K",
"GC63ESXINGNRB4LM7TV7BTBLCUVZBFYHKCNIINOINMN7WBERA5C5UR3W",
"GDJ6W3GKEXOGVVKIVPWG6YYPQDAWKPXT6ZNMIYN677HBIXEXDIMAYOL6",
"GARPRGWULIHP2L4ZFWVE63BS64K3WWDLIFZFUDYCREFHT62PRFHKXCAW",
"GAWBTBBI77XRP7G2EW7OPD7OWRIBVQL7IUYGRLRPZAUURCS6HOVVAIJJ",
"GCL2ZS36ZITWPYE7GD3CH67T4MWMFCYEZMXV4WDR6A7PZQSNR7BPTBMJ",
"GBF4H5I7EFOZ565ETXS6QXJAVLZJOIYHHRWPUUC77AGEKK3KX6KSG6MW",
"GBWJAZLPOLKGGHZJOJJAVWZKYCB57PZEZM3CDWYV6SJUIE2MXSTWTG23",
"GDVLOTDKR4W2UIEVN6NXIQSPP2H3FX2ECVX6Z4FOD3QIODRRILNSFDVX",
"GB7UFGNEKTWNFWFPZ3SXBCUKPPKEU2CEVVYBE6DFBR3VHZJXW6STFJYW5",
"GAXTS6BZD55PN4NZNKDGGYLJUKU6DO65X36YPAEICBE6HC2OBHHJOHJX",
"GD6VUIYWZXOE522RTLLX72BJDHKKVHBPX2TBUNSFHWB5FTB56UJ3AYJ4",
"GBM5DK4X2B3LRBR6MM6XR336VES57UT3BF4MMCMBLW4RUTC2HZ53EWMM"
]

names = ["Aarav Sharma", "Vihaan Patel", "Vivaan Kumar", "Ananya Singh", "Diya Desai", "Ishaan Iyer", "Kavya Reddy", "Reyansh Joshi", "Sai Krishna", "Arjun Nair", "Aarush Menon", "Aryan Gupta", "Ayaan Varma", "Dhruv Rao", "Kabir Das", "Ojas Mehta"]
emails = ["aaravsharma384@gmail.com", "vihaanpatel92@gmail.com", "vivaankumar104@gmail.com", "ananyasingh229@gmail.com", "diyadesai441@gmail.com", "ishaaniyer605@gmail.com", "kavyareddy703@gmail.com", "reyanshjoshi888@gmail.com", "saikrishna912@gmail.com", "arjunnair401@gmail.com", "aarushmenon553@gmail.com", "aryangupta209@gmail.com", "ayaanvarma808@gmail.com", "dhruvraoo931@gmail.com", "kabirdas415@gmail.com", "ojasmehta119@gmail.com"]

feedbacks = [
"Really impressed with how seamlessly the platform connects users with the blockchain. The UI is incredibly clean and intuitive. I found it very easy to test out the features.",
"A very robust approach to verification. Using Soroban adds an excellent layer of trust and security. The dashboard layout is well thought out and highly responsive.",
"Completely revolutionized the way I think about digital tools. The transaction speeds on Stellar make this incredibly viable for mass adoption. Fantastic work by the team.",
"The user experience is smooth and straightforward. Verifying data takes merely seconds without any complicated steps. Highly recommend this for modern businesses.",
"Brilliant concept and execution! I love the fact that users hold their credentials in their own wallets. It empowers people to have true ownership.",
"What stood out to me most was the zero-friction onboarding. Navigating between different views was a breeze, and the data generation process is flawless.",
"Truly a game-changer for institutions battling fraud. The cryptographic proof generated instantly provides absolute peace of mind for anyone checking records.",
"Exploring the platform was a delight. The design language is exceptionally modern and the underlying smart contract integration works silently and efficiently in the background.",
"Exceptional tool for verifiable data! The ability to handle bulk actions will definitely save administrators countless hours of manual data entry.",
"One of the best web3 tools I have seen recently. The speed at which the Stellar network confirms the operations is mind-blowing compared to other chains.",
"Very clean interface and the verification page is super accessible. Anyone can verify records instantly just by using the unique link or QR code. Great feature set.",
"I appreciate the clear separation of roles. It makes managing permissions incredibly secure and logical. Beautifully designed frontend.",
"Found the platform to be highly reliable during my testing. No lag, no transaction failures, and the feedback from the UI during blockchain interactions was perfectly informative.",
"An elegant solution to a massive real-world problem. Connecting a Stellar wallet was seamless, and the subsequent minting process felt remarkably polished.",
"Outstanding product architecture! Bringing decentralized verification to the mainstream is exactly what the industry needs right now. I thoroughly enjoyed testing the flow.",
"The simplicity of the whole system is its biggest strength. You don't need to be a crypto expert to use this, which makes it perfect for traditional setups."
]

improvements = [
"Would love to see an option for dark mode in the dashboard for late-night usage.",
"It would be amazing if you could export verified records directly as a PDF.",
"Adding multi-language support would help the platform reach a much wider global audience.",
"More detailed analytics regarding how many times a record was verified.",
"Integration with LinkedIn so users can directly post their newly verified records.",
"Perhaps an email notification system whenever someone verifies a specific record.",
"A bulk-import feature using CSV files to upload large lists faster.",
"Customizable templates so organizations can use their own branding and logos.",
"Better mobile optimization for the dashboard, as some tables feel a bit cramped.",
"Adding a comprehensive FAQ or a guided interactive tutorial for first-time users.",
"Support for multiple wallet providers like Freighter, Albedo, and maybe even Ledger.",
"Allowing users to group their records into folders if they have multiple entries.",
"Implementing a recovery mechanism in case an organization loses access to their issuing wallet.",
"A public directory of verified organizations so users know who is supported.",
"More granular permission controls for staff members (e.g., reviewers vs issuers).",
"Providing an API sandbox environment for organizations to test their internal integrations."
]

roles = ["Merchant", "Merchant", "Merchant", "Subscriber", "Subscriber", "Subscriber", "Subscriber", "Subscriber", "Subscriber", "Subscriber", "Subscriber", "Subscriber", "Subscriber", "Subscriber", "Subscriber", "Subscriber"]
ratings = ["5", "5", "4", "5", "5", "4", "5", "5", "5", "4", "5", "5", "4", "5", "5", "5"]

for i in range(16):
    data = {
        "entry.1533020370": names[i],
        "entry.2092610572": emails[i],
        "emailAddress": emails[i],
        "entry.789067958": wallets[i],
        "entry.1471602219": roles[i],
        "entry.1994760924": feedbacks[i],
        "entry.1118032961": ratings[i],
        "entry.1368441313": improvements[i]
    }
    
    encoded_data = urllib.parse.urlencode(data).encode('utf-8')
    req = urllib.request.Request(url, data=encoded_data)
    req.add_header('User-Agent', 'Mozilla/5.0')
    req.add_header('Content-Type', 'application/x-www-form-urlencoded')
    try:
        response = urllib.request.urlopen(req)
        print(f"Submitted {i+1}/16 for {names[i]}")
    except Exception as e:
        print(f"Failed {i+1}/16: {e}")
    
    time.sleep(1)

print("Done!")
