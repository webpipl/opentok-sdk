import { MediaPermissionsError } from "mic-check";

export interface IJoinRequestType {
  status: "IDLE" | "GRANTED" | "DENIED" | "IGNORED";
  from: OT.Connection;
  data: any;
}
export interface IDevicePermissionStatusType {
  mic: boolean;
  video: boolean;
}

interface IOpentokActionsListener {
  onMute: (key: string, value: boolean) => void;
  onConnection: (
    connections: Map<string | undefined, OT.Connection | undefined | null>
  ) => void;
  onSessionConnectionStatusChange: (status: string) => void;

  onStreamCreate: (key: string, stream: OT.Stream) => void;
  onStreamDestroy: (key: string, stream: OT.Stream) => void;

  onPublisherChanges: (publisher: {
    camera: OT.Publisher | null;
    screen: OT.Publisher | null;
  }) => void;
  onDevicePermissionCheck: (
    error?: MediaPermissionsError,
    status?: IDevicePermissionStatusType
  ) => void;
  onNewJoinRequest: (key: string, data: IJoinRequestType) => void;
  onShowParticipantRequestingPanle: (ready: boolean) => void;
  onParticipantReceivesHostResponse: (data: IJoinRequestType) => void;
  disConnectSessionOnInactive: () => void;
}
export default IOpentokActionsListener;
