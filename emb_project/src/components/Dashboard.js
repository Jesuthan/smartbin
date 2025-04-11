import React, { useState } from 'react';

// Component to show one bin's UI
const BinDetail = ({ id }) => (
  <div className="p-4 border rounded-2xl shadow mb-4 bg-white animate-fade-in">
    <h2 className="text-xl font-semibold mb-2">Bin #{id}</h2>
    <p>Temperature: -- °C</p>
    <p>Humidity: -- %</p>
    <p>Fill Level: -- %</p>
    <p>Location: --</p>
  </div>
);

// Main dashboard component
const Dashboard = () => {
  const [bins, setBins] = useState([1]); // Start with one bin
  const [loading, setLoading] = useState(false);

  const addBin = () => {
    setLoading(true);
    setTimeout(() => {
      setBins(prev => [...prev, prev.length + 1]);
      setLoading(false);
    }, 1000); // 1 second fake loading delay
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Smart Bin Dashboard</h1>

        <button 
          onClick={addBin}
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Adding Bin..." : "Add Bin"}
        </button>

        {loading && (
          <div className="mb-4 text-center text-gray-500">Loading bin...</div>
        )}

        {bins.map(id => (
          <BinDetail key={id} id={id} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
