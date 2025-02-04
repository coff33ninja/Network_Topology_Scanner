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