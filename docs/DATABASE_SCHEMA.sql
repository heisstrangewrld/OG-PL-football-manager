-- =============================================================================
-- DATABASE SCHEMA: PREMIER LEAGUE FOOTBALL MANAGER
-- Target Engine: PostgreSQL 15+ / Supabase
-- Pattern: Clean separation of Master Football Data vs Career Save State
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. MASTER FOOTBALL DATA (Global, Read-Only across career saves)
-- =============================================================================

CREATE TABLE master_competitions (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(20) NOT NULL,
    country VARCHAR(50) NOT NULL DEFAULT 'England',
    tier INT NOT NULL DEFAULT 1,
    competition_type VARCHAR(20) NOT NULL CHECK (competition_type IN ('LEAGUE', 'CUP', 'CONTINENTAL')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE master_clubs (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(50) NOT NULL,
    code VARCHAR(3) NOT NULL UNIQUE,
    stadium_name VARCHAR(100) NOT NULL,
    stadium_capacity INT NOT NULL,
    reputation INT NOT NULL CHECK (reputation BETWEEN 1 AND 10000),
    primary_color VARCHAR(7) NOT NULL,
    secondary_color VARCHAR(7) NOT NULL,
    badge_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE master_players (
    id VARCHAR(36) PRIMARY KEY,
    master_club_id VARCHAR(32) REFERENCES master_clubs(id) ON DELETE SET NULL,
    first_name VARCHAR(60) NOT NULL,
    last_name VARCHAR(60) NOT NULL,
    known_as VARCHAR(60),
    nationality VARCHAR(50) NOT NULL,
    birth_date DATE NOT NULL,
    primary_position VARCHAR(5) NOT NULL CHECK (primary_position IN (
        'GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'DM', 'CM', 'LM', 'RM', 'CAM', 'LW', 'RW', 'ST'
    )),
    secondary_positions TEXT[] DEFAULT '{}',
    preferred_foot VARCHAR(5) NOT NULL CHECK (preferred_foot IN ('LEFT', 'RIGHT', 'BOTH')),
    height_cm INT NOT NULL,
    weight_kg INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE master_attributes (
    master_player_id VARCHAR(36) PRIMARY KEY REFERENCES master_players(id) ON DELETE CASCADE,
    -- Physical (1-99)
    pace INT NOT NULL CHECK (pace BETWEEN 1 AND 99),
    acceleration INT NOT NULL CHECK (acceleration BETWEEN 1 AND 99),
    stamina INT NOT NULL CHECK (stamina BETWEEN 1 AND 99),
    strength INT NOT NULL CHECK (strength BETWEEN 1 AND 99),
    agility INT NOT NULL CHECK (agility BETWEEN 1 AND 99),
    jumping_reach INT NOT NULL CHECK (jumping_reach BETWEEN 1 AND 99),
    -- Technical (1-99)
    finishing INT NOT NULL CHECK (finishing BETWEEN 1 AND 99),
    passing INT NOT NULL CHECK (passing BETWEEN 1 AND 99),
    dribbling INT NOT NULL CHECK (dribbling BETWEEN 1 AND 99),
    tackling INT NOT NULL CHECK (tackling BETWEEN 1 AND 99),
    heading INT NOT NULL CHECK (heading BETWEEN 1 AND 99),
    first_touch INT NOT NULL CHECK (first_touch BETWEEN 1 AND 99),
    crossing INT NOT NULL CHECK (crossing BETWEEN 1 AND 99),
    long_shots INT NOT NULL CHECK (long_shots BETWEEN 1 AND 99),
    marking INT NOT NULL CHECK (marking BETWEEN 1 AND 99),
    -- Mental (1-99)
    composure INT NOT NULL CHECK (composure BETWEEN 1 AND 99),
    vision INT NOT NULL CHECK (vision BETWEEN 1 AND 99),
    positioning INT NOT NULL CHECK (positioning BETWEEN 1 AND 99),
    decisions INT NOT NULL CHECK (decisions BETWEEN 1 AND 99),
    work_rate INT NOT NULL CHECK (work_rate BETWEEN 1 AND 99),
    aggression INT NOT NULL CHECK (aggression BETWEEN 1 AND 99),
    bravery INT NOT NULL CHECK (bravery BETWEEN 1 AND 99),
    leadership INT NOT NULL CHECK (leadership BETWEEN 1 AND 99),
    -- Goalkeeping (1-99)
    reflexes INT NOT NULL DEFAULT 50 CHECK (reflexes BETWEEN 1 AND 99),
    handling INT NOT NULL DEFAULT 50 CHECK (handling BETWEEN 1 AND 99),
    gk_positioning INT NOT NULL DEFAULT 50 CHECK (gk_positioning BETWEEN 1 AND 99),
    shot_stopping INT NOT NULL DEFAULT 50 CHECK (shot_stopping BETWEEN 1 AND 99),
    distribution INT NOT NULL DEFAULT 50 CHECK (distribution BETWEEN 1 AND 99),
    -- Overall & Potential
    current_ability INT NOT NULL CHECK (current_ability BETWEEN 1 AND 99),
    potential_ability INT NOT NULL CHECK (potential_ability BETWEEN 1 AND 99),
    -- Hidden traits (1-20)
    hidden_consistency INT NOT NULL DEFAULT 10 CHECK (hidden_consistency BETWEEN 1 AND 20),
    hidden_injury_prone INT NOT NULL DEFAULT 10 CHECK (hidden_injury_prone BETWEEN 1 AND 20)
);

-- =============================================================================
-- 2. USER CAREER SAVES (Instance container per user game save)
-- =============================================================================

CREATE TABLE career_saves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- references auth.users in Supabase
    save_name VARCHAR(100) NOT NULL,
    managed_club_id VARCHAR(32) NOT NULL REFERENCES master_clubs(id),
    current_date DATE NOT NULL DEFAULT '2024-07-01',
    season_year INT NOT NULL DEFAULT 2024,
    manager_name VARCHAR(80) NOT NULL,
    manager_reputation INT NOT NULL DEFAULT 5000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 3. SAVE-ISOLATED CLUBS & FINANCES
-- =============================================================================

CREATE TABLE save_clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    save_id UUID NOT NULL REFERENCES career_saves(id) ON DELETE CASCADE,
    master_club_id VARCHAR(32) NOT NULL REFERENCES master_clubs(id),
    reputation INT NOT NULL,
    transfer_budget BIGINT NOT NULL, -- Currency in GBP (£)
    wage_budget_weekly BIGINT NOT NULL,
    current_balance BIGINT NOT NULL,
    board_confidence INT NOT NULL DEFAULT 75 CHECK (board_confidence BETWEEN 0 AND 100),
    fan_confidence INT NOT NULL DEFAULT 75 CHECK (fan_confidence BETWEEN 0 AND 100),
    training_facilities_tier INT NOT NULL DEFAULT 3 CHECK (training_facilities_tier BETWEEN 1 AND 5),
    youth_facilities_tier INT NOT NULL DEFAULT 3 CHECK (youth_facilities_tier BETWEEN 1 AND 5),
    CONSTRAINT uk_save_club UNIQUE (save_id, master_club_id)
);

-- =============================================================================
-- 4. SAVE-ISOLATED PLAYERS & DYNAMIC ATTRIBUTES
-- =============================================================================

CREATE TABLE save_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    save_id UUID NOT NULL REFERENCES career_saves(id) ON DELETE CASCADE,
    master_player_id VARCHAR(36) REFERENCES master_players(id), -- NULL for new youth academy regens
    club_id UUID REFERENCES save_clubs(id) ON DELETE SET NULL,  -- NULL if Free Agent
    first_name VARCHAR(60) NOT NULL,
    last_name VARCHAR(60) NOT NULL,
    known_as VARCHAR(60),
    nationality VARCHAR(50) NOT NULL,
    birth_date DATE NOT NULL,
    primary_position VARCHAR(5) NOT NULL,
    secondary_positions TEXT[] DEFAULT '{}',
    preferred_foot VARCHAR(5) NOT NULL,
    current_ability INT NOT NULL CHECK (current_ability BETWEEN 1 AND 99),
    potential_ability INT NOT NULL CHECK (potential_ability BETWEEN 1 AND 99),
    -- Dynamic condition & morale metrics
    condition_pct INT NOT NULL DEFAULT 100 CHECK (condition_pct BETWEEN 0 AND 100),
    sharpness_pct INT NOT NULL DEFAULT 85 CHECK (sharpness_pct BETWEEN 0 AND 100),
    morale VARCHAR(15) NOT NULL DEFAULT 'GOOD' CHECK (morale IN ('VERY_POOR', 'POOR', 'OKAY', 'GOOD', 'SUPERB')),
    form_rating NUMERIC(3, 1) NOT NULL DEFAULT 6.5 CHECK (form_rating BETWEEN 1.0 AND 10.0),
    is_injured BOOLEAN NOT NULL DEFAULT FALSE,
    injury_type VARCHAR(50),
    injury_return_date DATE
);

CREATE TABLE save_attributes (
    save_player_id UUID PRIMARY KEY REFERENCES save_players(id) ON DELETE CASCADE,
    pace INT NOT NULL,
    acceleration INT NOT NULL,
    stamina INT NOT NULL,
    strength INT NOT NULL,
    agility INT NOT NULL,
    jumping_reach INT NOT NULL,
    finishing INT NOT NULL,
    passing INT NOT NULL,
    dribbling INT NOT NULL,
    tackling INT NOT NULL,
    heading INT NOT NULL,
    first_touch INT NOT NULL,
    crossing INT NOT NULL,
    long_shots INT NOT NULL,
    marking INT NOT NULL,
    composure INT NOT NULL,
    vision INT NOT NULL,
    positioning INT NOT NULL,
    decisions INT NOT NULL,
    work_rate INT NOT NULL,
    aggression INT NOT NULL,
    bravery INT NOT NULL,
    leadership INT NOT NULL,
    reflexes INT NOT NULL,
    handling INT NOT NULL,
    gk_positioning INT NOT NULL,
    shot_stopping INT NOT NULL,
    distribution INT NOT NULL
);

CREATE TABLE save_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    save_id UUID NOT NULL REFERENCES career_saves(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES save_players(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES save_clubs(id) ON DELETE CASCADE,
    weekly_wage BIGINT NOT NULL,
    start_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    squad_status VARCHAR(20) NOT NULL CHECK (squad_status IN ('STAR', 'IMPORTANT', 'ROTATION', 'BACKUP', 'PROSPECT')),
    release_clause BIGINT,
    appearance_fee BIGINT NOT NULL DEFAULT 0,
    clean_sheet_or_goal_bonus BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uk_save_player_contract UNIQUE (save_id, player_id)
);

-- =============================================================================
-- 5. TACTICAL PRESETS & FORMATIONS
-- =============================================================================

CREATE TABLE save_tactics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    save_id UUID NOT NULL REFERENCES career_saves(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES save_clubs(id) ON DELETE CASCADE,
    formation_name VARCHAR(30) NOT NULL DEFAULT '4-3-3 Attacking',
    formation_code VARCHAR(15) NOT NULL DEFAULT '4-3-3',
    -- Tactical Team Instructions
    width VARCHAR(15) NOT NULL DEFAULT 'BALANCED' CHECK (width IN ('NARROW', 'BALANCED', 'WIDE')),
    tempo VARCHAR(15) NOT NULL DEFAULT 'BALANCED' CHECK (tempo IN ('LOW', 'BALANCED', 'HIGH')),
    passing_style VARCHAR(15) NOT NULL DEFAULT 'MIXED' CHECK (passing_style IN ('SHORT', 'MIXED', 'DIRECT')),
    play_out_from_back BOOLEAN NOT NULL DEFAULT TRUE,
    defensive_line VARCHAR(15) NOT NULL DEFAULT 'MID' CHECK (defensive_line IN ('DEEP', 'MID', 'HIGH')),
    pressing_intensity VARCHAR(15) NOT NULL DEFAULT 'BALANCED' CHECK (pressing_intensity IN ('LOW', 'BALANCED', 'INTENSE')),
    offside_trap BOOLEAN NOT NULL DEFAULT FALSE,
    counter_press BOOLEAN NOT NULL DEFAULT TRUE,
    counter_attack BOOLEAN NOT NULL DEFAULT TRUE,
    -- Lineup Slots: JSON array of 11 starting slots + 9 substitutes
    -- Format: [{"slotIndex": 0, "playerId": "uuid", "role": "SWEEPER_KEEPER", "duty": "DEFEND"}, ...]
    lineup_slots JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uk_save_club_tactics UNIQUE (save_id, club_id)
);

-- =============================================================================
-- 6. FIXTURES, RESULTS & LEAGUE TABLE STANDINGS
-- =============================================================================

CREATE TABLE save_fixtures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    save_id UUID NOT NULL REFERENCES career_saves(id) ON DELETE CASCADE,
    competition_id VARCHAR(32) NOT NULL REFERENCES master_competitions(id),
    season_year INT NOT NULL,
    gameweek INT NOT NULL,
    scheduled_date DATE NOT NULL,
    home_club_id UUID NOT NULL REFERENCES save_clubs(id),
    away_club_id UUID NOT NULL REFERENCES save_clubs(id),
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    home_score INT,
    away_score INT,
    match_seed INT,
    attendance INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE save_match_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    save_id UUID NOT NULL REFERENCES career_saves(id) ON DELETE CASCADE,
    fixture_id UUID NOT NULL REFERENCES save_fixtures(id) ON DELETE CASCADE,
    -- Summary match statistics
    home_stats JSONB NOT NULL DEFAULT '{}'::jsonb, -- { possession, shots, onTarget, xG, fouls, corners }
    away_stats JSONB NOT NULL DEFAULT '{}'::jsonb,
    player_ratings JSONB NOT NULL DEFAULT '{}'::jsonb, -- { playerId: ratingFloat }
    events JSONB NOT NULL DEFAULT '[]'::jsonb,          -- Array of MatchEvents (goals, cards, injuries)
    keyframe_storage_path TEXT,                         -- Supabase Storage path for full 2D replay if user match
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_save_fixture_report UNIQUE (save_id, fixture_id)
);

CREATE TABLE save_standings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    save_id UUID NOT NULL REFERENCES career_saves(id) ON DELETE CASCADE,
    competition_id VARCHAR(32) NOT NULL REFERENCES master_competitions(id),
    season_year INT NOT NULL,
    club_id UUID NOT NULL REFERENCES save_clubs(id),
    played INT NOT NULL DEFAULT 0,
    won INT NOT NULL DEFAULT 0,
    drawn INT NOT NULL DEFAULT 0,
    lost INT NOT NULL DEFAULT 0,
    goals_for INT NOT NULL DEFAULT 0,
    goals_against INT NOT NULL DEFAULT 0,
    goal_difference INT NOT NULL DEFAULT 0,
    points INT NOT NULL DEFAULT 0,
    CONSTRAINT uk_save_standing_club UNIQUE (save_id, competition_id, season_year, club_id)
);

-- =============================================================================
-- 7. TRANSFER TRANSACTIONS & FINANCIAL LOG
-- =============================================================================

CREATE TABLE save_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    save_id UUID NOT NULL REFERENCES career_saves(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES save_players(id),
    from_club_id UUID REFERENCES save_clubs(id), -- NULL if free agent sign
    to_club_id UUID NOT NULL REFERENCES save_clubs(id),
    transfer_fee BIGINT NOT NULL DEFAULT 0,
    wage_agreed BIGINT NOT NULL,
    transfer_date DATE NOT NULL,
    transfer_type VARCHAR(20) NOT NULL CHECK (transfer_type IN ('PERMANENT', 'FREE', 'LOAN')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE save_finances_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    save_id UUID NOT NULL REFERENCES career_saves(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES save_clubs(id),
    log_date DATE NOT NULL,
    category VARCHAR(30) NOT NULL CHECK (category IN (
        'GATE_RECEIPTS', 'TV_RIGHTS', 'COMMERCIAL_SPONSORSHIP', 'PRIZE_MONEY',
        'PLAYER_WAGES', 'TRANSFER_FEE_EXPENSE', 'TRANSFER_FEE_INCOME',
        'FACILITY_MAINTENANCE', 'SCOUTING_COSTS'
    )),
    amount BIGINT NOT NULL, -- Positive for income, negative for expense
    balance_after BIGINT NOT NULL,
    description TEXT
);

-- =============================================================================
-- 8. INDEXES FOR HIGH-THROUGHPUT LOOKUPS
-- =============================================================================

CREATE INDEX idx_master_players_club ON master_players(master_club_id);
CREATE INDEX idx_master_players_position ON master_players(primary_position);
CREATE INDEX idx_save_players_club ON save_players(save_id, club_id);
CREATE INDEX idx_save_fixtures_calendar ON save_fixtures(save_id, scheduled_date, is_completed);
CREATE INDEX idx_save_standings_points ON save_standings(save_id, competition_id, season_year, points DESC, goal_difference DESC);
CREATE INDEX idx_save_finances_club_date ON save_finances_log(save_id, club_id, log_date);

-- =============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

ALTER TABLE career_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE save_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE save_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE save_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE save_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE save_tactics ENABLE ROW LEVEL SECURITY;
ALTER TABLE save_fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE save_match_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE save_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE save_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE save_finances_log ENABLE ROW LEVEL SECURITY;

-- Master data is publicly readable by authenticated users
ALTER TABLE master_competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_attributes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to master competitions" ON master_competitions FOR SELECT USING (true);
CREATE POLICY "Allow public read access to master clubs" ON master_clubs FOR SELECT USING (true);
CREATE POLICY "Allow public read access to master players" ON master_players FOR SELECT USING (true);
CREATE POLICY "Allow public read access to master attributes" ON master_attributes FOR SELECT USING (true);

-- User career save isolation: Users only see and modify their own career saves
CREATE POLICY "Users can manage their own career saves" ON career_saves
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their save clubs" ON save_clubs
    FOR ALL USING (save_id IN (SELECT id FROM career_saves WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their save players" ON save_players
    FOR ALL USING (save_id IN (SELECT id FROM career_saves WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their save fixtures" ON save_fixtures
    FOR ALL USING (save_id IN (SELECT id FROM career_saves WHERE user_id = auth.uid()));

