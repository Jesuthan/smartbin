import React from "react";

const ControlButtons = ({ onCompressWaste, onAddBin }) => {
  return (
    <div className="text-center mt-4">
      {/* Button to Compress Waste */}
      <button
        onClick={onCompressWaste}
        className="btn btn-warning m-2"
      >
        Compress Bin
      </button>
      
      {/* Button to Add a New Bin */}
      <button
        onClick={onAddBin}
        className="btn btn-success m-2"
      >
        Add Bin
      </button>
    </div>
  );
};

export default ControlButtons;
