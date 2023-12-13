import OT from "@opentok/client";
import { ConnectionStatus } from "./enums/connection-status";
import { CustomSignalEvent } from "./IOpentokActionsListener";
import { IOpentokSessionType } from "./types/ConnectionEvent";
import PeerConnection from "./PeerConnectionManager";
import SignalManager from "./SignalsManager";
import Session from "./Session";
// type PublisherType = "camera" | "screen";

class SessionManager extends Session {
  peerConnection: PeerConnection | null = null;
  subscribers: Map<string, OT.Subscriber> = new Map<string, OT.Subscriber>();
  joinRequests: Map<string, CustomSignalEvent> = new Map<
    string,
    CustomSignalEvent
  >();
  disconnectTimer: any = null;
  signalManager: SignalManager;

  constructor() {
    super();
    this.signalManager = new SignalManager(this);
  }

  getConnections = () => {
    return this.peerConnection?.connections;
  };

  /**
   * @param apiKey The token used for authentication in the session
   * @param sessionId The token used for authentication in the session
   * @returns
   */
  private intializeSession = (apiKey: string, sessionId: string) => {
    return OT.initSession(apiKey, sessionId);
  };

  /**
   * @param {string} apiKey The token used for authentication in the session
   * @param {string} token The token used for authentication in the session
   * @param {string} sessionId  The unique identifier for the session to connect to.
   */
  connect = async (
    apiKey: string,
    sessionId: string,
    token: string
  ): Promise<IOpentokSessionType | OT.OTError> => {
    this.session = this.intializeSession(apiKey, sessionId);
    const promise: Promise<IOpentokSessionType | OT.OTError> = new Promise(
      (resolve, reject) => {
        this.session?.connect(token, (error?: OT.OTError) => {
          if (error) {
            this.status = ConnectionStatus.Failed;
            return reject(error as OT.OTError);
          }
          this.status = ConnectionStatus.Connected;
          this.mutateSessionData();
          this.peerConnection = new PeerConnection(this.session, this.status);
          this.registerPeerConnectionCallbacks();
          this.callbacks.sessionConnectedCallback?.(this.session);
          return resolve(this.session as IOpentokSessionType);
        });
      }
    );

    this.registerSessionEvents();
    return promise;
  };

  /**
   * Disconnects the active session
   * @returns Promise boolean
   */
  disconnect = (): Promise<Boolean> => {
    return new Promise((resolve, reject) => {
      this.session?.disconnect();
      this.callbacks.sessionDisconnectedCallback?.(this.session);
      this.removeSessionEventListener();
      resolve(true);
    });
  };

  // Subscribe to given stream
  subscribe = (
    stream: OT.Stream,
    element: HTMLElement,
    properties: OT.SubscriberProperties,
    name: string
  ): Promise<OT.Subscriber> => {
    if (!this.streams.has(this.getStreamUniqueId(stream))) {
      console.error("Stream not found");
      return Promise.reject(new Error("Stream not found"));
    }

    const extendedProperties: OT.SubscriberProperties = {
      ...properties,
      width: "100%",
      height: "100%",
      insertMode: "append",
      name: stream.connection.data?.name ?? name,
    };

    return new Promise((resolve, reject) => {
      const subscriber = this.session?.subscribe(
        stream,
        element,
        extendedProperties,
        (error) => {
          if (error) {
            console.error("Unable to subscribe:", error);
            return reject(error);
          }
          if (!subscriber) {
            return reject(new Error("Failed to create subscriber"));
          }
          this.subscribers.set(this.getStreamUniqueId(stream), subscriber);
          resolve(subscriber);
        }
      );
    });
  };

  addJoinRequest = (signalType: CustomSignalEvent) => {
    const storableData: CustomSignalEvent = {
      ...signalType,
      data: signalType.data,
      status: "IDLE",
      from: signalType.from,
    };
    const key = signalType.from.connectionId;
    this.joinRequests.set(key, storableData);
    this.callbacks.addJoinRquestCallback?.(key, storableData);
  };
  removeJoinRequest = (connectionId: string) => {
    this.joinRequests.delete(connectionId);
  };

  private registerSessionEvents = () => {
    this.initializeSessionEvents();
    this.signalManager.registerSignals();
  };
  private registerPeerConnectionCallbacks = () => {
    if (this.peerConnection) {
      this.peerConnection.callbacks.onShowLobby = this.callbacks.onShowLobby;
      this.peerConnection.callbacks.addConnectionCallback =
        this.callbacks.addConnectionCallback;
      this.peerConnection.callbacks.removeConnectionCallback =
        this.callbacks.removeConnectionCallback;
    }
  };
}

export default SessionManager;
