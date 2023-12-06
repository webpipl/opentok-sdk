"use client";
import { useEffect, useMemo, useState } from "react";
import useOpentokSdk from "../provider/use-opentok-sdk";
import { useParams } from "next/navigation";
import RemoteVideo from "./components/RemoteVideo";
import Sample from "./components/Sample";
import SESSION_STATUS, { JOIN_REQUEST_STATUS } from "./constants";
import JoinRequests from "./components/join-requests";

const apiKey = "47659661";
const inputSessionId =
  "1_MX40NzY1OTY2MX5-MTcwMDczMDU0NDk1Nn5qV3hTZkdXNW53WXdJMDh0S0NLM3dRQWx-fn4";
const u1Token =
  "T1==cGFydG5lcl9pZD00NzY1OTY2MSZzaWc9MjhlZjU4ZTI3M2IzZTA4MDIxYzllYTU4OWM1M2JmOWFjMGQwMWM4NDpzZXNzaW9uX2lkPTFfTVg0ME56WTFPVFkyTVg1LU1UY3dNRGN6TURVME5EazFObjVxVjNoVFprZFhOVzUzV1hkSk1EaDBTME5MTTNkUlFXeC1mbjQmY3JlYXRlX3RpbWU9MTcwMTIyNjUwNyZub25jZT0wLjE0MTgxNzYxNTY5MzcyODk3JnJvbGU9cHVibGlzaGVyJmV4cGlyZV90aW1lPTE3MDM4MTg1MDYmY29ubmVjdGlvbl9kYXRhPSUyMiU3QiU1QyUyMm5hbWUlNUMlMjIlM0ElNUMlMjJTYW5kZWVwJTVDJTIyJTJDJTVDJTIycm9sZSU1QyUyMiUzQSU1QyUyMmhvc3QlNUMlMjIlMkMlNUMlMjJpZCU1QyUyMiUzQTElN0QlMjImaW5pdGlhbF9sYXlvdXRfY2xhc3NfbGlzdD0=";
const u2Token =
  "T1==cGFydG5lcl9pZD00NzY1OTY2MSZzaWc9MzgxOWJkNTBiOTQwNTMyMTI4OGRhZmJkMGE4Y2JlMTZhODFhODEzMDpzZXNzaW9uX2lkPTFfTVg0ME56WTFPVFkyTVg1LU1UY3dNRGN6TURVME5EazFObjVxVjNoVFprZFhOVzUzV1hkSk1EaDBTME5MTTNkUlFXeC1mbjQmY3JlYXRlX3RpbWU9MTcwMTIyNjY2NyZub25jZT0wLjcyOTg5MjA3NTAzNDkyMjcmcm9sZT1wdWJsaXNoZXImZXhwaXJlX3RpbWU9MTcwMzgxODY2NyZjb25uZWN0aW9uX2RhdGE9JTIyJTdCJTVDJTIybmFtZSU1QyUyMiUzQSU1QyUyMkphZ2FkaGlzc2glNUMlMjIlMkMlNUMlMjJyb2xlJTVDJTIyJTNBJTVDJTIycGFydGljaXBhbnQlNUMlMjIlMkMlNUMlMjJpZCU1QyUyMiUzQTIlN0QlMjImaW5pdGlhbF9sYXlvdXRfY2xhc3NfbGlzdD0=";
const proctorToken =
  "T1==cGFydG5lcl9pZD00NzY1OTY2MSZzaWc9OWNjNzNjY2FlNjM5YTAyZjcyYjNiYmQyZTE5ODk2YmU3ZGUwY2JmNzpzZXNzaW9uX2lkPTFfTVg0ME56WTFPVFkyTVg1LU1UY3dNRGN6TURVME5EazFObjVxVjNoVFprZFhOVzUzV1hkSk1EaDBTME5MTTNkUlFXeC1mbjQmY3JlYXRlX3RpbWU9MTcwMTgyMzU4OSZub25jZT0wLjUxODIzMDM0NzQyNzU3Mjcmcm9sZT1zdWJzY3JpYmVyJmV4cGlyZV90aW1lPTE3MDQ0MTU1ODcmY29ubmVjdGlvbl9kYXRhPSUyMiU3QiU1QyUyMm5hbWUlNUMlMjIlM0ElNUMlMjJKYWxhZ2FtJTIwa2FseWFuJTVDJTIyJTJDJTVDJTIycm9sZSU1QyUyMiUzQSU1QyUyMnByb2N0b3IlNUMlMjIlMkMlNUMlMjJpZCU1QyUyMiUzQTMlN0QlMjImaW5pdGlhbF9sYXlvdXRfY2xhc3NfbGlzdD0=";
const Room = () => {
  const {
    opentok,
    streams,
    status,
    session,
    sampleClass,
    muted,
    handleCaptureSnapshot,
    snapshot,
    clearCaptureSnapshot,
    isHost,
    shouldShowPermissionRequestStrip,
    publisher,
    isParticipant,
    sendJoinRequestToHost,
    joinRequestStatus,
    requests,
    isHostJoined,
    someOneSharedScreen,
  } = useOpentokSdk();
  const [state, setState] = useState(opentok.session);
  const params = useParams();

  useEffect(() => {
    if (status === SESSION_STATUS.Idle)
      opentok
        .connect(
          apiKey,
          inputSessionId,
          params.room === "1" ? u1Token : u2Token
        )
        .then((res) => {});
    //
  }, [params, status]);
  //
  useEffect(() => {
    if (status === SESSION_STATUS.CONNECTED && isHost) {
      opentok.publish();
    }
  }, [status, isHost]);

  const handleClick = () => {};

  useEffect(() => {
    //stream hooks
    //create new hook

    console.log(session);
  }, [session]);

  const remoteVideos = useMemo(() => [...streams.values()]);
  return (
    <div className="">
      {status === SESSION_STATUS.CONNECTED ? (
        <>
          <div className="">
            {snapshot && (
              <div className=" h-32 w-32">
                <fieldset className=" border border-slate-500 p-2">
                  <legend className=" font-medium text-green-800 text-xs">
                    Publisher image
                  </legend>
                  <img
                    src={snapshot}
                    alt="Snapshot"
                    className=" max-w-full h-auto object-contain"
                  />
                </fieldset>
              </div>
            )}
          </div>
          <section className="w-full flex flex-row flex-wrap">
            {shouldShowPermissionRequestStrip ? (
              joinRequestStatus === JOIN_REQUEST_STATUS.Idle ? (
                <div className="flex flex-row shadow-sm border rounded-sm items-center h-20 w-full justify-between">
                  {isHostJoined ? (
                    <>
                      <h1>Ask to join</h1>
                      <button
                        onClick={sendJoinRequestToHost}
                        className=" bg-blue-600 text-white text-base rounded-lg px-4 py-2 "
                      >
                        Request
                      </button>
                    </>
                  ) : (
                    <h1>Waiting for host to join</h1>
                  )}
                </div>
              ) : (
                <div className="flex flex-row shadow-sm border rounded-sm items-center h-20 w-full justify-between">
                  <h1>Request sent to host waiting for response</h1>
                </div>
              )
            ) : (
              (!isParticipant ||
                (isParticipant &&
                  joinRequestStatus === JOIN_REQUEST_STATUS.Granted)) && (
                <>
                  <section id="remote-videos">
                    <div id="camera" className="w-60 h-60"></div>
                  </section>
                  {[...streams]?.map(([key, mainStream], idx) =>
                    mainStream?.me ? null : (
                      <RemoteVideo id={key} stream={mainStream} key={idx} />
                    )
                  )}
                  <div className=" w-60 h-60 overflow-hidden">
                    <div
                      id="screen"
                      className={` ${publisher?.screen ? "w-60 h-60" : ""} ${
                        !publisher?.screen && "hidden"
                      } `}
                    ></div>
                  </div>
                </>
              )
            )}
          </section>

          <div className=" flex gap-2 mb-3 mt-3">
            {!isParticipant && <JoinRequests />}
            <button
              onClick={snapshot ? clearCaptureSnapshot : handleCaptureSnapshot}
              className=" bg-teal-700 text-white text-sm shadow-lg font-medium px-4 py-2 rounded-xl"
            >
              {snapshot ? "Clear snap" : "Capture snapshot"}
            </button>
            <button
              onClick={opentok.toggleAudioMute}
              className=" bg-teal-700 text-white text-sm shadow-lg font-medium px-4 py-2 rounded-xl"
            >
              {muted.audio ? "Un mute Audio" : "Mute Audio"}
            </button>
            <button
              onClick={opentok.toggleVideoMute}
              className=" bg-teal-700 text-white text-sm shadow-lg font-medium px-4 py-2 rounded-xl"
            >
              {muted.audio ? "Un mute video" : "Mute Video"}
            </button>
            <button
              onClick={opentok.disconnect}
              className=" bg-teal-700 text-white text-sm shadow-lg font-medium px-4 py-2 rounded-xl"
            >
              Disconnect
            </button>
            {/* <button
              onClick={opentok.unpublish}
              className=" bg-red-700 text-white text-sm shadow-lg font-medium px-4 py-2 rounded-xl"
            >
              Un Publish Camera
            </button> */}
            <button
              onClick={
                someOneSharedScreen
                  ? () => {
                      alert("Someone already sharing their screen");
                    }
                  : opentok.shareScreen
              }
              className=" bg-blue-700 text-white text-sm shadow-lg font-medium px-4 py-2 rounded-xl"
            >
              {publisher?.screen ? "Stop sharing" : "Screen Share"}
            </button>
          </div>
        </>
      ) : status === SESSION_STATUS.Idle ? (
        <h1>Session connecting</h1>
      ) : status === SESSION_STATUS.Failed ? (
        <h1>Session connection failed</h1>
      ) : (
        status === SESSION_STATUS.Disconnected && (
          <section className=" flex flex-col  items-center justify-center">
            <h1>Disconnected from session</h1>
            <mark>Press F5 on your keyboard to reconnect</mark>
          </section>
        )
      )}
    </div>
  );
};

export default Room;
