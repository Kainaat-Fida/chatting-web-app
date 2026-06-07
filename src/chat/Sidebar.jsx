import React, { useState } from "react";
import AddContactModal from "./AddContactModel";
import { LogOut, UserPlus, Search } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../app/firebase";
import { useNavigate } from "react-router-dom";
import { logout } from "../features/auth/authSlice";
import { useDispatch } from "react-redux";

export default function Sidebar({ currentUser = {}, users = [], selectedUser, onSelect }) {
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(logout());
    navigate("/", { replace: true });
  };

  const filteredUsers = users.filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const name = (u.username || "").toLowerCase();
    const prof = (u.profession || "").toLowerCase();
    return name.includes(q) || prof.includes(q);
  });

  const getAvatar = (url) => url?.trim() || "/images/default-avatar.png";

  return (
    <div className="h-full flex flex-col">
      {/* Current User */}
      <div className="flex items-center justify-between p-3 border-b bg-[#f0f2f5]">
        <div className="flex items-center gap-3">
          <img
            src={getAvatar(currentUser.profileImage)}
            alt={currentUser.username || currentUser.email || "You"}
            className="w-12 h-12 rounded-full border"
            onError={(e) => (e.target.src = "/images/default-avatar.png")}
          />
          <div>
            <div className="font-semibold text-lg">
              {currentUser.username} (you)
            </div>
            <div className="text-sm text-gray-500">{currentUser.profession}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <UserPlus
            size={20}
            className="text-gray-600 cursor-pointer hover:text-green-600"
            onClick={() => setShowModal(true)}
          />
          <LogOut
            size={22}
            className="text-gray-600 cursor-pointer hover:text-red-500"
            onClick={handleLogout}
          />
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center p-3 border-b gap-2 bg-[#f8fafc]">
        <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 w-full shadow-sm border border-gray-200">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search or start new chat"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border-0 outline-none text-sm"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#f8fafc]">
        {filteredUsers.length === 0 && (
          <div className="text-center text-sm text-gray-400 mt-6">No chats found</div>
        )}

        {filteredUsers.map((u) => (
          <div
            key={u.uid || u.email || Math.random()}
            onClick={() => onSelect(u)}
            className={`flex items-center gap-3 p-3 rounded-xl mb-1 cursor-pointer transition ${
              selectedUser?.uid === u.uid ? "bg-green-50 border-l-4 border-green-500" : "hover:bg-white"
            }`}
          >
            <img
              src={getAvatar(u.profileImage)}
              alt={u.username || u.email || "User"}
              className="w-12 h-12 rounded-full border"
              onError={(e) => (e.target.src = "/images/default-avatar.png")}
            />
            <div className="flex-1">
              <div className="font-semibold text-sm">{u.username || u.email || "Unknown"}</div>
              <div className="text-xs text-gray-500">{u.profession || "No role"}</div>
            </div>
            <div className="text-xs text-gray-400">
              {u.lastMessage?.createdAt
                ? new Date(u.lastMessage.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <AddContactModal
          close={() => setShowModal(false)}
          currentUser={currentUser}
          onSelect={(user) => {
            onSelect(user);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
