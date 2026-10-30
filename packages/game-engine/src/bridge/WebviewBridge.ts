import { BridgeCommand, BridgeEvent } from '../events/BridgeProtocol.js';

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

export type CommandHandler = (command: BridgeCommand) => void;

export class WebviewBridge {
  private commandHandler?: CommandHandler;

  constructor() {
    this.setupWindowListener();
  }

  public setCommandHandler(handler: CommandHandler): void {
    this.commandHandler = handler;
  }

  private setupWindowListener(): void {
    if (typeof window === 'undefined') return;

    const onRawMessage = (event: MessageEvent) => {
      try {
        let data: BridgeCommand;
        if (typeof event.data === 'string') {
          // May be JSON string from postMessage
          data = JSON.parse(event.data);
        } else {
          data = event.data;
        }

        if (data && data.type && this.commandHandler) {
          this.commandHandler(data);
        }
      } catch {
        // Non-JSON or external message ignored
      }
    };

    window.addEventListener('message', onRawMessage);
    // Also listen to document for Android WebView edge cases
    if (typeof document !== 'undefined') {
      document.addEventListener('message' as any, onRawMessage as any);
    }
  }

  public sendToReactNative(event: BridgeEvent): void {
    const payload = JSON.stringify(event);

    if (typeof window !== 'undefined' && window.ReactNativeWebView?.postMessage) {
      window.ReactNativeWebView.postMessage(payload);
    } else if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      // In web iframe development mode
      window.parent.postMessage(payload, '*');
    } else {
      // Console fallback in pure headless / test environments
      console.log('[WebviewBridge] -> RN:', event.type);
    }
  }
}
