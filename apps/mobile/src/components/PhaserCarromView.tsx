import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { generateCarromPhaserHtml } from '@carromverse/game-engine';
import { THEME } from '../constants/theme';

export interface PhaserCarromViewProps {
  size: number;
  themeId?: string;
  strikerSkin?: string;
  activeSeat?: number;
  strikerOffset?: number;
  onEngineReady?: () => void;
  onBoardRendered?: (details: any) => void;
  onStrikerDragged?: (offset: number) => void;
  style?: StyleProp<ViewStyle>;
}

export const PhaserCarromView: React.FC<PhaserCarromViewProps> = ({
  size,
  themeId = 'forest',
  strikerSkin = 'emerald',
  activeSeat = 0,
  strikerOffset = 0,
  onEngineReady,
  onBoardRendered,
  onStrikerDragged,
  style,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isReady, setIsReady] = useState(false);

  // Generate self-contained HTML for Phaser 3
  const htmlContent = React.useMemo(() => {
    return generateCarromPhaserHtml({
      themeId,
      strikerSkin,
      activeSeat,
      canvasSize: 800,
    });
  }, []);

  const sendToPhaser = (type: string, payload?: any) => {
    if (!isReady || !webViewRef.current) return;
    const msg = JSON.stringify({ type, payload });
    const js = `
      try {
        if (typeof handleHostMessage === 'function') {
          handleHostMessage(${JSON.stringify(msg)});
        }
      } catch (err) {
        console.warn('[RN->Phaser bridge error]', err);
      }
      true;
    `;
    webViewRef.current.injectJavaScript(js);
  };

  // Sync theme changes
  useEffect(() => {
    sendToPhaser('CHANGE_THEME', { themeId });
  }, [themeId]);

  // Sync striker skin changes
  useEffect(() => {
    sendToPhaser('CHANGE_STRIKER_SKIN', { skin: strikerSkin });
  }, [strikerSkin]);

  // Sync active player seat
  useEffect(() => {
    sendToPhaser('SET_PLAYER_SEAT', { seat: activeSeat });
  }, [activeSeat]);

  // Sync striker offset position
  useEffect(() => {
    sendToPhaser('SET_STRIKER_OFFSET', { offset: strikerOffset });
  }, [strikerOffset]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      switch (data.type) {
        case 'ENGINE_READY':
          setIsReady(true);
          onEngineReady?.();
          break;
        case 'BOARD_RENDERED':
          onBoardRendered?.(data.payload);
          break;
        case 'STRIKER_DRAGGED':
          if (typeof data.payload?.offset === 'number') {
            onStrikerDragged?.(data.payload.offset);
          }
          break;
      }
    } catch (err) {
      console.warn('[PhaserCarromView] Error parsing bridge message:', err);
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        scalesPageToFit={false}
        style={styles.webView}
        containerStyle={styles.webViewContainer}
      />

      {!isReady && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={THEME.colors.accent} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#07130E',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.card,
  },
  webViewContainer: {
    backgroundColor: '#07130E',
  },
  webView: {
    backgroundColor: '#07130E',
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 19, 14, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
