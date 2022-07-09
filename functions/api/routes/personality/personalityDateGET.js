const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB, personalityDB } = require('../../../db');

/**
 *  @지난기록_불러오기
 *  @route GET /personality/date
 *  @error
 *    1. date가 request body로 넘어오지 않았을 때
 */

module.exports = async (req, res) => {
  // @FIX_ME
  // const user = req.user;
  // const userId = user.userId;

  let client;

  const { date } = req.query;

  try {
    client = await db.connect(req);

    const user = await userDB.getUserByUserId(client, 1);
    const userId = user.id;

    // @error1. date가 request body로 넘어오지 않았을 때
    if (!date) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    const history = await personalityDB.getHistoryByDate(client, userId, date);

    if (!history) {
      return res.status(statusCode.OK).send(util.fail(statusCode.OK, responseMessage.GET_DATE_HISTORY_SUCCESS));
    }

    const { personalityId, allTask, completeTask } = history;

    const personality = await personalityDB.getPersonalityById(client, personalityId);
    const allTaskList = allTask.split(',');
    const completeTaskList = completeTask.split(',');

    let done = [];
    let fail = [];

    for (let i = 0; i < allTaskList.length; i++) {
      const tId = allTaskList[i];
      let { content } = await personalityDB.getTaskByTaskId(client, tId);
      content = content.trim();

      if (completeTaskList.includes(tId)) {
        done.push({ taskId: tId, content });
      } else {
        fail.push({ taskId: tId, content });
      }
    }

    const data = {
      enum: personality.id,
      name: personality.name.trim(),
      desc: personality.description.trim(),
      percent: completeTask.length,
      done,
      fail,
    };

    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_DATE_HISTORY_SUCCESS, data));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);

    return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
