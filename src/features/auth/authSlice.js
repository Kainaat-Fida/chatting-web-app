import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../../app/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

// ------------------- SIGNUP -------------------
export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async ({ fullName, email, password, profession, avatarUrl }, { rejectWithValue }) => {
    try {
      // Create user with email & password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update Auth profile with name & avatar
      await updateProfile(user, {
        displayName: fullName,
        photoURL: avatarUrl || null,
      });

      // Save user info in Firestore users collection
      const userDoc = {
        uid: user.uid,
        email,
        username: fullName,
        profileImage: avatarUrl || "",
        profession: profession || "",
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", user.uid), userDoc);

      // Return this info to redux
      return userDoc;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ------------------- LOGIN -------------------
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Load Firestore profile (profession, avatar, etc.)
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      let userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      };

      if (userSnap.exists()) {
        userData = { ...userData, ...userSnap.data() };
      }

      return userData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ------------------- AUTH SLICE -------------------
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    // Signup
    builder
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
