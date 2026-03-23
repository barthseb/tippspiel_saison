export interface AdminProfile {
  id: string
  display_name: string
}

export interface Participant {
  id: string
  ticket_number: string | null
  name: string
  phone: string | null
  notes: string | null
  created_by: string | null
  created_by_email: string | null
  updated_at: string
}

export interface Match {
  id: string
  match_number: number
  match_date: string
  home_team: string
  away_team: string
  home_goals_actual: number | null
  away_goals_actual: number | null
  result_entered_by: string | null
  result_entered_at: string | null
}

export interface Tip {
  id: string
  participant_id: string
  match_id: string
  home_goals_tip: number
  away_goals_tip: number
  points: number | null
}

export interface LeaderboardEntry {
  id: string
  ticket_number: string | null
  name: string
  total_points: number
  exact_scores: number
  correct_outcomes: number
  wrong_tips: number
}

export interface TipWithMatch extends Tip {
  match: Match
}

export interface ParticipantWithTips extends Participant {
  tips: TipWithMatch[]
}
