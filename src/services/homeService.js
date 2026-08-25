import { getApi, postApi, putApi, patchApi } from '../api/apiMethods';
import { ENDPOINTS } from '../api/endpoints';

export const getTournamentsApi = async params => {
  return await getApi(ENDPOINTS.TOURNAMENTS, params);
};

export const getTournamentByIdApi = async (id) => {
  return await getApi(ENDPOINTS.TOURNAMENT_BY_ID(id));
};

export const createTournamentApi = async data => {
  return await postApi(ENDPOINTS.TOURNAMENTS, data);
};

// PATCH / update tournament by ID
export const updateTournamentApi = async (id, data) => {
  return await patchApi(ENDPOINTS.TOURNAMENT_BY_ID(id), data);
};

// GET existing configure-games config for a tournament
export const getConfigureGamesApi = async (tournamentId) => {
  return await getApi(ENDPOINTS.CONFIGURE_GAMES(tournamentId));
};

// PUT / save configure-games selections for a tournament
export const saveConfigureGamesApi = async (tournamentId, selections) => {
  return await putApi(ENDPOINTS.CONFIGURE_GAMES(tournamentId), { selections });
};

// GET dynamic list of countries
export const getCourseCountriesApi = async () => {
  return await getApi(ENDPOINTS.GET_COUNTRIES);
};

// GET dynamic list of states: /api/v1/mobile/courses/states?Country={country}
export const getStatesApi = async (country) => {
  return await getApi(ENDPOINTS.GET_STATES, { Country: country, country });
};

// GET dynamic list of golf clubs: /api/v1/mobile/courses/clubs?country={country}&state={state}
export const getClubsApi = async (params) => {
  return await getApi(ENDPOINTS.GET_CLUBS, params);
};

// GET courses by club ID
export const getCoursesByClubApi = async (clubId) => {
  return await getApi(ENDPOINTS.GET_COURSES, { clubId });
};