"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "../../../components/Header";
import { getPlayerGames, deleteGame, getPlayers, Player, Game, isAdmin } from "../../../lib/api";
import { useParams } from "next/navigation";

export default function PlayerHistory() {
  const params = useParams();
  const playerName = decodeURIComponent(params.name as string);
  const [playerHandicap, setPlayerHandicap] = useState<number | null>(null);
  const [playerGames, setPlayerGames] = useState<Game[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUserAdmin, setIsUserAdmin] = useState(false);

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
    const adminStatus = await isAdmin();
    setIsUserAdmin(adminStatus);
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
          <span className="block md:inline">{playerName}({playerHandicap})의 경기 이력</span>
          <span className="block md:inline">(승점 {totalScore}점)</span>
        </h1>

        <section id="game-history-section" className="bg-white md:p-6 rounded-lg shadow-md">
          {/* 데스크톱용 헤더 (모바일에서는 숨김) */}
          <div className={`hidden md:grid ${isUserAdmin ? 'md:grid-cols-7' : 'md:grid-cols-6'} gap-4 py-2 px-4 border-b font-bold text-center`}>
            <div>날짜시간</div>
            <div>상대(핸디)</div>
            <div>승패</div>
            <div>내역</div>
            <div>보너스</div>
            <div>승점</div>
            {isUserAdmin && <div>삭제</div>}
          </div>

          {/* 모바일용 헤더 (데스크톱에서는 숨김) */}
          <div className="md:hidden border-b py-2 px-4 font-bold text-center">
            <div className="grid grid-cols-4 gap-4">
              <div>날짜시간</div>
              <div>상대(핸디)</div>
              <div>승패</div>
              <div>내역</div>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-2">
              <div></div> {/* 빈 공간 */}
              <div>보너스</div>
              <div>승점</div>
              {isUserAdmin && <div>삭제</div>}
            </div>
          </div>

          {playerGames.length > 0 ? (
            playerGames.map((game) => {
              const opponentName = game.winner_name === playerName ? game.loser_name : game.winner_name;
              const winLoss = game.winner_name === playerName ? "승" : "패";
              const bonus = winLoss === "승" ? game.bonus : 0;
              const gameScore = (winLoss === "승" ? 3 : 1) + bonus;

              const opponentPlayer = allPlayers.find((p: Player) => p.player_name === opponentName);
              const opponentHandicap = opponentPlayer ? opponentPlayer.handicap : "N/A";

              return (
                <div key={game.id} className={`border-b py-4 flex flex-col md:grid ${isUserAdmin ? 'md:grid-cols-7' : 'md:grid-cols-6'} md:gap-4 text-center`}>
                  {/* 첫 번째 줄 */}
                  <div className="grid grid-cols-4 gap-4 md:contents">
                    <div className="bg-gray-100">{new Date(game.played_at).toLocaleString()}</div>
                    <div>{opponentName}({opponentHandicap})</div>
                    <div className={`${winLoss === '승' ? 'font-bold text-red-500' : ''}`}>
                      {winLoss}
                    </div>
                    <div>{game.score}</div>
                  </div>
                  {/* 두 번째 줄 */}
                  <div className="grid grid-cols-4 gap-4 md:contents mt-2 md:mt-0">
                    <div className="md:hidden"></div> {/* 빈 공간 */}
                    <div className={`${bonus === 1 ? 'font-bold text-red-500' : ''}`}>
                      {bonus}
                    </div>
                    <div>{gameScore}</div>
                    {isUserAdmin && (
                      <div>
                        <button
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                          onClick={() => handleDeleteGame(game.id)}
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-gray-500">
              경기 이력이 없습니다.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
