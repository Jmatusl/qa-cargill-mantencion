//TODO: CRear tipos de datos de el usuario con los Tokens o roles
export type User = {
  id?: number;
  username?: string;
  email: string;
  verified?: boolean;
  role?: string;
  tokens?: Token[];
  password?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Token = {
  createdAt: string;
  expiresAt: string;
  id: number;
  token: string;
  type: string;
  updatedAt: string;
  used: boolean;
  userId: number;
  url?: string;
};

export type UserForm = {
  id?: number;
  username: string;
  email: string;
  password?: string;
  role?: string;
};
