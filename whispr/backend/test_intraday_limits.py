#!/usr/bin/env python3
import asyncio
import aiohttp
import os
from datetime import datetime, timezone
from schwab_config import SchwabOAuthManager

async def test_intraday_limits():
    print("🧪 Testing Intraday Data Limits More Thoroughly...")
    
    oauth_manager = SchwabOAuthManager(
        client_id='aovZp4jBkjJCvrvci7NOrM6yuZk6GIj1',
        client_secret='0dG11fLY8qF7iYz3',
        redirect_uri='https://whispr-jjygd8lca-krithins-projects-859494f2.vercel.app/auth/callback'
    )
    
    await oauth_manager.load_tokens()
    access_token = await oauth_manager.get_valid_access_token()
    
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # Test different combinations for intraday data
    test_cases = [
        # Try different periodTypes
        ("1-minute", "15 days", {"symbol": "$SPX", "periodType": "day", "period": 15, "frequencyType": "minute", "frequency": 1}),
        ("1-minute", "20 days", {"symbol": "$SPX", "periodType": "day", "period": 20, "frequencyType": "minute", "frequency": 1}),
        ("1-minute", "30 days", {"symbol": "$SPX", "periodType": "day", "period": 30, "frequencyType": "minute", "frequency": 1}),
        ("1-minute", "1 month", {"symbol": "$SPX", "periodType": "month", "period": 1, "frequencyType": "minute", "frequency": 1}),
        ("1-minute", "2 months", {"symbol": "$SPX", "periodType": "month", "period": 2, "frequencyType": "minute", "frequency": 1}),
        ("1-minute", "3 months", {"symbol": "$SPX", "periodType": "month", "period": 3, "frequencyType": "minute", "frequency": 1}),
        
        # Test 5-minute with longer periods
        ("5-minute", "20 days", {"symbol": "$SPX", "periodType": "day", "period": 20, "frequencyType": "minute", "frequency": 5}),
        ("5-minute", "30 days", {"symbol": "$SPX", "periodType": "day", "period": 30, "frequencyType": "minute", "frequency": 5}),
        ("5-minute", "1 month", {"symbol": "$SPX", "periodType": "month", "period": 1, "frequencyType": "minute", "frequency": 5}),
        ("5-minute", "2 months", {"symbol": "$SPX", "periodType": "month", "period": 2, "frequencyType": "minute", "frequency": 5}),
        ("5-minute", "3 months", {"symbol": "$SPX", "periodType": "month", "period": 3, "frequencyType": "minute", "frequency": 5}),
        ("5-minute", "6 months", {"symbol": "$SPX", "periodType": "month", "period": 6, "frequencyType": "minute", "frequency": 5}),
        
        # Test 15-minute with longer periods
        ("15-minute", "20 days", {"symbol": "$SPX", "periodType": "day", "period": 20, "frequencyType": "minute", "frequency": 15}),
        ("15-minute", "30 days", {"symbol": "$SPX", "periodType": "day", "period": 30, "frequencyType": "minute", "frequency": 15}),
        ("15-minute", "1 month", {"symbol": "$SPX", "periodType": "month", "period": 1, "frequencyType": "minute", "frequency": 15}),
        ("15-minute", "3 months", {"symbol": "$SPX", "periodType": "month", "period": 3, "frequencyType": "minute", "frequency": 15}),
        ("15-minute", "6 months", {"symbol": "$SPX", "periodType": "month", "period": 6, "frequencyType": "minute", "frequency": 15}),
        
        # Test 30-minute with longer periods  
        ("30-minute", "20 days", {"symbol": "$SPX", "periodType": "day", "period": 20, "frequencyType": "minute", "frequency": 30}),
        ("30-minute", "1 month", {"symbol": "$SPX", "periodType": "month", "period": 1, "frequencyType": "minute", "frequency": 30}),
        ("30-minute", "3 months", {"symbol": "$SPX", "periodType": "month", "period": 3, "frequencyType": "minute", "frequency": 30}),
        ("30-minute", "6 months", {"symbol": "$SPX", "periodType": "month", "period": 6, "frequencyType": "minute", "frequency": 30}),
        
        # Test hourly data (might have different limits)
        ("1-hour", "1 month", {"symbol": "$SPX", "periodType": "month", "period": 1, "frequencyType": "minute", "frequency": 60}),
        ("1-hour", "3 months", {"symbol": "$SPX", "periodType": "month", "period": 3, "frequencyType": "minute", "frequency": 60}),
        ("1-hour", "6 months", {"symbol": "$SPX", "periodType": "month", "period": 6, "frequencyType": "minute", "frequency": 60}),
        ("1-hour", "1 year", {"symbol": "$SPX", "periodType": "year", "period": 1, "frequencyType": "minute", "frequency": 60}),
    ]
    
    import ssl
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    connector = aiohttp.TCPConnector(ssl=ssl_context)
    
    async with aiohttp.ClientSession(connector=connector) as session:
        for timeframe, period_desc, params in test_cases:
            print(f"📊 Testing {timeframe} ({period_desc})...")
            
            try:
                async with session.get(
                    "https://api.schwabapi.com/marketdata/v1/pricehistory",
                    headers=headers,
                    params=params
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        candles = data.get('candles', [])
                        if candles:
                            first_date = datetime.fromtimestamp(candles[0]['datetime']/1000, tz=timezone.utc).strftime('%Y-%m-%d')
                            last_date = datetime.fromtimestamp(candles[-1]['datetime']/1000, tz=timezone.utc).strftime('%Y-%m-%d')
                            days_span = len(candles) * (1 if timeframe == "1-minute" else (5 if timeframe == "5-minute" else (15 if timeframe == "15-minute" else (30 if timeframe == "30-minute" else 60)))) / 390  # 390 minutes per trading day
                            print(f"✅ {timeframe} ({period_desc}): {len(candles)} candles")
                            print(f"   Range: {first_date} to {last_date} (~{days_span:.1f} trading days)")
                        else:
                            print(f"❌ {timeframe} ({period_desc}): No candles returned")
                    else:
                        print(f"❌ {timeframe} ({period_desc}) failed: {response.status}")
                        
            except Exception as e:
                print(f"❌ {timeframe} ({period_desc}) error: {e}")
            
            # Small delay between requests
            await asyncio.sleep(0.3)

if __name__ == "__main__":
    asyncio.run(test_intraday_limits())
