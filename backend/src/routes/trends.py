from pytrends.request import TrendReq

# Initialize Pytrends
pytrends = TrendReq(hl='en-US', tz=360)

# Define your keyword
keyword = ["SEO tools"]  # Change this to your keyword

# Fetch interest over time
pytrends.build_payload(keyword, timeframe='today 12-m', geo='IS')  # Last 12 months in the US
data = pytrends.interest_over_time()

# Display the trends data
print(data)
