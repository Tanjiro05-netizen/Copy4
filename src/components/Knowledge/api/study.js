import { supabase } from '../../../supabaseClient';

class StudyApiService {
  // Get today's daily challenge based on day of week
  async getTodaysChallenge() {
    const dayOfWeek = new Date().getDay();
    try {
      const { data, error } = await supabase
        .from('knowledge_quizzes')
        .select(`
          *,
          questions:knowledge_quiz_questions(*)
        `)
        .eq('quiz_type', 'daily')
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      
      // Sort questions by order_index
      if (data?.questions) {
        data.questions.sort((a, b) => a.order_index - b.order_index);
      }
      
      return data;
    } catch (err) {
      console.error('Error fetching daily challenge:', err);
      return null;
    }
  }

  // Get a specific quiz by ID
  async getQuiz(quizId) {
    try {
      const { data, error } = await supabase
        .from('knowledge_quizzes')
        .select(`
          *,
          questions:knowledge_quiz_questions(*)
        `)
        .eq('id', quizId)
        .single();
      
      if (error) throw error;
      
      if (data?.questions) {
        data.questions.sort((a, b) => a.order_index - b.order_index);
      }
      
      return data;
    } catch (err) {
      console.error('Error fetching quiz:', err);
      return null;
    }
  }

  // Get user's study progress
  async getUserProgress(userId) {
    try {
      const { data, error } = await supabase
        .from('knowledge_user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      return data || {
        total_xp: 0,
        current_rank: 'noob',
        current_streak: 0,
        longest_streak: 0,
        daily_xp_earned: 0,
        last_activity_date: null
      };
    } catch (err) {
      console.error('Error fetching user progress:', err);
      return {
        total_xp: 0,
        current_rank: 'noob',
        current_streak: 0,
        longest_streak: 0,
        daily_xp_earned: 0,
        last_activity_date: null
      };
    }
  }

  // Submit quiz attempt and get XP
  async submitQuizAttempt(userId, quizId, score, maxScore, answers, timeTaken) {
    try {
      const quiz = await this.getQuiz(quizId);
      if (!quiz) throw new Error('Quiz not found');
      
      // Calculate base XP based on score percentage
      const baseXp = Math.floor((score / maxScore) * quiz.xp_reward);
      
      const { data, error } = await supabase
        .from('knowledge_quiz_attempts')
        .insert({
          user_id: userId,
          quiz_id: quizId,
          score,
          max_score: maxScore,
          xp_earned: baseXp,
          answers,
          time_taken_seconds: timeTaken
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Fetch updated progress
      const progress = await this.getUserProgress(userId);
      
      return { attempt: data, progress };
    } catch (err) {
      console.error('Error submitting quiz attempt:', err);
      throw err;
    }
  }

  // Check if user has completed today's challenge
  async hasCompletedTodaysChallenge(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const challenge = await this.getTodaysChallenge();
      
      if (!challenge) return false;
      
      const { data, error } = await supabase
        .from('knowledge_quiz_attempts')
        .select('id')
        .eq('user_id', userId)
        .eq('quiz_id', challenge.id)
        .gte('completed_at', today)
        .limit(1);
      
      if (error) throw error;
      
      return data && data.length > 0;
    } catch (err) {
      console.error('Error checking challenge completion:', err);
      return false;
    }
  }

  // Get cell leaderboard (top cells by weekly XP)
  async getCellLeaderboard(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('knowledge_cells')
        .select(`
          *,
          members:knowledge_cell_members(user_id)
        `)
        .order('weekly_xp', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      return data || [];
    } catch (err) {
      console.error('Error fetching cell leaderboard:', err);
      return [];
    }
  }

  // Get user's cell
  async getUserCell(userId) {
    try {
      const { data, error } = await supabase
        .from('knowledge_cell_members')
        .select(`
          cell:knowledge_cells(*)
        `)
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      return data?.cell || null;
    } catch (err) {
      console.error('Error fetching user cell:', err);
      return null;
    }
  }

  // Get all cells (for joining)
  async getAllCells() {
    try {
      const { data, error } = await supabase
        .from('knowledge_cells')
        .select(`
          *,
          members:knowledge_cell_members(user_id)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (err) {
      console.error('Error fetching cells:', err);
      return [];
    }
  }

  // Join a cell
  async joinCell(userId, cellId) {
    try {
      // First leave any existing cell
      await this.leaveCell(userId);
      
      const { data, error } = await supabase
        .from('knowledge_cell_members')
        .insert({ cell_id: cellId, user_id: userId })
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (err) {
      console.error('Error joining cell:', err);
      throw err;
    }
  }

  // Leave current cell
  async leaveCell(userId) {
    try {
      const { error } = await supabase
        .from('knowledge_cell_members')
        .delete()
        .eq('user_id', userId);
      
      if (error) throw error;
      
      return true;
    } catch (err) {
      console.error('Error leaving cell:', err);
      return false;
    }
  }

  // Create a new cell
  async createCell(userId, name, description = '') {
    try {
      const { data, error } = await supabase
        .from('knowledge_cells')
        .insert({ 
          name, 
          description, 
          created_by: userId 
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Auto-join the creator to the cell
      await this.joinCell(userId, data.id);
      
      return data;
    } catch (err) {
      console.error('Error creating cell:', err);
      throw err;
    }
  }

  // Get all available quizzes (catalogue)
  async getAllQuizzes(filters = {}) {
    try {
      let query = supabase
        .from('knowledge_quizzes')
        .select(`
          *,
          questions:knowledge_quiz_questions(id)
        `)
        .eq('is_active', true);
      
      if (filters.quiz_type) {
        query = query.eq('quiz_type', filters.quiz_type);
      }
      
      if (filters.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Add question count
      return (data || []).map(q => ({
        ...q,
        question_count: q.questions?.length || 0
      }));
    } catch (err) {
      console.error('Error fetching all quizzes:', err);
      return [];
    }
  }

  // Get user's quiz history
  async getUserQuizHistory(userId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('knowledge_quiz_attempts')
        .select(`
          *,
          quiz:knowledge_quizzes(title, quiz_type)
        `)
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      return data || [];
    } catch (err) {
      console.error('Error fetching quiz history:', err);
      return [];
    }
  }

  // Get streak multiplier
  getStreakMultiplier(streak) {
    if (streak >= 100) return 1.5;
    if (streak >= 30) return 1.3;
    if (streak >= 7) return 1.2;
    return 1.0;
  }

  // Get XP needed for next rank
  getXpForNextRank(currentRank) {
    const thresholds = {
      noob: 500,
      activist: 1500,
      organizer: 3500,
      cadre: 7000,
      revolutionary: 12000,
      vanguard: null // Max rank
    };
    return thresholds[currentRank] || null;
  }

  // Get rank display info
  getRankInfo(rank) {
    const ranks = {
      noob: { label: 'Noob', color: 'gray', icon: '🌱' },
      activist: { label: 'Activist', color: 'green', icon: '✊' },
      organizer: { label: 'Organizer', color: 'blue', icon: '📢' },
      cadre: { label: 'Cadre', color: 'purple', icon: '⭐' },
      revolutionary: { label: 'Revolutionary', color: 'red', icon: '🔥' },
      vanguard: { label: 'Vanguard', color: 'gold', icon: '👑' }
    };
    return ranks[rank] || ranks.noob;
  }

  // =============================================
  // ADMIN METHODS
  // =============================================

  // Create a new quiz
  async createQuiz(data) {
    try {
      const { data: quiz, error } = await supabase
        .from('knowledge_quizzes')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return quiz;
    } catch (err) {
      console.error('Error creating quiz:', err);
      throw err;
    }
  }

  // Update a quiz
  async updateQuiz(id, data) {
    try {
      const { data: quiz, error } = await supabase
        .from('knowledge_quizzes')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return quiz;
    } catch (err) {
      console.error('Error updating quiz:', err);
      throw err;
    }
  }

  // Delete a quiz
  async deleteQuiz(id) {
    try {
      const { error } = await supabase
        .from('knowledge_quizzes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error deleting quiz:', err);
      throw err;
    }
  }

  // Get quiz with questions (for admin editing)
  async getQuizWithQuestions(quizId) {
    try {
      const { data, error } = await supabase
        .from('knowledge_quizzes')
        .select(`
          *,
          questions:knowledge_quiz_questions(*)
        `)
        .eq('id', quizId)
        .single();
      
      if (error) throw error;
      
      if (data?.questions) {
        data.questions.sort((a, b) => a.order_index - b.order_index);
      }
      
      return data;
    } catch (err) {
      console.error('Error fetching quiz with questions:', err);
      throw err;
    }
  }

  // Create a question
  async createQuestion(quizId, data) {
    try {
      const { data: question, error } = await supabase
        .from('knowledge_quiz_questions')
        .insert({ ...data, quiz_id: quizId })
        .select()
        .single();
      
      if (error) throw error;
      return question;
    } catch (err) {
      console.error('Error creating question:', err);
      throw err;
    }
  }

  // Update a question
  async updateQuestion(id, data) {
    try {
      const { data: question, error } = await supabase
        .from('knowledge_quiz_questions')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return question;
    } catch (err) {
      console.error('Error updating question:', err);
      throw err;
    }
  }

  // Delete a question
  async deleteQuestion(id) {
    try {
      const { error } = await supabase
        .from('knowledge_quiz_questions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error deleting question:', err);
      throw err;
    }
  }

  // Reorder questions
  async reorderQuestions(quizId, orderedIds) {
    try {
      const updates = orderedIds.map((id, index) => 
        supabase
          .from('knowledge_quiz_questions')
          .update({ order_index: index })
          .eq('id', id)
          .eq('quiz_id', quizId)
      );
      
      await Promise.all(updates);
      return true;
    } catch (err) {
      console.error('Error reordering questions:', err);
      throw err;
    }
  }

  // Get all quizzes for admin (including inactive)
  async getAllQuizzesAdmin() {
    try {
      const { data, error } = await supabase
        .from('knowledge_quizzes')
        .select(`
          *,
          questions:knowledge_quiz_questions(id)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(q => ({
        ...q,
        question_count: q.questions?.length || 0
      }));
    } catch (err) {
      console.error('Error fetching all quizzes for admin:', err);
      return [];
    }
  }

  // =============================================
  // HISTORICAL SCENARIOS
  // =============================================

  async getAllScenarios() {
    try {
      const { data, error } = await supabase
        .from('knowledge_scenarios')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching scenarios:', err);
      return [];
    }
  }

  async getAllScenariosAdmin() {
    try {
      const { data, error } = await supabase
        .from('knowledge_scenarios')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching scenarios for admin:', err);
      return [];
    }
  }

  async getScenarioWithNodes(scenarioId) {
    try {
      const { data, error } = await supabase
        .from('knowledge_scenarios')
        .select(`
          *,
          nodes:knowledge_scenario_nodes(
            *,
            choices:knowledge_scenario_choices(*)
          )
        `)
        .eq('id', scenarioId)
        .single();
      
      if (error) throw error;
      
      if (data?.nodes) {
        data.nodes.sort((a, b) => a.order_index - b.order_index);
        data.nodes.forEach(node => {
          if (node.choices) {
            node.choices.sort((a, b) => a.order_index - b.order_index);
          }
        });
      }
      
      return data;
    } catch (err) {
      console.error('Error fetching scenario with nodes:', err);
      throw err;
    }
  }

  async createScenario(data) {
    try {
      const { data: scenario, error } = await supabase
        .from('knowledge_scenarios')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return scenario;
    } catch (err) {
      console.error('Error creating scenario:', err);
      throw err;
    }
  }

  async updateScenario(id, data) {
    try {
      const { data: scenario, error } = await supabase
        .from('knowledge_scenarios')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return scenario;
    } catch (err) {
      console.error('Error updating scenario:', err);
      throw err;
    }
  }

  async deleteScenario(id) {
    try {
      const { error } = await supabase
        .from('knowledge_scenarios')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error deleting scenario:', err);
      throw err;
    }
  }

  async createScenarioNode(scenarioId, data) {
    try {
      const { data: node, error } = await supabase
        .from('knowledge_scenario_nodes')
        .insert({ ...data, scenario_id: scenarioId })
        .select()
        .single();
      
      if (error) throw error;
      return node;
    } catch (err) {
      console.error('Error creating scenario node:', err);
      throw err;
    }
  }

  async updateScenarioNode(id, data) {
    try {
      const { data: node, error } = await supabase
        .from('knowledge_scenario_nodes')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return node;
    } catch (err) {
      console.error('Error updating scenario node:', err);
      throw err;
    }
  }

  async deleteScenarioNode(id) {
    try {
      const { error } = await supabase
        .from('knowledge_scenario_nodes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error deleting scenario node:', err);
      throw err;
    }
  }

  async createScenarioChoice(nodeId, data) {
    try {
      const { data: choice, error } = await supabase
        .from('knowledge_scenario_choices')
        .insert({ ...data, node_id: nodeId })
        .select()
        .single();
      
      if (error) throw error;
      return choice;
    } catch (err) {
      console.error('Error creating scenario choice:', err);
      throw err;
    }
  }

  async updateScenarioChoice(id, data) {
    try {
      const { data: choice, error } = await supabase
        .from('knowledge_scenario_choices')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return choice;
    } catch (err) {
      console.error('Error updating scenario choice:', err);
      throw err;
    }
  }

  async deleteScenarioChoice(id) {
    try {
      const { error } = await supabase
        .from('knowledge_scenario_choices')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error deleting scenario choice:', err);
      throw err;
    }
  }

  async getScenarioProgress(userId, scenarioId) {
    try {
      const { data, error } = await supabase
        .from('knowledge_scenario_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('scenario_id', scenarioId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (err) {
      console.error('Error fetching scenario progress:', err);
      return null;
    }
  }

  async saveScenarioProgress(userId, scenarioId, nodeId, choiceId, completed = false, ending = null, xp = 0) {
    try {
      const existing = await this.getScenarioProgress(userId, scenarioId);
      
      if (existing) {
        const choicesMade = existing.choices_made || [];
        if (choiceId && !choicesMade.includes(choiceId)) {
          choicesMade.push(choiceId);
        }
        
        const { data, error } = await supabase
          .from('knowledge_scenario_progress')
          .update({
            current_node_id: nodeId,
            choices_made: choicesMade,
            completed_at: completed ? new Date().toISOString() : null,
            ending_reached: ending,
            xp_earned: xp
          })
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('knowledge_scenario_progress')
          .insert({
            user_id: userId,
            scenario_id: scenarioId,
            current_node_id: nodeId,
            choices_made: choiceId ? [choiceId] : [],
            completed_at: completed ? new Date().toISOString() : null,
            ending_reached: ending,
            xp_earned: xp
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    } catch (err) {
      console.error('Error saving scenario progress:', err);
      throw err;
    }
  }

  // =============================================
  // CONCEPT MASTERY TREE
  // =============================================

  async getConceptCategories() {
    try {
      const { data, error } = await supabase
        .from('knowledge_concept_categories')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching concept categories:', err);
      return [];
    }
  }

  async getConceptsWithPrerequisites() {
    try {
      const { data, error } = await supabase
        .from('knowledge_concepts')
        .select(`
          *,
          category:knowledge_concept_categories(*),
          prerequisites:knowledge_concept_prerequisites!concept_id(
            prerequisite:knowledge_concepts!prerequisite_id(id, name)
          )
        `)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(concept => ({
        ...concept,
        prerequisite_ids: concept.prerequisites?.map(p => p.prerequisite?.id).filter(Boolean) || []
      }));
    } catch (err) {
      console.error('Error fetching concepts:', err);
      return [];
    }
  }

  async getUserConceptMastery(userId) {
    try {
      const { data, error } = await supabase
        .from('knowledge_concept_mastery')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching user concept mastery:', err);
      return [];
    }
  }

  async updateConceptMastery(userId, conceptId, updates) {
    try {
      const existing = await supabase
        .from('knowledge_concept_mastery')
        .select('*')
        .eq('user_id', userId)
        .eq('concept_id', conceptId)
        .single();
      
      if (existing.data) {
        const { data, error } = await supabase
          .from('knowledge_concept_mastery')
          .update({
            ...updates,
            mastered_at: updates.mastery_level === 3 ? new Date().toISOString() : existing.data.mastered_at
          })
          .eq('id', existing.data.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('knowledge_concept_mastery')
          .insert({
            user_id: userId,
            concept_id: conceptId,
            unlocked_at: new Date().toISOString(),
            ...updates
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    } catch (err) {
      console.error('Error updating concept mastery:', err);
      throw err;
    }
  }

  async createConceptCategory(data) {
    try {
      const { data: category, error } = await supabase
        .from('knowledge_concept_categories')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return category;
    } catch (err) {
      console.error('Error creating concept category:', err);
      throw err;
    }
  }

  async createConcept(data) {
    try {
      const { data: concept, error } = await supabase
        .from('knowledge_concepts')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return concept;
    } catch (err) {
      console.error('Error creating concept:', err);
      throw err;
    }
  }

  async updateConcept(id, data) {
    try {
      const { data: concept, error } = await supabase
        .from('knowledge_concepts')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return concept;
    } catch (err) {
      console.error('Error updating concept:', err);
      throw err;
    }
  }

  async deleteConcept(id) {
    try {
      const { error } = await supabase
        .from('knowledge_concepts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error deleting concept:', err);
      throw err;
    }
  }

  async setConceptPrerequisites(conceptId, prerequisiteIds) {
    try {
      // Delete existing prerequisites
      await supabase
        .from('knowledge_concept_prerequisites')
        .delete()
        .eq('concept_id', conceptId);
      
      // Insert new ones
      if (prerequisiteIds.length > 0) {
        const { error } = await supabase
          .from('knowledge_concept_prerequisites')
          .insert(prerequisiteIds.map(prereqId => ({
            concept_id: conceptId,
            prerequisite_id: prereqId
          })));
        
        if (error) throw error;
      }
      
      return true;
    } catch (err) {
      console.error('Error setting concept prerequisites:', err);
      throw err;
    }
  }
}

export const studyApiService = new StudyApiService();
