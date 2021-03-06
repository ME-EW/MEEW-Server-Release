const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB, personalityDB } = require('../../../db');

/**
 *  @최근기록_불러오기
 *  @route GET /personality/recent
 *  @error
 */

module.exports = async (req, res) => {
  // @FIX_ME
  // const user = req.user;
  // const userId = user.userId;

  let client;

  try {
    client = await db.connect(req);

    const user = await userDB.getUserByUserId(client, 1);
    const userId = user.id;

    const recentHistory = await personalityDB.getRecentHistoryById(client, userId);

    if (!recentHistory) {
      return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_RECENT_SUCCESS, { today: {}, recent: [] }));
    }

    const personality = await personalityDB.getPersonalityById(client, recentHistory.personalityId);

    const today = {
      enum: personality.id,
      name: personality.name.trim(),
      desc: personality.description.trim(),
    };

    let recent = [];

    const pastHistory = await personalityDB.getPastHistoryById(client, userId);

    // 오늘 기록은 제외하고 push
    for (let i = 1; i < pastHistory.length; i++) {
      const history = pastHistory[i];
      const allTaskIds = history.allTask.split(',');
      let completeTaskIds = [];
      if (history.completeTask) {
        completeTaskIds = history.completeTask.split(',');
      }

      let done = [];
      let fail = [];

      for (let i = 0; i < allTaskIds.length; i++) {
        const tId = allTaskIds[i];
        let { content } = await personalityDB.getTaskByTaskId(client, tId);
        content = content.trim();

        if (completeTaskIds.includes(tId)) {
          done.push({ taskId: parseInt(tId), content });
        } else {
          fail.push({ taskId: parseInt(tId), content });
        }
      }

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
        done,
        fail,
      };

      recent.push(historyObj);
    }

    const data = {
      today,
      recent,
    };

    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_RECENT_SUCCESS, data));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);

    return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
