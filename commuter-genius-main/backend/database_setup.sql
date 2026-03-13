-- ============================================
-- PostgreSQL Database Setup for Commuter Genius
-- Optimal Drop-off Point Using Safety-Aware SSSP Algorithm
-- ============================================
-- 
-- INSTRUCTIONS:
-- 1. Open PostgreSQL command line (psql) or pgAdmin
-- 2. Run this script as postgres superuser
-- 3. Verify installation using the check commands at the end
--
-- ============================================

-- Step 1: Create the database
CREATE DATABASE commuter_genius
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'English_United States.1252'
    LC_CTYPE = 'English_United States.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

COMMENT ON DATABASE commuter_genius 
    IS 'Safety-Enhanced Urban Navigation System with Crowdsourced Hazard Reporting';

-- Step 2: Connect to the newly created database
\c commuter_genius

-- Step 3: Enable PostGIS extension for spatial/geographic data
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Step 4: Verify PostGIS installation
SELECT PostGIS_Version();
SELECT PostGIS_Full_Version();

-- ============================================
-- TABLE CREATION
-- (Tables will be auto-created by FastAPI/SQLAlchemy)
-- But you can manually create them using this script:
-- ============================================

-- Users Table with Credibility Tracking
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    
    -- Credibility system (as per paper Section IV)
    credibility_score FLOAT DEFAULT 0.7 CHECK (credibility_score >= 0 AND credibility_score <= 1),
    reports_submitted INTEGER DEFAULT 0,
    reports_verified INTEGER DEFAULT 0,
    reports_rejected INTEGER DEFAULT 0,
    reports_flagged INTEGER DEFAULT 0,
    
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_report_time TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_credibility ON users(credibility_score);

-- Hazard Reports Table with PostGIS Geometry
CREATE TABLE IF NOT EXISTS hazard_reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Location using PostGIS POINT geometry (SRID 4326 = WGS84)
    location GEOMETRY(POINT, 4326) NOT NULL,
    address VARCHAR(500),
    
    -- Report details
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'obstacle', 'safety_concern', 'crowd_update', 
        'facility_issue', 'accident', 'crime', 'positive'
    )),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    
    -- Status and verification
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'resolved')),
    is_anonymous BOOLEAN DEFAULT FALSE,
    
    -- Community feedback
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    
    -- Admin moderation
    admin_notes TEXT,
    verified_by INTEGER REFERENCES users(id),
    verified_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Impact calculation cache
    current_impact_score FLOAT DEFAULT 0.0
);

CREATE INDEX idx_hazard_reports_user_id ON hazard_reports(user_id);
CREATE INDEX idx_hazard_reports_category ON hazard_reports(category);
CREATE INDEX idx_hazard_reports_severity ON hazard_reports(severity);
CREATE INDEX idx_hazard_reports_status ON hazard_reports(status);
CREATE INDEX idx_hazard_reports_created_at ON hazard_reports(created_at);
CREATE INDEX idx_hazard_reports_location ON hazard_reports USING GIST(location);

-- Safety Scores Table
CREATE TABLE IF NOT EXISTS safety_scores (
    id SERIAL PRIMARY KEY,
    location GEOMETRY(POINT, 4326) NOT NULL,
    
    -- Multi-dimensional scores (as per paper Section III.D)
    incident_score FLOAT DEFAULT 5.0 CHECK (incident_score >= 0 AND incident_score <= 10),
    feedback_score FLOAT DEFAULT 5.0 CHECK (feedback_score >= 0 AND feedback_score <= 10),
    crowd_score FLOAT DEFAULT 5.0 CHECK (crowd_score >= 0 AND crowd_score <= 10),
    lighting_score FLOAT DEFAULT 5.0 CHECK (lighting_score >= 0 AND lighting_score <= 10),
    police_score FLOAT DEFAULT 5.0 CHECK (police_score >= 0 AND police_score <= 10),
    total_score FLOAT DEFAULT 5.0 CHECK (total_score >= 0 AND total_score <= 10),
    
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP
);

CREATE INDEX idx_safety_scores_location ON safety_scores USING GIST(location);
CREATE INDEX idx_safety_scores_calculated_at ON safety_scores(calculated_at);

-- Emergency Contacts Table
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    relation VARCHAR(50) NOT NULL,
    
    -- Priority levels (P1=highest, P2=medium, P3=lowest)
    priority INTEGER DEFAULT 3 CHECK (priority IN (1, 2, 3)),
    
    -- Communication channels
    notify_sms BOOLEAN DEFAULT TRUE,
    notify_whatsapp BOOLEAN DEFAULT TRUE,
    notify_email BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_emergency_contacts_user_id ON emergency_contacts(user_id);
CREATE INDEX idx_emergency_contacts_priority ON emergency_contacts(priority);

-- SOS Alerts Table
CREATE TABLE IF NOT EXISTS sos_alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    location GEOMETRY(POINT, 4326) NOT NULL,
    address VARCHAR(500),
    
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    contacts_notified INTEGER DEFAULT 0,
    successful_notifications INTEGER DEFAULT 0,
    
    notes TEXT
);

CREATE INDEX idx_sos_alerts_user_id ON sos_alerts(user_id);
CREATE INDEX idx_sos_alerts_triggered_at ON sos_alerts(triggered_at);
CREATE INDEX idx_sos_alerts_is_active ON sos_alerts(is_active);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id INTEGER NOT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);

-- ============================================
-- SAMPLE DATA INSERTION (Optional - for testing)
-- ============================================

-- Create an admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO users (username, email, hashed_password, full_name, is_admin, credibility_score) 
VALUES (
    'admin', 
    'admin@commuter-genius.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5yvVwwVnUXfXe', -- admin123
    'System Administrator',
    TRUE,
    1.0
) ON CONFLICT (username) DO NOTHING;

-- Create a test user (password: test123)
INSERT INTO users (username, email, hashed_password, full_name, credibility_score) 
VALUES (
    'testuser', 
    'test@example.com',
    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- test123
    'Test User',
    0.7
) ON CONFLICT (username) DO NOTHING;

-- Sample hazard report (Chennai Central Station area)
INSERT INTO hazard_reports (
    user_id, 
    location, 
    address,
    category, 
    severity, 
    title, 
    description,
    status,
    upvotes
) VALUES (
    2, -- testuser
    ST_SetSRID(ST_MakePoint(80.2707, 13.0827), 4326), -- Chennai Central
    'Chennai Central Railway Station, Chennai',
    'safety_concern',
    'medium',
    'Poor lighting near bus stop',
    'The area near platform 5 exit has inadequate lighting during evening hours. Multiple commuters have reported feeling unsafe.',
    'verified',
    5
);

-- Sample hazard report (CMBT area)
INSERT INTO hazard_reports (
    user_id, 
    location, 
    address,
    category, 
    severity, 
    title, 
    description,
    status,
    upvotes
) VALUES (
    2,
    ST_SetSRID(ST_MakePoint(80.2425, 13.0569), 4326), -- CMBT
    'Chennai Mofussil Bus Terminus (CMBT)',
    'crowd_update',
    'low',
    'Heavy crowd during peak hours',
    'Bus terminal experiences very high crowd density between 8-10 AM and 6-8 PM. Recommend alternative routes during these hours.',
    'verified',
    8
);

-- Sample emergency contact
INSERT INTO emergency_contacts (user_id, name, phone, email, relation, priority, notify_sms, notify_whatsapp)
VALUES (
    2,
    'John Doe',
    '+919876543210',
    'john.doe@example.com',
    'Father',
    1,
    TRUE,
    TRUE
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all tables are created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check PostGIS functions are available
SELECT 
    ST_Distance(
        ST_SetSRID(ST_MakePoint(80.2707, 13.0827), 4326), 
        ST_SetSRID(ST_MakePoint(80.2425, 13.0569), 4326)
    ) AS distance_degrees;

-- Check sample data
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as hazard_count FROM hazard_reports;
SELECT COUNT(*) as emergency_contact_count FROM emergency_contacts;

-- Show sample hazards with location
SELECT 
    id,
    title,
    category,
    severity,
    ST_X(location) as longitude,
    ST_Y(location) as latitude,
    created_at
FROM hazard_reports
LIMIT 5;

-- ============================================
-- USEFUL SPATIAL QUERIES
-- ============================================

-- Find hazards within 2km of a point (Chennai Central)
-- Example query:
/*
SELECT 
    id, 
    title, 
    category,
    ST_Distance(
        location::geography, 
        ST_SetSRID(ST_MakePoint(80.2707, 13.0827), 4326)::geography
    ) / 1000 as distance_km
FROM hazard_reports
WHERE ST_DWithin(
    location::geography,
    ST_SetSRID(ST_MakePoint(80.2707, 13.0827), 4326)::geography,
    2000 -- 2km in meters
)
AND status = 'verified'
ORDER BY distance_km;
*/

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

SELECT 
    '✅ Database setup complete!' as status,
    'Run "python main.py" in backend directory to start the API' as next_step,
    'Access API docs at: http://localhost:8000/api/docs' as documentation;

-- ============================================
-- TROUBLESHOOTING
-- ============================================
-- If PostGIS extension fails:
-- 1. Ensure PostgreSQL is installed with PostGIS
-- 2. For Windows: Download PostGIS from postgis.net
-- 3. For Linux: sudo apt-get install postgis
-- 4. Restart PostgreSQL service
--
-- If tables are not created:
-- 1. Check you're connected to correct database (\c commuter_genius)
-- 2. Check user has CREATE privileges
-- 3. Run: GRANT ALL PRIVILEGES ON DATABASE commuter_genius TO postgres;
-- ============================================
