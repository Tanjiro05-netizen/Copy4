import React, { useState, useEffect } from 'react';
import { Users, Trophy, Crown, Plus, UserPlus } from 'lucide-react';
import { studyApiService } from '../api/study';

const CellLeaderboard = ({ userId, userCell, onCellChange }) => {
  const [cells, setCells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newCellName, setNewCellName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCells();
  }, []);

  const fetchCells = async () => {
    setLoading(true);
    try {
      const data = await studyApiService.getCellLeaderboard(10);
      setCells(data);
    } catch (err) {
      console.error('Error fetching cells:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCell = async () => {
    if (!newCellName.trim() || creating) return;
    
    setCreating(true);
    try {
      await studyApiService.createCell(userId, newCellName.trim());
      setShowCreateModal(false);
      setNewCellName('');
      fetchCells();
      onCellChange?.();
    } catch (err) {
      console.error('Error creating cell:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleJoinCell = async (cellId) => {
    try {
      await studyApiService.joinCell(userId, cellId);
      setShowJoinModal(false);
      fetchCells();
      onCellChange?.();
    } catch (err) {
      console.error('Error joining cell:', err);
    }
  };

  const getRankIcon = (index) => {
    if (index === 0) return <Crown className="w-4 h-4 text-yellow-400" />;
    if (index === 1) return <Trophy className="w-4 h-4 text-slate-300" />;
    if (index === 2) return <Trophy className="w-4 h-4 text-amber-600" />;
    return <span className="text-xs text-slate-500 w-4 text-center">{index + 1}</span>;
  };

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800/50 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-bold text-white">Cell Leaderboard</span>
        </div>
        <span className="text-[10px] text-slate-500 uppercase">Weekly</span>
      </div>

      {/* Leaderboard List */}
      <div className="divide-y divide-gray-800">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-4 h-4 bg-gray-700 rounded" />
                <div className="flex-1 h-4 bg-gray-700 rounded" />
                <div className="w-12 h-4 bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        ) : cells.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-sm">
            No cells yet. Be the first to create one!
          </div>
        ) : (
          cells.map((cell, index) => {
            const isUserCell = userCell?.id === cell.id;
            const memberCount = cell.members?.length || 0;
            
            return (
              <div 
                key={cell.id}
                className={`px-4 py-3 flex items-center gap-3 transition-colors ${
                  isUserCell ? 'bg-blue-500/10' : 'hover:bg-gray-800/30'
                }`}
              >
                {/* Rank */}
                <div className="w-6 flex items-center justify-center">
                  {getRankIcon(index)}
                </div>

                {/* Cell Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium truncate ${
                      isUserCell ? 'text-blue-400' : 'text-white'
                    }`}>
                      {cell.name}
                    </span>
                    {isUserCell && (
                      <span className="text-[10px] bg-blue-500/30 text-blue-400 px-1.5 py-0.5 rounded">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {memberCount}/5 members
                  </div>
                </div>

                {/* XP */}
                <div className="text-right">
                  <div className="text-sm font-bold text-white">
                    {(cell.weekly_xp || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500">XP</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Actions */}
      {userId && (
        <div className="border-t border-gray-700 p-3 flex gap-2">
          {!userCell ? (
            <>
              <button
                onClick={() => setShowJoinModal(true)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-xs font-bold transition-all"
              >
                <UserPlus className="w-4 h-4" />
                Join Cell
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-xs font-bold transition-all"
              >
                <Plus className="w-4 h-4" />
                Create Cell
              </button>
            </>
          ) : (
            <div className="flex-1 text-center text-xs text-slate-400">
              Member of <span className="text-blue-400 font-medium">{userCell.name}</span>
            </div>
          )}
        </div>
      )}

      {/* Create Cell Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold text-white">Create New Cell</h3>
            <input
              type="text"
              placeholder="Cell name..."
              value={newCellName}
              onChange={(e) => setNewCellName(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              maxLength={30}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCell}
                disabled={!newCellName.trim() || creating}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-bold transition-all"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Cell Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold text-white">Join a Cell</h3>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {cells.filter(c => (c.members?.length || 0) < 5).map(cell => (
                <button
                  key={cell.id}
                  onClick={() => handleJoinCell(cell.id)}
                  className="w-full p-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-left transition-all"
                >
                  <div className="text-white font-medium">{cell.name}</div>
                  <div className="text-xs text-slate-500">
                    {cell.members?.length || 0}/5 members • {cell.weekly_xp || 0} XP
                  </div>
                </button>
              ))}
              {cells.filter(c => (c.members?.length || 0) < 5).length === 0 && (
                <p className="text-slate-500 text-sm text-center py-4">
                  All cells are full. Create a new one!
                </p>
              )}
            </div>
            <button
              onClick={() => setShowJoinModal(false)}
              className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CellLeaderboard;
