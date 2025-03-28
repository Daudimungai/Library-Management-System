import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBooks, getStudents, addBook, updateBook } from '../db';
import type { Book, Student } from '../types';
import { 
  Plus, 
  Search, 
  ArrowLeft, 
  Filter,
  BookOpen,
  Edit3,
  Trash2,
  AlertCircle,
  X,
  CheckCircle
} from 'lucide-react';
import BorrowerForm from './BorrowerForm';
import BorrowersList from './BorrowersList';

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBookDetails, setShowBookDetails] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    availability: '',
    year: ''
  });
  const [showBorrowerForm, setShowBorrowerForm] = useState(false);
  const [showBorrowersList, setShowBorrowersList] = useState(false);

  // Mock user data (replace with actual authentication later)
  const currentUser = {
    name: "John Doe",
    role: "Librarian"
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [booksData, studentsData] = await Promise.all([
      getBooks(),
      getStudents(),
    ]);
    setBooks(booksData);
    setStudents(studentsData);
  };

  const handleAddBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newBook: Book = {
      id: crypto.randomUUID(),
      title: formData.get('title') as string,
      author: formData.get('author') as string,
      isbn: formData.get('isbn') as string,
      category: formData.get('category') as string,
      publishedYear: parseInt(formData.get('publishedYear') as string),
      description: formData.get('description') as string,
      coverImage: formData.get('coverImage') as string,
      available: true,
      copies: parseInt(formData.get('copies') as string),
    };

    await addBook(newBook);
    await loadData();
    setShowAddForm(false);
  };

  const handleReturn = async (bookId: string) => {
    try {
      const book = books.find(b => b.id === bookId);
      if (!book) return;

      const updatedBook = {
        ...book,
        available: true,
        returnDate: new Date(),
        borrowedBy: undefined,
        dueDate: undefined
      };

      await updateBook(updatedBook);
      setBooks(books.map(b => b.id === bookId ? updatedBook : b));
    } catch (error) {
      console.error('Error returning book:', error);
      alert('Failed to return book. Please try again.');
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm);

    const matchesCategory = !filters.category || book.category === filters.category;
    const matchesAvailability = !filters.availability || 
      (filters.availability === 'available' ? book.available : !book.available);
    const matchesYear = !filters.year || book.publishedYear === parseInt(filters.year);

    return matchesSearch && matchesCategory && matchesAvailability && matchesYear;
  });

  const categories = Array.from(new Set(books.map(book => book.category)));
  const years = Array.from(new Set(books.map(book => book.publishedYear))).sort((a, b) => b - a);

  const availableBooks = books.filter(book => book.available);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft size={24} />
          </Link>
          <h2 className="text-3xl font-bold text-gray-800">Library Books</h2>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Logged in as:</p>
          <p className="font-semibold text-indigo-600">{currentUser.name} ({currentUser.role})</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search books..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="border rounded-lg px-4 py-2"
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            className="border rounded-lg px-4 py-2"
            value={filters.availability}
            onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="borrowed">Borrowed</option>
          </select>
          <select
            className="border rounded-lg px-4 py-2"
            value={filters.year}
            onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
          >
            <option value="">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions */}
      {currentUser.role === 'Librarian' && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
          >
            <Plus size={20} />
            Add Book
          </button>
        </div>
      )}

      {/* Borrower Form */}
      {showBorrowerForm && (
        <BorrowerForm
          availableBooks={availableBooks}
          onBorrow={() => {
            setShowBorrowerForm(false);
            loadData();
          }}
        />
      )}

      {/* Main Books Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Library Books</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowBorrowersList(!showBorrowersList)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {showBorrowersList ? 'Hide Borrowers' : 'Show Borrowers'}
            </button>
            <button
              onClick={() => setShowBorrowerForm(!showBorrowerForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              {showBorrowerForm ? 'Cancel' : 'Borrow Books'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ISBN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 text-gray-400 mr-2" />
                      <div className="text-sm font-medium text-gray-900">
                        {book.title}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{book.author}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{book.isbn}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      book.available
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {book.available ? 'Available' : 'Borrowed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {!book.available && (
                      <button
                        onClick={() => handleReturn(book.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Return
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Borrowers List */}
      {showBorrowersList && (
        <div className="mt-6">
          <BorrowersList
            students={students}
            books={books}
            onReturn={handleReturn}
          />
        </div>
      )}

      {/* Add Book Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add New Book</h3>
              <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddBook} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Author</label>
                  <input
                    type="text"
                    name="author"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ISBN</label>
                  <input
                    type="text"
                    name="isbn"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    name="category"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  >
                    <option value="Fiction">Fiction</option>
                    <option value="Non-Fiction">Non-Fiction</option>
                    <option value="Science">Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="History">History</option>
                    <option value="Literature">Literature</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Published Year</label>
                  <input
                    type="number"
                    name="publishedYear"
                    required
                    min="1900"
                    max={new Date().getFullYear()}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Number of Copies</label>
                  <input
                    type="number"
                    name="copies"
                    required
                    min="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Cover Image URL</label>
                  <input
                    type="url"
                    name="coverImage"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  ></textarea>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Add Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Book Details Modal */}
      {showBookDetails && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Book Details</h3>
              <button onClick={() => setShowBookDetails(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {selectedBook.coverImage ? (
                  <img
                    src={selectedBook.coverImage}
                    alt={selectedBook.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <BookOpen size={64} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold">{selectedBook.title}</h4>
                  <p className="text-gray-600">by {selectedBook.author}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ISBN</p>
                  <p>{selectedBook.isbn}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p>{selectedBook.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Published Year</p>
                  <p>{selectedBook.publishedYear}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    selectedBook.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedBook.available ? 'Available' : 'Borrowed'}
                  </span>
                </div>
                {selectedBook.description && (
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="text-gray-700">{selectedBook.description}</p>
                  </div>
                )}
                <div className="pt-4">
                  <button
                    onClick={() => handleReturn(selectedBook.id)}
                    className={`w-full py-2 rounded-lg ${
                      selectedBook.available
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                    disabled={!selectedBook.available && currentUser.role !== 'Librarian'}
                  >
                    {selectedBook.available ? 'Borrow Book' : 'Return Book'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}