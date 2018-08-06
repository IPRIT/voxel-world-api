export const groups = {
  admin: {
    mask: 0x1000,
    name: 'Admin'
  },
  user: {
    mask: 0x100,
    name: 'User'
  },
  locked: {
    mask: 0x10,
    name: 'Locked'  
  },
  all: {
    mask: 0x1000 | 0x100 | 0x10,
    name: 'All'
  }
};

export const groupUtils = {
  /**
   * @param {{mask: number}|number} group
   * @return {{mask: number, name: number}|*}
   */
  resolveGroup (group) {
    return group.mask
      ? group
      : (
        Number.isInteger( group )
          ? groupUtils.groupByMask( group )
          : groups[ group ]
      )
  },

  /**
   * @param {Array<{mask:number}>|number[]} groups
   * @return {Array<{mask: number, name: number}>|*[]}
   */
  resolveAllGroups (...groups) {
    return groups.map( groupUtils.resolveGroup );
  },

  /**
   * @param {{mask: number, name: number}|number} group
   * @param {number} mask
   * @return {boolean}
   */
  hasRight (group, mask) {
    return (mask & groupUtils.resolveGroup( group ).mask) === groupUtils.resolveGroup( group ).mask;
  },

  /**
   * @param {{mask: number, name: number}|number} groups
   * @return {number}
   */
  grouping (...groups) {
    return groups.reduce((mask, group) => mask | groupUtils.resolveGroup( group ).mask, 0);
  },

  /**
   * @param {number} mask
   * @param {{mask: number, name: number}|number} group
   * @return {number}
   */
  addGroup (mask, group) {
    return mask | groupUtils.resolveGroup( group ).mask;
  },

  /**
   * @param {number} mask
   * @param {{mask: number, name: number}|number} group
   * @return {number}
   */
  removeGroup (mask, group) {
    return mask ^ groupUtils.resolveGroup( group ).mask;
  },

  /**
   * @param {number} mask
   * @return {{mask: number, name: number}}
   */
  groupByMask (mask) {
    if (mask === groups.all.mask) {
      return groups.all;
    }
    let filteredGroups = groupUtils.groupsByMask( mask );
    if (!filteredGroups.length) {
      throw new HttpError('Group not found');
    }
    return filteredGroups[ 0 ];
  },

  groupsByMask (mask) {
    return Object.keys( groups )
      .filter(groupKey => groupKey !== 'all' && groupUtils.hasRight( groupKey, mask ))
      .map(groupKey => groups[ groupKey ])
  },

  groupsByMaskSorted (mask, order = 'desc') {
    let sign = order === 'desc' ? -1 : 1;
    return groupUtils.groupsByMask( mask )
      .sort((a, b) => sign * (a.mask - b.mask));
  },

  maxGroupByMask (mask) {
    let filteredGroups = groupUtils.groupsByMaskSorted( mask );
    if (!filteredGroups.length) {
      throw new HttpError('Group not found');
    }
    return filteredGroups[ 0 ];
  },

  minGroupByMask (mask) {
    let filteredGroups = groupUtils.groupsByMaskSorted( mask, 'asc' );
    if (!filteredGroups.length) {
      throw new HttpError('Group not found');
    }
    return filteredGroups[ 0 ];
  }
};