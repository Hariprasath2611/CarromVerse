# @carromverse/multiplayer

CarromVerse Offline and Local Multiplayer package. Responsible for seat configuration, pass-and-play handovers, team balance validation, and session lifecycle tracking across all supported game modes.

## Supported Modes
- 2-Player Individual (1v1, South vs North)
- 3-Player Individual (Points Carrom, South, East, North)
- 4-Player Individual (Free-for-All, all 4 seats)
- 4-Player Team (2v2 Doubles, Team A: South & North; Team B: East & West)

## Key Modules
- `offline/`: Seat rotations, pass-and-play prompts, offline configuration
- `players/`: Player initial configuration, avatar registries
- `teams/`: Doubles partner pairing and opposite seating validation
- `sessions/`: Match status tracker and session lifecycle management

## Tests
```bash
npm run test
```
