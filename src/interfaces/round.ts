import { cards } from "./inputOutputDataFormator";

export interface countDownInterface {
  time: number;
  tableId : string;
}

export interface setDealerInterface {
  // DLR: number;
  round: number;
  tableId : string;
}

export interface tosscardI {
  userId: string;
  si: number;
  card: string;
  name: string;
}

export interface tossWinnerDataI {
  userId: string;
  si: number;
  card: string;
  name: string;
  msg: string;
}
export interface tossCardInterface {
  tableId: string;
  tossCardArr: Array<tosscardI>,
  tossWinnerData: tossWinnerDataI
}

export interface userCardsInterface {
  cards: Array<cards>;
  closedDeck: Array<string>;
  opendDeck: Array<string>;
  trumpCard: Array<string>;
  tableId :string;
}
export interface formateProvidedCardsIF {
  cards: Array<cards>;
  movedCard: Array<string>;
  extraCard: Array<string>;
  turnCard: Array<string>;
  tableId :string;
}
