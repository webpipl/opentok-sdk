import SessionManager from "./SessionManager";
import { CustomSignalEvent } from "./IOpentokActionsListener";
import { SignalPermission } from "./enums/connection-status";
import OT from "@opentok/client";
import { ASK_TO_JOIN, REPOND_TO_JOIN_REQUEST } from "./constants/signals";
class SignalManager {
  private sessionManager: SessionManager;
  constructor(sessionManager: SessionManager) {
    this.sessionManager = sessionManager;
  }

  public get isIamHost() {
    if (this.sessionManager) {
      return this.sessionManager.session?.data?.role === "host";
    }
    return false;
  }

  private getSession = () => this.sessionManager.session;

  /**
   * @param type SIGNAL TYPE
   * @param to To which connection u want to send signal
   * @param data data you want to send
   * @param onSent callback
   */
  sendSignal = (
    type: string,
    to: OT.Connection,
    data: any,
    onSent?: (data?: any) => void
  ) => {
    let signal = {
      data,
      ...(type && { type }),
      ...(to && { to }),
    };

    this.getSession()?.signal(signal, (error) => {
      if (error) {
        onSent?.(error.message);
        throw new Error(" sendSignal error: " + error.message);
      } else if (typeof onSent === "function") {
        onSent?.();
      }
    });
  };

  registerSignals = () => {
    this.getSession()?.on(
      `signal:${ASK_TO_JOIN}` as "signal",
      (event: CustomSignalEvent) => {
        console.log("listen the signal", event);
        const signalType = event;
        this.sessionManager.addJoinRequest(signalType);
      }
    );
    // Listens for the host's response to the participant
    this.getSession()?.on(
      `signal:${REPOND_TO_JOIN_REQUEST}` as "signal",
      (event: CustomSignalEvent) => {
        this.sessionManager.callbacks.participantsReceiveResponseFromHostCallback?.(
          event
        );
      }
    );
  };

  // Host processes and replies to participant's join request
  onRespondToJoinRequest = (
    permission: string,
    data: any
  ): Promise<CustomSignalEvent | undefined> => {
    return new Promise((resolve, reject) => {
      this.sendSignal(
        REPOND_TO_JOIN_REQUEST,
        data.from,
        permission,
        (error?: OT.OTError | undefined) => {
          if (error) {
            resolve(undefined);
            console.log("unable to send request");
            return;
          }

          console.log("respond:", data);

          if (permission === SignalPermission.Granted) {
            this.sessionManager.removeJoinRequest(data.from.connectionId);
            // this.joinRequests.delete(data.from.connectionId);
          }
          resolve(data);
        }
      );
    });
  };

  private getPeerConnection = () => {
    return this.sessionManager.peerConnection;
  };

  // Participant initiates a join request to the host.
  sendRequestToHost = (): Promise<boolean> => {
    const host = this.getPeerConnection()?.getHost;
    if (host) {
      return new Promise((resolve, reject) => {
        this.sendSignal(
          ASK_TO_JOIN,
          host,
          "Jagadhissh",
          (error?: OT.OTError | undefined) => {
            if (error) {
              reject(false);
              console.log("unable to send request");
              return;
            }
            resolve(true);
            console.log("request sent");
          }
        );
      });
    }
    return Promise.reject(false);
  };
}
export default SignalManager;
