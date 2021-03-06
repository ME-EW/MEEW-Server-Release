const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB, personalityDB } = require('../../../db');

/**
 *  @전체기록_불러오기
 *  @route GET /personality/all
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

    let all = [];

    const pastHistory = await personalityDB.getAllHistoryById(client, userId);
    if (!pastHistory) {
      return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_ALL_SUCCESS, { all: [] }));
    }

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
