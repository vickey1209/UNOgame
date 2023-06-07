import { defaultTableGamePlayInterface } from '../interfaces/tableGamePlay';
import { defaultTableConfig } from '../interfaces/tableConfig';

export interface defaulPlayerGamePlayInterface {
  _id: string;
  userName :string,
  profilePic :string,
  seatIndex : number,
  isBot : boolean,
  userId : string,
  timeOutCounter : number,
  ScriptUser : boolean,
  points : number,
  userStatus : string,
  isUnoClick : boolean,
  card: Array<string>,
  createdAt: string;
  updatedAt: string;
}



export interface pairDataInterface {
  pure: Array<Array<string>>;
  impure: Array<Array<string>>;
  set: Array<Array<string>>;
  dwd: Array<Array<string>>;
}


export interface InsertPlayerInTableInterface {
  tableGamePlay: defaultTableGamePlayInterface;
  playerGamePlay: defaulPlayerGamePlayInterface;
  tableConfig: defaultTableConfig;
}

export interface seatPlayerInterface {
  si: number;
  points: number;
  name: string;
  pp: string;
  state: string;
  UserId: string;
}

