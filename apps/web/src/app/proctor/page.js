"use client";
import { useEffect } from "react";
import useOpentokSDK from "./provider/use-opentok-sdk";
import SESSION_STATUS from "../rooms/[room]/constants";
import RemoteVideo from "./component/RemoteVideo";

const apiKey = "47659661";
const inputSessionId =
  "1_MX40NzY1OTY2MX5-MTcwMDczMDU0NDk1Nn5qV3hTZkdXNW53WXdJMDh0S0NLM3dRQWx-fn4";
const proctorToken =
  "T1==cGFydG5lcl9pZD00NzY1OTY2MSZzaWc9OWNjNzNjY2FlNjM5YTAyZjcyYjNiYmQyZTE5ODk2YmU3ZGUwY2JmNzpzZXNzaW9uX2lkPTFfTVg0ME56WTFPVFkyTVg1LU1UY3dNRGN6TURVME5EazFObjVxVjNoVFprZFhOVzUzV1hkSk1EaDBTME5MTTNkUlFXeC1mbjQmY3JlYXRlX3RpbWU9MTcwMTgyMzU4OSZub25jZT0wLjUxODIzMDM0NzQyNzU3Mjcmcm9sZT1zdWJzY3JpYmVyJmV4cGlyZV90aW1lPTE3MDQ0MTU1ODcmY29ubmVjdGlvbl9kYXRhPSUyMiU3QiU1QyUyMm5hbWUlNUMlMjIlM0ElNUMlMjJKYWxhZ2FtJTIwa2FseWFuJTVDJTIyJTJDJTVDJTIycm9sZSU1QyUyMiUzQSU1QyUyMnByb2N0b3IlNUMlMjIlMkMlNUMlMjJpZCU1QyUyMiUzQTMlN0QlMjImaW5pdGlhbF9sYXlvdXRfY2xhc3NfbGlzdD0=";
const Page = () => {
  const { opentok, streams, status, session } = useOpentokSDK();

  useEffect(() => {
    console.log("opentook:", status);
  }, [status]);
  useEffect(() => {
    if (status === SESSION_STATUS.Idle || !status) {
      // console.log("Opentok:", status);
      opentok
        .connect(apiKey, inputSessionId, proctorToken)
        .then((res) => {})
        .catch((err) => {
          console.log("Opentok Error:", err);
        });
    }
  }, [status]);

  useEffect(() => {
    console.log("status: ", status);
  }, [session, status]);
  return (
    <div className=" bg-slate-100 h-screen w-full py-2">
      <div className=" h-[98vh] rounded-lg bg-white w-10/12 mx-auto py-2 px-4">
        <h1 className=" text-2xl font-medium text-slate-800 mb-2">
          You can watch active session
        </h1>
        {status === SESSION_STATUS.Idle ||
        status === SESSION_STATUS.Connecting ||
        status === SESSION_STATUS.ReConnecting ? (
          <section className=" flex flex-col  items-center justify-center">
            <h1>Connecting to opentok session</h1>
            <mark>connecting...</mark>
          </section>
        ) : status === SESSION_STATUS.Connected ? (
          <section className=" grid grid-cols-3 gap-2">
            {streams?.size < 1 ? (
              <h1 className=" text-red-600 font-bold text-2xl">
                No one joined on meeting
              </h1>
            ) : (
              [...streams]?.map(([key, mainStream], idx) => (
                <RemoteVideo id={key} stream={mainStream} key={idx} />
              ))
            )}
          </section>
        ) : status === SESSION_STATUS.Failed ? (
          <section className=" flex flex-col  items-center justify-center">
            <h1>Failed to connect</h1>
            <mark>Unable to connecting to session </mark>
          </section>
        ) : (
          <section className=" flex flex-col  items-center justify-center">
            <h1>Disconnected from session</h1>
            <mark>Press F5 on your keyboard to reconnect</mark>
          </section>
        )}
      </div>
    </div>
  );
};
export default Page;
