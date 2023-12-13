import { MediaPermissionsError } from "mic-check";

export interface IJoinRequestType {
  status: "IDLE" | "GRANTED" | "DENIED" | "IGNORED";
  from: OT.Connection;
  data: any;
}
export interface CustomSignalEvent extends OT.Event<"signal", OT.Session> {
  status?: "IDLE" | "GRANTED" | "DENIED" | "IGNORED";
  // from?: OT.Connection;
  data?: any;
  from?: any;
}

export interface IDevicePermissionStatusType {
  mic: boolean;
  video: boolean;
}

interface IOpentokActionsListener {
  onDevicePermissionCheck: (
    error?: MediaPermissionsError,
    status?: IDevicePermissionStatusType
  ) => void;
  // onNewJoinRequest: (key: string, data: IJoinRequestType) => void;
  // onShowParticipantRequestingPanle: (ready: boolean) => void;
  // onParticipantReceivesHostResponse: (data: IJoinRequestType) => void;
  // disConnectSessionOnInactive: () => void;
}
export default IOpentokActionsListener;
