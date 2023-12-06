"use client";
import OpentokSession from "./OpentokSession";
import { ConnectionStatus } from "./enums/connection-status";

class OpentokClientSDK extends OpentokSession {
  capturedSnapshot: string | null | undefined;
  constructor() {
    super();
    this.capturedSnapshot = "";
  }

  connect = async (apiKey: string, sessionId: string, token: string) => {
    if (this.session?.currentState !== "connected") {
      await this.connectToSession(apiKey, sessionId, token);
    }
  };

  disconnect = async () => {
    this.disconnectFromSession();
  };
  handelPublish = (): Promise<OT.Publisher> => {
    return new Promise((resolve, reject) => {
      var publisher = OT.initPublisher(
        "screen-preview",
        { videoSource: "screen", audioSource: false },
        function (error) {
          if (error) {
            // Look at error.message to see what went wrong.
          } else {
            resolve(publisher);
          }
        }
      );
    });
  };

  shareScreen = () => {
    if (!this.isScreenPublished) {
      this.publish("screen");
    } else {
      this.unpublish("screen");
    }
  };

  captureSnapshot = (): Promise<string | undefined> => {
    const capturedData = this.publisher.camera?.getImgData();
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
