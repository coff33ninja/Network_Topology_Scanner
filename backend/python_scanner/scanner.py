#!/usr/bin/env python3

import os
import sys
import time
import json
import sqlite3
import logging
from datetime import datetime
from typing import Dict, List, Optional

import scapy.all as scapy
import nmap
import netifaces
import requests
import websockets
import schedule
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scanner.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class NetworkScanner:
    def __init__(self, db_path: str = "../database/network_topology.db"):
        """Initialize the network scanner."""
        self.db_path = db_path
        self.nm = nmap.PortScanner()
        self.known_devices = self.load_known_devices()
        
    def load_known_devices(self) -> Dict:
        """Load known devices from database."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT mac_address, device_type FROM devices")
        devices = {row[0]: row[1] for row in cursor.fetchall()}
        conn.close()
        return devices

    async def scan_network(self, network: str = "192.168.1.0/24") -> List[Dict]:
        """Perform a network scan using scapy."""
        logger.info(f"Starting network scan on {network}")
        
        # Create ARP request packet
        arp = scapy.ARP(pdst=network)
        ether = scapy.Ether(dst="ff:ff:ff:ff:ff:ff")
        packet = ether/arp

        # Send packet and get response
        result = scapy.srp(packet, timeout=3, verbose=0)[0]
        devices = []

        for sent, received in result:
            device = {
                'ip': received.psrc,
                'mac': received.hwsrc,
                'timestamp': datetime.now().isoformat()
            }
            devices.append(device)
            
            # Scan ports for this device
            self.scan_ports(device)

        return devices

    def scan_ports(self, device: Dict) -> None:
        """Scan ports for a specific device using nmap."""
        try:
            self.nm.scan(device['ip'], arguments='-sS -sV -F')
            
            if device['ip'] in self.nm.all_hosts():
                device['ports'] = []
                for proto in self.nm[device['ip']].all_protocols():
                    ports = self.nm[device['ip']][proto].keys()
                    for port in ports:
                        service = self.nm[device['ip']][proto][port]
                        device['ports'].append({
                            'port': port,
                            'protocol': proto,
                            'service': service.get('name', ''),
                            'version': service.get('version', '')
                        })
        except Exception as e:
            logger.error(f"Error scanning ports for {device['ip']}: {str(e)}")

    def update_database(self, devices: List[Dict]) -> None:
        """Update the SQLite database with scan results."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        for device in devices:
            # Update or insert device
            cursor.execute("""
                INSERT OR REPLACE INTO devices 
                (mac_address, ip_address, last_seen, is_active, updated_at)
                VALUES (?, ?, ?, ?, ?)
            """, (
                device['mac'],
                device['ip'],
                device['timestamp'],
                True,
                datetime.now().isoformat()
            ))

            device_id = cursor.lastrowid

            # Update services
            if 'ports' in device:
                for port_info in device['ports']:
                    cursor.execute("""
                        INSERT OR REPLACE INTO services
                        (device_id, port, protocol, service_name, is_active, last_checked)
                        VALUES (?, ?, ?, ?, ?, ?)
                    """, (
                        device_id,
                        port_info['port'],
                        port_info['protocol'],
                        port_info['service'],
                        True,
                        datetime.now().isoformat()
                    ))

        conn.commit()
        conn.close()

    async def start_monitoring(self):
        """Start continuous network monitoring."""
        while True:
            try:
                devices = await self.scan_network()
                self.update_database(devices)
                # TODO: Implement WebSocket notifications
                await asyncio.sleep(300)  # Scan every 5 minutes
            except Exception as e:
                logger.error(f"Error in monitoring loop: {str(e)}")
                await asyncio.sleep(60)  # Wait a minute before retrying

if __name__ == "__main__":
    scanner = NetworkScanner()
    import asyncio
    asyncio.run(scanner.start_monitoring())