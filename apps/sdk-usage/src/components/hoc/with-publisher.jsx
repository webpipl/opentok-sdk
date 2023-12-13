import { useEffect, useRef, useState } from "react";
import { PublishManager } from "remote-meet-sdk";

const withPublisher = (Component) => {
  return (props) => {
    const [opentok, setOpentok] = useState(null);
    const opentokRef = useRef(null);
    useEffect(() => {
      if (opentok === null) {
        let instance = new PublishManager();
        setOpentok(instance);
        opentokRef.current = instance;
      }
    }, []);
    useEffect(() => {
      return () => {
        console.log("opentokRef.current:0", opentokRef.current);
        if (opentokRef.current) {
          opentokRef.current.destroy();
          // opentokRef.current?.disconnect();
        }
      };
    }, []);
    if (!opentok) return;
    return <Component children={props.children} opentok={opentok} />;
  };
};

export default withPublisher;
