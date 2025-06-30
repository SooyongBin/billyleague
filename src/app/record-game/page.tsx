"use client";

import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { recordGame, Player, getPlayersNotFinishedAllGames, getNonOpponents } from "../../lib/api"; // Player 인터페이스 임포트

export default function RecordGame() {
  const [players, setPlayers] = useState<Player[]>([]); // Player[] 타입 사용
  const [winnerName, setWinnerName] = useState("");
  const [loserName, setLoserName] = useState("");
  const [score, setScore] = useState("");
  const [loading, setLoading] = useState(true);
  const [nonOpponentPlayers, setNonOpponentPlayers] = useState<Player[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const fetchedPlayers = await getPlayersNotFinishedAllGames();
      setPlayers(fetchedPlayers);
      setNonOpponentPlayers(fetchedPlayers); // 초기에는 모든 플레이어를 패배 선수 후보로 설정
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function updateLoserOptions() {
      if (winnerName) {
        const nonOpponents = await getNonOpponents(winnerName);
        setNonOpponentPlayers(nonOpponents);
        // 승리 선수가 변경되면 패배 선수 선택을 초기화
        setLoserName(""); 
      } else {
        // 승리 선수가 선택되지 않으면 모든 플레이어를 패배 선수 후보로 설정
        setNonOpponentPlayers([]); // 승리 선수 미선택 시 패배 선수 목록 비움
      }
    }
    updateLoserOptions();
  }, [winnerName, players]);

  const handleRecordGame = async () => {
    if (!winnerName || !loserName || !score) {
      alert("승리 선수, 패배 선수, 내역을 모두 입력해주세요.");
      return;
    }
    if (winnerName === loserName) {
      alert("승리 선수와 패배 선수는 같을 수 없습니다.");
      return;
    }

    const winner = players.find(p => p.player_name === winnerName);
    const loser = players.find(p => p.player_name === loserName);

    let bonus = 0;
    if (winner && loser && loser.handicap - winner.handicap >= 3) {
      bonus = 1;
    }

    await recordGame(winnerName, loserName, score, bonus);
    alert("게임 결과가 등록되었습니다.");
    setWinnerName("");
    setLoserName("");
    setScore("");
  };

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
        <h1 className="text-3xl font-bold text-center my-6">게임 결과 등록</h1>

        <section className="bg-white p-6 rounded-lg shadow-md">
          
          <div className="space-y-4">
            <div>
              <label htmlFor="winnerSelect" className="block text-gray-700 text-sm font-bold mb-2">
                승리 선수 선택:
              </label>
              <select
                id="winnerSelect"
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={winnerName}
                onChange={(e) => setWinnerName(e.target.value)}
              >
                <option value="">선택하세요</option>
                {players.map((player) => (
                  <option key={player.player_name} value={player.player_name}>
                    {player.player_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="loserSelect" className="block text-gray-700 text-sm font-bold mb-2">
                패배 선수 선택:
              </label>
              <select
                id="loserSelect"
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={loserName}
                onChange={(e) => setLoserName(e.target.value)}
                disabled={!winnerName}
              >
                <option value="">선택하세요</option>
                {nonOpponentPlayers.map((player) => (
                  <option key={player.player_name} value={player.player_name}>
                    {player.player_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="scoreInput" className="block text-gray-700 text-sm font-bold mb-2">
                내역:
              </label>
              <input
                type="text"
                id="scoreInput"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="내역을 입력하세요. 예) 10대8"
                value={score}
                onChange={(e) => setScore(e.target.value)}
              />
            </div>
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleRecordGame}
            >
              등록
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}