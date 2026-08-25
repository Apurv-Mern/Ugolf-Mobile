import { getApi, postApi, deleteApi } from '../api/apiMethods';
import { ENDPOINTS } from '../api/endpoints';

// ── Teams APIs ──

// GET list of user's teams
export const getTeamsApi = async (params) => {
  return await getApi(ENDPOINTS.TEAMS, params);
};

// POST create a new team
export const createTeamApi = async (teamData) => {
  return await postApi(ENDPOINTS.TEAMS, teamData);
};

// GET team by ID with members
export const getTeamByIdApi = async (teamId) => {
  return await getApi(ENDPOINTS.TEAM_BY_ID(teamId));
};

// GET candidate players to add to team
export const getTeamMemberCandidatesApi = async (teamId, params) => {
  return await getApi(ENDPOINTS.TEAM_MEMBER_CANDIDATES(teamId), params);
};

// POST add member to team
export const addTeamMemberApi = async (teamId, memberData) => {
  return await postApi(ENDPOINTS.TEAM_MEMBERS(teamId), memberData);
};

  // DELETE remove member from team
export const removeTeamMemberApi = async (teamId, playerUserId) => {
  return await deleteApi(ENDPOINTS.TEAM_MEMBER_DELETE(teamId, playerUserId));
};

// DELETE soft-delete a team (creator only)
export const deleteTeamApi = async (teamId) => {
  return await deleteApi(ENDPOINTS.TEAM_BY_ID(teamId));
};

// ── Tournament Teams APIs ──

// GET teams linked to tournament
export const getTournamentTeamsApi = async (tournamentId) => {
  return await getApi(ENDPOINTS.TOURNAMENT_TEAMS(tournamentId));
};

// POST invite team to tournament
export const inviteTeamToTournamentApi = async (tournamentId, data) => {
  return await postApi(ENDPOINTS.TOURNAMENT_TEAMS(tournamentId), data);
};

// GET candidate teams to invite to tournament
export const getTournamentInviteCandidatesApi = async (tournamentId, params) => {
  return await getApi(ENDPOINTS.TOURNAMENT_TEAM_INVITE_CANDIDATES(tournamentId), params);
};

// DELETE uninvite team from tournament
export const uninviteTeamFromTournamentApi = async (tournamentId, teamId) => {
  return await deleteApi(ENDPOINTS.TOURNAMENT_TEAM_UNINVITE(tournamentId, teamId));
};

// POST select your team for tournament
export const selectTournamentTeamApi = async (tournamentId, data) => {
  console.log('=== SELECT TOURNAMENT TEAM API CALL ===', { tournamentId, payload: data });
  const result = await postApi(ENDPOINTS.TOURNAMENT_TEAM_SELECT(tournamentId), data);
  console.log('=== SELECT TOURNAMENT TEAM API RESPONSE ===', result);
  return result;
};

// DELETE unselect your team from tournament
export const unselectTournamentTeamApi = async (tournamentId) => {
  return await deleteApi(ENDPOINTS.TOURNAMENT_TEAM_SELECT(tournamentId));
};

// POST send/resend invite notifications
export const sendInviteNotificationsApi = async (tournamentId, teamId) => {
  return await postApi(ENDPOINTS.TOURNAMENT_TEAM_SEND_INVITE_NOTIFICATIONS(tournamentId, teamId));
};

// ── Team Member Invites & Response APIs ──

// GET list of invites sent/received for a team
export const getTeamInvitesApi = async (teamId) => {
  return await getApi(ENDPOINTS.TEAM_INVITES(teamId));
};

// POST send team invite to a player
export const sendTeamInviteApi = async (teamId, data) => {
  return await postApi(ENDPOINTS.TEAM_INVITES(teamId), data);
};

// POST accept team invite
export const acceptTeamInviteApi = async (inviteId) => {
  return await postApi(ENDPOINTS.TEAM_INVITE_ACCEPT(inviteId));
};

// POST reject team invite
export const rejectTeamInviteApi = async (inviteId) => {
  return await postApi(ENDPOINTS.TEAM_INVITE_REJECT(inviteId));
};
