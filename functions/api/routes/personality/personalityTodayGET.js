const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB, personalityDB } = require('../../../db');

/**
 *  @오늘의_캐릭터_확인
 *  @route GET /personality/today
 *  @error
 *    1. 오늘의 캐릭터를 아직 배정받지 못함 (신규 유저)
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

    // @error 1. 오늘의 캐릭터를 아직 배정받지 못함 (신규 유저)
    if (!recentHistory) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.HISTORY_NOT_EXIST));
    }

    const personality = await personalityDB.getPersonalityById(client, recentHistory.personalityId);

    const allTaskIds = recentHistory.allTask.split(',');

    let completeTaskIds = [];
    if (recentHistory.completeTask) {
      completeTaskIds = recentHistory.completeTask.split(',');
    }

    let todo = [];
    for (let i = 0; i < allTaskIds.length; i++) {
      const taskId = allTaskIds[i];
      const complete = completeTaskIds.filter((e) => e === taskId).length === 1 ? true : false;
      const task = await personalityDB.getTaskByTaskId(client, taskId);

      todo.push({
        taskId: parseInt(taskId),
        content: task.content.trim(),
        complete,
      });
    }

    const personalityImage = await personalityDB.getImageByLevelAndId(client, completeTaskIds.length, recentHistory.personalityId);
    const imageUrl = personalityImage.url;

    const data = {
      nickname: user.nickname.trim(),
      enum: personality.id,
      name: personality.name.trim(),
      level: completeTaskIds.length,
      imageUrl,
      chance: user.chance,
      finished: recentHistory.finished,
      todo,
    };

    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_TODAY_SUCCESS, data));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
