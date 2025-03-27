import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBooks, getStudents } from '../db';
import type { Book, Student } from '../types';
import { 
  BookOpen, 
  Users, 
  BookX, 
  Search, 
  RotateCcw, 
  BookMarked,
  Settings,
  LogOut,
  Bell,
  HelpCircle,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function Dashboard() {
  const [books, setBooks] = useState<Book[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock user data (replace with actual authentication later)
  const currentUser = {
    name: "John Doe",
    role: "Librarian"
  };

  useEffect(() => {
    const loadData = async () => {
      const [booksData, studentsData] = await Promise.all([
        getBooks(),
        getStudents(),
      ]);
      setBooks(booksData);
      setStudents(studentsData);
    };
    loadData();
  }, []);

  const totalBooks = books.length;
  const availableBooks = books.filter(book => book.available).length;
  const totalStudents = students.length;
  const recentBooks = books.slice(0, 5); // Get 5 most recent books
  
  // Get recently returned books (books that were previously borrowed but are now available)
  const recentlyReturnedBooks = books
    .filter(book => book.available && book.borrowedBy)
    .slice(0, 5);

  // Mock notifications (replace with actual notifications system)
  const notifications = [
    { id: 1, message: "3 books are overdue", type: "warning" },
    { id: 2, message: "New books added to Science category", type: "info" },
    { id: 3, message: "System maintenance scheduled for Sunday", type: "info" }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome to School Library System</h1>
            <p className="text-gray-600 mt-2">Managing knowledge, empowering minds</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Logged in as:</p>
            <p className="font-semibold text-indigo-600">{currentUser.name} ({currentUser.role})</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/books" className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <BookOpen className="text-indigo-600" size={24} />
            <span className="font-medium">Search & Borrow</span>
          </div>
        </Link>
        <Link to="/returns" className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <RotateCcw className="text-green-600" size={24} />
            <span className="font-medium">Return Books</span>
          </div>
        </Link>
        <Link to="/borrowed" className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <BookMarked className="text-blue-600" size={24} />
            <span className="font-medium">Borrowed Books</span>
          </div>
        </Link>
        <Link to="/settings" className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <Settings className="text-gray-600" size={24} />
            <span className="font-medium">Settings</span>
          </div>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <BookOpen className="text-indigo-600" size={32} />
            <div>
              <h3 className="text-xl font-semibold">Total Books</h3>
              <p className="text-3xl font-bold text-indigo-600">{totalBooks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <BookX className="text-green-600" size={32} />
            <div>
              <h3 className="text-xl font-semibold">Available Books</h3>
              <p className="text-3xl font-bold text-green-600">{availableBooks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <Users className="text-blue-600" size={32} />
            <div>
              <h3 className="text-xl font-semibold">Total Students</h3>
              <p className="text-3xl font-bold text-blue-600">{totalStudents}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* New Arrivals */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">New Arrivals</h3>
          <div className="space-y-3">
            {recentBooks.map(book => (
              <div key={book.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{book.title}</p>
                  <p className="text-sm text-gray-600">{book.author}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  book.available 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {book.available ? 'Available' : 'Borrowed'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications & Rules */}
        <div className="space-y-6">
          {/* Recently Returned Books */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Recently Returned Books</h3>
            <div className="space-y-3">
              {recentlyReturnedBooks.length > 0 ? (
                recentlyReturnedBooks.map(book => (
                  <div key={book.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{book.title}</p>
                      <p className="text-sm text-gray-600">{book.author}</p>
                      <p className="text-xs text-gray-500">ISBN: {book.isbn}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-500" size={16} />
                      <span className="text-sm text-green-600">Returned</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recently returned books</p>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Notifications</h3>
            <div className="space-y-3">
              {notifications.map(notification => (
                <div key={notification.id} className="flex items-start gap-3">
                  <Bell className={`${
                    notification.type === 'warning' ? 'text-amber-500' : 'text-blue-500'
                  }`} size={20} />
                  <p className="text-gray-700">{notification.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Library Rules & Hours */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Library Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-gray-600" />
                <div>
                  <p className="font-medium">Operating Hours</p>
                  <p className="text-sm text-gray-600">Monday - Friday: 8:00 AM - 5:00 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="text-gray-600" />
                <div>
                  <p className="font-medium">Borrowing Rules</p>
                  <p className="text-sm text-gray-600">Maximum 3 books per student</p>
                  <p className="text-sm text-gray-600">14 days borrowing period</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <HelpCircle size={20} className="text-gray-600" />
                <div>
                  <p className="font-medium">Need Help?</p>
                  <p className="text-sm text-gray-600">Contact the librarian at library@school.edu</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}