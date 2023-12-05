import { useEffect, useRef } from "react";
import useOpentokSDK from "../../provider/use-opentok-sdk";

const RemoteVideo = ({ id, stream }) => {
  const videoRef = useRef(null);
  const { onSubscribe, opentok } = useOpentokSDK();
  const subscriptionRef = useRef();
  const isSubscribingRef = useRef(false);

  useEffect(() => {
    if (!stream) return;
    // if (!isSubscribingRef.current) {
    //   isSubscribingRef.current = true;

    opentok.subscribe(stream, videoRef.current, {}, `${id}-subscriber`);
    // subscriptionRef.current = opentok.current.session.subscribe(
    //   stream,
    //   videoRef.current,
    //   {
    //     name: id + "-Subscriber",
    //     style: { nameDisplayMode: "on" },
    //   }
    // );
    // }
  }, [stream]);

  return (
    <div className="w-60  h-60" ref={videoRef}></div>
    // <div className=" relative w-60 h-60">
    //   {/* <button
    //     className=" absolute  bottom-0 bg-red-800 text-white px-4 py-1 text-sm rounded"
    //     onClick={unsubscribe}
    //   >
    //     UnSubscribe
    //   </button> */}
    // </div>
  );
};

export default RemoteVideo;
