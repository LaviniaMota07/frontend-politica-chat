export interface LoginResponse {
  user: {
    userId: number;
    name: string;
    email: string;
    typeUserId: number;
  };
}

export interface UserSuggestion {
  email: string;
  name: string;
  userId: number;
}
