import React, { useState } from 'react';
import type { Book, Student } from '../types';
import { addStudent, updateBook } from '../db';

interface BorrowerFormProps {
  availableBooks: Book[];
  onBorrow: () => void;
}

export default function BorrowerForm({ availableBooks, onBorrow }: BorrowerFormProps) {
  const [studentName, setStudentName] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !admissionNumber || selectedBooks.length === 0) {
      alert('Please fill in all fields and select at least one book');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create new student
      const newStudent: Student = {
        id: admissionNumber,
        name: studentName,
        grade: '', // You might want to add this field to the form
        borrowedBooks: selectedBooks
      };
      await addStudent(newStudent);

      // Update books to mark them as borrowed
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // Set due date to 14 days from now

      await Promise.all(
        selectedBooks.map(bookId => {
          const book = availableBooks.find(b => b.id === bookId);
          if (book) {
            return updateBook({
              ...book,
              available: false,
              borrowedBy: admissionNumber,
              dueDate
            });
          }
        })
      );

      // Reset form
      setStudentName('');
      setAdmissionNumber('');
      setSelectedBooks([]);
      onBorrow();
    } catch (error) {
      console.error('Error borrowing books:', error);
      alert('Failed to borrow books. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Borrow Books</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="studentName" className="block text-sm font-medium text-gray-700">
            Student Name
          </label>
          <input
            type="text"
            id="studentName"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label htmlFor="admissionNumber" className="block text-sm font-medium text-gray-700">
            Admission Number
          </label>
          <input
            type="text"
            id="admissionNumber"
            value={admissionNumber}
            onChange={(e) => setAdmissionNumber(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Books to Borrow
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableBooks.map(book => (
              <label key={book.id} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedBooks.includes(book.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedBooks([...selectedBooks, book.id]);
                    } else {
                      setSelectedBooks(selectedBooks.filter(id => id !== book.id));
                    }
                  }}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  {book.title} by {book.author}
                </span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Processing...' : 'Borrow Books'}
        </button>
      </form>
    </div>
  );
} 