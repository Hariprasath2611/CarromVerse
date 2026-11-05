import { Schema, MapSchema, type } from '@colyseus/schema';
import { PlayerSchema } from './PlayerSchema.js';

export type RoomStatus =
  | 'CREATED'
  | 'WAITING'
  | 'READY'
  | 'STARTING'
  | 'IN_PROGRESS'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CLOSED'
  | 'EXPIRED';

export class CarromRoomState extends Schema {
  @type('string')
  roomId: string = '';

  @type('string')
  roomCode: string = '';

  @type('string')
  status: RoomStatus = 'WAITING';

  @type('string')
  gameMode: string = 'two_player_individual';

  @type('number')
  maxPlayers: number = 2;

  @type('string')
  hostUserId: string = '';

  @type('string')
  boardTheme: string = 'classic';

  @type('number')
  targetScore: number = 25;

  @type('number')
  turnTimeLimitSeconds: number = 25;

  @type('boolean')
  isPrivate: boolean = true;

  @type('boolean')
  hasPassword: boolean = false;

  @type('string')
  teamAName: string = 'Team Emerald';

  @type('string')
  teamBName: string = 'Team Gold';

  @type('number')
  activeSeat: number = 0;

  @type('number')
  turnNumber: number = 1;

  @type('string')
  queenStatus: string = 'on_board';

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
