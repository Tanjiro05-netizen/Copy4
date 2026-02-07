import React, { useState, useEffect, useCallback } from 'react';
import { X, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import CollectButton from './CollectButton';

const QuizPlayer = ({ quiz, userId, onComplete, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(quiz?.time_limit_seconds || 60);
  const [quizComplete, setQuizComplete] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const questions = quiz?.questions || [];
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  // Timer countdown
  useEffect(() => {
    if (quizComplete || showFeedback) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeout();
          return quiz?.time_limit_seconds || 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, quizComplete, showFeedback]);

  const handleTimeout = useCallback(() => {
    if (!showFeedback) {
      handleAnswer(null);
    }
  }, [showFeedback]);

  const handleAnswer = (answer) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answer);
    const correct = answer?.toLowerCase() === currentQuestion?.correct_answer?.toLowerCase();
    setIsCorrect(correct);
    setShowFeedback(true);
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        answer,
        correct,
        question_id: currentQuestion.id
      }
    }));
  };

  const handleNext = () => {
    setShowFeedback(false);
    setSelectedAnswer(null);
    setTimeLeft(quiz?.time_limit_seconds || 60);
    
    if (currentIndex + 1 >= totalQuestions) {
      calculateResults();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const calculateResults = () => {
    const correctCount = Object.values(answers).filter(a => a.correct).length;
    const score = correctCount;
    const maxScore = totalQuestions;
    const percentage = Math.round((score / maxScore) * 100);
    const xpEarned = Math.floor((score / maxScore) * (quiz?.xp_reward || 50));
    
    setResults({
      score,
      maxScore,
      percentage,
      xpEarned,
      answers
    });
    setQuizComplete(true);
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const { question_type, question_text, options } = currentQuestion;
    const parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;

    return (
      <div className="space-y-6">
        {/* Question Text */}
        <div className="text-center">
          <p className="text-lg text-white font-medium leading-relaxed">
            {question_text}
          </p>
        </div>

        {/* Options */}
        {question_type === 'multiple_choice' && parsedOptions && (
          <div className="space-y-3">
            {parsedOptions.map((option, idx) => {
              const isSelected = selectedAnswer === option;
              const isCorrectAnswer = option.toLowerCase() === currentQuestion.correct_answer.toLowerCase();
              
              let buttonClass = 'w-full p-4 rounded-lg border text-left transition-all ';
              
              if (showFeedback) {
                if (isCorrectAnswer) {
                  buttonClass += 'bg-green-500/20 border-green-500 text-green-400';
                } else if (isSelected && !isCorrectAnswer) {
                  buttonClass += 'bg-red-500/20 border-red-500 text-red-400';
                } else {
                  buttonClass += 'bg-gray-800/50 border-gray-700 text-slate-500';
                }
              } else {
                buttonClass += isSelected
                  ? 'bg-red-500/20 border-red-500 text-white'
                  : 'bg-gray-800/50 border-gray-700 text-slate-300 hover:bg-gray-700/50 hover:border-gray-600';
              }

              return (
                <button
                  key={idx}
                  onClick={() => !showFeedback && handleAnswer(option)}
                  disabled={showFeedback}
                  className={buttonClass}
                >
                  <span className="text-sm">{option}</span>
                </button>
              );
            })}
          </div>
        )}

        {question_type === 'true_false' && (
          <div className="flex gap-4">
            {['True', 'False'].map((option) => {
              const isSelected = selectedAnswer === option;
              const isCorrectAnswer = option.toLowerCase() === currentQuestion.correct_answer.toLowerCase();
              
              let buttonClass = 'flex-1 p-6 rounded-lg border text-center transition-all ';
              
              if (showFeedback) {
                if (isCorrectAnswer) {
                  buttonClass += 'bg-green-500/20 border-green-500 text-green-400';
                } else if (isSelected && !isCorrectAnswer) {
                  buttonClass += 'bg-red-500/20 border-red-500 text-red-400';
                } else {
                  buttonClass += 'bg-gray-800/50 border-gray-700 text-slate-500';
                }
              } else {
                buttonClass += isSelected
                  ? 'bg-red-500/20 border-red-500 text-white'
                  : 'bg-gray-800/50 border-gray-700 text-slate-300 hover:bg-gray-700/50';
              }

              return (
                <button
                  key={option}
                  onClick={() => !showFeedback && handleAnswer(option)}
                  disabled={showFeedback}
                  className={buttonClass}
                >
                  <span className="text-lg font-bold">{option}</span>
                </button>
              );
            })}
          </div>
        )}

        {question_type === 'fill_blank' && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Type your answer..."
              className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value && !showFeedback) {
                  handleAnswer(e.target.value);
                }
              }}
              disabled={showFeedback}
            />
            {!showFeedback && (
              <p className="text-xs text-slate-500 text-center">Press Enter to submit</p>
            )}
          </div>
        )}

        {question_type === 'swipe' && parsedOptions && (
          <div className="flex gap-4">
            {parsedOptions.map((option) => {
              const isSelected = selectedAnswer === option;
              const isCorrectAnswer = option.toLowerCase() === currentQuestion.correct_answer.toLowerCase();
              
              let buttonClass = 'flex-1 p-6 rounded-lg border text-center transition-all ';
              const isRevolutionary = option.toLowerCase() === 'revolutionary';
              
              if (showFeedback) {
                if (isCorrectAnswer) {
                  buttonClass += 'bg-green-500/20 border-green-500 text-green-400';
                } else if (isSelected && !isCorrectAnswer) {
                  buttonClass += 'bg-red-500/20 border-red-500 text-red-400';
                } else {
                  buttonClass += 'bg-gray-800/50 border-gray-700 text-slate-500';
                }
              } else {
                buttonClass += isRevolutionary
                  ? 'bg-green-900/30 border-green-700 text-green-400 hover:bg-green-800/30'
                  : 'bg-red-900/30 border-red-700 text-red-400 hover:bg-red-800/30';
              }

              return (
                <button
                  key={option}
                  onClick={() => !showFeedback && handleAnswer(option)}
                  disabled={showFeedback}
                  className={buttonClass}
                >
                  <span className="text-lg font-bold">{option}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Results screen
  if (quizComplete && results) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-md w-full p-6 space-y-6">
          <CollectButton 
            results={results}
            quiz={quiz}
            userId={userId}
            onCollected={onComplete}
            onClose={onClose}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              Q {currentIndex + 1}/{totalQuestions}
            </span>
            <div className="flex items-center gap-1.5 text-orange-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-mono font-bold">{timeLeft}s</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-800">
          <div 
            className="h-full bg-red-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Question Content */}
        <div className="p-6">
          {renderQuestion()}
        </div>

        {/* Feedback */}
        {showFeedback && currentQuestion && (
          <div className={`mx-6 mb-4 p-4 rounded-lg border ${
            isCorrect 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`text-sm font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {isCorrect ? 'Correct!' : `Incorrect. Answer: ${currentQuestion.correct_answer}`}
                </p>
                {currentQuestion.explanation && (
                  <p className="text-xs text-slate-400 mt-1">{currentQuestion.explanation}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {showFeedback && (
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg font-bold transition-all"
            >
              <span>{currentIndex + 1 >= totalQuestions ? 'See Results' : 'Next Question'}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPlayer;
