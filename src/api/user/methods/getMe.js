import Promise from 'bluebird';
import { wrapRequest } from "../../../utils";

/**
 * @param {*} req
 * @param {*} res
 * @param {Function} next
 * @return {Promise<T>}
 */
export function getMeRequest (req, res, next) {
  return wrapRequest( getMe, req, res, next );
}

/**
 * @param {*} params
 * @return {Promise<{firstName: string, lastName: string}>}
 */
export async function getMe (params) {
  let {} = params;

  return {
    firstName: 'Alex',
    lastName: 'Belov'
  };
}