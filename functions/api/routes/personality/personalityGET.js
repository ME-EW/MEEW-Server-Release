const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { personalityDB } = require('../../../db');

/**
 *  @캐릭터목록_불러오기
 *  @route GET /personalit
 *  @error
 */

module.exports = async (req, res) => {
  let client;

  try {
    client = await db.connect(req);

    let personalities = await personalityDB.getPersonalities(client);

    personalities.forEach((p) => {
      p.name = p.name.trim();
      p.description = p.description.trim();
    });

    const data = {
      personalities,
    };

    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_LIST_SUCCESS, data));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);

    return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
