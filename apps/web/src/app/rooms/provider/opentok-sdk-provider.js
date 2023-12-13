"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import OpentokSDKContext from "./opentok-sdk-context";
import { JOIN_REQUEST_STATUS } from "../[room]/constants";
import withOpentokHOC from "@/hoc/with-opentok-hoc";
export const DISCONNECT_SESSION_AT = 120000;

function OpenttokSDKProvider({ children, opentok }) {
  const [connections, setConnections] = useState(
    opentok?.sessionManager?.getConnections()
  );
  const [status, setStatus] = useState(opentok?.getStatus());
  const [streams, setStreams] = useState(opentok?.getStreams());
  const [session, setSession] = useState(opentok?.getSession());
  const [muted, setMuted] = useState({ audio: false, video: false });
  const [snapshot, setSnapshot] = useState(undefined);
  const [publisher, setPublisher] = useState({
    camera: opentok.getPublishedCamera(),
    screen: opentok?.getPublishedScreen(),
  });

  const [showPermissionRequestStrip, setPermissionRequestStrip] =
    useState(undefined);

  const [joinRequestStatus, setJoinRequestStatus] = useState(
    JOIN_REQUEST_STATUS.Idle
  );

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

  const [devicePermissionError, setDevicePermissionError] = useState(
    opentok?.devicePermissionError
  );
  const [devicePermissionStatus, setDevicePermissionStatus] = useState(
    opentok?.devicePermissions
  );

  const [isHost, setIsHost] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);
  const [requests, setRequests] = useState(opentok.sessionManager.joinRequests);
  const disconnectTimer = useRef(null);
  useEffect(() => {
    if (session) {
      const data = session?.connection?.data;
      if (data && data?.role === "host") {
        setIsHost(true);
      }
    }
  }, [session]);

  const monitorSessionForInactivityToDisconnect = useCallback(
    (connectionList) => {
      if (connectionList.size < 2) {
        if (disconnectTimer.current) clearTimeout(disconnectTimer.current);
        disconnectTimer.current = setTimeout(
          () => opentok.disconnect(),
          DISCONNECT_SESSION_AT
        );
      } else {
        if (disconnectTimer.current) {
          clearTimeout(disconnectTimer.current);
          disconnectTimer.current = null;
        }
      }
    },
    [opentok]
  );

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

    opentok.callbacks.addConnectionCallback = (data) => {
      setConnections(new Map(data));
      // monitorSessionForInactivityToDisconnect(data);
    };
    opentok.callbacks.removeConnectionCallback = (data) => {
      setConnections(new Map(data));
      // monitorSessionForInactivityToDisconnect(data);
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

    opentok.callbacks.onPublishCompletedCallback = (data) => {
      setPublisher(data);
    };

    opentok.utilityCallbacks.onDevicePermissionCheck = (
      error,
      permissionStatus
    ) => {
      if (error) {
        setDevicePermissionError(error);
        return;
      }
      setDevicePermissionStatus(permissionStatus);
    };

    opentok.callbacks.onShowLobby = (isReadyToAsk) => {
      setPermissionRequestStrip(isReadyToAsk);
      setIsParticipant(true);
    };

    opentok.callbacks.addJoinRquestCallback = (key, request) => {
      console.log("new requests:", request);
      setRequests((prev) => {
        return new Map(prev.set(key, request));
      });
    };

    opentok.callbacks.participantsReceiveResponseFromHostCallback = (data) => {
      setJoinRequestStatus(JOIN_REQUEST_STATUS[data?.data]);
      setTimeout(() => {
        if (data?.data === JOIN_REQUEST_STATUS.Granted) {
          // opentok.sessionManager.publish();
          opentok.publish();
        }
      }, 1000);
    };
  }, []);

  const handleCaptureSnapshot = () => {
    opentok.captureSnapshot().then((res) => {
      setSnapshot(res);
    });
  };
  const clearCaptureSnapshot = () => {
    opentok.clearCapturedSnapshot();
    setSnapshot(undefined);
  };
  const shouldShowPermissionRequestStrip = useMemo(() => {
    return (
      isParticipant &&
      showPermissionRequestStrip &&
      joinRequestStatus !== JOIN_REQUEST_STATUS.Granted
    );
  }, [isParticipant, showPermissionRequestStrip, joinRequestStatus]);
  const sendJoinRequestToHost = () => {
    opentok
      .askToJoin()
      .then((res) => {
        setJoinRequestStatus(JOIN_REQUEST_STATUS.RequestSent);
      })
      .catch(() => {
        setJoinRequestStatus(JOIN_REQUEST_STATUS.Idle);
      });
  };

  const onRespondToJoinRequest = useCallback((permission, data) => {
    opentok.respondToJoinRequest(permission, data);
    if (permission === JOIN_REQUEST_STATUS.Granted) {
      setRequests((prevRequests) => {
        const copy = new Map(prevRequests);
        copy.delete(data?.from?.id);
        return copy;
      });
    }
  }, []);
  const someOneSharedScreen = useMemo(
    () =>
      [...streams]?.some(
        ([key, stream]) =>
          stream?.connection?.id !== session?.connection?.id &&
          stream?.videoType === "screen"
      ),
    [streams, session]
  );

  return (
    <OpentokSDKContext.Provider
      value={{
        opentok,
        status: status,
        streams: streams,
        session: session,
        muted,
        handleCaptureSnapshot,
        clearCaptureSnapshot,
        snapshot,
        isHost,
        shouldShowPermissionRequestStrip,
        isParticipant,
        publisher,
        sendJoinRequestToHost,
        joinRequestStatus,
        requests,
        onRespondToJoinRequest,
        isHostJoined,
        someOneSharedScreen,
      }}
    >
      {devicePermissionError?.name ? (
        <div className=" flex-col flex justify-center items-center w-full">
          <mark>Permission type:{devicePermissionError.type}</mark>
          <h1 className=" text-red-700 font-medium">
            Error message:{devicePermissionError.message}
          </h1>
        </div>
      ) : devicePermissionStatus?.mic && devicePermissionStatus?.video ? (
        children
      ) : (
        <h1>Wait untill we loads permissions</h1>
      )}
    </OpentokSDKContext.Provider>
  );
}

export default withOpentokHOC(OpenttokSDKProvider);
