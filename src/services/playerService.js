import { getApi, putApi } from '../api/apiMethods';
import { ENDPOINTS } from '../api/endpoints';

export const getPlayerProfileApi = async () => {
  return await getApi(ENDPOINTS.PLAYER_ME);
};

export const updatePlayerProfileApi = async (data) => {
  return await putApi(ENDPOINTS.PLAYER_ME, data);
};

export const getPlayerSubscriptionApi = async () => {
  return await getApi(ENDPOINTS.PLAYER_SUBSCRIPTION);
};

export const getPlayerGameHistoryApi = async (params) => {
  return await getApi(ENDPOINTS.PLAYER_GAME_HISTORY, params);
};

export const getTournamentLeaderboardApi = async (tournamentId, params = {}) => {
  const query = {};
  if (params.gameNumber != null) {
    query.gameNumber = params.gameNumber;
  }
  if (params.view != null) {
    query.view = params.view;
  }
  return await getApi(ENDPOINTS.TOURNAMENT_LEADERBOARD(tournamentId), query);
};

export const getAuthMeApi = async () => {
  return await getApi(ENDPOINTS.AUTH_ME);
};

export const getCourseCountriesApi = async () => {
  return await getApi(ENDPOINTS.GET_COUNTRIES);
};
