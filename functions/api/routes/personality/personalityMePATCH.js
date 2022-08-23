const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB, personalityDB } = require('../../../db');

/**
 *  @나의_캐릭터_설정하기
 *  @route PATCH /personality/me
 *  @error
 */

module.exports = async (req, res) => {
  let client;

  try {
    // @FIX_ME
    // const user = req.user;
    // const userId = user.userId;

    const userId = 1;

    const { personalityId } = req.body;

    if (personalityId < 1 || personalityId > 8) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.INVALID_PERSONALITY_ID));
    }

    client = await db.connect(req);

    await userDB.setPersonality(client, userId, personalityId);

    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SET_PERSONALITY_SUCCESS));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);

    return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
