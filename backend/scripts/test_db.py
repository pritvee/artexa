import pymysql
import sys
import os

def test_conn():
    try:
        conn = pymysql.connect(
            host='localhost',
            user='root',
            password=os.getenv('DB_PASSWORD', ''),
            port=3306
        )
        print("Successfully connected to MySQL server!")
        
        with conn.cursor() as cursor:
            cursor.execute("CREATE DATABASE IF NOT EXISTS artexa_db")
            print("Database 'artexa_db' checked/created.")
            
        conn.close()
    except Exception as e:
        print(f"Error: {e}")
        print("\nNote: If you have a password for your 'root' user, please set it in your .env file.")

if __name__ == "__main__":
    test_conn()
