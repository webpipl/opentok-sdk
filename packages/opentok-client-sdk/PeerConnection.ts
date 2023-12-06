class PeerConnection {
  connections: Map<string | undefined, OT.Connection | undefined | null> =
    new Map<string, OT.Connection>();
  constructor() {}
}

export default PeerConnection;
