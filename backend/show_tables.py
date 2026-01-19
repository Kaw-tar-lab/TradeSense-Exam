#!/usr/bin/env python3
"""
Script to display database tables and their structure
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Change to the backend directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Add current directory to path
sys.path.insert(0, '.')

# Import and create app
from app import create_app
app = create_app()

# Display tables within app context
with app.app_context():
    from extensions import db
    from sqlalchemy import inspect, text
    
    # Get table information
    insp = inspect(db.engine)
    tables = insp.get_table_names()
    
    print("=== TradeSense Database Tables ===\n")
    print(f"Database: tradesense_db")
    print(f"Total tables: {len(tables)}")
    print("\nTables:")
    for table in sorted(tables):
        print(f"  - {table}")
    
    print("\n=== Table Structures ===")
    
    # Show structure of each table
    for table_name in sorted(tables):
        if table_name != 'test_table':  # Skip test table
            print(f"\n--- {table_name.upper()} ---")
            columns = insp.get_columns(table_name)
            for col in columns:
                nullable = "NULL" if col['nullable'] else "NOT NULL"
                default = f"DEFAULT {col['default']}" if col['default'] else ""
                print(f"  {col['name']} {col['type']} {nullable} {default}".strip())