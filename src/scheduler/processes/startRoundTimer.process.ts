import commonEventEmitter from '../../commonEventEmitter';
import Logger from "../../logger"
import { WAITING_FOR_PLAYER_TIMER_EXPIRED } from '../../constants/eventEmitter';

export async function startRoundTimerProcess(job: any){
  try {
    commonEventEmitter.emit(WAITING_FOR_PLAYER_TIMER_EXPIRED, job.data);
    return job.data;
    
  } catch (err: any) {
    Logger.error(err);
    return undefined;
  }
};

// export = startRoundTimerProcess;
