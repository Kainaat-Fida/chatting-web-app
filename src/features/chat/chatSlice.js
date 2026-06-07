// src/features/chat/chatSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { db } from "../../app/firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

// -------------------- Fetch all chats for current user --------------------
export const fetchChats = createAsyncThunk(
  "chat/fetchChats",
  async (currentUserUid, { rejectWithValue }) => {
    try {
      const chatsRef = collection(db, "chats");

      return new Promise((resolve) => {
        onSnapshot(chatsRef, async (snapshot) => {
          const usersMap = new Map();

          snapshot.docs.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.senderId === currentUserUid || data.receiverId === currentUserUid) {
              const otherUid = data.senderId === currentUserUid ? data.receiverId : data.senderId;
              const existing = usersMap.get(otherUid);

              const lastMsgCreatedAt = data.lastMessage?.createdAt?.toMillis
                ? data.lastMessage.createdAt.toMillis()
                : 0;
              const existingCreatedAt = existing?.lastMessage?.createdAt
                ? new Date(existing.lastMessage.createdAt).getTime()
                : 0;

              if (!existing || lastMsgCreatedAt > existingCreatedAt) {
                usersMap.set(otherUid, {
                  uid: otherUid,
                  chatId: docSnap.id,
                  lastMessage: data.lastMessage
                    ? {
                        ...data.lastMessage,
                        createdAt: data.lastMessage.createdAt?.toDate?.().toISOString() || null,
                      }
                    : { message: "", createdAt: null },
                });
              }
            }
          });

          const detailed = await Promise.all(
            Array.from(usersMap.values()).map(async (u) => {
              try {
                const userSnap = await getDoc(doc(db, "users", u.uid));
                const pdata = userSnap.exists() ? userSnap.data() : {};
                return {
                  ...u,
                  username: pdata.username || pdata.fullName || "Unknown",
                  profileImage: pdata.profileImage || pdata.photoURL || "/default-avatar.png",
                  profession: pdata.profession || "",
                };
              } catch {
                return { ...u, username: "Unknown", profileImage: "/default-avatar.png", profession: "" };
              }
            })
          );

          // Sort by lastMessage timestamp
          detailed.sort(
            (a, b) => new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0)
          );

          resolve(detailed);
        });
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// -------------------- Fetch messages for a chat --------------------
export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async ({ chatId }, { rejectWithValue }) => {
    try {
      return new Promise((resolve) => {
        const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"));
        onSnapshot(q, (snapshot) => {
          const msgs = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              ...data,
              createdAt: data.createdAt?.toDate?.().toISOString() || null,
            };
          });
          resolve({ chatId, messages: msgs });
        });
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// -------------------- Send message --------------------
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ chatId, currentUser, selectedUser, message }, { rejectWithValue }) => {
    try {
      const timestamp = serverTimestamp();

      // Add message to Firestore
      await addDoc(collection(db, "chats", chatId, "messages"), {
        message,
        senderId: currentUser.uid,
        receiverId: selectedUser.uid,
        createdAt: timestamp,
      });

      // Update lastMessage in chat
      await setDoc(
        doc(db, "chats", chatId),
        {
          senderId: currentUser.uid,
          receiverId: selectedUser.uid,
          lastMessage: { message, createdAt: timestamp },
        },
        { merge: true }
      );

      // Return message in serializable format
      return {
        chatId,
        message: {
          id: Date.now().toString(), // temporary ID for local update
          senderId: currentUser.uid,
          receiverId: selectedUser.uid,
          message,
          createdAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// -------------------- chatSlice --------------------
const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chats: [],          // all chats with last message
    selectedChat: null, // currently selected user/chat
    messages: {},       // { chatId: [messages] }
    loading: false,
    error: null,
  },
  reducers: {
    selectChat: (state, action) => {
      state.selectedChat = action.payload;
    },
    clearChat: (state) => {
      state.selectedChat = null;
    },
  },
  extraReducers: (builder) => {
    // fetchChats
    builder
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // fetchMessages
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      const { chatId, messages } = action.payload;
      state.messages[chatId] = messages;
    });

    // sendMessage
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      const { chatId, message } = action.payload;
      if (!state.messages[chatId]) state.messages[chatId] = [];
      state.messages[chatId].push(message);

      // update lastMessage in chats array
      const chatIndex = state.chats.findIndex((c) => c.chatId === chatId);
      if (chatIndex !== -1) {
        state.chats[chatIndex].lastMessage = message;
      }
    });
  },
});

export const { selectChat, clearChat } = chatSlice.actions;
export default chatSlice.reducer;
