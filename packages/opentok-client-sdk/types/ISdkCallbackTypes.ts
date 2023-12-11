import { CustomSignalEvent } from "../IOpentokActionsListener";
import { ConnectionStatus } from "../enums/connection-status";
import { IOpentokSessionType, IOpentokStreamType } from "./ConnectionEvent";

interface ISDKCallbacks {
  myCustomCallback?: () => void;
  onShowLobby?: (status?: boolean) => void;
  addJoinRquestCallback?: (
    key: string,
    storableData: CustomSignalEvent
  ) => void;
  removeJoinRquest?: () => void;
  sessionConnectedCallback?: (session: IOpentokSessionType | undefined) => void;
  sessionDisconnectedCallback?: (
    session: IOpentokSessionType | undefined
  ) => void;
  listenSessionStatus?: (status: any) => void;
  onConnectionCreated?: (connections: Map<string, OT.Connection>) => void;
  onSessionStatusChange?: (status: ConnectionStatus) => void;
  addStreamCallback?: (
    streamUniqueId: string,
    stream: IOpentokStreamType
  ) => void;
  removeStreamCallback?: (
    streamUniqueId: string,
    stream: IOpentokStreamType
  ) => void;

  addConnectionCallback?: (connections: Map<string, OT.Connection>) => void;
  removeConnectionCallback?: (connections: Map<string, OT.Connection>) => void;
  participantsReceiveResponseFromHostCallback?: (
    event: CustomSignalEvent
  ) => void;
  onPublishCompletedCallback?: (publisher: {
    camera: OT.Publisher | null;
    screen: OT.Publisher | null;
  }) => void;
  muteCallback?: (video: string, isVideoEnabled: undefined | boolean) => void;
}
export default ISDKCallbacks;
