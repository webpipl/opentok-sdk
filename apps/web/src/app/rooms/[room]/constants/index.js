const SESSION_STATUS = {
  CONNECTED: "connected",
  Connecting: "connecting",
  ReConnecting: "reconnecting",
  Disconnected: "disconnected",
  Connected: "connected",
  Idle: "idle",
  Failed: "failed",
};

export const JOIN_REQUEST_STATUS = {
  Idle: "Idle",
  Granted: "Granted",
  Denied: "Denied",
  Ignored: "Ignored",
  RequestSent: "RequestSent",
};
export default SESSION_STATUS;
