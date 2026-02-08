import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Trophy, BookMarked, LogOut, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

const StudentDashboard = () => {
  const [tests, setTests] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [testsRes, attemptsRes] = await Promise.all([
        api.get('/tests'),
        api.get('/attempts/my-attempts'),
      ]);
      setTests(testsRes.data);
      setAttempts(attemptsRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const getAttemptStatus = (testId) => {
    const testAttempts = attempts.filter((a) => a.testId === testId);
    return {
      attempted: testAttempts.length > 0,
      firstAttempt: testAttempts.find((a) => a.isFirstAttempt),
      reAttempts: testAttempts.filter((a) => !a.isFirstAttempt).length,
    };
  };

  const isTestAvailable = (test) => {
    const now = new Date();
    const start = new Date(test.startWindow);
    const end = new Date(test.endWindow);
    return !test.isLive || (now >= start && now <= end);
  };

  const handleStartTest = (test) => {
    if (!isTestAvailable(test)) {
      Swal.fire({
        title: 'Test Not Available',
        text: 'This test is not available at this time.',
        icon: 'warning',
        confirmButtonColor: '#007AFF',
      });
      return;
    }

    const status = getAttemptStatus(test.id);
    if (status.attempted) {
      Swal.fire({
        title: 'Re-attempt Test?',
        text: 'This re-attempt will not affect your ranking.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#007AFF',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Start Re-attempt',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate(`/test/${test.id}`);
        }
      });
    } else {
      navigate(`/test/${test.id}`);
    }
  };

  const handleViewResult = (attemptId) => {
    navigate(`/result/${attemptId}`);
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

  const attemptedTests = tests.filter((t) => getAttemptStatus(t.id).attempted).length;
  const progress = tests.length > 0 ? Math.round((attemptedTests / tests.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate" style={{ fontFamily: 'Manrope, sans-serif' }}>
              MS Test Portal
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">Student Dashboard</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => navigate('/revision')}
              data-testid="revision-nav-button"
              className="flex items-center gap-2 px-2 sm:px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm sm:text-base"
            >
              <BookMarked size={18} />
              <span className="hidden sm:inline">Revision</span>
            </button>
            <div className="text-right">
              <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate hidden xs:block">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              data-testid="logout-button"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={18} className="text-gray-600" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Progress Overview
              </h3>
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm text-gray-600">Attempted {attemptedTests} out of {tests.length}</span>
                  <span className="text-sm font-bold text-blue-600" data-testid="progress-percentage">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                    data-testid="progress-bar"
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Available Tests
              </h3>
              <div className="space-y-3">
                {tests.length === 0 ? (
                  <div className="text-center py-8" data-testid="no-tests-message">
                    <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No tests available</p>
                  </div>
                ) : (
                  tests.map((test) => {
                    const status = getAttemptStatus(test.id);
                    const available = isTestAvailable(test);
                    return (
                      <div
                        key={test.id}
                        data-testid={`test-item-${test.id}`}
                        className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{test.title}</h4>
                          {status.attempted && (
                            <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                          <span className={`px-2 py-1 rounded ${
                            test.isLive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {test.isLive ? 'Live' : 'Practice'}
                          </span>
                          <span>{test.questionCount} Questions</span>
                          <span>{test.duration} mins</span>
                        </div>
                        {!available && (
                          <div className="flex items-center gap-1 text-xs text-orange-600 mb-2">
                            <AlertCircle size={14} />
                            <span>Not available now</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStartTest(test)}
                            data-testid={`start-test-button-${test.id}`}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all active:scale-95 text-sm font-medium"
                          >
                            {status.attempted ? 'Re-attempt' : 'Start Test'}
                          </button>
                          {test.isLive && (
                            <button
                              onClick={() => navigate(`/leaderboard/${test.id}`)}
                              data-testid={`leaderboard-button-${test.id}`}
                              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                              title="View Leaderboard"
                            >
                              <Trophy size={20} className="text-yellow-600" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Recent Attempts
              </h3>

              {attempts.length === 0 ? (
                <div className="text-center py-8 sm:py-12" data-testid="no-attempts-message">
                  <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Attempts Yet</h4>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4">Start taking tests to see your results here</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {attempts.map((attempt) => (
                    <div
                      key={attempt.id}
                      data-testid={`attempt-item-${attempt.id}`}
                      className="p-4 sm:p-5 rounded-lg border border-gray-200 hover:border-blue-300 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0">
                          <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-1 truncate">{attempt.testTitle}</h4>
                          <p className="text-xs text-gray-500">
                            {new Date(attempt.completedAt).toLocaleString()}
                          </p>
                        </div>
                        {attempt.isFirstAttempt && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium whitespace-nowrap ml-2">
                            Ranked
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4">
                        <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                          <p className="text-lg sm:text-2xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            {attempt.marks}
                          </p>
                          <p className="text-xs text-gray-600">Marks</p>
                        </div>
                        <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                          <p className="text-lg sm:text-2xl font-bold text-gray-900 mono">
                            {Math.floor(attempt.timeTaken / 60)}:{(attempt.timeTaken % 60).toString().padStart(2, '0')}
                          </p>
                          <p className="text-xs text-gray-600">Time</p>
                        </div>
                        <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
                          <p className="text-lg sm:text-2xl font-bold text-green-700" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            {attempt.correctCount}
                          </p>
                          <p className="text-xs text-green-700">Correct</p>
                        </div>
                        <div className="text-center p-2 sm:p-3 bg-red-50 rounded-lg">
                          <p className="text-lg sm:text-2xl font-bold text-red-700" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            {attempt.incorrectCount}
                          </p>
                          <p className="text-xs text-red-700">Incorrect</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleViewResult(attempt.id)}
                        data-testid={`view-result-button-${attempt.id}`}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all active:scale-95 font-medium text-sm sm:text-base"
                      >
                        View Detailed Results
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
