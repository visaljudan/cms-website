import React from "react";

const Divider = ({ label }) => {
  return (
    <div className="text-xs text-gray-300 font-semibold uppercase tracking-wide px-6 py-2 border-t border-white/10">
      {label}
    </div>
  );
};

export default Divider;
