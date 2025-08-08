import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import messageReducer from './slices/messageSlice';
import searchReducer from './slices/searchSlice';
import freelancerReducer from './slices/freelancerSlice';
import adminReducer from './slices/adminSlice';
import associateReducer from './slices/associateSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    messages: messageReducer,
    search: searchReducer,
    freelancer: freelancerReducer,
    admin: adminReducer,
    associate: associateReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
}); 