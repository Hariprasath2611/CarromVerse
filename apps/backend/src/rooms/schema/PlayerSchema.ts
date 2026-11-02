import { Schema, type } from '@colyseus/schema';

export class PlayerSchema extends Schema {
  @type('string')
  id: string = '';

  @type('string')
  userId: string = '';

  @type('string')
  displayName: string = '';

  @type('string')
  avatar: string = '👑';

  @type('number')
  seat: number = 0;

  @type('string')
  assignedCoinType: string = 'white';

  @type('string')
  teamId: string = 'none';

  @type('boolean')
  isReady: boolean = false;

  @type('boolean')
  isConnected: boolean = true;

  @type('number')
  score: number = 0;

  @type('number')
  fouls: number = 0;

  constructor(fields?: Partial<PlayerSchema>) {
    super();
    if (fields) {
      Object.assign(this, fields);
    }
  }
}
