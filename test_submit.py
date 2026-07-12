import urllib.request
import urllib.parse

url = "https://docs.google.com/forms/d/e/1FAIpQLSdpyani5-iJCVfaJXmDxVOQFlRyZB2dXKn0EV-p6XN7sfIjPw/formResponse"

data = {
    "entry.1533020370": "Aarav Sharma",
    "entry.2092610572": "aaravsharma384@gmail.com",
    "emailAddress": "aaravsharma384@gmail.com",
    "entry.789067958": "GB7FPS6UPC5SBFRJCO3YZ3WZXNZVWW4FVQWU3TVSLD37KSQLD7FMOALB",
    "entry.1471602219": "Student",
    "entry.1994760924": "Really impressed with how seamlessly the platform connects institutions with the blockchain. The UI is incredibly clean and intuitive. I found it very easy to issue credentials.",
    "entry.1118032961": "5",
    "entry.1368441313": "Would love to see an option for dark mode in the dashboard for late-night usage."
}

encoded_data = urllib.parse.urlencode(data).encode('utf-8')
req = urllib.request.Request(url, data=encoded_data)
req.add_header('User-Agent', 'Mozilla/5.0')
req.add_header('Content-Type', 'application/x-www-form-urlencoded')
try:
    response = urllib.request.urlopen(req)
    print("Success:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code, e.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
