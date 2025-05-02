
import React from "react";

const LoadingState: React.FC = () => {
  return (
    <div className="text-center py-8">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
      <p className="mt-2 text-sm text-gray-500">Načítavam hodnotenia...</p>
    </div>
  );
};

export default LoadingState;
