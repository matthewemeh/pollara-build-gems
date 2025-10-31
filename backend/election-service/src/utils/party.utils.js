/**
 * @param {string} partyID
 * @returns {string} path of party's logo (image) in Supabase bucket
 */
const getPartyImageKey = partyID => `parties/${partyID}`;

/**
 * @param {string} contestantID
 * @returns {string} path of contestant's profile image in Supabase bucket
 */
const getContestantImageKey = contestantID => `contestants/${contestantID}`;

/**
 * @param {string} pollID
 * @param {string} optionID
 * @returns {string} path of poll option's image in Supabase bucket
 */
const getOptionImageKey = (formID, pollID, optionID) =>
  `forms/${formID}/polls/${pollID}/${optionID}`;

module.exports = { getPartyImageKey, getContestantImageKey, getOptionImageKey };
