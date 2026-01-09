import React from "react";

const Card = ({ title, description, icon }) => {
  return (
    <div className="max-w-sm rounded-lg bg-gradient-to-b from-[#2c4274] to-[#1E293B] p-6 shadow-lg text-white">
      {/* Icon container */}
      <div className="flex items-center justify-center w-14 h-14 mb-5 mx-auto bg-[#334155] rounded-full">
        {icon ? (
          <img src={icon} alt={title} className="w-6 h-6" />
        ) : (
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        )}
      </div>

      {/* Card Title */}
      <h2 className="text-xl font-semibold text-center mb-2">{title}</h2>

      {/* Card Description */}
      <p className="text-sm text-center text-gray-300">{description}</p>
    </div>
  );
};

export default Card;
