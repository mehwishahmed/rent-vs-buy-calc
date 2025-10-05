// src/components/ModeToggle.tsx
'use client';

import React, { useState } from 'react';
import { ChatInterface } from './chat/ChatInterface';
import { Calculator } from './calculator/Calculator';

export function ModeToggle() {
  const [mode, setMode] = useState<'chat' | 'dashboard'>('chat');

  if (mode === 'chat') {
    return (
      <ChatInterface 
        onSwitchToDashboard={() => setMode('dashboard')} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Dashboard Header with Chat Toggle */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Rent vs Buy Calculator</h1>
          <button
            onClick={() => setMode('chat')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <span className="text-lg">🤖</span>
            Switch to AI Mode
          </button>
        </div>
      </div>
      
      {/* Traditional Calculator */}
      <Calculator />
    </div>
  );
}

