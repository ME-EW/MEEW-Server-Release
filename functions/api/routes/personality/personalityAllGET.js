const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB, personalityDB } = require('../../../db');

/**
 *  @전체기록_불러오기
 *  @route GET /personality/all?page=
 *  @error
 */

module.exports = async (req, res) => {
  // @FIX_ME
  // const user = req.user;
  // const userId = user.userId;

  const { page } = req.query;

  if (page < 1) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.INVALID_PAGE));
  }

  const limit = 10;
  const offset = limit * (page - 1);

  let client;

  try {
    client = await db.connect(req);

    const user = await userDB.getUserByUserId(client, 1);
    const userId = user.id;

    let all = [];

    const allHistory = await personalityDB.getAllHistoryById(client, userId, limit, offset);
    if (!allHistory) {
      return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_ALL_SUCCESS, { all: [] }));
    }

    for (let i = 0; i < allHistory.length; i++) {
      const history = allHistory[i];
      const allTaskIds = history.allTask.split(',');
      let completeTaskIds = history.completeTask ? history.completeTask.split(',') : [];

      const level = completeTaskIds.length;
      const personality = await personalityDB.getPersonalityById(client, history.personalityId);
      const personalityImage = await personalityDB.getImageByLevelAndId(client, level, history.personalityId);
      const imgUrl = personalityImage.url;

      const createdAt = history.createdAt;

      const historyObj = {
        date: createdAt,
        enum: personality.id,
        name: personality.name.trim(),
        imgUrl,
        percent: level * 25,
        done: completeTaskIds.length,
        fail: allTaskIds.length,
      };

      all.push(historyObj);
    }

    const data = {
      all,
    };

    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_ALL_SUCCESS, data));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);

    return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
