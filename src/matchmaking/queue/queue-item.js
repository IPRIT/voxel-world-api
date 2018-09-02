let QUEUE_ITEM_INCREMENT = 1;

export class QueueItem {

  /**
   * @type {number}
   * @private
   */
  _id = QUEUE_ITEM_INCREMENT++;

  /**
   * @type {Player}
   * @private
   */
  _player = null;

  /**
   * @type {number}
   * @private
   */
  _createdAt = null;

  /**
   * @param {Player} player
   */
  constructor (player) {
    this._player = player;
    this._createdAt = Date.now();
  }

  /**
   * @return {number}
   */
  get id () {
    return this._id;
  }

  /**
   * @return {Player}
   */
  get player () {
    return this._player;
  }

  /**
   * @return {number|*}
   */
  get playerId () {
    return this._player.id;
  }

  /**
   * @return {number}
   */
  get createdAt () {
    return this._createdAt;
  }
}