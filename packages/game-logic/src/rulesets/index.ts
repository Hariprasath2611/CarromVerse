import { GameConfiguration, GameMode } from '@carromverse/shared-types';
import { FourPlayerIndividualRuleset } from './FourPlayerIndividualRuleset.js';
import { FourPlayerTeamRuleset } from './FourPlayerTeamRuleset.js';
import { FreeStyleRuleset } from './FreeStyleRuleset.js';
import { IRuleset } from './Ruleset.js';
import { StandardTwoPlayerRuleset } from './StandardTwoPlayerRuleset.js';
import { ThreePlayerRuleset } from './ThreePlayerRuleset.js';

export * from './Ruleset.js';
export * from './StandardTwoPlayerRuleset.js';
export * from './ThreePlayerRuleset.js';
export * from './FourPlayerIndividualRuleset.js';
export * from './FourPlayerTeamRuleset.js';
export * from './FreeStyleRuleset.js';

export function createRulesetForMode(mode: GameMode, config?: Partial<GameConfiguration>): IRuleset {
  if (config?.variant === 'freestyle_carrom') {
    return new FreeStyleRuleset(config);
  }

  switch (mode) {
    case 'two_player_individual':
      return new StandardTwoPlayerRuleset(config);
    case 'three_player_individual':
      return new ThreePlayerRuleset(config);
    case 'four_player_individual':
      return new FourPlayerIndividualRuleset(config);
    case 'four_player_team':
      return new FourPlayerTeamRuleset(config);
    case 'practice':
    default:
      return new StandardTwoPlayerRuleset(config);
  }
}
