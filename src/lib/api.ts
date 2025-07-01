import { createClient } from "./supabase/client";

const supabase = createClient();

export interface Player {
  player_name: string;
  handicap: number;
}

export interface PlayerWithGameHistory extends Player {
  hasGameHistory: boolean;
}

export interface Game {
  id: string;
  winner_name: string;
  loser_name: string;
  score: string;
  played_at: string;
  bonus: number;
}

// 선수 목록 가져오기
export async function getPlayers(): Promise<Player[]> {
  const { data, error } = await supabase.from("player_handicap").select("*").order("player_name", { ascending: true });
  if (error) {
    console.error("Error fetching players:", error);
    return [];
  }
  return data;
}

// 선수 추가
export async function addPlayer(playerName: string, handicap: number) {
  const { data, error } = await supabase.from("player_handicap").insert([{ player_name: playerName, handicap: handicap }]);
  if (error) {
    console.error("Error adding player:", error);
    alert("선수 추가에 실패했습니다. 이미 존재하는 선수일 수 있습니다.");
    return null;
  }
  return data;
}

// 선수 삭제
export async function deletePlayer(playerName: string): Promise<boolean> {
  const { error } = await supabase.from("player_handicap").delete().eq("player_name", playerName);
  if (error) {
    console.error("Error deleting player:", error);
    return false;
  }
  return true;
}

// 게임 결과 기록
export async function recordGame(winnerName: string, loserName: string, score: string, bonus: number) {
  const { data, error } = await supabase.from("game").insert([
    {
      winner_name: winnerName,
      loser_name: loserName,
      score: score,
      bonus: bonus,
    },
  ]);
  if (error) {
    console.error("Error recording game:", error);
    return null;
  }
  return data;
}

// 특정 선수의 경기 이력 가져오기
export async function getPlayerGames(playerName: string): Promise<Game[]> {
  const { data, error } = await supabase
    .from("game")
    .select("*")
    .or(`winner_name.eq.${playerName},loser_name.eq.${playerName}`)
    .order("played_at", { ascending: false });
  if (error) {
    console.error("Error fetching player games:", error);
    return [];
  }
  return data;
}

// 모든 게임 기록 가져오기
export async function getAllGames(): Promise<Game[]> {
  const { data, error } = await supabase.from("game").select("*");
  if (error) {
    console.error("Error fetching all games:", error);
    return [];
  }
  return data;
}

// 게임 기록 삭제
export async function deleteGame(gameId: string): Promise<boolean> {
  const { error } = await supabase.from("game").delete().eq("id", gameId);
  if (error) {
    console.error("Error deleting game:", error);
    return false;
  }
  return true;
}

// 특정 선수와 게임을 한 적이 있는 선수 목록 조회
export async function getOpponents(playerName: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("game")
    .select("winner_name, loser_name")
    .or(`winner_name.eq.${playerName},loser_name.eq.${playerName}`);

  if (error) {
    console.error("Error fetching opponents:", error);
    return [];
  }

  const opponents = new Set<string>();
  data.forEach((game: { winner_name: string; loser_name: string }) => {
    if (game.winner_name === playerName) {
      opponents.add(game.loser_name);
    } else if (game.loser_name === playerName) {
      opponents.add(game.winner_name);
    }
  });

  return Array.from(opponents);
}

// 특정 선수가 모든 다른 선수와 경기를 완료했는지 확인
export async function hasPlayedAgainstAllOthers(playerName: string): Promise<boolean> {
  const allPlayers = await getPlayers();
  const opponents = await getOpponents(playerName);

  // 자신을 제외한 모든 다른 선수 수
  const otherPlayersCount = allPlayers.length - 1;

  // 경기한 상대방 수가 자신을 제외한 모든 다른 선수 수와 같으면 모든 경기를 완료한 것으로 간주
  return opponents.length === otherPlayersCount;
}

// 경기를 모두 완료하지 않은 선수 목록 조회
export async function getPlayersNotFinishedAllGames(): Promise<Player[]> {
  const allPlayers = await getPlayers();
  const playersNotFinished: Player[] = [];

  for (const player of allPlayers) {
    const finishedAll = await hasPlayedAgainstAllOthers(player.player_name);
    if (!finishedAll) {
      playersNotFinished.push(player);
    }
  }
  return playersNotFinished;
}

// 특정 선수와 게임을 한 적이 없는 선수 목록 조회
export async function getNonOpponents(playerName: string): Promise<Player[]> {
  const allPlayers = await getPlayers();
  const opponents = await getOpponents(playerName);

  const nonOpponents = allPlayers.filter(
    (player) => player.player_name !== playerName && !opponents.includes(player.player_name)
  );

  return nonOpponents;
}

export async function isAdmin(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}