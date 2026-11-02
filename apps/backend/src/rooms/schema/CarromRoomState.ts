import { Schema, MapSchema, type } from '@colyseus/schema';
import { PlayerSchema } from './PlayerSchema.js';

export type RoomStatus =
  | 'WAITING'
  | 'READY'
  | 'IN_PROGRESS'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CLOSED';

export class CarromRoomState extends Schema {
  @type('string')
  roomId: string = '';

  @type('string')
  status: RoomStatus = 'WAITING';

  @type('string')
  gameMode: string = 'two_player_individual';

  @type('number')
  maxPlayers: number = 2;

  @type('number')
  activeSeat: number = 0;

  @type('number')
  turnNumber: number = 1;

  @type('string')
  queenStatus: string = 'on_board';

  @type('string')
  hostUserId: string = '';

  @type('number')
  turnTimeLimitSeconds: number = 25;

  @type('number')
  targetScore: number = 25;

  @type('number')
  strikerOffset: number = 0;

  @type({ map: PlayerSchema })
  players = new MapSchema<PlayerSchema>();

  @type({ map: 'number' })
  scores = new MapSchema<number>();

  constructor(fields?: Partial<CarromRoomState>) {
    super();
    if (fields) {
      Object.assign(this, fields);
    }
  }
}
