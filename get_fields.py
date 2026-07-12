import urllib.request
import re
import json

url = "https://docs.google.com/forms/d/e/1FAIpQLSdpyani5-iJCVfaJXmDxVOQFlRyZB2dXKn0EV-p6XN7sfIjPw/viewform"
req = urllib.request.Request(url)
html = urllib.request.urlopen(req).read().decode('utf-8')

match = re.search(r'var FB_PUBLIC_LOAD_DATA_ = (.*?);', html, re.DOTALL)
if match:
    data = match.group(1)
    data = json.loads(data)
    fields = data[1][1]
    for field in fields:
        title = field[1]
        entry_id = field[4][0][0]
        print(f"Title: {title}, Entry ID: entry.{entry_id}")
else:
    print("Could not find form data.")
