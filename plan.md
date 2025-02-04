# Network Topology Scanner & Management System Overview
Created on: 2024-01-09

## System Description
This system is a modular network topology scanner with a centralized Core UI that allows multi-location monitoring using distributed Python and Node.js nodes. It provides in-depth scanning, real-time device tracking, and cross-referenced validation using an SQLite3 database.

## Key Features
1. Multi-node Support
   - Collect and manage data from multiple servers or locations
   - Distributed architecture for scalability

2. Device Management
   - Wake-on-LAN (WoL) capabilities
   - Remote power management
   - IP:Port direct access to services

3. Monitoring Features
   - Always-online monitoring with downtime alerts
   - Scheduled speed tests
   - Network performance tracking
   - Self-hosted & remote tool detection (Anydesk, RustDesk, RDP, VNC)

4. Scanning Capabilities
   - Open port detection
   - Service identification
   - Protocol recognition (SSH, HTTP, SMB, FTP)
   - Custom port scanning

5. Core UI Features
   - Graphical network mapping
   - Dynamic UI adaptation
   - Direct service access links
   - Historical data visualization

6. Security Features
   - Role-based access control
   - Remote command execution
   - API contract validation
   - Error handling and fallbacks

## Technology Stack
- Backend: Python (Network Scanning) + Node.js (API)
- Frontend: React
- Database: SQLite3
- Real-time Updates: WebSockets

## Project Structure
📂 Network_Topology_Scanner
 ├── 📂 docs                # Documentation & planning
 ├── 📂 backend            # Backend services
 ├── 📂 frontend           # Frontend application
 ├── 📂 database           # Database files
 └── 📂 scripts            # Utility scripts

For detailed information about specific components, please refer to their respective documentation files in the docs directory.
c:\Users\HLTWO\Network\Network_Topology_Scanner\docs\database_schema.txt
# Database Schema Documentation
Created on: 2024-01-09

## Overview
The SQLite3 database schema is designed to support network topology scanning, device tracking, and user management.

## Core Tables

### 1. devices
- id: INTEGER PRIMARY KEY
- mac_address: TEXT UNIQUE
- ip_address: TEXT
- hostname: TEXT
- device_type: TEXT
- location_id: INTEGER
- last_seen: TIMESTAMP
- is_active: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

### 2. device_types
- id: INTEGER PRIMARY KEY
- name: TEXT UNIQUE
- icon: TEXT
- default_ports: TEXT
- default_protocols: TEXT
- ui_rules: TEXT (JSON)

### 3. services
- id: INTEGER PRIMARY KEY
- device_id: INTEGER
- port: INTEGER
- protocol: TEXT
- service_name: TEXT
- is_active: BOOLEAN
- last_checked: TIMESTAMP

### 4. locations
- id: INTEGER PRIMARY KEY
- name: TEXT
- description: TEXT
- network_range: TEXT
- created_at: TIMESTAMP

### 5. users
- id: INTEGER PRIMARY KEY
- username: TEXT UNIQUE
- password_hash: TEXT
- role: TEXT
- last_login: TIMESTAMP
- created_at: TIMESTAMP

### 6. scan_history
- id: INTEGER PRIMARY KEY
- device_id: INTEGER
- scan_time: TIMESTAMP
- status: TEXT
- details: TEXT (JSON)

## Indexes
- devices_mac_idx ON devices(mac_address)
- devices_ip_idx ON devices(ip_address)
- services_device_port_idx ON services(device_id, port)

## Foreign Keys
- devices.location_id -> locations.id
- services.device_id -> devices.id
- scan_history.device_id -> devices.id

## JSON Structures

### Device Type UI Rules
```json
{
  "allow_wol": boolean,
  "allow_remote_access": boolean,
  "display_options": {
    "show_in_map": boolean,
    "show_services": boolean
  }
}
Scan History Details
{
  "response_time": float,
  "open_ports": [int],
  "services_detected": [{
    "port": int,
    "protocol": string,
    "service": string
  }]
}

📍REWRITE_WHOLE_FILE 003 "c:\Users\HLTWO\Network\Network_Topology_Scanner\docs\api_structure.txt"
API Structure Documentation
Created on: 2024-01-09
API Endpoints
Device Management
GET    /api/devices
GET    /api/devices/:id
POST   /api/devices
PUT    /api/devices/:id
DELETE /api/devices/:id
Scanning Operations
POST   /api/scan/network
POST   /api/scan/device/:id
GET    /api/scan/history
GET    /api/scan/status
Service Management
GET    /api/services
GET    /api/services/:id
POST   /api/services/check/:id
Location Management
GET    /api/locations
POST   /api/locations
PUT    /api/locations/:id
DELETE /api/locations/:id
User Management
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/users
POST   /api/users
PUT    /api/users/:id
WebSocket Events
Device Status
device.online
device.offline
device.updated
service.status_change
Scanning Events
scan.started
scan.progress
scan.completed
scan.error
System Events
system.alert
system.notification
system.error
Request/Response Examples
Device Object
{
  "id": "integer",
  "mac_address": "string",
  "ip_address": "string",
  "hostname": "string",
  "device_type": "string",
  "location_id": "integer",
  "services": [{
    "port": "integer",
    "protocol": "string",
    "status": "string"
  }],
  "last_seen": "timestamp",
  "is_active": "boolean"
}
Scan Result Object
{
  "scan_id": "string",
  "timestamp": "datetime",
  "device_id": "integer",
  "results": {
    "status": "string",
    "open_ports": ["integer"],
    "services": [{
      "port": "integer",
      "protocol": "string",
      "service_name": "string"
    }],
    "response_time": "float"
  }
}
Error Handling
All endpoints follow standard HTTP status codes:
200: Success
201: Created
400: Bad Request
401: Unauthorized
403: Forbidden
404: Not Found
500: Internal Server Error
Error Response Format:
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object (optional)"
  }
}

📍REWRITE_WHOLE_FILE 004 "c:\Users\HLTWO\Network\Network_Topology_Scanner\docs\ui_design.txt"
UI Design Documentation
Created on: 2024-01-09
Core UI Components
1. Navigation
Main dashboard
Device list
Network map
Scan history
Settings
User management
2. Dashboard Layout
+------------------+------------------+
|     Network      |    Quick         |
|     Status       |    Actions       |
+------------------+------------------+
|                                    |
|        Network Map                 |
|                                    |
+------------------+------------------+
| Active           |    Recent        |
| Alerts          |    Changes       |
+------------------+------------------+
3. Device Card Design
+--------------------------------+
| [Icon] Device Name             |
|--------------------------------|
| IP: xxx.xxx.xxx.xxx           |
| Status: Active/Inactive        |
| Services: SSH, HTTP, etc.      |
|--------------------------------|
| [Actions] [Details] [Monitor]  |
+--------------------------------+
4. Network Map Features
Interactive node visualization
Color-coded status indicators
Zoom and pan controls
Grouping by location
Connection line visualization
Service indicators
5. Alert System
Toast notifications
Status bar indicators
Alert levels:
Critical (Red)
Warning (Yellow)
Info (Blue)
Success (Green)
6. Data Tables
Sortable columns
Filterable content
Pagination
Bulk actions
Export functionality
7. Forms
Device addition/editing
User management
Scan configuration
Settings modification
8. Responsive Design Breakpoints
Desktop: 1200px+
Tablet: 768px - 1199px
Mobile: <768px
Color Scheme
:root {
  --primary: #2c3e50;
  --secondary: #34495e;
  --accent: #3498db;
  --success: #2ecc71;
  --warning: #f1c40f;
  --danger: #e74c3c;
  --light: #ecf0f1;
  --dark: #2c3e50;
}
Typography
Primary Font: 'Roboto', sans-serif
Monospace: 'Source Code Pro', monospace
Size Scale:
h1: 2.5rem
h2: 2rem
h3: 1.75rem
body: 1rem
small: 0.875rem
Icons
Device Types:
router.svg
server.svg
workstation.svg
printer.svg
unknown.svg
Status Icons:
online.svg
offline.svg
warning.svg
error.svg
Action Icons:
scan.svg
edit.svg
delete.svg
refresh.svg
Animations
Loading spinners
Status transitions
Toast notifications
Map node interactions
Menu transitions
Accessibility
ARIA labels
Keyboard navigation
High contrast mode
Screen reader support
Focus indicators

📍REWRITE_WHOLE_FILE 005 "c:\Users\HLTWO\Network\Network_Topology_Scanner\docs\roadmap.txt"
Project Roadmap
Created on: 2024-01-09
Phase 1: Foundation (Week 1-2)
 Project structure setup
 Initial documentation
 Basic database schema
 Core Python scanner module
 Basic Node.js API structure
Phase 2: Core Features (Week 3-4)
 Network scanning implementation
 Device detection and tracking
 Basic UI framework
 Database integration
 Initial API endpoints
Phase 3: UI Development (Week 5-6)
 React component structure
 Network map visualization
 Device management interface
 Basic styling and responsiveness
 Form implementations
Phase 4: Advanced Features (Week 7-8)
 Wake-on-LAN implementation
 Service detection
 Real-time updates
 Alert system
 User authentication
Phase 5: Testing & Optimization (Week 9-10)
 Unit testing
 Integration testing
 Performance optimization
 Security hardening
 Documentation updates
Phase 6: Polish & Launch (Week 11-12)
 UI/UX refinements
 Error handling improvements
 Final security audit
 Deployment documentation
 Release preparation
Future Enhancements
Advanced Features
Custom scanning profiles
Automated device categorization
Network traffic analysis
Performance trending
Integration Options
SNMP support
Active Directory integration
Third-party monitoring tools
Custom plugin system
Reporting
Custom report builder
Scheduled reports
Export formats (PDF, CSV, JSON)
Dashboard customization
Mobile Support
Native mobile apps
Push notifications
Offline capabilities
Mobile-optimized views
Timeline Overview
Month 1: Phase 1-2
Month 2: Phase 3-4
Month 3: Phase 5-6
Resource Allocation
Backend Development: 40%
Frontend Development: 30%
Testing & QA: 15%
Documentation: 10%
Project Management: 5%

Now let's create the basic directory structure:

📍OTHER 006
mkdir -p "c:\Users\HLTWO\Network\Network_Topology_Scanner\backend\python_scanner"
mkdir -p "c:\Users\HLTWO\Network\Network_Topology_Scanner\backend\node_api"
mkdir -p "c:\Users\HLTWO\Network\Network_Topology_Scanner\frontend\react_ui"
mkdir -p "c:\Users\HLTWO\Network\Network_Topology_Scanner\frontend\assets"
mkdir -p "c:\Users\HLTWO\Network\Network_Topology_Scanner\database"
mkdir -p "c:\Users\HLTWO\Network\Network_Topology_Scanner\scripts"

Let's create basic script files:

📍REWRITE_WHOLE_FILE 007 "c:\Users\HLTWO\Network\Network_Topology_Scanner\scripts\setup.sh"
```bash
#!/bin/bash

# Setup script for Network Topology Scanner
echo "Setting up Network Topology Scanner..."

# Create virtual environment for Python
python -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies
cd backend/node_api
npm install

# Setup frontend
cd ../../frontend/react_ui
npm install

# Initialize database
cd ../../scripts
python update_schema.py

echo "Setup complete!"
c:\Users\HLTWO\Network\Network_Topology_Scanner\scripts\start_services.sh
#!/bin/bash

# Start all services for Network Topology Scanner
echo "Starting Network Topology Scanner services..."

# Start Python scanner
cd ../backend/python_scanner
python scanner.py &

# Start Node.js API
cd ../node_api
npm start &

# Start React frontend
cd ../../frontend/react_ui
npm start &

echo "All services started!"
c:\Users\HLTWO\Network\Network_Topology_Scanner\scripts\update_schema.py
#!/usr/bin/env python3

import sqlite3
import os
import json
from datetime import datetime

def create_database():
    """Initialize the SQLite database with the required schema."""
    db_path = "../database/network_topology.db"

    # Ensure database directory exists
    os.makedirs(os.path.dirname(db_path), exist_ok=True)

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Create tables
    cursor.executescript('''
        -- Devices table
        CREATE TABLE IF NOT EXISTS devices (
            id INTEGER PRIMARY KEY,
            mac_address TEXT UNIQUE,
            ip_address TEXT,
            hostname TEXT,
            device_type TEXT,
            location_id INTEGER,
            last_seen TIMESTAMP,
            is_active BOOLEAN,
            created_at TIMESTAMP,
            updated_at TIMESTAMP,
            FOREIGN KEY (location_id) REFERENCES locations(id)
        );

        -- Device types table
        CREATE TABLE IF NOT EXISTS device_types (
            id INTEGER PRIMARY KEY,
            name TEXT UNIQUE,
            icon TEXT,
            default_ports TEXT,
            default_protocols TEXT,
            ui_rules TEXT
        );

        -- Services table
        CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY,
            device_id INTEGER,
            port INTEGER,
            protocol TEXT,
            service_name TEXT,
            is_active BOOLEAN,
            last_checked TIMESTAMP,
            FOREIGN KEY (device_id) REFERENCES devices(id)
        );

        -- Locations table
        CREATE TABLE IF NOT EXISTS locations (
            id INTEGER PRIMARY KEY,
            name TEXT,
            description TEXT,
            network_range TEXT,
            created_at TIMESTAMP
        );

        -- Users table
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT UNIQUE,
            password_hash TEXT,
            role TEXT,
            last_login TIMESTAMP,
            created_at TIMESTAMP
        );

        -- Scan history table
        CREATE TABLE IF NOT EXISTS scan_history (
            id INTEGER PRIMARY KEY,
            device_id INTEGER,
            scan_time TIMESTAMP,
            status TEXT,
            details TEXT,
            FOREIGN KEY (device_id) REFERENCES devices(id)
        );
    ''')

    # Create indexes
    cursor.executescript('''
        CREATE INDEX IF NOT EXISTS devices_mac_idx ON devices(mac_address);
        CREATE INDEX IF NOT EXISTS devices_ip_idx ON devices(ip_address);
        CREATE INDEX IF NOT EXISTS services_device_port_idx ON services(device_id, port);
    ''')

    # Insert default device types
    default_types = {
        "router": {
            "icon": "router.png",
            "ports": ["80", "443", "22", "23"],
            "protocols": ["HTTP", "HTTPS", "SSH", "Telnet"],
            "ui_rules": {
                "allow_wol": False,
                "allow_remote_access": True
            }
        },
        "server": {
            "icon": "server.png",
            "ports": ["22", "3389", "5900"],
            "protocols": ["SSH", "RDP", "VNC"],
            "ui_rules": {
                "allow_wol": True,
                "allow_remote_access": True
            }
        }
    }

    for type_name, type_data in default_types.items():
        cursor.execute('''
            INSERT OR IGNORE INTO device_types (name, icon, default_ports, default_protocols, ui_rules)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            type_name,
            type_data["icon"],
            json.dumps(type_data["ports"]),
            json.dumps(type_data["protocols"]),
            json.dumps(type_data["ui_rules"])
        ))

    conn.commit()
    conn.close()

if __name__ == "__main__":
    create_database()
    print("Database schema updated successfully!")
