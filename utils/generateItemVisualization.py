import sys
import json

print(json.dumps({1: 1, "title": sys.argv[1]}))
sys.stdout.flush()