'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { useSession } from 'next-auth/react';

type HubName = 'emergency' | 'missing-persons' | 'shuttle';

export function useSignalR(
  hub: HubName,
  handlers: Record<string, (...args: any[]) => void>
) {
  const { data: session } = useSession();
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!session?.accessToken) return;

    const url = `${process.env.NEXT_PUBLIC_SIGNALR_URL}/hubs/${hub}`;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(url, {
        accessTokenFactory: () => session.accessToken,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    // Register handlers
    Object.entries(handlersRef.current).forEach(([event, handler]) => {
      connection.on(event, (...args) => handlersRef.current[event]?.(...args));
    });

    connection.start().catch(err =>
      console.warn(`SignalR ${hub} connection failed:`, err)
    );

    return () => {
      connection.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, hub]);

  const invoke = useCallback(async (method: string, ...args: any[]) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      return connectionRef.current.invoke(method, ...args);
    }
  }, []);

  return { invoke };
}
