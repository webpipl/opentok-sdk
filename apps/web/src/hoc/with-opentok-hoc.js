"use client";
import { useEffect, useRef, useState } from "react";
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
export default withOpentokHOC;
