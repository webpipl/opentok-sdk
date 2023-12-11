"use client";
import SessionManager from "./SessionManager";
import PublishManager, { PublisherType } from "./PublishManager";
import OpentokBase from "./OpentokBase";
import { IJoinRequestType } from "./IOpentokActionsListener";
import ISDKCallbacks from "./types/ISdkCallbackTypes";

class OpentokClientSDK extends OpentokBase {
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
    } catch (eroror) {}
  };
  publish = (type: PublisherType) => {
    this.publishManager.publish(type);
  };

  disconnect = async () => {
    this.sessionManager.disconnect();
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
