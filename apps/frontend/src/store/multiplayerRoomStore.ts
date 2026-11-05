import { create } from 'zustand';
import {
  CreatePrivateRoomDto,
  GameMode,
  MultiplayerPlayer,
  RoomLifecycleState,
  RoomTeamId,
} from '@carromverse/shared-types';
import { ColyseusClientService } from '../services/multiplayer/colyseusClient';
import { PrivateRoomApiService } from '../services/multiplayer/privateRoomApi';
import { useAuthStore } from './authStore';

interface MultiplayerRoomState {
  roomId: string | null;
  roomCode: string | null;
  status: RoomLifecycleState;
  gameMode: GameMode;
  maxPlayers: number;
  boardTheme: string;
  targetScore: number;
  turnTimeLimitSeconds: number;
  hasPassword: boolean;
  teamAName: string;
  teamBName: string;
  hostUserId: string | null;
  mySessionId: string | null;
  isHost: boolean;
  isReady: boolean;
  allPlayersReady: boolean;
  players: MultiplayerPlayer[];
  countdown: number | null;
  matchStarted: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  createPrivateRoom: (dto: CreatePrivateRoomDto, userProfile?: any) => Promise<string>;
  joinPrivateRoom: (roomCode: string, password?: string, userProfile?: any) => Promise<void>;
  toggleReady: () => void;
  changeGameMode: (mode: GameMode) => void;
  changeSettings: (settings: {
    boardTheme?: string;
    targetScore?: number;
    turnTimeLimitSeconds?: number;
    teamAName?: string;
    teamBName?: string;
  }) => void;
  switchTeam: (targetTeam?: RoomTeamId, targetSessionId?: string) => void;
  kickPlayer: (targetSessionId: string) => void;
  startMatch: () => void;
  leaveRoom: () => Promise<void>;
  clearRoom: () => void;
}

export const useMultiplayerRoomStore = create<MultiplayerRoomState>((set, get) => {
  const clientService = ColyseusClientService.getInstance();

  const bindRoomListeners = (room: any, currentUserId: string) => {
    set({ mySessionId: room.sessionId });

    // 1. Full State Change Listener
    room.onStateChange((state: any) => {
      if (!state) return;

      const playerList: MultiplayerPlayer[] = [];
      if (state.players) {
        state.players.forEach((p: any, sessionId: string) => {
          playerList.push({
            id: sessionId,
            userId: p.userId,
            displayName: p.displayName,
            avatar: p.avatar,
            seat: p.seat,
            assignedCoinType: p.assignedCoinType,
            teamId: p.teamId,
            isReady: p.isReady,
            isConnected: p.isConnected,
            isHost: p.isHost || state.hostUserId === p.userId,
            score: p.score,
            fouls: p.fouls,
          });
        });
      }

      // Sort players by seat order (0, 1, 2, 3)
      playerList.sort((a, b) => a.seat - b.seat);

      const me = playerList.find((p) => p.id === room.sessionId || p.userId === currentUserId);
      const isHost = Boolean(me?.isHost || state.hostUserId === currentUserId);
      const isReady = Boolean(me?.isReady);
      const isFull = playerList.length >= (state.maxPlayers || 2);
      const allPlayersReady = isFull && playerList.every((p) => p.isReady);

      set({
        roomId: state.roomId || room.id,
        roomCode: state.roomCode,
        status: state.status as RoomLifecycleState,
        gameMode: state.gameMode as GameMode,
        maxPlayers: state.maxPlayers,
        boardTheme: state.boardTheme,
        targetScore: state.targetScore,
        turnTimeLimitSeconds: state.turnTimeLimitSeconds,
        hasPassword: state.hasPassword,
        teamAName: state.teamAName,
        teamBName: state.teamBName,
        hostUserId: state.hostUserId,
        isHost,
        isReady,
        allPlayersReady,
        players: playerList,
      });
    });

    // 2. Countdown Starting
    room.onMessage('MATCH_STARTING', ({ countdownSeconds }: { countdownSeconds: number }) => {
      set({ countdown: countdownSeconds, status: 'STARTING' });
    });

    // 3. Match Started
    room.onMessage('MATCH_STARTED', () => {
      set({ matchStarted: true, status: 'IN_PROGRESS', countdown: null });
    });

    // 4. Host Transferred
    room.onMessage('HOST_TRANSFERRED', ({ newHostUserId }: { newHostUserId: string }) => {
      const isNowHost = newHostUserId === currentUserId;
      set({ hostUserId: newHostUserId, isHost: isNowHost });
    });

    // 5. Kicked From Room
    room.onMessage('KICKED_FROM_ROOM', ({ reason }: { reason: string }) => {
      set({ error: reason || 'You were removed from the room by the host' });
      get().clearRoom();
    });

    // 6. Error Messages
    room.onMessage('ERROR', (err: { code: string; message: string }) => {
      set({ error: err.message });
    });

    // 7. Room Error / Disconnect
    room.onError((code: number, message: string) => {
      set({ error: `Connection error (${code}): ${message}` });
    });

    room.onLeave((code: number) => {
      if (code > 1000) {
        set({ error: 'Disconnected from multiplayer room' });
      }
      get().clearRoom();
    });
  };

  return {
    roomId: null,
    roomCode: null,
    status: 'WAITING',
    gameMode: 'two_player_individual',
    maxPlayers: 2,
    boardTheme: 'classic',
    targetScore: 25,
    turnTimeLimitSeconds: 25,
    hasPassword: false,
    teamAName: 'Team Emerald',
    teamBName: 'Team Gold',
    hostUserId: null,
    mySessionId: null,
    isHost: false,
    isReady: false,
    allPlayersReady: false,
    players: [],
    countdown: null,
    matchStarted: false,
    isLoading: false,
    error: null,

    createPrivateRoom: async (dto, userProfile) => {
      set({ isLoading: true, error: null });
      try {
        const user = useAuthStore.getState().user;
        const currentUserId = user?.uid || '';

        // 1. Reserve room on backend
        const reservation = await PrivateRoomApiService.createPrivateRoom(dto);

        // 2. Join via Colyseus
        const room = await clientService.joinRoom(reservation.roomId, {
          password: dto.password,
          displayName: userProfile?.displayName || user?.displayName || 'Host',
          avatar: userProfile?.avatarUrl || '👑',
        });

        bindRoomListeners(room, currentUserId);

        set({
          roomId: reservation.roomId,
          roomCode: reservation.roomCode,
          gameMode: reservation.gameMode as GameMode,
          maxPlayers: reservation.maxPlayers,
          hasPassword: reservation.hasPassword,
          boardTheme: reservation.boardTheme,
          isHost: true,
          isLoading: false,
        });

        return reservation.roomCode;
      } catch (err: any) {
        set({ isLoading: false, error: err.message || 'Failed to create room' });
        throw err;
      }
    },

    joinPrivateRoom: async (roomCode, password, userProfile) => {
      set({ isLoading: true, error: null });
      try {
        const user = useAuthStore.getState().user;
        const currentUserId = user?.uid || '';

        // 1. Lookup room details
        const lookup = await PrivateRoomApiService.lookupRoomCode(roomCode);

        // 2. If password protected, verify password first
        if (lookup.hasPassword) {
          if (!password) {
            throw new Error('This room requires a password.');
          }
          const pwdCheck = await PrivateRoomApiService.verifyPassword(roomCode, password);
          if (!pwdCheck.valid) {
            throw new Error('Incorrect room password.');
          }
        }

        // 3. Connect to Colyseus room
        const room = await clientService.joinRoom(lookup.roomId, {
          password,
          displayName: userProfile?.displayName || user?.displayName || 'Player',
          avatar: userProfile?.avatarUrl || '🐯',
        });

        bindRoomListeners(room, currentUserId);

        set({
          roomId: lookup.roomId,
          roomCode: lookup.roomCode,
          gameMode: lookup.gameMode,
          maxPlayers: lookup.maxPlayers,
          hasPassword: lookup.hasPassword,
          boardTheme: lookup.boardTheme,
          isLoading: false,
        });
      } catch (err: any) {
        set({ isLoading: false, error: err.message || 'Failed to join room' });
        throw err;
      }
    },

    toggleReady: () => {
      clientService.setReady();
    },

    changeGameMode: (gameMode) => {
      clientService.changeGameMode(gameMode);
    },

    changeSettings: (settings) => {
      clientService.changeSettings(settings);
    },

    switchTeam: (targetTeam, targetSessionId) => {
      clientService.switchTeam(targetTeam, targetSessionId);
    },

    kickPlayer: (targetSessionId) => {
      clientService.kickPlayer(targetSessionId);
    },

    startMatch: () => {
      clientService.startMatch();
    },

    leaveRoom: async () => {
      await clientService.leaveRoom();
      get().clearRoom();
    },

    clearRoom: () => {
      set({
        roomId: null,
        roomCode: null,
        status: 'WAITING',
        hostUserId: null,
        mySessionId: null,
        isHost: false,
        isReady: false,
        allPlayersReady: false,
        players: [],
        countdown: null,
        matchStarted: false,
        isLoading: false,
      });
    },
  };
});
