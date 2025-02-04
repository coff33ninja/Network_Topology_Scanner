#!/usr/bin/env python3

import re
import json
from typing import Dict, Optional

class DeviceRecognition:
    """Device recognition and categorization based on various identifiers."""
    
    def __init__(self, rules_file: str = "recognition_rules.json"):
        """Initialize with recognition rules."""
        self.rules = self.load_rules(rules_file)
        
    def load_rules(self, rules_file: str) -> Dict:
        """Load recognition rules from JSON file."""
        try:
            with open(rules_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return self.get_default_rules()
    
    def get_default_rules(self) -> Dict:
        """Return default recognition rules."""
        return {
            "mac_prefixes": {
                "00:00:0C": "Cisco",
                "00:1A:A0": "Dell",
                "00:14:22": "Dell",
                "00:50:56": "VMware",
                "00:05:69": "VMware",
                "00:1C:42": "Parallels"
            },
            "hostname_patterns": {
                "printer": r".*printer.*|.*print.*",
                "router": r".*router.*|.*gateway.*|.*ap.*",
                "server": r".*srv.*|.*server.*",
                "workstation": r".*pc.*|.*laptop.*|.*desktop.*"
            },
            "service_patterns": {
                "printer": [{"port": 631, "service": "ipp"}],
                "router": [
                    {"port": 80, "service": "http"},
                    {"port": 443, "service": "https"},
                    {"port": 53, "service": "domain"}
                ],
                "server": [
                    {"port": 22, "service": "ssh"},
                    {"port": 3389, "service": "ms-wbt-server"}
                ]
            }
        }
    
    def recognize_device(self, device_info: Dict) -> str:
        """
        Recognize device type based on available information.
        Returns device type as string.
        """
        # Try MAC-based recognition
        if 'mac' in device_info:
            mac_prefix = device_info['mac'][:8].upper()
            if mac_prefix in self.rules['mac_prefixes']:
                return self.rules['mac_prefixes'][mac_prefix]
        
        # Try hostname-based recognition
        if 'hostname' in device_info:
            hostname = device_info['hostname'].lower()
            for device_type, pattern in self.rules['hostname_patterns'].items():
                if re.match(pattern, hostname, re.IGNORECASE):
                    return device_type
        
        # Try service-based recognition
        if 'ports' in device_info:
            for device_type, services in self.rules['service_patterns'].items():
                matches = 0
                required_matches = len(services)
                
                for service in services:
                    for port_info in device_info['ports']:
                        if (port_info['port'] == service['port'] and 
                            service['service'] in port_info['service'].lower()):
                            matches += 1
                            break
                
                if matches == required_matches:
                    return device_type
        
        return "unknown"

    def get_device_capabilities(self, device_type: str) -> Dict:
        """Return capabilities for a given device type."""
        capabilities = {
            "printer": {
                "allow_wol": True,
                "allow_remote_access": True,
                "services": ["ipp", "http"],
                "icon": "printer.png"
            },
            "router": {
                "allow_wol": False,
                "allow_remote_access": True,
                "services": ["http", "https", "ssh"],
                "icon": "router.png"
            },
            "server": {
                "allow_wol": True,
                "allow_remote_access": True,
                "services": ["ssh", "rdp", "http"],
                "icon": "server.png"
            },
            "workstation": {
                "allow_wol": True,
                "allow_remote_access": True,
                "services": ["rdp", "ssh"],
                "icon": "workstation.png"
            },
            "unknown": {
                "allow_wol": False,
                "allow_remote_access": False,
                "services": [],
                "icon": "unknown.png"
            }
        }
        return capabilities.get(device_type, capabilities["unknown"])