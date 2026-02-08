import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookMarked, Trash2 } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

const Revision = () => {
  const navigate = useNavigate();
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevisions();
  }, []);

  const fetchRevisions = async () => {
    try {
      const response = await api.get('/revisions');
      setRevisions(response.data);
    } catch (error) {
      toast.error('Failed to load revisions');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRevision = async (testId, questionId) => {
  Swal.fire({
    title: 'Remove from Revision?',
    text: 'Are you sure you want to remove this question from your revision list?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#007AFF',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, remove it',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await api.delete(`/revisions?test_id=${testId}&question_id=${questionId}`);
        setRevisions(revisions.filter((r) => !(r.testId === testId && r.questionId === questionId)));
        toast.success('Removed from revision list');
      } catch (error) {
        console.error(error.response?.data || error.message);
        toast.error('Failed to remove from revision');
      }
    }
  });
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading revisions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => navigate('/student')}
            data-testid="back-button"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2 truncate" style={{ fontFamily: 'Manrope, sans-serif' }}>
              <BookMarked size={20} className="sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
              <span className="truncate">Revision List</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">Questions marked for review</p>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {revisions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-12 text-center" data-testid="no-revisions-message">
            <BookMarked size={48} className="sm:w-16 sm:h-16 mx-auto text-gray-300 mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
              No Questions Marked
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">Start marking questions during test results to build your revision list</p>
            <button
              onClick={() => navigate('/student')}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all active:scale-95 font-medium text-sm sm:text-base"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
              <BookMarked size={20} className="sm:w-6 sm:h-6 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-1" />
              <div className="min-w-0">
                <h3 className="font-semibold text-blue-900 mb-1 text-sm sm:text-base">Revision Tips</h3>
                <p className="text-xs sm:text-sm text-blue-800">
                  Review these questions carefully. Understanding why you got them wrong is key to improvement.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Questions to Review ({revisions.length})
                </h2>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {revisions.map((revision, index) => (
                  <div
                    key={revision.questionId}
                    data-testid={`revision-item-${index}`}
                    className="p-4 sm:p-6 rounded-lg border-2 border-blue-200 bg-blue-50"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded font-medium truncate">
                            {revision.testTitle}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg mb-3">
                          {revision.questionText}
                        </h4>

                        <div className="space-y-2 mb-4">
                          {revision.options.map((option, optIndex) => {
                            const isCorrect = optIndex === revision.correctAnswer;
                            return (
                              <div
                                key={optIndex}
                                className={`p-2 sm:p-3 rounded-lg border-2 ${
                                  isCorrect
                                    ? 'border-green-400 bg-green-100'
                                    : 'border-gray-200 bg-white'
                                }`}
                              >
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs sm:text-sm font-medium text-gray-700">Option {optIndex + 1}:</span>
                                  <span className="text-xs sm:text-sm text-gray-900 break-words">{option}</span>
                                  {isCorrect && (
                                    <span className="ml-auto px-2 py-1 bg-green-600 text-white text-xs rounded font-medium flex-shrink-0">
                                      Correct
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {revision.explanation && (
                          <div className="p-3 sm:p-4 bg-white rounded-lg border border-gray-200">
                            <p className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">Explanation:</p>
                            <p className="text-xs sm:text-sm text-gray-700">{revision.explanation}</p>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleRemoveRevision(revision.testId, revision.questionId)}
                        data-testid={`remove-revision-button-${index}`}
                        className="ml-2 p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors flex-shrink-0"
                        title="Remove from revision"
                      >
                        <Trash2 size={18} className="sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Revision;
