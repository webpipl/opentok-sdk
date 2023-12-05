"use client";
import dynamic from "next/dynamic";

const ComponentC = dynamic(() => import("./provider/opentok-sdk-provider"), {
  ssr: false,
});

const RoomLayout = ({ children }) => <ComponentC>{children}</ComponentC>;

export default RoomLayout;
