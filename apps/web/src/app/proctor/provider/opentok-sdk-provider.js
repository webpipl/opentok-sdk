"use client";
import { useEffect, useMemo, useState } from "react";
import OpentokSDKContext from "./opentok-sdk-context";
import withOpentokHOC from "@/hoc/with-opentok-hoc";
const OpenttokSDKProvider = ({ children, opentok }) => {
  const [connections, setConnections] = useState();
  const [status, setStatus] = useState(opentok?.getStatus());
  const [streams, setStreams] = useState(opentok?.getStreams());
  const [session, setSession] = useState(opentok.getSession());
  const [muted, setMuted] = useState({ audio: false, video: false });
  const [snapshot, setSnapshot] = useState(undefined);

  const isHostJoined = useMemo(() => {
    const hostExists = session?.connections?.find((connection) => {
      const data =
        typeof connection.data === "string"
          ? JSON.parse(JSON.parse(connection.data))
          : connection.data;
      return data?.role === "host";
    });
    return hostExists;
  }, [session, streams]);

  const [isHost, setIsHost] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);
  const [requests, setRequests] = useState(opentok.joinRequests);
  useEffect(() => {
    if (session) {
      const data = session?.connection?.data;
      if (data && data?.role === "host") {
        setIsHost(true);
      }
    }
  }, [session]);
  useEffect(() => {}, [isHost]);

  useEffect(() => {
    opentok.muteCallback = (stateKey, stateNewValue) => {
      setMuted((prev) => ({
        ...prev,
        [stateKey]: stateNewValue,
      }));
    };

    opentok.callbacks.sessionConnectedCallback = (data) => {
      console.log("session connected");
      setSession(data);
    };

    opentok.callbacks.sessionDisConnectedCallback = () => {
      setSession(undefined);
    };
    opentok.callbacks.listenSessionStatus = (data) => {
      setStatus(data);
    };
    opentok.callbacks.addStreamCallback = (key, stream) => {
      setStreams((prev) => {
        return new Map(prev.set(key, stream));
      });
    };

    opentok.callbacks.removeStreamCallback = (key, stream) => {
      setStreams((prev) => {
        const streamsData = new Map(prev);
        streamsData.delete(key);
        return streamsData;
      });
    };
    opentok.callbacks.throwError = (errorData) => {
      if (errorData?.name === "OT_AUTHENTICATION_ERROR") {
        setStatus("failed");
      }
    };
    opentok.callbacks.recordingStarted = (event) => {};
    opentok.callbacks.recordingStopped = (event) => {};
  }, []);

  const onSubscribe = () => {};

  const handleCaptureSnapshot = () => {
    opentok.captureSnapshot().then((res) => {
      setSnapshot(res);
    });
  };
  const clearCaptureSnapshot = () => {
    opentok.clearCapturedSnapshot();
    setSnapshot(undefined);
  };

  return (
    <OpentokSDKContext.Provider
      value={{
        opentok,
        status: status,
        streams: streams,
        session: session,
        onSubscribe: onSubscribe,
        muted,
        handleCaptureSnapshot,
        clearCaptureSnapshot,
        snapshot,
      }}
    >
      {children}
    </OpentokSDKContext.Provider>
  );
};

export default withOpentokHOC(OpenttokSDKProvider);
