"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import OpentokSDKContext from "./opentok-sdk-context";
import { JOIN_REQUEST_STATUS } from "../[room]/constants";
const { OpentokClientSDK } = require("opentok-client-sdk");

const withOpentokHOC = (Component) => {
  return (props) => {
    const [opentok, setOpentok] = useState(null);
    const opentokRef = useRef(null);
    useEffect(() => {
      if (opentok === null) {
        let instance = new OpentokClientSDK();
        setOpentok(instance);
        opentokRef.current = instance;
      }
    }, []);
    useEffect(() => {
      return () => {
        if (opentokRef.current) {
          opentokRef.current?.disconnect();
        }
      };
    }, []);
    if (!opentok) return;
    return <Component children={props.children} opentok={opentok} />;
  };
};

const OpenttokSDKProvider = ({ children, opentok }) => {
  const [connections, setConnections] = useState();
  const [status, setStatus] = useState(opentok?.status);
  const [streams, setStreams] = useState(opentok?.streams);
  const [session, setSession] = useState(opentok?.session);
  const [muted, setMuted] = useState({ audio: false, video: false });
  const [snapshot, setSnapshot] = useState(undefined);
  const [publisher, setPublisher] = useState({
    camera: opentok.publisher.camera,
    screen: opentok?.publisher.screen,
  });
  const [showPermissionRequestStrip, setPermissionRequestStrip] =
    useState(undefined);

  const [joinRequestStatus, setJoinRequestStatus] = useState(
    JOIN_REQUEST_STATUS.Idle
  );

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

  const [devicePermissionError, setDevicePermissionError] = useState(
    opentok?.devicePermissionError
  );
  const [devicePermissionStatus, setDevicePermissionStatus] = useState(
    opentok?.devicePermissions
  );

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

    // opentok.onWaitingRoomShouldWait((data) => {
    //   setShouldWaitOnLobby(data?.value);
    // });

    opentok.onPublisherChanges = (data) => {
      setPublisher(data);
    };
    opentok.onDevicePermissionCheck = (error, permissionStatus) => {
      if (error) {
        setDevicePermissionError(error);
        console.log("Permission Listening:", error);
        return;
      }
      setDevicePermissionStatus(permissionStatus);
    };
    opentok.onShowParticipantRequestingPanle = (isReadyToAsk) => {
      setPermissionRequestStrip(isReadyToAsk);
      setIsParticipant(true);
    };
    opentok.onNewJoinRequest = (key, request) => {
      console.log("new requests:", request);
      setRequests((prev) => {
        return new Map(prev.set(key, request));
      });
    };

    opentok.onParticipantReceivesHostResponse = (data) => {
      setJoinRequestStatus(JOIN_REQUEST_STATUS[data?.data]);
      setTimeout(() => {
        if (data?.data === JOIN_REQUEST_STATUS.Granted) {
          opentok.publish();
        }
      }, 1000);
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
  const shouldShowPermissionRequestStrip = useMemo(() => {
    return (
      isParticipant &&
      showPermissionRequestStrip &&
      joinRequestStatus !== JOIN_REQUEST_STATUS.Granted
    );
  }, [isParticipant, showPermissionRequestStrip, joinRequestStatus]);
  const sendJoinRequestToHost = () => {
    opentok
      .sendRequestToHost()
      .then((res) => {
        console.log("reuest sent");
        setJoinRequestStatus(JOIN_REQUEST_STATUS.RequestSent);
      })
      .catch(() => {
        setJoinRequestStatus(JOIN_REQUEST_STATUS.Idle);
      });
  };

  const onRespondToJoinRequest = useCallback((permission, data) => {
    opentok.onRespondToJoinRequest(permission, data);
    if (permission === JOIN_REQUEST_STATUS.Granted) {
      setRequests((prevRequests) => {
        const copy = new Map(prevRequests);
        copy.delete(data?.from?.id);
        return copy;
      });
    }
  }, []);
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
        isHost,
        shouldShowPermissionRequestStrip,
        isParticipant,
        publisher,
        sendJoinRequestToHost,
        joinRequestStatus,
        requests,
        onRespondToJoinRequest,
        isHostJoined,
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
};

export default withOpentokHOC(OpenttokSDKProvider);
