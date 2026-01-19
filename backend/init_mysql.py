#!/usr/bin/env python3
"""
MySQL Database Initialization Script for TradeSense
This script helps initialize and test MySQL database connection.
"""

import os
import sys
from dotenv import load_dotenv
import pymysql

# Load environment variables
load_dotenv()

def test_mysql_connection():
    """Test MySQL connection with provided credentials"""
    try:
        # Get MySQL configuration from environment
        host = os.getenv('MYSQL_HOST', 'localhost')
        port = int(os.getenv('MYSQL_PORT', 3306))
        user = os.getenv('MYSQL_USER', 'root')
        password = os.getenv('MYSQL_PASSWORD', '')
        database = os.getenv('MYSQL_DATABASE', 'tradesense_db')
        
        print(f"Testing MySQL connection...")
        print(f"Host: {host}")
        print(f"Port: {port}")
        print(f"User: {user}")
        print(f"Database: {database}")
        
        # Test basic connection
        connection = pymysql.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        
        print("✅ Basic connection successful!")
        
        # Check if database exists, create if not
        with connection.cursor() as cursor:
            cursor.execute("SHOW DATABASES LIKE %s", (database,))
            result = cursor.fetchone()
            
            if not result:
                print(f"Creating database '{database}'...")
                cursor.execute(f"CREATE DATABASE `{database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
                print("✅ Database created successfully!")
            else:
                print(f"✅ Database '{database}' already exists!")
        
        connection.select_db(database)
        
        # Test table creation
        with connection.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS test_table (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    test_data VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Insert test data
            cursor.execute("INSERT INTO test_table (test_data) VALUES (%s)", ("MySQL connection test",))
            connection.commit()
            
            # Verify data
            cursor.execute("SELECT COUNT(*) as count FROM test_table")
            count = cursor.fetchone()['count']
            print(f"✅ Test table created and verified ({count} records)")
            
            # Clean up test data
            cursor.execute("DELETE FROM test_table WHERE test_data = %s", ("MySQL connection test",))
            connection.commit()
        
        connection.close()
        print("\n🎉 MySQL connection test completed successfully!")
        return True
        
    except pymysql.Error as e:
        print(f"❌ MySQL connection failed: {e}")
        print("\nTroubleshooting tips:")
        print("1. Make sure MySQL server is running")
        print("2. Check if credentials in .env file are correct")
        print("3. Ensure MySQL user has proper permissions")
        print("4. Verify database exists or can be created")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def create_database_tables():
    """Initialize all database tables"""
    try:
        from app import create_app
        from extensions import db
        
        print("Initializing database tables...")
        
        app = create_app()
        
        with app.app_context():
            # Drop all tables first (optional - remove in production)
            # db.drop_all()
            
            # Create all tables
            db.create_all()
            print("✅ All database tables created successfully!")
            
            # Show created tables
            inspector = db.inspect(db.engine)
            tables = inspector.get_table_names()
            print(f"Created tables: {', '.join(tables)}")
            
        return True
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        return False

if __name__ == "__main__":
    print("=== TradeSense MySQL Setup ===\n")
    
    # Test connection first
    if test_mysql_connection():
        print("\n" + "="*50)
        # Then initialize tables
        create_database_tables()
    else:
        print("\nPlease fix the connection issues before proceeding.")
        sys.exit(1)