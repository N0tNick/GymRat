// required to get userId's from loggin in
import React, { createContext, useContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [firestoreUserId, setFirestoreUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null)
  return (
    <UserContext.Provider value={{ userId, setUserId, firestoreUserId, setFirestoreUserId, userEmail, setUserEmail }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
