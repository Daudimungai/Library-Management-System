export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  available: boolean;
  borrowedBy?: string;
  dueDate?: Date;
  returnDate?: Date;
  category: string;
  publishedYear: number;
  description?: string;
  coverImage?: string;
  copies: number;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  borrowedBooks: string[];
}

export interface Admin {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'librarian';
}

export interface Notification {
  id: number;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp?: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: Admin | null;
}