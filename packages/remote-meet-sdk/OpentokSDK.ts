"use client";
import SessionManager from "./SessionManager";
import PublishManager, { PublisherType } from "./PublishManager";
import { IJoinRequestType } from "./IOpentokActionsListener";
import ISDKCallbacks from "./types/ISdkCallbackTypes";
import SdkUtilities from "./SdkUtilities";

class OpentokClientSDK extends SdkUtilities {
  capturedSnapshot: string | null | undefined;
  publishManager: PublishManager;
  sessionManager: SessionManager = new SessionManager();
  callbacks: ISDKCallbacks = {};
  constructor() {
    super();
    this.capturedSnapshot = "";
    this.publishManager = new PublishManager(
      this.initialAudioDevice,
      this.initialVideoDevice,
      this.sessionManager
    );
    this.registerClientCallback();
  }

  registerClientCallback = () => {
    this.sessionManager.callbacks = this.callbacks;
    this.publishManager.callbacks = this.callbacks;
  };
  // registerCallback(){}
  connect = async (apiKey: string, sessionId: string, token: string) => {
    try {
      await this.sessionManager.connect(apiKey, sessionId, token);
    } catch (error) {
      this.callbacks.throwError?.(error as OT.OTError);
      console.log("error connecting to session:", error);
    }
  };
  publish = async (type: PublisherType) => {
    try {
      await this.publishManager.publish(type);
    } catch (error) {
      console.log("error publish:", error);
    }
  };
  getPublishedCamera = () => {
    this.publishManager.publisher.camera;
  };
  getPublishedScreen = () => {
    this.publishManager.publisher.screen;
  };
  subscribe = (
    stream: OT.Stream,
    element: HTMLElement,
    properties: OT.SubscriberProperties,
    name: string
  ) => {
    return this.sessionManager.subscribe(stream, element, properties, name);
  };

  disconnect = async () => {
    this.sessionManager.disconnect();
  };

  getSession = () => {
    return this.sessionManager.session;
  };
  getStreams = () => {
    return this.sessionManager.streams;
  };
  getStatus = () => {
    return this.sessionManager.status;
  };
  shareScreen = () => {
    if (!this.publishManager.publisher.screen) {
      this.publishManager.publish("screen");
    } else {
      this.publishManager.unpublish("screen");
    }
  };

  //ask to allow participant to join
  askToJoin = () => this.sessionManager.signalManager.sendRequestToHost();

  //Host responding to participant request
  respondToJoinRequest = (permission: string, data: IJoinRequestType) => {
    return this.sessionManager.signalManager.onRespondToJoinRequest(
      permission,
      data
    );
  };

  toggleAudio = () => {
    this.publishManager.toggleAudioMute();
  };
  toggleVideo = () => {
    this.publishManager.toggleVideoMute();
  };

  captureSnapshot = (): Promise<string | undefined> => {
    const capturedData = this.publishManager.publisher.camera?.getImgData();
    if (capturedData) {
      this.capturedSnapshot = `data:image/png;base64,${capturedData}`;
      return Promise.resolve(this.capturedSnapshot);
    }
    return Promise.resolve(undefined);
  };

  clearCapturedSnapshot = () => {
    this.capturedSnapshot = undefined;
  };
}

export default OpentokClientSDK;
