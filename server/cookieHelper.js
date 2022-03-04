
import { randomBytes } from 'crypto';

const cookieMixin = {
  getGameCookie() {
    return this.gameCookie;
  },
};

/**
 *
 * @param {Request} req
 * @returns
 */
function getGameCookie(req) {
  return req.cookies?.gameCookie;
}

function genCookie() {
  const ranBytes = randomBytes(64);
  let cookie = '';
  for (let idx = 0; idx < ranBytes.length; idx++) {
    cookie += String.fromCharCode(65 + ranBytes[idx] % 57);
  }
  return cookie;
}

function setGameCookie(res) {
  const cookie = genCookie();
  res.cookie('gameCookie', cookie);
  return cookie;
}

/**
 * Creates a cookie if one doesn't exist.
 * It also supplies the game cookie mixins to the request.
 * @param {Request} req
 * @param {Response} res
 */
export function cookieMiddlewear(req, res, next) {
  Object.assign(req, cookieMixin);
  let cookie = getGameCookie(req);
  if (cookie === undefined) {
    cookie = setGameCookie(res);
  }
  req.gameCookie = cookie;
  next();
}

/**
 * Checks if a request has a cookie.
 * @param {Request} req
 * @returns {boolean} does it have a game cookie.
 */
export function requestHasCookie(req) {
  return getGameCookie(req) !== undefined;
}
