import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { generateCarromPhaserHtml } from '@carromverse/game-engine';
import { THEME } from '../constants/theme';

export interface PhaserCarromViewRef {
  shoot: (power: number, angle?: number) => void;
  setAimPower: (power: number) => void;
  cancelAim: () => void;
  resetBoard: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  setAudioConfig: (soundEnabled: boolean, soundVolume: number) => void;
}

export interface PhaserCarromViewProps {
  size: number;
  themeId?: string;
  strikerSkin?: string;
  activeSeat?: number;
  strikerOffset?: number;
  soundEnabled?: boolean;
  soundVolume?: number;
  onEngineReady?: () => void;
  onBoardRendered?: (details: any) => void;
  onStrikerDragged?: (offset: number, isOverlapping?: boolean) => void;
  onShotStarted?: (details: any) => void;
  onAimChanged?: (details: { angle: number; powerRatio: number }) => void;
  onObjectPocketed?: (details: { id: string; type: string; pocketIndex: number }) => void;
  onStrikerPocketed?: (details: { pocketIndex: number }) => void;
  onShotSettled?: (details: { pocketedCount: number; pocketedItems: any[]; strikerPocketed: boolean }) => void;
  style?: StyleProp<ViewStyle>;
}

const RNWebView = WebView as any;

export const PhaserCarromView = forwardRef<PhaserCarromViewRef, PhaserCarromViewProps>(
  (
    {
      size,
      themeId = 'classic',
      strikerSkin = 'emerald',
      activeSeat = 0,
      strikerOffset = 0,
      soundEnabled = true,
      soundVolume = 0.8,
      onEngineReady,
      onBoardRendered,
      onStrikerDragged,
      onShotStarted,
      onAimChanged,
      onObjectPocketed,
      onStrikerPocketed,
      onShotSettled,
      style,
    },
    ref
  ) => {
    const webViewRef = useRef<any>(null);
    const iframeRef = useRef<any>(null);
    const [isReady, setIsReady] = useState(false);

    // Generate self-contained HTML for Phaser 3
    const htmlContent = React.useMemo(() => {
      return generateCarromPhaserHtml({
        themeId,
        strikerSkin,
        activeSeat,
        canvasSize: 840,
      });
    }, [themeId, strikerSkin, activeSeat]);

    // Mounting key forces React to discard any stale in-memory cached frames
    const contentKey = `carrom_${themeId}_${strikerSkin}_${htmlContent.length}`;

    const sendToPhaser = (type: string, payload?: any) => {
      if (!isReady) return;
      const msg = JSON.stringify({ type, payload });

      if (Platform.OS === 'web') {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.postMessage(msg, '*');
        }
      } else if (webViewRef.current) {
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
      }
    };

    useImperativeHandle(ref, () => ({
      shoot: (power: number, angle?: number) => {
        sendToPhaser('SHOOT', { power, angle });
      },
      setAimPower: (power: number) => {
        sendToPhaser('SET_AIM_POWER', { power });
      },
      cancelAim: () => {
        sendToPhaser('CANCEL_AIM');
      },
      resetBoard: () => {
        sendToPhaser('RESET_BOARD');
      },
      pauseGame: () => {
        sendToPhaser('PAUSE_GAME');
      },
      resumeGame: () => {
        sendToPhaser('RESUME_GAME');
      },
      setAudioConfig: (soundEnabled: boolean, soundVolume: number) => {
        sendToPhaser('SET_AUDIO_CONFIG', { soundEnabled, soundVolume });
      },
    }));

    // Sync audio settings
    useEffect(() => {
      sendToPhaser('SET_AUDIO_CONFIG', {
        soundEnabled,
        soundVolume,
      });
    }, [soundEnabled, soundVolume, isReady]);

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

    // Native WebView message handler
    const handleMessage = (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        dispatchBridgeMessage(data);
      } catch (err) {
        console.warn('[PhaserCarromView] Error parsing bridge message:', err);
      }
    };

    const dispatchBridgeMessage = (data: any) => {
      if (!data || !data.type) return;
      switch (data.type) {
        case 'ENGINE_READY':
          setIsReady(true);
          onEngineReady?.();
          break;
        case 'BOARD_RENDERED':
          setIsReady(true);
          onBoardRendered?.(data.payload);
          break;
        case 'STRIKER_DRAGGED':
          if (typeof data.payload?.offset === 'number') {
            onStrikerDragged?.(data.payload.offset, data.payload?.isOverlapping);
          }
          break;
        case 'AIM_CHANGED':
          onAimChanged?.(data.payload);
          break;
        case 'SHOT_STARTED':
          onShotStarted?.(data.payload);
          break;
        case 'OBJECT_POCKETED':
          onObjectPocketed?.(data.payload);
          break;
        case 'STRIKER_POCKETED':
          onStrikerPocketed?.(data.payload);
          break;
        case 'SHOT_SETTLED':
          onShotSettled?.(data.payload);
          break;
        case 'ENGINE_ERROR':
          console.error('[PhaserCarromView] In-engine runtime error:', data.payload);
          break;
      }
    };

    // Web window message listener
    useEffect(() => {
      if (Platform.OS !== 'web' || typeof window === 'undefined') return;

      const onWindowMessage = (event: MessageEvent) => {
        try {
          const raw = event.data;
          const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
          dispatchBridgeMessage(data);
        } catch {
          // Ignore internal non-JSON web messages
        }
      };

      window.addEventListener('message', onWindowMessage);
      return () => {
        window.removeEventListener('message', onWindowMessage);
      };
    }, [
      onEngineReady,
      onBoardRendered,
      onStrikerDragged,
      onAimChanged,
      onShotStarted,
      onObjectPocketed,
      onStrikerPocketed,
      onShotSettled,
    ]);

    return (
      <View style={[styles.container, { width: size, height: size }, style]}>
        {Platform.OS === 'web' ? (
          <iframe
            key={contentKey}
            ref={iframeRef}
            srcDoc={htmlContent}
            title="CarromVerse Canvas"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: '#07130E',
            }}
          />
        ) : (
          <RNWebView
            key={contentKey}
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: htmlContent, baseUrl: 'https://localhost' }}
            onMessage={handleMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            scrollEnabled={false}
            bounces={false}
            overScrollMode="never"
            scalesPageToFit={false}
            androidLayerType="hardware"
            mixedContentMode="always"
            allowFileAccess={true}
            allowFileAccessFromFileURLs={true}
            allowUniversalAccessFromFileURLs={true}
            onLoadEnd={() => {
              const js = `
                try {
                  if (window._phaserGameInstance && window._phaserGameInstance.scale) {
                    window._phaserGameInstance.scale.refresh();
                  }
                } catch(e){}
                true;
              `;
              webViewRef.current?.injectJavaScript(js);
            }}
            onError={(e: any) => {
              console.warn('[PhaserCarromView] WebView onError:', e.nativeEvent);
            }}
            onHttpError={(e: any) => {
              console.warn('[PhaserCarromView] WebView onHttpError:', e.nativeEvent);
            }}
            onRenderProcessGone={(e: any) => {
              console.warn('[PhaserCarromView] WebView render process gone:', e.nativeEvent);
            }}
            style={styles.webView}
            containerStyle={styles.webViewContainer}
          />
        )}

        {!isReady && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={THEME.colors.accent} />
          </View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#07130E',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: Platform.OS === 'web' ? 'hidden' : 'visible',
    borderRadius: Platform.OS === 'web' ? 8 : 0,
  },
  webViewContainer: {
    width: '100%',
    height: '100%',
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
  },
  webView: {
    width: '100%',
    height: '100%',
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7, 19, 14, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
