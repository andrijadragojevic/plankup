import React, { useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const FirebaseTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Testing...');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    console.log(msg);
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    addLog('Starting Firebase connection test...');

    // Test 1: Check if Firebase objects exist
    if (auth) {
      addLog('✓ Auth object exists');
    } else {
      addLog('✗ Auth object is undefined!');
    }

    if (db) {
      addLog('✓ Firestore object exists');
    } else {
      addLog('✗ Firestore object is undefined!');
    }

    // Test 2: Check environment variables
    addLog(`API Key: ${import.meta.env.VITE_FIREBASE_API_KEY ? 'Present' : 'Missing'}`);
    addLog(`Project ID: ${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'Missing'}`);
    addLog(`Auth Domain: ${import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'Missing'}`);

    // Test 3: Try to set up auth listener
    try {
      addLog('Setting up auth state listener...');
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          if (user) {
            addLog(`✓ Auth state changed: User logged in (${user.uid})`);
            setStatus('Firebase Connected - User Logged In');
          } else {
            addLog('✓ Auth state changed: No user');
            setStatus('Firebase Connected - No User');
          }
        },
        (error) => {
          addLog(`✗ Auth error: ${error.message}`);
          setStatus('Firebase Error');
        }
      );

      return () => {
        addLog('Cleaning up auth listener');
        unsubscribe();
      };
    } catch (error: any) {
      addLog(`✗ Failed to set up auth listener: ${error.message}`);
      setStatus('Firebase Connection Failed');
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Firebase Connection Test</h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Status</h2>
          <p className="text-2xl font-mono">{status}</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Logs</h2>
          <div className="bg-slate-900 text-green-400 p-4 rounded font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
