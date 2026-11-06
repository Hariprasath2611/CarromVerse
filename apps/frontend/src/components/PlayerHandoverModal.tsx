import React from 'react';
import { Player } from '@carromverse/shared-types';

export interface PlayerHandoverModalProps {
  visible?: boolean;
  nextPlayer?: Player | null;
  onConfirm?: () => void;
}

/**
 * PlayerHandoverModal has been deprecated and disabled.
 * The striker now shifts immediately after each turn/chance without any modal or pop-up interruption.
 */
export const PlayerHandoverModal: React.FC<PlayerHandoverModalProps> = () => {
  return null;
};
