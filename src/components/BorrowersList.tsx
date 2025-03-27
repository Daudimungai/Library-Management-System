import React from 'react';
import type { Book, Student } from '../types';
import { User, BookOpen, CheckCircle, XCircle } from 'lucide-react';

interface BorrowersListProps {
  students: Student[];
  books: Book[];
  onReturn: (bookId: string) => void;
}

export default function BorrowersList({ students, books, onReturn }: BorrowersListProps) {
  const borrowers = students.filter(student => student.borrowedBooks.length > 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Current Borrowers</h2>
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
                Borrowed Books
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {borrowers.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {student.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Grade {student.grade}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {student.id}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {student.borrowedBooks.map(bookId => {
                      const book = books.find(b => b.id === bookId);
                      if (!book) return null;
                      return (
                        <div key={bookId} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {book.title}
                            </span>
                          </div>
                          <button
                            onClick={() => onReturn(bookId)}
                            className="text-sm text-indigo-600 hover:text-indigo-900"
                          >
                            Return
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {student.borrowedBooks.every(bookId => {
                      const book = books.find(b => b.id === bookId);
                      return book?.available;
                    }) ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 