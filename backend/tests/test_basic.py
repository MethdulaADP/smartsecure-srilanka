import os
import tempfile
import json
import unittest
from pathlib import Path

from app import app, create_database, DB_PATH

class BasicAPITest(unittest.TestCase):
    def setUp(self):
        # Use a temp DB per test run
        self.tmp_dir = tempfile.TemporaryDirectory()
        self.db_file = Path(self.tmp_dir.name) / 'test.db'
        # Monkey patch global DB_PATH (simple approach for now)
        from app import DB_PATH as APP_DB_PATH
        APP_DB_PATH = self.db_file  # noqa
        from database import create_database
        create_database(self.db_file)
        self.client = app.test_client()

    def tearDown(self):
        self.tmp_dir.cleanup()

    def test_health(self):
        r = self.client.get('/health')
        self.assertEqual(r.status_code, 200)
        self.assertIn('status', r.get_json())

    def test_register_and_login(self):
        r = self.client.post('/register', json={'username': 'alice', 'password': 'pw123', 'email': 'a@a.com'})
        self.assertEqual(r.status_code, 200)
        data = r.get_json()
        self.assertTrue(data['success'])

        r2 = self.client.post('/login', json={'username': 'alice', 'password': 'pw123'})
        self.assertEqual(r2.status_code, 200)
        self.assertTrue(r2.get_json()['success'])

if __name__ == '__main__':
    unittest.main()
