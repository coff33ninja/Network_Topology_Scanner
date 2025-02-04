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