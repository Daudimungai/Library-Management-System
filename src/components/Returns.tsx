import React, { useEffect, useState } from 'react';
import { getBooks, getStudents, updateBook } from '../db';
import type { Book, Student } from '../types';
import { CheckCircle, Calendar, BookOpen, User } from 'lucide-react';

export default function Returns() {
  const [books, setBooks] = useState<Book[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<(Book & { student: Student })[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [booksData, studentsData] = await Promise.all([
        getBooks(),
        getStudents(),
      ]);
      setBooks(booksData);
      setStudents(studentsData);

      // Get all borrowed books with student information
      const borrowed = booksData
        .filter(book => !book.available && book.borrowedBy)
        .map(book => ({
          ...book,
          student: studentsData.find(s => s.id === book.borrowedBy)!
        }))
        .filter(item => item.student); // Only include books where we found the student

      setBorrowedBooks(borrowed);
    };
    loadData();
  }, []);

  const handleReturn = async (book: Book) => {
    try {
      const updatedBook = {
        ...book,
        available: true,
        returnDate: new Date(),
        borrowedBy: undefined,
        dueDate: undefined
      };
      
      await updateBook(updatedBook);
      
      // Update local state
      setBooks(books.map(b => b.id === book.id ? updatedBook : b));
      setBorrowedBooks(borrowedBooks.filter(b => b.id !== book.id));
    } catch (error) {
      console.error('Error returning book:', error);
      alert('Failed to return book. Please try again.');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="text-indigo-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-800">Return Books</h1>
        </div>

        {borrowedBooks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No books are currently borrowed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admission Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Book
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Borrowed Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {borrowedBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {book.student.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Grade {book.student.grade}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {book.student.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{book.title}</div>
                      <div className="text-sm text-gray-500">{book.author}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(book.dueDate!)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(book.dueDate!)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleReturn(book)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Return
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 