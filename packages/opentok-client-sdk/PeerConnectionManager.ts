import { IOpentokSessionType } from "./types/ConnectionEvent";
import { ConnectionStatus } from "./enums/connection-status";
import parseJSON from "./helpers/parseJSON";
import PeerConnectionType from "./types/PeerConnectionType";
import ISDKCallbacks from "./types/ISdkCallbackTypes";

class PeerConnectionManager {
  connections: Map<string, PeerConnectionType> = new Map<
    string,
    OT.Connection
  >();

  callbacks: ISDKCallbacks = {};
  status: ConnectionStatus = ConnectionStatus.Idle;
  session: IOpentokSessionType | undefined = undefined;
  // onShowLobby?: (status?: boolean) => void;
  // addConnectionCallback?: (connections: Map<string, OT.Connection>) => void;
  // removeConnectionCallback?: (connections: Map<string, OT.Connection>) => void;
  constructor(
    session: IOpentokSessionType | undefined,
    status: ConnectionStatus
    // newConnection: (connections: Map<string, OT.Connection>) => void
  ) {
    this.status = status;
    this.session = session;
    this.initConnectionEvents();
  }
  public get amIHost() {
    return this.session?.data?.role === "host";
  }

  public get getHost() {
    return Array.from(this.connections.values()).find((connection) => {
      const data = parseJSON(connection.data);
      return data?.role === "host";
    });
  }

  initConnectionEvents = () => {
    if (this.status === ConnectionStatus.Connected && this.session) {
      this.session.on("connectionCreated", this.connectionCreated);
      this.session.on("connectionDestroyed", this.connectionDestroyed);
    }
  };
  addConnection = (connection: PeerConnectionType) => {
    this.connections.set(connection.connectionId, connection);
    this.callbacks.addConnectionCallback?.(this.connections);
  };
  removeConnection = (connection: PeerConnectionType) => {
    this.connections.delete(connection.connectionId);
    this.callbacks.removeConnectionCallback?.(this.connections);
  };
  isOwnConnection = (connection: PeerConnectionType) => {
    return this.session?.connection?.connectionId;
  };

  /**
   * Event handler for connectionCreated.
   * @param event - The connectionCreated event object
   */
  private connectionCreated = (
    event: OT.Event<"connectionCreated", OT.Session> & {
      connection: PeerConnectionType;
    }
  ): void => {
    const { connection } = event;
    connection.data = parseJSON(connection.data);
    if (this.isOwnConnection(connection)) {
      connection.me = true;
      if (!this.amIHost) {
        // this.onShowLobby?.(true);
        this.callbacks.onShowLobby?.(true);
      }
    } else {
      connection.me = false;
    }
    this.addConnection(connection);
  };

  /**
   * Event handler for connectionDestroyed.
   * @param event - The connectionDestroyed event object
   */
  private connectionDestroyed = (
    event: OT.Event<"connectionDestroyed", OT.Session> & {
      connection: OT.Connection;
    }
  ): void => {
    const { connection } = event;
    this.removeConnection(connection);
  };
}

export default PeerConnectionManager;
