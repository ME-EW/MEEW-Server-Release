const dayjs = require('dayjs');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getRecentHistoryById = async (client, userId) => {
  const { rows } = await client.query(
    `
      SELECT * FROM public.history
      WHERE user_id = $1 
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getTaskByTaskId = async (client, taskId) => {
  const { rows } = await client.query(
    `
      SELECT * FROM public.task
      WHERE id = $1
    `,
    [taskId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getPersonalityById = async (client, personalityId) => {
  const { rows } = await client.query(
    `
      SELECT * FROM public.personality
      WHERE id = $1
    `,
    [personalityId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getTasksByPersonalityId = async (client, personalityId) => {
  const { rows } = await client.query(
    `
      SELECT * FROM public.task
      WHERE personality_id = $1
    `,
    [personalityId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const updateRecentHistory = async (client, userId, personalityId, allTask) => {
  const now = dayjs().add(9, 'hour');
  const { rows } = await client.query(
    `
      UPDATE public.history
      SET personality_id = $2, all_task = $3, complete_task = '', updated_at = $4
      WHERE id = (SELECT id FROM public.history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1)
      RETURNING *
    `,
    [userId, personalityId, allTask, now],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const updateTODO = async (client, userId, strCompleteTasks) => {
  const now = dayjs().add(9, 'hour');
  const { rows } = await client.query(
    `
      UPDATE public.history
      SET complete_task = $2, updated_at = $3
      WHERE id = (SELECT id FROM public.history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1)
      RETURNING *
    `,
    [userId, strCompleteTasks, now],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getImageById = async (client, personalityId) => {
  const { rows } = await client.query(
    `
      SELECT * FROM public.personality_image
      WHERE personality_id = $1 AND level > 0
      ORDER BY level
    `,
    [personalityId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getImageByLevelAndId = async (client, level, personalityId) => {
  const { rows } = await client.query(
    `
      SELECT * FROM public.personality_image
      WHERE level = $1 AND personality_id = $2
    `,
    [level, personalityId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const finishHistoryByHistoryId = async (client, historyId) => {
  const now = dayjs().add(9, 'hour');
  const dateFormat = now.format('YYYY-MM-DD');

  const { rows } = await client.query(
    `
      UPDATE public.history
      SET finished = true, finished_at = $2, updated_at = $3
      WHERE id = $1
      RETURNING *
    `,
    [historyId, now, dateFormat],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const createNewHistoryByUserId = async (client, userId, newPersonalityId, strNewTasks) => {
  const now = dayjs().add(9, 'hour');
  const dateFormat = now.format('YYYY-MM-DD');

  const { rows } = await client.query(
    `
    INSERT INTO public.history 
    (user_id, personality_id, all_task, complete_task, created_at, updated_at)
    VALUES
    ($1, $2, $3, '', $4, $4)
    RETURNING *
    `,
    [userId, newPersonalityId, strNewTasks, dateFormat],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const insertSchedule = async (client) => {
  const { rows } = await client.query(
    `
    INSERT INTO public.scheduling
    (text)
    VALUES
    ('DONE')
    RETURNING *
    `,
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

const getPastHistoryById = async (client, userId) => {
  const { rows } = await client.query(
    `
      SELECT * FROM public.history
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 4
    `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getAllHistoryById = async (client, userId, limit, offset) => {
  const { rows } = await client.query(
    `
      SELECT * FROM public.history
      WHERE user_id = $1
      AND created_at <> to_char(now() + '9 hours', 'YYYY-MM-DD')::date
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `,
    [userId, limit, offset],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getHistoryByDate = async (client, userId, date) => {
  const { rows } = await client.query(
    `
      SELECT * FROM public.history
      WHERE user_id = $1
      AND created_at = $2
    `,
    [userId, date],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getPersonalities = async (client) => {
  const { rows } = await client.query(
    `
      SELECT * FROM public.personality
      ORDER BY id
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = {
  getRecentHistoryById,
  getTaskByTaskId,
  getPersonalityById,
  getTasksByPersonalityId,
  updateRecentHistory,
  updateTODO,
  getImageById,
  getImageByLevelAndId,
  finishHistoryByHistoryId,
  createNewHistoryByUserId,
  insertSchedule,
  getPastHistoryById,
  getAllHistoryById,
  getHistoryByDate,
  getPersonalities,
};
