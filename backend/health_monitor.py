"""
System Health Monitor and Diagnostics
Auto-running health checks for production monitoring
"""

import asyncio
import aiohttp
import time
from datetime import datetime
from typing import Dict, List, Optional
import json

class HealthMonitor:
    def __init__(self, api_url: str = "http://localhost:8000"):
        self.api_url = api_url
        self.test_results: List[Dict] = []
        
    async def check_endpoint(self, session: aiohttp.ClientSession, 
                            endpoint: str, method: str = "GET",
                            data: Optional[Dict] = None) -> Dict:
        """Check a single endpoint and return results"""
        url = f"{self.api_url}{endpoint}"
        start_time = time.time()
        
        try:
            if method == "GET":
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    status = response.status
                    response_time = time.time() - start_time
                    try:
                        body = await response.json()
                    except:
                        body = await response.text()
            else:
                async with session.post(url, json=data, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    status = response.status
                    response_time = time.time() - start_time
                    try:
                        body = await response.json()
                    except:
                        body = await response.text()
            
            return {
                "endpoint": endpoint,
                "status": "✅ PASS" if status < 400 else "❌ FAIL",
                "http_code": status,
                "response_time": f"{response_time:.3f}s",
                "timestamp": datetime.now().isoformat()
            }
        except asyncio.TimeoutError:
            return {
                "endpoint": endpoint,
                "status": "❌ TIMEOUT",
                "http_code": 0,
                "response_time": ">10s",
                "error": "Request timed out",
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {
                "endpoint": endpoint,
                "status": "❌ ERROR",
                "http_code": 0,
                "response_time": "N/A",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def run_health_checks(self) -> Dict:
        """Run comprehensive health checks"""
        print("=" * 60)
        print("COMMUTER GENIUS - HEALTH MONITOR")
        print("=" * 60)
        print(f"\nStarting health checks at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"API URL: {self.api_url}\n")
        
        # Define all endpoints to test
        endpoints = [
            ("/", "Root endpoint"),
            ("/api/health", "Health check"),
            ("/api/docs", "API documentation"),
        ]
        
        results = []
        
        async with aiohttp.ClientSession() as session:
            print("Testing endpoints...\n")
            
            for endpoint, description in endpoints:
                result = await self.check_endpoint(session, endpoint)
                results.append(result)
                
                # Print result
                status_icon = "✅" if result["status"] == "✅ PASS" else "❌"
                print(f"{status_icon} {description:30s} [{result['response_time']:>8s}] {endpoint}")
            
        print("\n" + "=" * 60)
        print("SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for r in results if r["status"] == "✅ PASS")
        failed = sum(1 for r in results if r["status"] != "✅ PASS")
        
        print(f"\nTotal Tests: {len(results)}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        
        if failed == 0:
            print("\n🎉 All systems operational!")
            overall_status = "HEALTHY"
        elif failed < len(results) / 2:
            print("\n⚠️  Some services degraded")
            overall_status = "DEGRADED"
        else:
            print("\n🚨 Critical issues detected!")
            overall_status = "UNHEALTHY"
        
        # Calculate average response time
        avg_response = sum(
            float(r["response_time"].replace("s", "").replace(">", "").replace("N/A", "0"))
            for r in results if "response_time" in r
        ) / len(results)
        
        print(f"\nAverage Response Time: {avg_response:.3f}s")
        
        return {
            "status": overall_status,
            "timestamp": datetime.now().isoformat(),
            "total_tests": len(results),
            "passed": passed,
            "failed": failed,
            "avg_response_time": avg_response,
            "results": results
        }
    
    async def continuous_monitoring(self, interval: int = 60):
        """Run continuous health monitoring"""
        print("\n" + "=" * 60)
        print("CONTINUOUS MONITORING STARTED")
        print(f"Checking every {interval} seconds (Ctrl+C to stop)")
        print("=" * 60 + "\n")
        
        try:
            while True:
                await self.run_health_checks()
                print(f"\nNext check in {interval} seconds...\n")
                await asyncio.sleep(interval)
        except KeyboardInterrupt:
            print("\n\n" + "=" * 60)
            print("Monitoring stopped by user")
            print("=" * 60)

async def main():
    import sys
    
    # Parse command line arguments
    api_url = "http://localhost:8000"
    continuous = False
    interval = 60
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "--continuous":
            continuous = True
            if len(sys.argv) > 2:
                interval = int(sys.argv[2])
        elif sys.argv[1] == "--help":
            print("Health Monitor - Commuter Genius")
            print("\nUsage:")
            print("  python health_monitor.py                    - Run once")
            print("  python health_monitor.py --continuous       - Run continuously (60s interval)")
            print("  python health_monitor.py --continuous 30   - Run continuously (30s interval)")
            print("  python health_monitor.py --help             - Show this help")
            return
        else:
            api_url = sys.argv[1]
    
    monitor = HealthMonitor(api_url)
    
    if continuous:
        await monitor.continuous_monitoring(interval)
    else:
        result = await monitor.run_health_checks()
        
        # Exit with error code if unhealthy
        if result["status"] == "UNHEALTHY":
            sys.exit(1)
        elif result["status"] == "DEGRADED":
            sys.exit(2)
        else:
            sys.exit(0)

if __name__ == "__main__":
    asyncio.run(main())
