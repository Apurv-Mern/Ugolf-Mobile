// const BASE_URL = 'https://ugolf-backend.24livehost.com:5011';
// const BASE_URL = 'https://ugolf-backend.24livehost.com';
// const BASE_URL = 'http://localhost:4000'; // works on iOS simulator only
// const BASE_URL = 'http://192.168.10.186:4000'; // physical device on same Wi‑Fi
const BASE_URL = "http://10.0.2.2:4000"; // Android emulator → host machine localhost:4000

export const ENDPOINTS = {
  LOGIN: "/api/v1/mobile/auth/login",
  REGISTER: "/api/v1/mobile/auth/register",
  ForgotPassword: "/api/v1/mobile/auth/forgot-password",
  RESET_PASSWORD: "/api/v1/mobile/auth/reset-password",
  SEND_VERIFICATION_OTP: "/api/v1/mobile/auth/send-verification-otp",
  VERIFY_EMAIL: "/api/v1/mobile/auth/verify-email",
  LOGOUT: "/api/v1/mobile/auth/logout",
  REFRESH: "/api/v1/mobile/auth/refresh",
  AUTH_ME: "/api/v1/mobile/auth/me",

  // Player profile / subscription / history
  PLAYER_ME: "/api/v1/mobile/players/me",
  PLAYER_SUBSCRIPTION: "/api/v1/mobile/players/me/subscription",
  PLAYER_GAME_HISTORY: "/api/v1/mobile/players/me/game-history",

  TOURNAMENTS: "/api/v1/mobile/tournaments",
  TOURNAMENT_BY_ID: (id) => `/api/v1/mobile/tournaments/${id}`,
  TOURNAMENT_LEADERBOARD: (id) =>
    `/api/v1/mobile/tournaments/${id}/leaderboard`,
  CONFIGURE_GAMES: (id) => `/api/v1/mobile/tournaments/${id}/configure-games`,
  GET_CLUBS: "/api/v1/mobile/courses/clubs",
  GET_COURSES: "/api/v1/mobile/courses",
  GET_COUNTRIES: "/api/v1/mobile/courses/countries",
  GET_STATES: "/api/v1/mobile/courses/states",
  GET_CLUB_RULES: "/api/v1/mobile/club-rules",

  // Teams APIs
  TEAMS: "/api/v1/mobile/teams",
  TEAM_BY_ID: (id) => `/api/v1/mobile/teams/${id}`,
  TEAM_MEMBER_CANDIDATES: (id) =>
    `/api/v1/mobile/teams/${id}/member-candidates`,
  TEAM_MEMBERS: (id) => `/api/v1/mobile/teams/${id}/members`,
  TEAM_MEMBER_DELETE: (teamId, playerUserId) =>
    `/api/v1/mobile/teams/${teamId}/members/${playerUserId}`,

  // Tournament Teams APIs
  TOURNAMENT_TEAMS: (id) => `/api/v1/mobile/tournaments/${id}/teams`,
  TOURNAMENT_TEAM_INVITE_CANDIDATES: (id) =>
    `/api/v1/mobile/tournaments/${id}/teams/invite-candidates`,
  TOURNAMENT_TEAM_UNINVITE: (tournamentId, teamId) =>
    `/api/v1/mobile/tournaments/${tournamentId}/teams/${teamId}`,
  TOURNAMENT_TEAM_SELECT: (id) =>
    `/api/v1/mobile/tournaments/${id}/teams/select`,
  TOURNAMENT_TEAM_SEND_INVITE_NOTIFICATIONS: (tournamentId, teamId) =>
    `/api/v1/mobile/tournaments/${tournamentId}/teams/${teamId}/send-invite-notifications`,

  // Team Invites & Notifications APIs
  TEAM_INVITES: (teamId) => `/api/v1/mobile/teams/${teamId}/invites`,
  TEAM_INVITE_ACCEPT: (inviteId) =>
    `/api/v1/mobile/teams/invites/${inviteId}/accept`,
  TEAM_INVITE_REJECT: (inviteId) =>
    `/api/v1/mobile/teams/invites/${inviteId}/reject`,

  // General Notifications APIs
  NOTIFICATIONS: "/api/v1/mobile/notifications",
  NOTIFICATIONS_UNREAD_COUNT: "/api/v1/mobile/notifications/unread-count",
  NOTIFICATIONS_READ_ALL: "/api/v1/mobile/notifications/read-all",
  NOTIFICATIONS_CLEAR_ALL: "/api/v1/mobile/notifications/clear-all",
  NOTIFICATION_BY_ID: (id) => `/api/v1/mobile/notifications/${id}`,
  NOTIFICATION_READ: (id) => `/api/v1/mobile/notifications/${id}/read`,
  NOTIFICATION_RESPOND: (id) => `/api/v1/mobile/notifications/${id}/respond`,

  // Help & Support
  SUPPORT_MESSAGES: "/api/v1/mobile/support-messages",

  // Game Play Session APIs
  TOURNAMENT_START_GAME_READINESS: (id) =>
    `/api/v1/mobile/tournaments/${id}/start-game/readiness`,
  TOURNAMENT_START_GAME: (id) => `/api/v1/mobile/tournaments/${id}/start-game`,
  GAME_SESSION: (tournamentId, sessionId) =>
    `/api/v1/mobile/tournaments/${tournamentId}/game-sessions/${sessionId}`,
  GAME_SESSION_ANSWER_YES: (tournamentId, sessionId) =>
    `/api/v1/mobile/tournaments/${tournamentId}/game-sessions/${sessionId}/answer-yes`,
  GAME_SESSION_ANSWER_NO: (tournamentId, sessionId) =>
    `/api/v1/mobile/tournaments/${tournamentId}/game-sessions/${sessionId}/answer-no`,
  GAME_SESSION_CONFIRM_INSTRUCTION: (tournamentId, sessionId) =>
    `/api/v1/mobile/tournaments/${tournamentId}/game-sessions/${sessionId}/confirm-instruction`,
  GAME_SESSION_BACK: (tournamentId, sessionId) =>
    `/api/v1/mobile/tournaments/${tournamentId}/game-sessions/${sessionId}/back`,
};

export default BASE_URL;
