import { openDB } from 'idb';
import type { Book, Student, Admin } from '../types';

const DB_NAME = 'LibraryDB';
const DB_VERSION = 2;

export const initDB = async () => {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      if (oldVersion < 1) {
        const bookStore = db.createObjectStore('books', { keyPath: 'id' });
        bookStore.createIndex('isbn', 'isbn', { unique: true });
        
        const studentStore = db.createObjectStore('students', { keyPath: 'id' });
        studentStore.createIndex('name', 'name', { unique: false });
      }
      
      if (oldVersion < 2) {
        const adminStore = db.createObjectStore('admins', { keyPath: 'id' });
        adminStore.createIndex('username', 'username', { unique: true });
        
        // Add default admin account
        const defaultAdmin: Admin = {
          id: crypto.randomUUID(),
          username: 'admin',
          password: 'admin123', // In production, this should be hashed
          name: 'System Administrator',
          role: 'admin'
        };
        adminStore.add(defaultAdmin);
      }
    },
  });
  return db;
};

export const addBook = async (book: Book) => {
  const db = await initDB();
  return db.add('books', book);
};

export const getBooks = async () => {
  const db = await initDB();
  return db.getAll('books');
};

export const updateBook = async (book: Book) => {
  const db = await initDB();
  return db.put('books', book);
};

export const addStudent = async (student: Student) => {
  const db = await initDB();
  return db.add('students', student);
};

export const getStudents = async () => {
  const db = await initDB();
  return db.getAll('students');
};

export const updateStudent = async (student: Student) => {
  const db = await initDB();
  return db.put('students', student);
};

export const getAdminByUsername = async (username: string): Promise<Admin | undefined> => {
  const db = await initDB();
  const index = db.transaction('admins').store.index('username');
  return index.get(username);
};

export const updateAdmin = async (admin: Admin) => {
  const db = await initDB();
  return db.put('admins', admin);
};