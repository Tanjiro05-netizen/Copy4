-- World Sim Tables
-- CLI-style historical-materialist simulation engine

-- Scenario Packs (admin-created content)
CREATE TABLE world_sim_scenario_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  premise TEXT,
  difficulty_default INT DEFAULT 2,
  episode_count INT DEFAULT 12,
  starting_entities JSONB DEFAULT '[]'::jsonb,
  starting_conditions JSONB DEFAULT '{}'::jsonb,
  events_library JSONB DEFAULT '{}'::jsonb,
  theory_prompts JSONB DEFAULT '{}'::jsonb,
  achievements JSONB DEFAULT '[]'::jsonb,
  npc_roster JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Episodes within a scenario pack
CREATE TABLE world_sim_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_pack_id UUID REFERENCES world_sim_scenario_packs(id) ON DELETE CASCADE,
  episode_number INT NOT NULL,
  title TEXT NOT NULL,
  objective TEXT,
  main_conflict TEXT,
  unlocks JSONB DEFAULT '[]'::jsonb,
  failure_modes TEXT[] DEFAULT '{}',
  theory_theme TEXT,
  milestone_condition JSONB,
  branch_points JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(scenario_pack_id, episode_number)
);

-- User sessions
CREATE TABLE world_sim_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_pack_id UUID REFERENCES world_sim_scenario_packs(id),
  title TEXT,
  current_episode INT DEFAULT 1,
  world_state JSONB DEFAULT '{}'::jsonb,
  achievements_earned TEXT[] DEFAULT '{}',
  difficulty INT DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message history (for context window)
CREATE TABLE world_sim_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES world_sim_sessions(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')) NOT NULL,
  content TEXT NOT NULL,
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_world_sim_sessions_user ON world_sim_sessions(user_id);
CREATE INDEX idx_world_sim_sessions_pack ON world_sim_sessions(scenario_pack_id);
CREATE INDEX idx_world_sim_messages_session ON world_sim_messages(session_id);
CREATE INDEX idx_world_sim_episodes_pack ON world_sim_episodes(scenario_pack_id);

-- RLS Policies
ALTER TABLE world_sim_scenario_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_sim_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_sim_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_sim_messages ENABLE ROW LEVEL SECURITY;

-- Scenario packs: anyone can read active packs
CREATE POLICY "Anyone can read active scenario packs"
  ON world_sim_scenario_packs FOR SELECT
  USING (is_active = true);

-- Episodes: anyone can read
CREATE POLICY "Anyone can read episodes"
  ON world_sim_episodes FOR SELECT
  USING (true);

-- Sessions: users can manage their own
CREATE POLICY "Users can read own sessions"
  ON world_sim_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON world_sim_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON world_sim_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON world_sim_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Messages: users can manage messages in their sessions
CREATE POLICY "Users can read messages in own sessions"
  ON world_sim_messages FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM world_sim_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own sessions"
  ON world_sim_messages FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM world_sim_sessions WHERE user_id = auth.uid()
    )
  );

-- Insert the first scenario pack: Relay to Revolution
INSERT INTO world_sim_scenario_packs (
  slug,
  title,
  description,
  premise,
  difficulty_default,
  episode_count,
  starting_entities,
  starting_conditions,
  events_library,
  theory_prompts,
  achievements,
  npc_roster
) VALUES (
  '01_relay_to_revolution_germany',
  'Relay to Revolution: Germany Arc',
  'Build disciplined links, counter reformist capture, survive repression, and help catalyze independent class organs.',
  'You (randomized avatar) appear in Marx/Engels'' orbit and are sent into Germany as a relay: build disciplined links, counter reformist "unity congress" capture, survive repression, and help catalyze the formation of independent class organs that can sustain escalation (cells → delegates → councils → dual power moments). This is not a superhero story. It''s a capacity-building simulator under scarcity and surveillance.',
  2,
  12,
  '[
    {"type": "figure", "id": "marx_figure", "role": "program_correction", "location": "london"},
    {"type": "figure", "id": "engels_figure", "role": "logistics", "location": "london"},
    {"type": "theatre", "id": "germany_theatre", "name": "Germany"},
    {"type": "faction", "id": "reformist_committee", "name": "Unity Congress Sponsors"},
    {"type": "institution", "id": "union_apparatus", "name": "Union Apparatus"},
    {"type": "threat", "id": "police_unit", "name": "Police"},
    {"type": "field", "id": "press_field", "name": "Press"}
  ]'::jsonb,
  '{
    "funds": {"min": "low", "max": "low"},
    "print_capacity": {"min": "none", "max": "none"},
    "couriers": {"min": 0, "max": 0},
    "contacts": {"min": 1, "max": 1},
    "heat": {"min": 18, "max": 25},
    "infiltration_risk": {"min": 10, "max": 18},
    "militancy": {"min": 30, "max": 40},
    "program_clarity": {"min": 15, "max": 25},
    "union_influence": {"min": 55, "max": 75},
    "reformist_pull": {"min": 45, "max": 65},
    "trust": {"min": 35, "max": 45},
    "consciousness": {"min": 20, "max": 30},
    "factionalism": {"min": 20, "max": 35},
    "state_stability": {"min": 60, "max": 75},
    "employer_cohesion": {"min": 55, "max": 70},
    "international_momentum": {"min": 15, "max": 30},
    "rumor_level": {"min": 10, "max": 20}
  }'::jsonb,
  '{
    "repression": {
      "heat_35": ["targeted surveillance", "random workplace checks", "press smear"],
      "heat_55": ["raid on meeting point", "detentions", "print seizure attempts"],
      "heat_75": ["coordinated arrests", "public bans", "paramilitary posture"]
    },
    "infiltration": [
      "Friendly comrade asks for full membership list",
      "New hire knows too much, too soon",
      "Emergency meeting proposed at unsafe time/place",
      "Leak appears as false accusation to split the group"
    ],
    "reformist": [
      "Unity congress seat offered",
      "Joint statement against reaction demands you drop program points",
      "Labor law reform pledge to postpone struggle",
      "Respectable donors offer funds + media if you moderate"
    ],
    "employer": [
      "Select key technicians for privileges",
      "Subcontract layoffs to frighten core workforce",
      "Offer small raise if strike ends immediately",
      "Outsource to break militancy"
    ]
  }'::jsonb,
  '{
    "ep1_3": [
      "What are ''conditions'' in material terms?",
      "Why is moral outrage politically insufficient?",
      "Define mediation in the wage relation."
    ],
    "ep4": [
      "Class function of cross-class bloc in crisis?",
      "Why does ''democratic unity'' stabilize bourgeois order?",
      "How does opportunism appear as ''practical realism''?"
    ],
    "ep5_7": [
      "Why must organization be structured to withstand the state?",
      "What does bourgeois legality conceal?",
      "Explain why repression is predictable, not accidental."
    ],
    "ep8_10": [
      "Difference between union rep and council delegate?",
      "What is dual power materially (not romantically)?",
      "Why is insurrectionism without organs adventurism?"
    ],
    "ep11": [
      "Imperialism: why war is not ''policy error'' but tendency?",
      "Why internationalism is not ethics but necessity?"
    ]
  }'::jsonb,
  '[
    {"id": "first_cell", "name": "First Cell Formed", "condition": "worker_cell with reliability >= medium"},
    {"id": "comms_line", "name": "Comms Line Established", "condition": "courier active 3 turns"},
    {"id": "print_survives", "name": "Print Survives Heat 35", "condition": "printshop not seized after first repression spike"},
    {"id": "congress_defanged", "name": "Unity Congress Defanged", "condition": "reformist_pull -15 without program integrity loss"},
    {"id": "delegate_recall", "name": "Delegate Recall Works", "condition": "delegate corrected without collapse"},
    {"id": "strike_spreads", "name": "Strike Spreads to 3 Sites", "condition": "3+ sites in coordinated action"},
    {"id": "infiltration_neutralized", "name": "Infiltration Neutralized", "condition": "infiltration risk reduced after event"},
    {"id": "dual_power_flicker", "name": "Dual Power Flicker", "condition": "dual power meter > threshold for 2 turns"}
  ]'::jsonb,
  '[
    {"id": "councilist_metalworker", "type": "composite", "stance": "pushes council form, distrusts party"},
    {"id": "union_steward", "type": "composite", "stance": "mediator; stability first"},
    {"id": "parliamentary_socialist", "type": "composite", "stance": "unity congress evangelist"},
    {"id": "printer_master", "type": "composite", "stance": "material constraint NPC, has debts"},
    {"id": "courier_divided", "type": "composite", "stance": "divided loyalties, risk node"},
    {"id": "agent_provocateur", "type": "composite", "stance": "provokes rash action"},
    {"id": "ultra_left_cadre", "type": "composite", "stance": "wants immediate confrontation"},
    {"id": "marx", "type": "historical", "function": "program correction + analysis demands"},
    {"id": "engels", "type": "historical", "function": "logistics realism + route planning + resource triage"}
  ]'::jsonb
);

-- Insert episodes for Relay to Revolution
INSERT INTO world_sim_episodes (scenario_pack_id, episode_number, title, objective, main_conflict, unlocks, failure_modes, theory_theme, milestone_condition, branch_points) 
SELECT 
  id,
  1,
  'Conditions, Not Virtue',
  'Pick initial lever: (A) counter Unity Congress, (B) secure comms/print, (C) seed first cell',
  'You have no infrastructure; "unity" pressure already rolling',
  '["courier_creation", "basic_intelligence", "printshop_attempt"]'::jsonb,
  ARRAY['Choose everything → Heat rises, no capacity built'],
  'conditions, mediation, bourgeois legality',
  '{"type": "priority_set", "values": ["A", "B", "C"]}'::jsonb,
  NULL
FROM world_sim_scenario_packs WHERE slug = '01_relay_to_revolution_germany';

INSERT INTO world_sim_episodes (scenario_pack_id, episode_number, title, objective, main_conflict, unlocks, failure_modes, theory_theme, milestone_condition, branch_points)
SELECT id, 2, 'Crossing the Theatre',
  'Establish Germany entry node (city + sector)',
  'Police checks + poor papers + rumor of compromised printers',
  '["safehouse_low", "contact_acquisition", "small_funds"]'::jsonb,
  ARRAY['Heat spike from sloppy travel narrative', 'Lose contact'],
  'state as apparatus; repression as class function',
  NULL,
  '{"options": [{"id": "B2a", "name": "Industrial Hub", "effect": "faster militancy, higher police"}, {"id": "B2b", "name": "Port/Rail Node", "effect": "logistics advantage, infiltration risk"}]}'::jsonb
FROM world_sim_scenario_packs WHERE slug = '01_relay_to_revolution_germany';

INSERT INTO world_sim_episodes (scenario_pack_id, episode_number, title, objective, main_conflict, unlocks, failure_modes, theory_theme, milestone_condition, branch_points)
SELECT id, 3, 'The First Cell',
  'Create a cell with compartmentalized roles',
  'Militants want immediacy; reformists want committees',
  '["create_worker_cell", "basic_leaflet", "rumor_control"]'::jsonb,
  ARRAY['Cell collapses into talk-shop', 'Gets infiltrated early'],
  'party/cell function vs movement spontaneity',
  '{"type": "entity_exists", "entity": "worker_cell", "condition": "reliability >= medium"}'::jsonb,
  NULL
FROM world_sim_scenario_packs WHERE slug = '01_relay_to_revolution_germany';

INSERT INTO world_sim_episodes (scenario_pack_id, episode_number, title, objective, main_conflict, unlocks, failure_modes, theory_theme, milestone_condition, branch_points)
SELECT id, 4, 'The Unity Congress Invitation',
  'Map the Congress sponsors + agenda; decide attack angle',
  'It''s attractive: legal space, protection, broad numbers',
  '["debate_node", "counter_leaflet", "workplace_meetings"]'::jsonb,
  ARRAY['Denounce without base → isolate', 'Join → program integrity drops'],
  'popular front logic; class independence',
  NULL,
  NULL
FROM world_sim_scenario_packs WHERE slug = '01_relay_to_revolution_germany';

INSERT INTO world_sim_episodes (scenario_pack_id, episode_number, title, objective, main_conflict, unlocks, failure_modes, theory_theme, milestone_condition, branch_points)
SELECT id, 5, 'Print vs Heat',
  'Create limited print capacity without triggering raids',
  'Paper shortages; printer circle leak; police want the press',
  '["create_printshop", "create_courier", "distribution_plan"]'::jsonb,
  ARRAY['Seizure', 'Arrests', 'Rumor explosion', 'Infiltration risk rises'],
  'propaganda as organization tool, not moral speech',
  '{"type": "entity_stable", "entity": "printshop", "duration": 3}'::jsonb,
  NULL
FROM world_sim_scenario_packs WHERE slug = '01_relay_to_revolution_germany';

INSERT INTO world_sim_episodes (scenario_pack_id, episode_number, title, objective, main_conflict, unlocks, failure_modes, theory_theme, milestone_condition, branch_points)
SELECT id, 6, 'Wage Cut Hits: Shop-Floor Pivot',
  'Translate crisis into concrete organization (meeting, delegate idea)',
  'Union channels anger into procedure; boss divides workforce',
  '["strike_fund_seed", "delegate_election", "slowdown_option"]'::jsonb,
  ARRAY['Premature strike → crushed', 'Pure legalism → demoralization'],
  'wage relation; exploitation; unions as mediation',
  NULL,
  NULL
FROM world_sim_scenario_packs WHERE slug = '01_relay_to_revolution_germany';

INSERT INTO world_sim_episodes (scenario_pack_id, episode_number, title, objective, main_conflict, unlocks, failure_modes, theory_theme, milestone_condition, branch_points)
SELECT id, 7, 'The Raid Probability',
  'Survive first serious repression wave',
  'Raids, arrests, newspaper seizures, missing comrades',
  '["redundancy_courier", "safehouse_upgrade", "compartmentalization"]'::jsonb,
  ARRAY['Network map exposed → cascade arrests (Org Capacity collapses)'],
  'state violence; legality; why discipline matters materially',
  NULL,
  NULL
FROM world_sim_scenario_packs WHERE slug = '01_relay_to_revolution_germany';

INSERT INTO world_sim_episodes (scenario_pack_id, episode_number, title, objective, main_conflict, unlocks, failure_modes, theory_theme, milestone_condition, branch_points)
SELECT id, 8, 'Delegates and Recall',
  'Establish legitimate delegates beyond union structure',
  'Union demands control; reformists demand "responsibility"',
  '["create_council_delegate", "recall_mechanic", "coordination_meetings"]'::jsonb,
  ARRAY['Delegate becomes representative divorced from base (trust drops)'],
  'form vs content; representation vs class organ',
  NULL,
  NULL
FROM world_sim_scenario_packs WHERE slug = '01_relay_to_revolution_germany';

INSERT INTO world_sim_episodes (scenario_pack_id, episode_number, title, objective, main_conflict, unlocks, failure_modes, theory_theme, milestone_condition, branch_points)
SELECT id, 9, 'Spread or Die',
  'Spread action to 2–3 sites without overexposing',
  'Employer cohesion; media narrative; police pattern',
  '["cross_site_coordination"]'::jsonb,
  ARRAY['Growth without structure → factionalism + infiltration skyrocket'],
  'concentration of capital; strategic nodes; mass action logistics',
  NULL,
  NULL
FROM world_sim_scenario_packs WHERE slug = '01_relay_to_revolution_germany';

INSERT INTO world_sim_episodes (scenario_pack_id, episode_number, title, objective, main_conflict, unlocks, failure_modes, theory_theme, milestone_condition, branch_points)
SELECT id, 10, 'Dual Power Flicker',
  'Councils coordinate material decisions (food, shifts, defense-of-struggle)',
  'Reformists want parliament; militants want "storm the state" now',
  '["dual_power_meter", "negotiation_traps", "lesser_evil_chain"]'::jsonb,
  ARRAY['Class collaboration accepted → Program Integrity craters', 'Insurrectionist leap → repression crush'],
  'state power; dictatorship of the proletariat (as class rule)',
  NULL,
  NULL
FROM world_sim_scenario_packs WHERE slug = '01_relay_to_revolution_germany';

INSERT INTO world_sim_episodes (scenario_pack_id, episode_number, title, objective, main_conflict, unlocks, failure_modes, theory_theme, milestone_condition, branch_points)
SELECT id, 11, 'International Shock',
  'Respond to international event: war scare, credit shock, border crackdown',
  'Nationalism rises; "defend the nation" campaigns',
  '["international_momentum_actions", "anti_nationalist_propaganda"]'::jsonb,
  ARRAY['Split into patriotic factions', 'Repression justification'],
  'imperialism; war; internationalism as material necessity',
  NULL,
  NULL
FROM world_sim_scenario_packs WHERE slug = '01_relay_to_revolution_germany';

INSERT INTO world_sim_episodes (scenario_pack_id, episode_number, title, objective, main_conflict, unlocks, failure_modes, theory_theme, milestone_condition, branch_points)
SELECT id, 12, 'Outcome',
  'Resolve based on meters',
  'Final reckoning of all accumulated forces and decisions',
  '[]'::jsonb,
  ARRAY['Crushed (Heat high, Org low)', 'Survival (Org medium, Class Power medium)', 'Partial Breakthrough (councils flicker)', 'Revolutionary Success (rare)'],
  'synthesis of all theory themes',
  NULL,
  '{"endings": [{"id": "crushed", "condition": "heat > 70 AND org_capacity < 30"}, {"id": "survival", "condition": "org_capacity >= 40 AND class_power >= 40"}, {"id": "partial", "condition": "dual_power_achieved AND program_integrity >= 50"}, {"id": "success", "condition": "org_capacity >= 70 AND class_power >= 70 AND program_integrity >= 70 AND state_stability < 40"}]}'::jsonb
FROM world_sim_scenario_packs WHERE slug = '01_relay_to_revolution_germany';
