import { cards } from './inputOutputDataFormator';
import { seatsInterface } from './signup';

export interface discardedCardsObjInterface {
  userId: string;
  card: string;
  seatIndex: number;
}

export interface defaultTableGamePlayInterface {
  _id: string;
  movedCard: Array<string>;
  extraCard: Array<string>;
  turnCard: Array<string>;
  seats : Array<seatsInterface>;
  cardColor : string;
  cardNumber: string;
  cardTurnCircle: string;
  cardDrawCounter: number;
  currentTurnUserId : string;
  currentPlayerInTable : number;
  tableStatus : string;
  DCSend : boolean;
  currentTurnSeatIndex: number;
  paneltyID : string;
  oldPaneltyID : string;
  paneltyTurn : number;
  createdAt:string;
  updatedAt:string;
}    

export interface DefaultBaseTable {
  tableState: string;
  seats: Array<seatsInterface>;
}

export interface GTIResponse {
  isSeconderyTimer : boolean;
  isRemainSeconderyTurns : boolean;
  tableId: string;
  userId : string;
  seatIndex: number;
  name : string;
  userState : string;
  pp : string;
  pts : number;
  cardCount : number;
  cards : Array<cards>;
  bv: number;
  chips : string;
  tableState: string;
  totalPlayers: number;
  time: number;
  currentTurnUserId :string;
  currentTurnSeatIndex: number;
  DLR: number;
  playersDetail: Array<seatsInterface>;
  reconnect?: boolean;
  totalUserTurnTimer : number;
  totalUserSeconderyTimer : number;
  trumpCard: Array<string>;
  closedDeck: Array<string>;
  opendDeck: Array<string>;
  finishDeck: Array<string>;
  declareStatus : string;
  validDeclaredPlayer : string;
  validDeclaredPlayerSI : number;
  declareingPlayersSI : Array<number>;

}
