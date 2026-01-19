import React from 'react';

const TestClick: React.FC = () => {
  const handleClick = () => {
    console.log('Test click worked!');
    alert('Click test successful!');
  };

  return (
    <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg m-4">
      <h3 className="font-bold mb-2">Click Test Component</h3>
      <button 
        onClick={handleClick}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Test Button Click
      </button>
      <div 
        onClick={handleClick}
        className="mt-2 p-3 bg-green-500/20 border border-green-500/50 rounded cursor-pointer hover:bg-green-500/30"
      >
        Test Div Click (should also work)
      </div>
    </div>
  );
};

export default TestClick;