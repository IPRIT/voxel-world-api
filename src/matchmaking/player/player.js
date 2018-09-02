export class Player {

  /**
   * @type {Socket}
   * @private
   */
  _socket = null;

  /**
   * @type {User}
   * @private
   */
  _user = null;

  /**
   * @param {Socket} socket
   * @param {User} user
   */
  constructor (socket, user = null) {
    this._socket = socket;
    this._user = user;
  }

  /**
   * @return {number|*}
   */
  get id () {
    return this._user.id;
  }

  /**
   * @return {string}
   */
  get socketId () {
    return this._socket.id;
  }

  /**
   * @return {User}
   */
  get user () {
    return this._user;
  }

  /**
   * @return {Socket}
   */
  get socket () {
    return this._socket;
  }
}