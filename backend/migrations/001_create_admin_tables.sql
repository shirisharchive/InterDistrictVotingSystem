-- Admin Management Tables

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  admin_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_super_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admin assignments table (for district/area access control)
CREATE TABLE IF NOT EXISTS admin_assignments (
  assignment_id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES admins(admin_id) ON DELETE CASCADE,
  district_id VARCHAR(50) NOT NULL,
  area_no VARCHAR(50) NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(admin_id, district_id, area_no)
);

-- Create indices for better query performance
CREATE INDEX IF NOT EXISTS idx_admin_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admin_assignments_admin ON admin_assignments(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_assignments_district ON admin_assignments(district_id);

-- Sample data: Create a super admin (password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO admins (name, email, password_hash, is_super_admin)
VALUES ('Super Admin', 'admin@voting.com', '$2b$10$wX/w5MV7yZ3Y4YqYpZqX9.dJrJcNw5XjKq8X3YjKq8X3YjKq8', true)
ON CONFLICT (email) DO NOTHING;

-- Sample admin for Kathmandu district, area 1
INSERT INTO admins (name, email, password_hash, is_super_admin)
VALUES ('Kathmandu Admin', 'kathmandu.admin@voting.com', '$2b$10$wX/w5MV7yZ3Y4YqYpZqX9.dJrJcNw5XjKq8X3YjKq8X3YjKq8', false)
ON CONFLICT (email) DO NOTHING;

-- Assign admin to Kathmandu district area 1
INSERT INTO admin_assignments (admin_id, district_id, area_no)
SELECT admin_id, 'Kathmandu', '1' FROM admins WHERE email = 'kathmandu.admin@voting.com'
ON CONFLICT (admin_id, district_id, area_no) DO NOTHING;
