import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

const TestAttempt = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTest();
  }, [testId]);

  useEffect(() => {
    if (timeLeft <= 0 && test) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, test]);

  const fetchTest = async () => {
    try {
      const response = await api.get(`/tests/${testId}`);
      setTest(response.data);
      setTimeLeft(response.data.duration * 60);
    } catch (error) {
      toast.error('Failed to load test');
      navigate('/student');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    setAnswers({ ...answers, [questionId]: optionIndex });
    toast.success('Answer saved', { duration: 1000 });
  };

  const handleAutoSubmit = async () => {
    if (!test) return;

    const answersArray = test.questions.map((q) => ({
      questionId: q.id,
      selectedOption: answers[q.id] !== undefined ? answers[q.id] : -1,
    }));

    const timeTaken = test.duration * 60 - timeLeft;

    try {
      const response = await api.post('/attempts', {
        testId: test.id,
        answers: answersArray,
        timeTaken: timeTaken,
      });

      Swal.fire({
        title: 'Time Up!',
        text: 'Test submitted automatically',
        icon: 'info',
        confirmButtonColor: '#007AFF',
      }).then(() => {
        navigate(`/result/${response.data.attemptId}`);
      });
    } catch (error) {
      toast.error('Failed to submit test');
    }
  };

  const handleSubmit = () => {
    const unanswered = test.questions.length - Object.keys(answers).length;

    Swal.fire({
      title: 'Submit Test?',
      html: `
        <div class="text-left">
          <p class="mb-2">You have answered <strong>${Object.keys(answers).length}</strong> out of <strong>${test.questions.length}</strong> questions.</p>
          ${unanswered > 0 ? `<p class="text-orange-600">Warning: <strong>${unanswered}</strong> questions are unanswered!</p>` : ''}
          <p class="mt-3 text-red-600 font-semibold">This action cannot be undone.</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#007AFF',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Submit Test',
      cancelButtonText: 'Review Answers',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const answersArray = test.questions.map((q) => ({
          questionId: q.id,
          selectedOption: answers[q.id] !== undefined ? answers[q.id] : -1,
        }));

        const timeTaken = test.duration * 60 - timeLeft;

        try {
          const response = await api.post('/attempts', {
            testId: test.id,
            answers: answersArray,
            timeTaken: timeTaken,
          });

          Swal.fire({
            title: 'Success!',
            text: 'Test submitted successfully',
            icon: 'success',
            confirmButtonColor: '#007AFF',
          }).then(() => {
            navigate(`/result/${response.data.attemptId}`);
          });
        } catch (error) {
          toast.error('Failed to submit test');
        }
      }
    });
  };

  if (loading || !test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  const currentQ = test.questions[currentQuestion];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerColor = timeLeft < 60 ? 'text-red-600' : timeLeft < 300 ? 'text-orange-600' : 'text-green-600';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {test.title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              Question {currentQuestion + 1} of {test.questions.length}
            </p>
          </div>
          <div className="flex items-center justify-end gap-2 sm:gap-4">
            <div className={`flex items-center gap-1 sm:gap-2 ${timerColor} font-bold text-lg sm:text-xl mono flex-shrink-0`} data-testid="test-timer">
              <Clock size={18} className="sm:w-6 sm:h-6" />
              <span className="text-base sm:text-lg">
                {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3 sm:mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / test.questions.length) * 100}%` }}
              data-testid="question-progress-bar"
            ></div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-8 mb-4 sm:mb-6">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {currentQ.text}
            </h2>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {currentQ.options.map((option, index) => {
              const isSelected = answers[currentQ.id] === index;
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQ.id, index)}
                  data-testid={`option-button-${index}`}
                  className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all hover:-translate-y-1 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div
                      className={`w-5 sm:w-6 h-5 sm:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-400'
                      }`}
                    >
                      {isSelected && <div className="w-2 sm:w-3 h-2 sm:h-3 bg-white rounded-full"></div>}
                    </div>
                    <span className="text-xs sm:text-base text-gray-900 font-medium">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            data-testid="previous-question-button"
            className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
            {test.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                data-testid={`question-nav-${index}`}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg font-bold text-sm sm:text-base transition-all ${
                  index === currentQuestion
                    ? 'bg-blue-600 text-white'
                    : answers[test.questions[index].id] !== undefined
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestion < test.questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              data-testid="next-question-button"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all active:scale-95 text-sm sm:text-base"
            >
              <span>Next</span>
              <ChevronRight size={18} className="sm:w-5 sm:h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              data-testid="submit-test-button"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all active:scale-95 font-semibold text-sm sm:text-base"
            >
              <Flag size={18} className="sm:w-5 sm:h-5" />
              <span>Submit Test</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestAttempt;
