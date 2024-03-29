const dayjs = require('dayjs');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getUserBySocialTypeAndSocialId = async (client, socialType, socialId) => {
  const { rows } = await client.query(
    `
    SELECT id FROM public.user
    WHERE social_type = $1 AND social_id = $2
    `,
    [socialType, socialId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const checkAvailableName = async (client, nickname) => {
  const { rows } = await client.query(
    `
    SELECT id FROM public.user
    WHERE nickname = $1
    `,
    [nickname],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const createNewUser = async (client, socialType, socialId, nickname, personalityId) => {
  const now = dayjs().add(9, 'hour');
  const dateFormat = now.format('YYYY-MM-DD');

  const { rows } = await client.query(
    `
    INSERT INTO public.user
    (social_type, social_id, nickname, personality, created_at, updated_at)
    VALUES
    ($1, $2, $3, $4, $5, $5)
    RETURNING *
    `,
    [socialType, socialId, nickname, personalityId, dateFormat],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getAllUser = async (client) => {
  const { rows } = await client.query(
    `
      SELECT * FROM public.user
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getUserByUserId = async (client, userId) => {
  const { rows } = await client.query(
    `
      SELECT * FROM public.user
      WHERE id = $1
    `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const updateChanceByUserId = async (client, userId, newChanceCount) => {
  const now = dayjs().add(9, 'hour');
  const { rows } = await client.query(
    `
      UPDATE public.user
      SET chance = $2, updated_at = $3
      WHERE id = $1
      RETURNING *
    `,
    [userId, newChanceCount, now],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const refillChanceById = async (client, userId) => {
  const now = dayjs().add(9, 'hour');
  const { rows } = await client.query(
    `
      UPDATE public.user
      SET chance = 3, updated_at = $2
      WHERE id = $1
      RETURNING *
    `,
    [userId, now],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const setPersonality = async (client, userId, personalityId) => {
  const now = dayjs().add(9, 'hour');
  const { rows } = await client.query(
    `
      UPDATE public.user
      SET personality = $2, updated_at = $3
      WHERE id = $1
      RETURNING *
    `,
    [userId, personalityId, now],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = {
  getUserBySocialTypeAndSocialId,
  checkAvailableName,
  createNewUser,
  getAllUser,
  getUserByUserId,
  updateChanceByUserId,
  refillChanceById,
  setPersonality,
};
