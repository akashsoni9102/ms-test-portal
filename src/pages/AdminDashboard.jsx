import React, { useState, useEffect } from 'react';
import { Plus, BarChart3, LogOut, Users, FileText, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

const AdminDashboard = () => {
  const [tests, setTests] = useState([]);
  const [students, setStudents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editModalData, setEditModalData] = useState(null);
  const [activeView, setActiveView] = useState('tests');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchTests();
    fetchStudents();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await api.get('/tests');
      setTests(response.data);
    } catch (error) {
      toast.error('Failed to fetch tests');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/auth/students');
      setStudents(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAnalytics = async (testId) => {
    try {
      const response = await api.get(`/analytics/test/${testId}`);
      setAnalytics(response.data);
      setSelectedTest(testId);
    } catch (error) {
      toast.error('Failed to fetch analytics');
    }
  };

  const handleEditClick = (e, test) => {
    e.stopPropagation();
    setSelectedTest(test.id);
    setShowCreateModal(false);
    setEditModalData(test);
    setShowEditModal(true);
  };

  const handleDeleteClick = async (e, test) => {
    e.stopPropagation();
    const result = await Swal.fire({
      title: 'Delete test? ',
      text: `Delete "${test.title}" permanently?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      confirmButtonColor: '#d33'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/tests/${test.id}`);
        toast.success('Test deleted');
        if (selectedTest === test.id) {
          setSelectedTest(null);
          setAnalytics(null);
        }
        fetchTests();
      } catch (error) {
        toast.error('Failed to delete test');
      }
    }
  };

  const handleDeleteStudent = async (student) => {
    const result = await Swal.fire({
      title: 'Delete student?',
      text: `Delete "${student.name}" permanently?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      confirmButtonColor: '#d33'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/auth/students/${student.id || student._id}`);
        toast.success('Student deleted');
        fetchStudents();
      } catch (error) {
        toast.error('Failed to delete student');
      }
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout?',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#007AFF',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-2 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate" style={{ fontFamily: 'Manrope, sans-serif' }}>
              MS Test Portal
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">Admin Dashboard</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-right hidden xs:block">
              <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              data-testid="logout-button"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-4 sm:mb-6 flex gap-2 sm:gap-4 border-b border-gray-200 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <button
            onClick={() => { setActiveView('tests'); setSelectedTest(null); setAnalytics(null); }}
            className={`px-3 sm:px-4 py-2 font-medium border-b-2 transition-all text-sm sm:text-base whitespace-nowrap ${
              activeView === 'tests'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Tests
          </button>
          <button
            onClick={() => setActiveView('students')}
            className={`px-3 sm:px-4 py-2 font-medium border-b-2 transition-all text-sm sm:text-base whitespace-nowrap ${
              activeView === 'students'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Students
          </button>
        </div>

        {activeView === 'tests' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Tests
                </h2>
                <button
                  onClick={() => setShowCreateModal(true)}
                  data-testid="create-test-button"
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-all active:scale-95"
                  title="Create Test"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="space-y-3">
                {tests.length === 0 ? (
                  <div className="text-center py-8" data-testid="no-tests-message">
                    <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No tests created yet</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Create your first test
                    </button>
                  </div>
                ) : (
                  tests.map((test) => (
                    <div
                      key={test.id}
                      onClick={() => { setSelectedTest(test.id); fetchAnalytics(test.id); }}
                      data-testid={`test-item-${test.id}`}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md ${
                        selectedTest === test.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{test.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span className={`px-2 py-1 rounded ${
                              test.isLive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {test.isLive ? 'Live' : 'Practice'}
                            </span>
                            <span>{test.questionCount} Questions</span>
                            <span>{test.duration} mins</span>
                          </div>
                        </div>

                        {user?.role === 'admin' && (
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={(e) => handleEditClick(e, test)}
                              className="p-2 hover:bg-gray-100 rounded"
                              title="Edit"
                              data-testid={`edit-test-${test.id}`}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(e, test)}
                              className="p-2 hover:bg-gray-100 rounded"
                              title="Delete"
                              data-testid={`delete-test-${test.id}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-8">
            {selectedTest && (() => {
              const test = tests.find(t => t.id === selectedTest);
              if (!test) return null;
              return (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{test.title}</h2>
                      <p className="text-sm text-gray-500">{test.questionCount} Questions • {test.duration} mins</p>
                    </div>
                    <div className="text-sm text-gray-600">Created: {new Date(test.createdAt).toLocaleString()}</div>
                  </div>

                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Questions</h3>
                    <div className="space-y-4">
                      {test.questions.map((q, idx) => (
                        <div key={q.id} className="p-4 border rounded">
                          <p className="font-medium">{idx + 1}. {q.text}</p>
                          <ul className="list-disc pl-6 mt-2 text-sm text-gray-700">
                            {q.options.map((opt, i) => (
                              <li key={i} className={i === q.correctAnswer ? 'text-green-700 font-semibold' : ''}>{opt}</li>
                            ))}
                          </ul>
                          {q.explanation && <p className="text-xs text-gray-500 mt-2">Explanation: {q.explanation}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
            {analytics ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Users size={24} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Students</p>
                        <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                          {analytics.totalStudents}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <BarChart3 size={24} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Average Marks</p>
                        <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                          {analytics.averageMarks}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <FileText size={24} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Attempts</p>
                        <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                          {analytics.totalAttempts}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    Student Rankings - {analytics.testTitle}
                  </h3>

                  {analytics.rankings.length === 0 ? (
                    <div className="text-center py-8" data-testid="no-rankings-message">
                      <Users size={48} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500">No attempts yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full" data-testid="rankings-table">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rank</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Student</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Marks</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Time Taken</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Accuracy</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.rankings.map((ranking) => {
                            const accuracy = ((ranking.correctCount / (ranking.correctCount + ranking.incorrectCount + ranking.unattemptedCount)) * 100).toFixed(1);
                            return (
                              <tr key={ranking.id} className="border-b border-gray-100 hover:bg-gray-50" data-testid={`ranking-row-${ranking.rank}`}>
                                <td className="py-3 px-4">
                                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                                    ranking.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                                    ranking.rank === 2 ? 'bg-gray-200 text-gray-700' :
                                    ranking.rank === 3 ? 'bg-orange-100 text-orange-700' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    {ranking.rank}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-medium text-gray-900">{ranking.userName}</td>
                                <td className="py-3 px-4 font-semibold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                  {ranking.marks}
                                </td>
                                <td className="py-3 px-4 text-gray-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                  {Math.floor(ranking.timeTaken / 60)}:{(ranking.timeTaken % 60).toString().padStart(2, '0')}
                                </td>
                                <td className="py-3 px-4 text-gray-600">{accuracy}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center" data-testid="no-test-selected-message">
                <BarChart3 size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Select a Test
                </h3>
                <p className="text-gray-600">Click on a test from the left panel to view analytics</p>
              </div>
            )}
          </div>
        </div>
        ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Registered Students
          </h2>

          {students.length === 0 ? (
            <div className="text-center py-8">
              <Users size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No students registered yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Mobile</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Registered</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id || student.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{student.name}</td>
                      <td className="py-3 px-4 text-gray-700">{student.email}</td>
                      <td className="py-3 px-4 text-gray-700">{student.mobile ?? '-'}</td>
                      <td className="py-3 px-4 text-gray-600 text-sm">{new Date(student.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDeleteStudent(student)}
                          className="p-2 hover:bg-red-100 rounded text-red-600 hover:text-red-700 transition-colors"
                          title="Delete student"
                          data-testid={`delete-student-${student._id || student.id}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        )}
      </div>

      {showCreateModal && (
        <CreateTestModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchTests();
          }}
        />
      )}
      {showEditModal && editModalData && (
        <EditTestModal
          data={editModalData}
          onClose={() => { setShowEditModal(false); setEditModalData(null); }}
          onSuccess={() => { setShowEditModal(false); setEditModalData(null); fetchTests(); }}
        />
      )}
    </div>
  );
};

const CreateTestModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    duration: 60,
    startWindow: '',
    endWindow: '',
    isLive: true,
    questions: [{ text: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }],
  });
  const [loading, setLoading] = useState(false);

  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { text: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }],
    });
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index][field] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        startWindow: new Date(formData.startWindow).toISOString(),
        endWindow: new Date(formData.endWindow).toISOString(),
      };

      await api.post('/tests', payload);
      toast.success('Test created successfully!');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" data-testid="create-test-modal">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Create New Test
          </h2>
          <button
            onClick={onClose}
            data-testid="close-modal-button"
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Test Title</label>
              <input
                type="text"
                required
                data-testid="test-title-input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Mathematics Test 1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
              <input
                type="number"
                required
                data-testid="test-duration-input"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Window</label>
              <input
                type="datetime-local"
                required
                data-testid="test-start-window-input"
                value={formData.startWindow}
                onChange={(e) => setFormData({ ...formData, startWindow: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Window</label>
              <input
                type="datetime-local"
                required
                data-testid="test-end-window-input"
                value={formData.endWindow}
                onChange={(e) => setFormData({ ...formData, endWindow: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isLive"
              data-testid="test-is-live-checkbox"
              checked={formData.isLive}
              onChange={(e) => setFormData({ ...formData, isLive: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isLive" className="text-sm font-medium text-gray-700">
              Live Test (affects ranking)
            </label>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Questions
              </h3>
              <button
                type="button"
                onClick={handleAddQuestion}
                data-testid="add-question-button"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
              >
                <Plus size={16} /> Add Question
              </button>
            </div>

            <div className="space-y-6">
              {formData.questions.map((question, qIndex) => (
                <div key={qIndex} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question {qIndex + 1}
                  </label>
                  <input
                    type="text"
                    required
                    data-testid={`question-text-input-${qIndex}`}
                    value={question.text}
                    onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                    placeholder="Enter question text"
                  />

                  <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={question.correctAnswer === oIndex}
                          onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)}
                          data-testid={`question-${qIndex}-correct-option-${oIndex}`}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          required
                          data-testid={`question-${qIndex}-option-${oIndex}-input`}
                          value={option}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Option ${oIndex + 1}`}
                        />
                      </div>
                    ))}
                  </div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">Explanation (Optional)</label>
                  <textarea
                    data-testid={`question-explanation-input-${qIndex}`}
                    value={question.explanation}
                    onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Explain the correct answer"
                    rows="2"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="submit-test-button"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Test'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditTestModal = ({ data, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    duration: 60,
    startWindow: '',
    endWindow: '',
    isLive: true,
    questions: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!data) return;
    setFormData({
      title: data.title || '',
      duration: data.duration || 60,
      startWindow: data.startWindow ? new Date(data.startWindow).toISOString().slice(0,16) : '',
      endWindow: data.endWindow ? new Date(data.endWindow).toISOString().slice(0,16) : '',
      isLive: data.isLive || false,
      questions: data.questions?.map(q => ({ ...q })) || []
    });
  }, [data]);

  const handleAddQuestion = () => {
    setFormData({ ...formData, questions: [...formData.questions, { text: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }] });
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index][field] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        startWindow: new Date(formData.startWindow).toISOString(),
        endWindow: new Date(formData.endWindow).toISOString(),
      };
      await api.put(`/tests/${data.id}`, payload);
      toast.success('Test updated');
      onSuccess();
    } catch (error) {
      toast.error('Failed to update test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Edit Test</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Test Title</label>
              <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
              <input type="number" required value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })} className="w-full px-4 py-2 border rounded" min="1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Window</label>
              <input type="datetime-local" required value={formData.startWindow} onChange={(e) => setFormData({ ...formData, startWindow: e.target.value })} className="w-full px-4 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Window</label>
              <input type="datetime-local" required value={formData.endWindow} onChange={(e) => setFormData({ ...formData, endWindow: e.target.value })} className="w-full px-4 py-2 border rounded" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" checked={formData.isLive} onChange={(e) => setFormData({ ...formData, isLive: e.target.checked })} />
            <label className="text-sm font-medium text-gray-700">Live Test (affects ranking)</label>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
              <button type="button" onClick={handleAddQuestion} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Add Question</button>
            </div>

            <div className="space-y-6">
              {formData.questions.map((question, qIndex) => (
                <div key={qIndex} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question {qIndex + 1}</label>
                  <input type="text" required value={question.text} onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)} className="w-full px-4 py-2 border rounded mb-3" />

                  <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <input type="radio" name={`correct-${qIndex}`} checked={question.correctAnswer === oIndex} onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)} />
                        <input type="text" value={option} onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)} className="w-full px-3 py-2 border rounded" />
                      </div>
                    ))}
                  </div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">Explanation (optional)</label>
                  <textarea value={question.explanation} onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)} className="w-full px-3 py-2 border rounded" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
