import { getApi, postApi } from '../api/apiMethods';
import { ENDPOINTS } from '../api/endpoints';

// GET check start-game readiness
export const getStartGameReadinessApi = async (tournamentId, params = {}) => {
  return await getApi(ENDPOINTS.TOURNAMENT_START_GAME_READINESS(tournamentId), params);
};

// POST start or resume a game session
export const startGameApi = async (tournamentId, data = {}) => {
  return await postApi(ENDPOINTS.TOURNAMENT_START_GAME(tournamentId), data);
};

// GET play state for a session
export const getGameSessionApi = async (tournamentId, sessionId) => {
  return await getApi(ENDPOINTS.GAME_SESSION(tournamentId, sessionId));
};

// POST answer YES to the current question
export const answerYesSessionApi = async (tournamentId, sessionId, data = {}) => {
  return await postApi(ENDPOINTS.GAME_SESSION_ANSWER_YES(tournamentId, sessionId), data);
};

// POST answer NO to the current question
export const answerNoSessionApi = async (tournamentId, sessionId, data = {}) => {
  return await postApi(ENDPOINTS.GAME_SESSION_ANSWER_NO(tournamentId, sessionId), data);
};

// POST confirm instruction and continue
export const confirmInstructionSessionApi = async (tournamentId, sessionId) => {
  return await postApi(ENDPOINTS.GAME_SESSION_CONFIRM_INSTRUCTION(tournamentId, sessionId));
};

// POST go back one play step
export const backSessionStepApi = async (tournamentId, sessionId) => {
  return await postApi(ENDPOINTS.GAME_SESSION_BACK(tournamentId, sessionId));
};

// GET club rules
export const getClubRulesApi = async (params = {}) => {
  return await getApi(ENDPOINTS.GET_CLUB_RULES, params);
};
