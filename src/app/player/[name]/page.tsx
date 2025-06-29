"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "../../../components/Header";
import { getPlayerGames, deleteGame, getPlayers, Player, Game } from "../../../lib/api";
import { useParams } from "next/navigation";

export default function PlayerHistory() {
  const params = useParams();
  const playerName = decodeURIComponent(params.name as string);
  const [playerHandicap, setPlayerHandicap] = useState<number | null>(null);
  const [playerGames, setPlayerGames] = useState<Game[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlayerDetails = useCallback(async () => {
    setLoading(true);
    const players = await getPlayers();
    setAllPlayers(players);
    const currentPlayer = players.find((p: Player) => p.player_name === playerName);
    if (currentPlayer) {
      setPlayerHandicap(currentPlayer.handicap);
    }

    const games = await getPlayerGames(playerName);
    // 날짜시간 기준으로 정렬
    games.sort((a, b) => new Date(a.played_at).getTime() - new Date(b.played_at).getTime());
    setPlayerGames(games);
    setLoading(false);
  }, [playerName]);

  useEffect(() => {
    fetchPlayerDetails();
  }, [fetchPlayerDetails]);

  const handleDeleteGame = async (gameId: string) => {
    if (confirm("정말로 이 게임 기록을 삭제하시겠습니까?")) {
      await deleteGame(gameId);
      fetchPlayerDetails(); // 데이터 새로고침
    }
  };

  // 승점 계산
  let totalScore = 0;
  playerGames.forEach((game) => {
    if (game.winner_name === playerName) {
      totalScore += 3; // 승리 시 3점
      totalScore += game.bonus; // 보너스 점수 추가
    } else if (game.loser_name === playerName) {
      totalScore += 1; // 패배 시 1점
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl font-semibold">데이터 로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center my-6">
          {playerName}({playerHandicap})의 경기 이력(승점 {totalScore}점)
        </h1>

        <section className="bg-white p-6 rounded-lg shadow-md">
          
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">날짜시간</th>
                <th className="py-2 px-4 border-b">상대</th>
                <th className="py-2 px-4 border-b">핸디</th>
                <th className="py-2 px-4 border-b">승패</th>
                <th className="py-2 px-4 border-b">내역</th>
                <th className="py-2 px-4 border-b">보너스</th>
                <th className="py-2 px-4 border-b">승점</th>
                <th className="py-2 px-4 border-b">삭제</th>
              </tr>
            </thead>
            <tbody>
              {playerGames.length > 0 ? (
                playerGames.map((game) => {
                  const opponentName = game.winner_name === playerName ? game.loser_name : game.winner_name;
                  const winLoss = game.winner_name === playerName ? "승" : "패";
                  const bonus = winLoss === "승" ? game.bonus : 0;
                  const gameScore = (winLoss === "승" ? 3 : 1) + bonus;

                  // 상대방 핸디캡 찾기
                  const opponentPlayer = allPlayers.find((p: Player) => p.player_name === opponentName);
                  const opponentHandicap = opponentPlayer ? opponentPlayer.handicap : "N/A";

                  return (
                    <tr key={game.id}>
                      <td className="py-2 px-4 border-b text-center">{new Date(game.played_at).toLocaleString()}</td>
                      <td className="py-2 px-4 border-b text-center">{opponentName}</td>
                      <td className="py-2 px-4 border-b text-center">{opponentHandicap}</td>
                      <td className={`py-2 px-4 border-b text-center ${winLoss === '승' ? 'font-bold text-red-500' : ''}`}>
                        {winLoss}
                      </td>
                      <td className="py-2 px-4 border-b text-center">{game.score}</td>
                      <td className={`py-2 px-4 border-b text-center ${bonus === 1 ? 'font-bold text-red-500' : ''}`}>
                        {bonus}
                      </td>
                      <td className="py-2 px-4 border-b text-center">{gameScore}</td>
                      <td className="py-2 px-4 border-b text-center">
                        <button
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                          onClick={() => handleDeleteGame(game.id)}
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">
                    경기 이력이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
