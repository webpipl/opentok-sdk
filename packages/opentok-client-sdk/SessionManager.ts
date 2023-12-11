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
  ): Promise<IOpentokSessionType> => {
    this.session = this.intializeSession(apiKey, sessionId);
    const promise: Promise<IOpentokSessionType> = new Promise(
      (resolve, reject) => {
        this.session?.connect(token, (error?: OT.OTError) => {
          if (error) {
            this.status = ConnectionStatus.Failed;
          }
          this.status = ConnectionStatus.Connected;
          this.mutateSessionData();
          this.peerConnection = new PeerConnection(this.session, this.status);
          this.registerPeerConnectionCallbacks();
          this.callbacks.sessionConnectedCallback?.(this.session);
          resolve(this.session as IOpentokSessionType);
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

  subscribe = (
    stream: OT.Stream,
    element: HTMLElement,
    properties: OT.SubscriberProperties,
    name: string
  ): Promise<OT.Subscriber | OT.OTError | undefined> => {
    if (!this.streams.get(this.getStreamUniqueId(stream))) {
      return Promise.resolve(undefined);
    }
    const data = stream.connection.data;
    properties = {
      width: "280px",
      height: "280px",
      insertMode: "append",
      name: data?.name || name,
    };
    let _self = this;
    return new Promise((resolve, reject) => {
      const subscriber = this.session?.subscribe(
        stream,
        element,
        properties,
        (error?: OT.OTError | undefined) => {
          if (error) {
            console.log("unable to subscribe");
            reject(error);
          }

          if (subscriber) {
            this.subscribers.set(_self.getStreamUniqueId(stream), subscriber);
            resolve(subscriber);
          }
        }
      );
      subscriber?.on("destroyed", () => {
        console.log("subscriber destroyed");
      });
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
