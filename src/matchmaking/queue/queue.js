import { QueueItem } from "./queue-item";

export class Queue {

  /**
   * @type {string}
   * @private
   */
  _region = '';

  /**
   * @type {string}
   * @private
   */
  _gameType = '';

  /**
   * @type {Array<QueueItem>}
   * @private
   */
  _queue = [];

  /**
   * @param {string} region
   * @param {string} gameType
   */
  constructor ({ region = 'eu', gameType = 'quick' }) {
    this._region = region;
    this._gameType = gameType;
  }

  /**
   * @param {Player} player
   * @return {QueueItem}
   */
  addToQueue (player) {
    const queueItem = new QueueItem( player );
    this._queue.push( queueItem );

    this._logMessage(
      `[${player.user.nickname}] joined the queue.`
    );

    return queueItem;
  }

  /**
   * @param {QueueItem} queueItem
   */
  removeFromQueue (queueItem) {
    this._removeFromQueue(queueItem.id, (queueItemId, queueItem) => {
      return queueItemId === queueItem.id;
    });
  }

  /**
   * @param {number} queueItemId
   */
  removeFromQueueById (queueItemId) {
    this._removeFromQueue(queueItemId, (queueItemId, queueItem) => {
      return queueItemId === queueItem.id;
    });
  }

  /**
   * @param {number} userId
   */
  removeFromQueueByUserId (userId) {
    this._removeFromQueue(userId, (userId, queueItem) => {
      return userId === queueItem.playerId;
    });
  }

  /**
   * @return {Array<QueueItem>}
   */
  get queue () {
    return this._queue;
  }

  /**
   * @return {string}
   */
  get region () {
    return this._region;
  }

  /**
   * @return {string}
   */
  get gameType () {
    return this._gameType;
  }

  /**
   * @param {*} value
   * @param {Function} predicate
   * @private
   */
  _removeFromQueue (value, predicate) {
    let deletedItem = null;

    for (let i = 0; i < this._queue.length; ++i) {
      const queueItem = this._queue[ i ];

      if (predicate( value, queueItem )) {
        deletedItem = this._queue.splice( i, 1 )[ 0 ];
        break;
      }
    }

    if (deletedItem) {
      const { player } = deletedItem;

      this._logMessage(
        `[${player.user.nickname}] left the queue.`
      );
    }
  }

  /**
   * @param {*} args
   * @private
   */
  _logMessage (...args) {
    console.log(
      `[Queue (${this._queue.length})][${this._region.toUpperCase()}/${this._gameType}]`,
      ...args
    );
  }

  /**
   * @return {string[]}
   * @private
   */
  _logArgs () {
    return [ `Queue size: ${this._queue.length}` ];
  }

  /**
   * @private
   */
  _logInfo () {
    this._logMessage(
      ...this._logArgs()
    );
  }
}