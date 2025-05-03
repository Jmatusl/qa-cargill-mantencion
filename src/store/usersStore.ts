import { create } from "zustand";
import { User, Token, Role } from "@prisma/client";
import {
  fetchUsers,
  editUser,
  deleteUser,
  sePasswordActiveUser,
} from "@/services/userServices";
interface Error {
  message: string;
}

interface Tokens {
  token: Token;
}

interface UserData extends User {
  roles: Role;
  Token: Tokens[];
}
export interface Store {
  users: UserData[];
  error: Error | null;
  currentUser: UserData | null;
  loading: boolean;

  setLoading: (loading: boolean) => void;
  setCurrentUser: (user: User) => void;
  setError: (error: Error) => void;
  setUsers: (users: UserData[]) => void;
  fetchUsers: () => Promise<void>;
}

export const useUsersStore = create<Store>((set) => ({
  users: [] as UserData[],
  error: null,
  currentUser: null,
  loading: false,

  setLoading: (loading: boolean) => set(() => ({ loading })),
  setCurrentUser: (user: User) =>
    set(() => ({ currentUser: user as UserData })),
  setError: (error: Error) => set(() => ({ error })),
  setUsers: (users: UserData[]) => set(() => ({ users })),
  fetchUsers: async () => {
    try {
      set(() => ({ loading: true }));

      const usersResponse = await fetchUsers();
      // console.log(usersResponse);

      set(() => ({ users: usersResponse }));
    } catch (error) {
      console.error("Failed to fetch users:", error);
      set(() => ({ error: error as Error }));
    } finally {
      set(() => ({ loading: false }));
    }
  },
}));
