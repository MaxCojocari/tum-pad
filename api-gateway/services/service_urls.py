import os
from dotenv import load_dotenv

load_dotenv()

AUCTIONS_SERVICE_URL = os.getenv('AUCTIONS_SERVICE_URL')
BIDDERS_SERVICE_URL = os.getenv('BIDDERS_SERVICE_URL')