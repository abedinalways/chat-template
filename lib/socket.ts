// lib/socket.ts
// Singleton Socket.io service that manages the connection lifecycle.
// Provides a clean API for emitting events and listening to server events.
// SSR-safe: the socket is only created on the client side.

import { io, Socket } from 'socket.io-client';
import type { SocketEmitEvents, SocketEvents } from '@/types/chat';

export interface SocketServiceConfig {
  url: string;
  token?: string;
  autoConnect?: boolean;
}

type AnySocket = Socket<Record<string, (...args: unknown[]) => void>, Record<string, (...args: unknown[]) => void>>;

/**
 * Singleton socket service.
 *
 * Usage:
 *   const socketService = SocketService.getInstance({ url, token });
 *   socketService.on('newMessage', (msg) => { ... });
 *   socketService.emit('joinRoom', { conversationId, userId });
 *   socketService.disconnect();
 */
class SocketService {
  private static instance: SocketService | null = null;

  private socket: AnySocket | null = null;
  private config: SocketServiceConfig;
  private connectionCallbacks: Set<(connected: boolean) => void> = new Set();

  private constructor(config: SocketServiceConfig) {
    this.config = config;
  }

  /**
   * Get or create the singleton instance.
   * If the instance already exists but the config changed, it will reconnect.
   */
  static getInstance(config: SocketServiceConfig): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService(config);
    } else if (SocketService.instance.config.url !== config.url) {
      // URL changed — disconnect old socket and update config
      SocketService.instance.disconnect();
      SocketService.instance.config = config;
    }
    return SocketService.instance;
  }

  /**
   * Reset the singleton (useful for tests or when user logs out).
   */
  static reset(): void {
    if (SocketService.instance) {
      SocketService.instance.disconnect();
      SocketService.instance = null;
    }
  }

  /**
   * Create the underlying socket.io client and wire up internal listeners.
   */
  private createSocket(): void {
    if (typeof window === 'undefined') return;

    const { url, token } = this.config;

    this.socket = io(url, {
      auth: token ? { token } : undefined,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      autoConnect: this.config.autoConnect ?? true,
    }) as AnySocket;

    this.socket.on('connect', () => {
      this.notifyConnectionListeners(true);
    });

    this.socket.on('disconnect', (reason: string) => {
      this.notifyConnectionListeners(false);
      // Attempt to reconnect if the server disconnected us
      if (reason === 'io server disconnect') {
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('[SocketService] Connection error:', error.message);
      this.notifyConnectionListeners(false);
    });
  }

  private notifyConnectionListeners(connected: boolean): void {
    this.connectionCallbacks.forEach((cb) => cb(connected));
  }

  /** Connect (or reconnect) the socket. */
  connect(): void {
    if (!this.socket) {
      this.createSocket();
    } else if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  /** Disconnect the socket. */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /** Returns true if the socket is currently connected. */
  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /** Returns the underlying Socket instance (or null). */
  getSocket(): AnySocket | null {
    return this.socket;
  }

  /**
   * Listen to a server event.
   * Returns an unsubscribe function.
   */
  on<K extends keyof SocketEvents>(
    event: K,
    callback: (payload: Parameters<SocketEvents[K]>[0]) => void,
  ): () => void {
    if (!this.socket) {
      this.connect();
    }

    this.socket?.on(event as string, callback as (...args: unknown[]) => void);

    return () => {
      this.off(event, callback);
    };
  }

  /** Remove a specific listener for an event. */
  off<K extends keyof SocketEvents>(
    event: K,
    callback: (payload: Parameters<SocketEvents[K]>[0]) => void,
  ): void {
    this.socket?.off(event as string, callback as (...args: unknown[]) => void);
  }

  /** Remove all listeners for a specific event. */
  offAll<K extends keyof SocketEvents>(event: K): void {
    this.socket?.off(event as string);
  }

  /** Emit an event to the server. */
  emit<K extends keyof SocketEmitEvents>(
    event: K,
    ...args: Parameters<SocketEmitEvents[K]>
  ): void {
    if (!this.socket || !this.socket.connected) {
      console.warn(`[SocketService] Cannot emit "${event}" — socket not connected`);
      return;
    }
    this.socket.emit(event as string, ...args);
  }

  /** Subscribe to connection state changes. */
  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionCallbacks.add(callback);
    return () => {
      this.connectionCallbacks.delete(callback);
    };
  }
}

export { SocketService };
