import React from "react";
import { ArrowLeft } from "lucide-react";

export default function ChatHeader({ selectedUser = {}, onBack }) {
  if (!selectedUser.uid) {
    return (
      <div className="h-[70px] border-b flex items-center justify-center text-gray-500 bg-[#f0f2f5]">
        Select conversation
      </div>
    );
  }

  return (
    <div className="h-[72.5px] border-b px-4 flex items-center bg-[#f0f2f5]">

      {/* BACK ARROW — only visible on mobile */}
      {onBack && (
        <button
          className="md:hidden mr-3 relative group"
          onClick={onBack}
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />

          {/* Tooltip */}
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-gray-800
            text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100">
            Back
          </span>
        </button>
      )}

      <img
        src={selectedUser.profileImage || "/images/default-avatar.png"}
        className="w-12 h-12 rounded-full border"
      />

      <div className="ml-3">
        <div className="font-semibold text-gray-900">{selectedUser.username}</div>
        <div className="text-sm text-gray-500">{selectedUser.profession}</div>
      </div>
    </div>
  );
}
