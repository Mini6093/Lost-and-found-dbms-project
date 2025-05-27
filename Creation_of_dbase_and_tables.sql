-- Drop and recreate database
DROP DATABASE IF EXISTS lost_and_found2;
CREATE DATABASE lost_and_found2;
USE lost_and_found2;

-- 1. item_categories Table
CREATE TABLE item_categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(255) UNIQUE NOT NULL,
  category_description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. locations Table
CREATE TABLE locations (
  location_id INT AUTO_INCREMENT PRIMARY KEY,
  location_name VARCHAR(255) UNIQUE NOT NULL,
  location_details TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. admin_users Table
CREATE TABLE admin_users (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  last_login TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. lost_items Table
CREATE TABLE lost_items (
  lost_item_id INT AUTO_INCREMENT PRIMARY KEY,
  report_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reporter_name VARCHAR(255) NOT NULL,
  reporter_contact VARCHAR(255) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  item_description TEXT,
  lost_date DATETIME NOT NULL,
  lost_location_id INT NOT NULL,
  category_id INT NULL,
  status ENUM('open','in_progress','matched','closed_returned','closed_unclaimed') NOT NULL DEFAULT 'open',
  notes TEXT,
  resolved_date TIMESTAMP NULL,
  FOREIGN KEY (lost_location_id) REFERENCES locations(location_id),
  FOREIGN KEY (category_id) REFERENCES item_categories(category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. found_items Table
CREATE TABLE found_items (
  found_item_id INT AUTO_INCREMENT PRIMARY KEY,
  report_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reporter_name VARCHAR(255) NOT NULL,
  reporter_contact VARCHAR(255) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  item_description TEXT,
  found_date DATETIME NOT NULL,
  found_location_id INT NOT NULL,
  assigned_location_id INT NULL,
  category_id INT NULL,
  status ENUM('open','in_progress','matched','closed_returned','closed_unclaimed') NOT NULL DEFAULT 'open',
  notes TEXT,
  resolved_date TIMESTAMP NULL,
  FOREIGN KEY (found_location_id) REFERENCES locations(location_id),
  FOREIGN KEY (assigned_location_id) REFERENCES locations(location_id),
  FOREIGN KEY (category_id) REFERENCES item_categories(category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. matches Table
CREATE TABLE matches (
  match_id INT AUTO_INCREMENT PRIMARY KEY,
  lost_item_id INT NOT NULL,
  found_item_id INT NOT NULL,
  match_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_status ENUM('returned','unclaimed') NULL,
  resolved_date TIMESTAMP NULL,
  FOREIGN KEY (lost_item_id) REFERENCES lost_items(lost_item_id),
  FOREIGN KEY (found_item_id) REFERENCES found_items(found_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. status_history Table
CREATE TABLE status_history (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL,
  item_type ENUM('lost','found') NOT NULL,
  status ENUM('open','in_progress','matched','closed_returned','closed_unclaimed') NOT NULL,
  changed_by_admin_id INT NOT NULL,
  change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (changed_by_admin_id) REFERENCES admin_users(admin_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3 sample locations
INSERT INTO locations (location_name, location_details) VALUES
  ('Library - Main Hall',    'Central library main hall near the entrance'),
  ('Cafeteria - South Wing', 'Student cafeteria located in the south academic block'),
  ('Gymnasium',               'Indoor sports complex and gym area');

-- 3 sample item categories
INSERT INTO item_categories (category_name, category_description) VALUES
  ('Electronics', 'Devices such as phones, laptops, chargers'),
  ('Stationery',  'Pens, notebooks, and other study supplies'),
  ('Clothing',    'Jackets, sweaters, and other apparel items');

-- 3 sample admin users (passwords are bcrypt hashes for password1, password2, password3)
INSERT INTO admin_users (username, password) VALUES
  ('admin1', '$2b$12$hf3grblrl0iEHi14.qlkC.loAVIt.I9sStxIaJHJxs2rQNmTCRawa'),
  ('admin2', '$2b$12$9g28h2MAU3vViP3wdpsA5uU0HNjxsM4Cz6er22RthRGllOf9FFpDi'),
  ('admin3', '$2b$12$d2Lrnje62yzcA.waa3oV1.jJ//A0tkTSiGMbHi5BjzuNUt8/MEZ92');
  
  SELECT admin_id, username, password
  FROM admin_users;
  
  UPDATE admin_users 
SET password = '$2b$12$9e/CNS5DiO0RAy80T0xsmeFFv6jydy4FgO6QB51f4HiguilTbcJFe' 
WHERE username = 'admin1';

UPDATE admin_users 
SET password = '$2b$12$iT6JPgWV9Z3la7ZJ2jvmvO3r6qtooiNKRDOd.FyjdUEAmpSyvJehu' 
WHERE username = 'admin2';

UPDATE admin_users 
SET password = '$2b$12$b8RJfIU8DUVENm2F7tl9RuWgJBoTpJskWAmRdDdf7zh5lzFgBXnqW' 
WHERE username = 'admin3';

ALTER TABLE admin_users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;