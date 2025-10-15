import React from 'react';

export default function OrDivider() {
  return (
    <div className="flex items-center my-6">
      <div className="flex-grow border-t border-gray-300"></div>
      <span className="mx-4 text-sm text-gray-500">or</span>
      <div className="flex-grow border-t border-gray-300"></div>
    </div>
  );
}
