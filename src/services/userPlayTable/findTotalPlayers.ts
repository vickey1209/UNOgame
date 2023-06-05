import { seatsInterface } from '../../interfaces/signup';
import { defaultTableGamePlayInterface } from '../../interfaces/tableGamePlay';
import Logger from "../../logger"
import { playerGamePlayCache, tableConfigCache, tableGamePlayCache, userProfileCache } from '../../cache';

const findTotalPlayersCount = async (
  tableGamePlay: defaultTableGamePlayInterface,
  tableId: string,
): Promise<number> => {
  try {
    const filteredSeats = tableGamePlay.seats.filter(
      (seat: seatsInterface) => seat.userId
    );

    const playerInfoPromise = filteredSeats.map((seat: seatsInterface) =>
      userProfileCache.getUserProfile(seat.userId)
    );

    const totalPlayers = await Promise.all(playerInfoPromise);
    const totalPlayersCount = totalPlayers.length;

    return totalPlayersCount;
  } catch (error: any) {
    Logger.error(tableId,error, 'function findTotalPlayersCount');
    throw new Error(error);
  }
};

export = findTotalPlayersCount;
