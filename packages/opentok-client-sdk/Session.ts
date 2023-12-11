import SignalManager from "./SignalsManager";
import { SESSION_EVENTS_NAMES } from "./constants/events-names";
import { ConnectionStatus } from "./enums/connection-status";
import parseJSON from "./helpers/parseJSON";
import {
  IOpentokSessionType,
  IOpentokStreamType,
} from "./types/ConnectionEvent";
import ISDKCallbacks from "./types/ISdkCallbackTypes";

class Session {
  session: IOpentokSessionType | undefined = undefined;
  status: ConnectionStatus = ConnectionStatus.Idle;
  callbacks: ISDKCallbacks = {};
  streams: Map<string, IOpentokStreamType | undefined | null> = new Map<
    string,
    OT.Stream
  >(null);

  constructor() {}

  /**
   * @description this function helps to load all session events
   */
  protected initializeSessionEvents = () => {
    this.session?.on("sessionConnected", this.sessionConnected);
    this.session?.on("sessionDisconnected", this.sessionDisconnected);
    this.session?.on("sessionReconnecting", this.sessionReconnecting);

    this.session?.on("sessionReconnected", this.sessionReconnected);
    this.session?.on("streamCreated", this.sessionStreamCreated);
    this.session?.on("streamDestroyed", this.sessionStreamDestroyed);
  };

  /**
   *
   * @description Remove all session event listeners
   */
  protected removeSessionEventListener = () => {
    SESSION_EVENTS_NAMES.forEach((eventName) => {
      this.session?.off(eventName, () => {});
    });
  };
  private sessionConnected = (
    event: OT.Event<"sessionConnected", OT.Session>
  ) => {
    this.session = event.target;
    this.status = ConnectionStatus.Connected;
    this.sendSessionStatus();
  };

  private sessionDisconnected = (
    event: OT.Event<"sessionDisconnected", OT.Session>
  ) => {
    this.status = ConnectionStatus.Disconnected;
    this.session = undefined;
    this.sendSessionStatus();
  };
  private sessionReconnecting = (
    event: OT.Event<"sessionReconnecting", OT.Session>
  ) => {
    this.status = ConnectionStatus.ReConnecting;
    this.sendSessionStatus();
  };
  private sessionReconnected = (
    event: OT.Event<"sessionReconnected", OT.Session>
  ) => {
    this.status = ConnectionStatus.Connected;
    this.sendSessionStatus();
  };
  private sendSessionStatus = () => {
    this.callbacks.listenSessionStatus?.(this.status);
  };
  private sessionStreamCreated = (
    event: OT.Event<"streamCreated", OT.Session> & {
      stream: IOpentokStreamType;
    }
  ) => {
    const { stream } = event;
    stream.me = false;
    let parsedData = stream.connection.data;
    stream.connection.data = parsedData;
    this.addStream(stream);
  };
  private sessionStreamDestroyed = (
    event: OT.Event<"streamDestroyed", OT.Session> & {
      stream: IOpentokStreamType;
      reason: string;
    }
  ) => {
    const { stream } = event;
    this.removeStream(stream);
  };
  protected getStreamUniqueId = (stream: OT.Stream) => {
    return `${stream.connection.connectionId}-${stream.videoType}`;
  };
  addStream = (stream: IOpentokStreamType) => {
    this.streams?.set(this.getStreamUniqueId(stream), stream);
    this.callbacks.addStreamCallback?.(this.getStreamUniqueId(stream), stream);
  };
  removeStream = (stream: IOpentokStreamType) => {
    this.streams?.delete(this.getStreamUniqueId(stream));
    this.callbacks.removeStreamCallback?.(
      this.getStreamUniqueId(stream),
      stream
    );
  };
  protected mutateSessionData = () => {
    if (this.session && this.session.connection) {
      let data = parseJSON(this.session?.connection?.data);
      this.session.data = data;
      this.session.connection.data = data;
    }
  };
}
export default Session;
