import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Medal, Award } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

const Leaderboard = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [rankings, setRankings] = useState([]);
  const [testTitle, setTestTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchLeaderboard();
  }, [testId]);

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get(`/attempts/test/${testId}`);
      setRankings(response.data);
      if (response.data.length > 0) {
        setTestTitle(response.data[0].testTitle);
      }
    } catch (error) {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  const topThree = rankings.slice(0, 3);
  const restRankings = rankings.slice(3);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/student')}
            data-testid="back-button"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Leaderboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 truncate">{testTitle}</p>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {rankings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center" data-testid="no-rankings-message">
            <Trophy size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
              No Rankings Yet
            </h3>
            <p className="text-gray-600">Be the first to attempt this test!</p>
          </div>
        ) : (
          <>
            {topThree.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Top Performers
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {topThree.map((ranking, index) => {
                    const isCurrentUser = ranking.userId === user?.id;
                    const podiumColors = [
                      { bg: 'bg-gradient-to-br from-yellow-100 to-yellow-200', border: 'border-yellow-400', text: 'text-yellow-700', icon: Trophy },
                      { bg: 'bg-gradient-to-br from-gray-100 to-gray-200', border: 'border-gray-400', text: 'text-gray-700', icon: Medal },
                      { bg: 'bg-gradient-to-br from-orange-100 to-orange-200', border: 'border-orange-400', text: 'text-orange-700', icon: Award },
                    ];
                    const color = podiumColors[index];
                    const Icon = color.icon;

                    return (
                      <div
                        key={ranking.id}
                        data-testid={`podium-${ranking.rank}`}
                        className={`${color.bg} rounded-xl shadow-lg border-2 ${color.border} p-4 sm:p-6 transform hover:-translate-y-2 transition-all ${
                          isCurrentUser ? 'ring-4 ring-blue-500' : ''
                        }`}
                      >
                        <div className="text-center">
                          <div className={`inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-white ${color.text} mb-3 sm:mb-4 shadow-md`}>
                            <Icon size={24} className="sm:w-8 sm:h-8" />
                          </div>
                          <h3 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            #{ranking.rank}
                          </h3>
                          <p className="font-semibold text-sm sm:text-lg text-gray-900 mb-1 truncate">
                            {ranking.userName}
                            {isCurrentUser && <span className="ml-1 text-blue-600 text-xs">(You)</span>}
                          </p>
                          <div className="mt-3 sm:mt-4 space-y-2">
                            <div className="bg-white bg-opacity-70 rounded-lg p-2 sm:p-3">
                              <p className="text-lg sm:text-2xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                                {ranking.marks}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-700">Marks</p>
                            </div>
                            <div className="bg-white bg-opacity-70 rounded-lg p-2 sm:p-3">
                              <p className="text-base sm:text-xl font-bold mono">
                                {Math.floor(ranking.timeTaken / 60)}:{(ranking.timeTaken % 60).toString().padStart(2, '0')}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-700">Time</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {restRankings.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  All Rankings
                </h3>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="w-full text-sm sm:text-base" data-testid="rankings-table">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 sm:py-3 px-4 text-xs sm:text-sm font-semibold text-gray-700">Rank</th>
                        <th className="text-left py-2 sm:py-3 px-4 text-xs sm:text-sm font-semibold text-gray-700">Student</th>
                        <th className="text-left py-2 sm:py-3 px-4 text-xs sm:text-sm font-semibold text-gray-700">Marks</th>
                        <th className="text-left py-2 sm:py-3 px-4 text-xs sm:text-sm font-semibold text-gray-700">Time</th>
                        <th className="text-left py-2 sm:py-3 px-4 text-xs sm:text-sm font-semibold text-gray-700">Accuracy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {restRankings.map((ranking) => {
                        const isCurrentUser = ranking.userId === user?.id;
                        const accuracy = ((ranking.correctCount / (ranking.correctCount + ranking.incorrectCount + ranking.unattemptedCount)) * 100).toFixed(1);
                        return (
                          <tr
                            key={ranking.id}
                            data-testid={`ranking-row-${ranking.rank}`}
                            className={`border-b border-gray-100 hover:bg-gray-50 ${
                              isCurrentUser ? 'bg-blue-50' : ''
                            }`}
                          >
                            <td className="py-2 sm:py-3 px-4">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-bold text-xs sm:text-sm">
                                {ranking.rank}
                              </span>
                            </td>
                            <td className="py-2 sm:py-3 px-4 font-medium text-gray-900 truncate text-xs sm:text-sm">
                              {ranking.userName}
                              {isCurrentUser && <span className="ml-1 text-blue-600 text-xs">(You)</span>}
                            </td>
                            <td className="py-2 sm:py-3 px-4 font-semibold text-gray-900 text-xs sm:text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                              {ranking.marks}
                            </td>
                            <td className="py-2 sm:py-3 px-4 text-gray-600 text-xs sm:text-sm whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                              {Math.floor(ranking.timeTaken / 60)}:{(ranking.timeTaken % 60).toString().padStart(2, '0')}
                            </td>
                            <td className="py-2 sm:py-3 px-4 text-gray-600 text-xs sm:text-sm">{accuracy}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
