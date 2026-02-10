import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Award,
  Bookmark,
} from "lucide-react";
import api from "../utils/api";
import { toast } from "sonner";

const TestResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [attemptId]);

  const fetchData = async () => {
    try {
      const attemptsRes = await api.get("/attempts/my-attempts");
      const foundAttempt = attemptsRes.data.find((a) => a.id === attemptId);
      if (!foundAttempt) {
        toast.error("Attempt not found");
        navigate("/student");
        return;
      }
      setAttempt(foundAttempt);

      const revisionsRes = await api.get("/revisions");
      setRevisions(revisionsRes.data.map((r) => r.questionId));
    } catch (error) {
      toast.error("Failed to load result");
      navigate("/student");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkForRevision = async (questionId) => {
    try {
      if (revisions.includes(questionId)) {
        await api.delete(
          `/revisions?test_id=${attempt.testId}&question_id=${questionId}`,
        );
        setRevisions(revisions.filter((id) => id !== questionId));
        toast.success("Removed from revision");
      } else {
        await api.post("/revisions", {
          testId: attempt.testId,
          questionId: questionId,
        });
        setRevisions([...revisions, questionId]);
        toast.success("Marked for revision");
      }
    } catch (error) {
      toast.error("Failed to update revision");
    }
  };

  if (loading || !attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  const totalQuestions =
    attempt.correctCount + attempt.incorrectCount + attempt.unattemptedCount;
  const accuracy =
    totalQuestions > 0
      ? ((attempt.correctCount / totalQuestions) * 100).toFixed(1)
      : 0;

  const weakSections = {};
  attempt.detailedResults.forEach((result) => {
    if (!result.isCorrect) {
      const category =
        result.status === "unattempted" ? "Unattempted" : "Incorrect";
      weakSections[category] = (weakSections[category] || 0) + 1;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              onClick={() => navigate("/student")}
              data-testid="back-button"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div className="min-w-0">
              <h1
                className="text-lg sm:text-xl font-bold text-gray-900 truncate"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Test Results
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                {attempt.testTitle}
              </p>
            </div>
          </div>
          {attempt.isFirstAttempt && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs sm:text-sm rounded-full font-medium whitespace-nowrap">
              Ranked Attempt
            </span>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <Award size={20} className="sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">Total Marks</p>
                <p
                  className="text-2xl sm:text-3xl font-bold text-gray-900"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                  data-testid="total-marks"
                >
                  {attempt.marks}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <Clock size={20} className="sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">Time Taken</p>
                <p
                  className="text-2xl sm:text-3xl font-bold text-gray-900 mono"
                  data-testid="time-taken"
                >
                  {Math.floor(attempt.timeTaken / 60)}:
                  {(attempt.timeTaken % 60).toString().padStart(2, "0")}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                <CheckCircle
                  size={20}
                  className="sm:w-6 sm:h-6 text-purple-600"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">Accuracy</p>
                <p
                  className="text-2xl sm:text-3xl font-bold text-gray-900"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                  data-testid="accuracy"
                >
                  {accuracy}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="grid grid-cols-3 gap-1 sm:gap-2 text-center">
              <div>
                <p
                  className="text-lg sm:text-2xl font-bold text-green-700"
                  data-testid="correct-count"
                >
                  {attempt.correctCount}
                </p>
                <p className="text-xs text-gray-600">Correct</p>
              </div>
              <div>
                <p
                  className="text-lg sm:text-2xl font-bold text-red-700"
                  data-testid="incorrect-count"
                >
                  {attempt.incorrectCount}
                </p>
                <p className="text-xs text-gray-600">Wrong</p>
              </div>
              <div>
                <p
                  className="text-lg sm:text-2xl font-bold text-gray-600"
                  data-testid="unattempted-count"
                >
                  {attempt.unattemptedCount}
                </p>
                <p className="text-xs text-gray-600">Skipped</p>
              </div>
            </div>
          </div>
        </div>

        {Object.keys(weakSections).length > 0 && (
          <div
            className="bg-orange-50 border border-orange-200 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8"
            data-testid="weak-sections-alert"
          >
            <h3
              className="text-base sm:text-lg font-bold text-orange-900 mb-3 sm:mb-4 flex items-center gap-2"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              <AlertCircle size={20} className="sm:w-6 sm:h-6 flex-shrink-0" />
              <span>Weak Sections Analysis</span>
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              {Object.entries(weakSections).map(([category, count]) => (
                <div
                  key={category}
                  className="bg-white rounded-lg p-3 sm:p-4 text-center"
                >
                  <p className="text-lg sm:text-2xl font-bold text-orange-700">
                    {count}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-700">{category}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-orange-800">
              Review these questions and mark them for revision to improve your
              performance.
            </p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3
            className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-4 sm:mb-6"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Answer Review
          </h3>

          <div className="space-y-4 sm:space-y-6">
            {attempt.detailedResults.map((result, index) => (
              <div
                key={result.questionId}
                data-testid={`question-result-${index}`}
                className={`p-4 sm:p-6 rounded-lg border-2 ${
                  result.isCorrect
                    ? "border-green-200 bg-green-50"
                    : result.status === "unattempted"
                      ? "border-gray-200 bg-gray-50"
                      : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                    <div
                      className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                        result.isCorrect
                          ? "bg-green-100"
                          : result.status === "unattempted"
                            ? "bg-gray-100"
                            : "bg-red-100"
                      }`}
                    >
                      {result.isCorrect ? (
                        <CheckCircle
                          size={18}
                          className="sm:w-6 sm:h-6 text-green-600"
                        />
                      ) : result.status === "unattempted" ? (
                        <AlertCircle
                          size={18}
                          className="sm:w-6 sm:h-6 text-gray-600"
                        />
                      ) : (
                        <XCircle
                          size={18}
                          className="sm:w-6 sm:h-6 text-red-600"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-1 sm:mb-2">
                        Question {index + 1}:{" "}
                        <span className="break-words whitespace-pre-wrap">
                          {result.questionText}
                        </span>
                      </h4>
                      {result.status === "unattempted" ? (
                        <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                          Not attempted
                        </p>
                      ) : (
                        <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                          Your answer:{" "}
                          <span className="font-medium">
                            Option {result.selectedOption + 1}
                          </span>
                        </p>
                      )}
                      <p className="text-xs sm:text-sm text-green-700 font-medium">
                        Correct answer:{" "}
                        <span className="font-semibold">
                          Option {result.correctOption + 1}
                        </span>
                      </p>
                      {result.explanation && (
                        <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-white rounded-lg border border-gray-200">
                          <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap">
                            <span className="font-semibold">Explanation:</span>{" "}
                            {result.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleMarkForRevision(result.questionId)}
                    data-testid={`mark-revision-button-${index}`}
                    className={`ml-0 sm:ml-2 p-2 rounded-lg transition-all flex-shrink-0 ${
                      revisions.includes(result.questionId)
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                    title={
                      revisions.includes(result.questionId)
                        ? "Remove from revision"
                        : "Mark for revision"
                    }
                  >
                    <Bookmark size={18} className="sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
          <button
            onClick={() => navigate("/student")}
            data-testid="back-to-dashboard-button"
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate("/revision")}
            data-testid="view-revision-button"
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all active:scale-95 font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Bookmark size={18} className="sm:w-5 sm:h-5" />
            <span>View Revision List</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestResult;
