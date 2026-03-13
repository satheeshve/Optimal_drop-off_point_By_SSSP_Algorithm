@echo off
color 0B
echo ============================================
echo  POLICE PATROL - QUICK TEST
echo ============================================
echo.
echo Testing police patrol functionality...
echo.

timeout /t 2 >nul

echo [1] Testing API endpoint...
curl -X POST "http://localhost:8000/api/police/patrols" -H "Content-Type: application/json" -d "{\"station_name\":\"Central Station\",\"station_code\":\"CS001\",\"latitude\":13.0827,\"longitude\":80.2707,\"patrol_route_name\":\"Downtown Route\",\"patrol_area_description\":\"Main Street to Park Road\",\"shift_date\":\"2026-01-26\",\"shift_type\":\"morning\",\"start_time\":\"06:00\",\"end_time\":\"14:00\",\"officer_in_charge\":\"Officer Kumar\",\"officer_badge_number\":\"BADGE001\",\"patrol_vehicle_number\":\"TN01AB1234\",\"contact_number\":\"9876543210\",\"emergency_contact\":\"100\",\"coverage_radius_km\":2.0,\"created_by\":\"admin\"}"

echo.
echo.
echo [2] Fetching today's patrols...
curl -X GET "http://localhost:8000/api/police/patrols/today"

echo.
echo.
echo ============================================
echo  TEST COMPLETE
echo ============================================
echo.
echo If you see patrol data above, it works!
echo.
pause
