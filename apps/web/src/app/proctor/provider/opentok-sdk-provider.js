"use client";
import { useEffect, useMemo, useState } from "react";
import OpentokSDKContext from "./opentok-sdk-context";
import withOpentokHOC from "@/hoc/with-opentok-hoc";
const OpenttokSDKProvider = ({ children, opentok }) => {
  const [connections, setConnections] = useState();
  const [status, setStatus] = useState(opentok?.status);
  const [streams, setStreams] = useState(opentok?.streams);
  const [session, setSession] = useState(opentok?.session);
  const [muted, setMuted] = useState({ audio: false, video: false });
  const [snapshot, setSnapshot] = useState(undefined);

  useEffect(() => {
    // console.log("iam cosjsjs yes  cncjjfjjf");
    // console.log("no connectus")
    // console.log("no connectus")
  }, []);
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
    opentok.onMute = (stateKey, stateNewValue) => {
      setMuted((prev) => ({
        ...prev,
        [stateKey]: stateNewValue,
      }));
    };
    opentok.onConnection = (data) => {
      setSession(opentok?.session);
    };
    opentok.onSessionConnectionStatusChange = (data) => {
      setStatus(data);
    };

    opentok.onStreamCreate = (key, stream) => {
      setStreams((prev) => {
        return new Map(prev.set(key, stream));
      });
    };
    opentok.onStreamDestroy = (key, stream) => {
      setStreams((prev) => {
        const streamsData = new Map(prev);
        streamsData.delete(key);
        return streamsData;
      });
    };
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
