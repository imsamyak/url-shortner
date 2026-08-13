export interface User {
  id: string;
  name: string;
  email: string;
}
export interface Redirect {
  id: string;
  url: string;
  origin: string;
  createdAt: string;
  expiresAt?: string;
}
