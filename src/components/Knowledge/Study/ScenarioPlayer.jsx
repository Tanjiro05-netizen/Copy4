import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { studyApiService } from '../api/study';
import { 
  ArrowLeft, BookOpen, Clock, Target, Flame, ChevronRight,
  Trophy, AlertTriangle, RefreshCw, Loader2, Star
} from 'lucide-react';

const ENDING_STYLES = {
  victory: {
    bg: 'from-green-900/50 to-gray-900',
    border: 'border-green-500/50',
    icon: '🏆',
    title: 'Revolutionary Victory!',
    color: 'text-green-400'
  },
  partial: {
    bg: 'from-yellow-900/50 to-gray-900',
    border: 'border-yellow-500/50',
    icon: '⚡',
    title: 'Partial Victory',
    color: 'text-yellow-400'
  },
  defeat: {
    bg: 'from-red-900/50 to-gray-900',
    border: 'border-red-500/50',
    icon: '💔',
    title: 'Defeat',
    color: 'text-red-400'
  }
};

const ScenarioPlayer = ({ scenario, onBack, onComplete }) => {
  const { user } = useAuth();
  const [fullScenario, setFullScenario] = useState(null);
  const [currentNode, setCurrentNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [choicesMade, setChoicesMade] = useState([]);
  const [isEnding, setIsEnding] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  useEffect(() => {
    loadScenario();
  }, [scenario.id]);

  const loadScenario = async () => {
    setLoading(true);
    try {
      const data = await studyApiService.getScenarioWithNodes(scenario.id);
      setFullScenario(data);
      
      // Check for existing progress
      if (user) {
        const progress = await studyApiService.getScenarioProgress(user.id, scenario.id);
        if (progress && progress.current_node_id && !progress.completed_at) {
          const node = data.nodes.find(n => n.id === progress.current_node_id);
          if (node) {
            setCurrentNode(node);
            setChoicesMade(progress.choices_made || []);
            setLoading(false);
            return;
          }
        }
      }
      
      // Start from beginning
      const startNode = data.nodes.find(n => n.is_start);
      if (startNode) {
        setCurrentNode(startNode);
        if (user) {
          await studyApiService.saveScenarioProgress(user.id, scenario.id, startNode.id, null);
        }
      }
    } catch (err) {
      console.error('Error loading scenario:', err);
    }
    setLoading(false);
  };

  const handleChoice = async (choice) => {
    if (!choice.next_node_id || !fullScenario) return;
    
    const nextNode = fullScenario.nodes.find(n => n.id === choice.next_node_id);
    if (!nextNode) return;

    const newChoicesMade = [...choicesMade, choice.id];
    setChoicesMade(newChoicesMade);
    setCurrentNode(nextNode);

    // Check if this is an ending
    if (nextNode.node_type === 'ending') {
      setIsEnding(true);
      const bonusXp = choice.is_historically_accurate ? 10 : 0;
      const totalXp = scenario.xp_reward + bonusXp;
      setXpEarned(totalXp);
      
      if (user) {
        await studyApiService.saveScenarioProgress(
          user.id, 
          scenario.id, 
          nextNode.id, 
          choice.id, 
          true, 
          nextNode.ending_type,
          totalXp
        );
        
        // Award XP
        const progress = await studyApiService.getUserProgress(user.id);
        if (progress) {
          await studyApiService.updateUserProgress(user.id, {
            total_xp: (progress.total_xp || 0) + totalXp,
            daily_xp: Math.min((progress.daily_xp || 0) + totalXp, 100)
          });
        }
      }
    } else {
      if (user) {
        await studyApiService.saveScenarioProgress(
          user.id, 
          scenario.id, 
          nextNode.id, 
          choice.id
        );
      }
    }
  };

  const handleRestart = async () => {
    setIsEnding(false);
    setChoicesMade([]);
    setXpEarned(0);
    
    const startNode = fullScenario?.nodes.find(n => n.is_start);
    if (startNode) {
      setCurrentNode(startNode);
      if (user) {
        // Reset progress
        await studyApiService.saveScenarioProgress(user.id, scenario.id, startNode.id, null, false, null, 0);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!fullScenario || !currentNode) {
    return (
      <div className="text-center py-20 text-gray-500">
        <AlertTriangle className="w-12 h-12 mx-auto mb-3" />
        <p>Scenario not found or has no content.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const endingStyle = isEnding && currentNode.ending_type 
    ? ENDING_STYLES[currentNode.ending_type] 
    : null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Exit Scenario</span>
        </button>
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            {fullScenario.setting || 'Historical Scenario'}
          </span>
          <span className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            {fullScenario.difficulty}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-500">Progress</span>
          <span className="text-xs text-gray-400">{choicesMade.length} choices made</span>
        </div>
        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-500"
            style={{ width: `${Math.min((choicesMade.length / 5) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Story Card */}
      <div className={`rounded-xl overflow-hidden border ${
        endingStyle 
          ? `bg-gradient-to-br ${endingStyle.bg} ${endingStyle.border}` 
          : 'bg-gray-900/80 border-gray-700'
      }`}>
        {/* Node Title */}
        {currentNode.title && (
          <div className="px-6 py-4 border-b border-gray-700/50">
            <h2 className={`text-xl font-bold ${endingStyle?.color || 'text-white'}`}>
              {endingStyle ? `${endingStyle.icon} ${endingStyle.title}` : currentNode.title}
            </h2>
          </div>
        )}

        {/* Image */}
        {currentNode.image_url && (
          <div className="w-full h-48 bg-gray-800">
            <img 
              src={currentNode.image_url} 
              alt="" 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <div className="prose prose-invert max-w-none mb-6">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {currentNode.content}
            </p>
          </div>

          {/* Ending Insight */}
          {isEnding && currentNode.ending_insight && (
            <div className="mt-6 p-4 bg-black/30 rounded-lg border border-gray-700">
              <h4 className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Historical Insight
              </h4>
              <p className="text-sm text-gray-300">{currentNode.ending_insight}</p>
            </div>
          )}

          {/* XP Earned */}
          {isEnding && xpEarned > 0 && (
            <div className="mt-4 flex items-center justify-center gap-2 text-orange-400">
              <Flame className="w-5 h-5" />
              <span className="font-bold text-lg">+{xpEarned} XP Earned!</span>
            </div>
          )}

          {/* Choices */}
          {!isEnding && currentNode.choices && currentNode.choices.length > 0 && (
            <div className="space-y-3 mt-6">
              <h4 className="text-sm font-bold text-gray-400 mb-3">What do you do?</h4>
              {currentNode.choices.map((choice, index) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoice(choice)}
                  className="w-full text-left p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-red-500/50 rounded-lg transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-400 group-hover:bg-red-600 group-hover:text-white transition-colors">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <div className="flex-1">
                      <p className="text-white group-hover:text-red-300 transition-colors">
                        {choice.choice_text}
                      </p>
                      {choice.consequence_preview && (
                        <p className="text-xs text-gray-500 mt-1 italic">
                          {choice.consequence_preview}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-red-400 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Ending Actions */}
          {isEnding && (
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleRestart}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Try Again</span>
              </button>
              <button
                onClick={() => onComplete?.(xpEarned)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
              >
                <Trophy className="w-5 h-5" />
                <span>Continue</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScenarioPlayer;
