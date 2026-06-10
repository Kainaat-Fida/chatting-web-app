import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Sidebar from "../chat/Sidebar";
import ChatHeader from "../chat/ChatHeader";
import Messages from "../chat/Message";
import { auth, db } from "../app/firebase";
import { doc, getDoc } from "firebase/firestore";
import { fetchChats, selectChat } from "../features/chat/chatSlice";

export default function ChatLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { chats, selectedChat } = useSelector((state) => state.chat);

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mobile view state
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  // Firebase Auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          const data = snap.exists() ? snap.data() : {};
          const userData = {
            uid: user.uid,
            username: data.username || data.fullName || user.displayName || user.email,
            email: user.email,
            profileImage: data.profileImage?.trim() || user.photoURL || "/images/default-avatar.png",
            profession: data.profession || "",
          };
          setCurrentUser(userData);
          dispatch(fetchChats(user.uid));
        } catch (error) {
          console.error("Error fetching user:", error);
          setCurrentUser({
            uid: user.uid,
            username: user.displayName || user.email,
            email: user.email,
            profileImage: user.photoURL || "/images/default-avatar.png",
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [dispatch]);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !currentUser) {
      navigate("/", { replace: true });
    }
  }, [loading, currentUser, navigate]);

  // Auto-select "You" chat
  useEffect(() => {
    if (currentUser && chats?.length > 0 && !selectedChat) {
      const selfChat = chats.find(c => c.uid === currentUser.uid);
      dispatch(selectChat(selfChat || currentUser));
    }
  }, [currentUser, chats, selectedChat, dispatch]);

  const handleSelectUser = (user) => {
    dispatch(selectChat(user));
    setIsMobileChatOpen(true); // open chat on mobile
  };

  const handleBackClick = () => {
    setIsMobileChatOpen(false); // go back to sidebar
  };

  return (
    <div className="w-full h-[100dvh] flex bg-[#f0f2f5] overflow-hidden">

      {/* LEFT SIDEBAR */}
      <div
        className={`fixed inset-0 z-20 bg-[#f8fafc] md:relative md:translate-x-0 w-full md:w-[32%] h-[100dvh]
 border-r flex flex-col transition-transform duration-300
        ${isMobileChatOpen ? "-translate-x-full md:translate-x-0" : "translate-x-0"}`}
      >
        {currentUser && (
          <Sidebar
            currentUser={currentUser}
            users={[currentUser, ...(chats || []).filter(c => c.uid !== currentUser.uid)]}
            selectedUser={selectedChat}
            onSelect={handleSelectUser}
          />
        )}
      </div>

      {/* RIGHT CHAT AREA */}
      <div
        className={`flex-1 h-[100dvh] flex flex-col bg-[#f6f2eb] overflow-hidden transition-transform duration-300
        ${isMobileChatOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}
      >
        {currentUser && selectedChat && (
          <>
            {/* Pass handleBackClick to ChatHeader */}
            <ChatHeader selectedUser={selectedChat} onBack={handleBackClick} />
            <div className="flex-1 flex flex-col min-h-0 pt-[10px]">
              <Messages selectedUser={selectedChat} currentUser={currentUser} />
            </div>


          </>
        )}

        {!selectedChat && (
          <div className="flex-1 flex items-center justify-center text-gray-500 bg-[#f6f2eb]">
            Loading chats...
          </div>
        )}
      </div>
    </div>
  );
}
