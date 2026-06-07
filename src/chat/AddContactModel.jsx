import React, { useEffect, useState } from "react";
import { db } from "../app/firebase";
import { collection, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function AddContactModal({ close, currentUser, onSelect }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, "users"));
      const list = [];
      snap.forEach((d) => {
        if (d.id !== currentUser.uid) {
          const data = d.data();
          list.push({
            uid: d.id,
            username: data.username || data.fullName || data.email,
            profileImage: data.profileImage || data.photoURL || "/default-avatar.png",
            profession: data.profession || "",
            email: data.email || "",
          });
        }
      });
      setUsers(list);
    };
    fetchUsers();
  }, [currentUser.uid]);

  const startChat = async (user) => {
    const chatId =
      currentUser.uid > user.uid
        ? currentUser.uid + user.uid
        : user.uid + currentUser.uid;

    await setDoc(
      doc(db, "chats", chatId),
      {
        senderId: currentUser.uid,
        receiverId: user.uid,
        lastMessage: { message: "", createdAt: serverTimestamp() },
      },
      { merge: true }
    );

    if (onSelect) onSelect(user);
    close();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
      onClick={close}
    >
      <div
        className="bg-white rounded-xl w-full sm:w-[380px] max-h-[85vh] flex flex-col shadow-lg animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-lg">Add Contact</h2>
          <button
            onClick={close}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Close
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scroll">
          {users.length === 0 ? (
            <div className="text-center text-gray-500 py-6 text-sm">
              No users found
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.uid}
                onClick={() => startChat(user)}
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition"
              >
                <img
                  src={user.profileImage}
                  alt="avatar"
                  className="w-11 h-11 rounded-full border"
                />
                <div className="flex-1">
                  <div className="font-medium">{user.username}</div>
                  <div className="text-xs text-gray-500">{user.profession}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t">
          <button
            className="w-full py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
            onClick={close}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
