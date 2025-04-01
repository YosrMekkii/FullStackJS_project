import React from "react";

const Challenges = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-indigo-600 to-purple-800 text-white py-10 px-6 flex flex-col items-center">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-extrabold mb-6">Challenges</h1>
        <p className="text-lg mb-10">
          Test your skills with real-world challenges and improve by solving them!
        </p>
        <div className="bg-white text-gray-900 rounded-3xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold">Coming Soon...</h2>
          <p className="text-gray-700 mt-4">We are working hard to bring exciting challenges for you.</p>
        </div>
      </div>
    </div>
  );
};

export default Challenges;