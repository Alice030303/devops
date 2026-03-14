import { createContext } from 'react';

const defaultUser = {
  _id: null,
  name: '',
  email: '',
  token: '',
  watched: [],
  favorite: [],
  wishlist: [],
};

export const UserContext = createContext({
  user: defaultUser,
  setUser: () => {},
  logout: () => {},
  checkTokenExpiration: () => {},
  fetchUserProfile: async () => {},
});
export { defaultUser };
