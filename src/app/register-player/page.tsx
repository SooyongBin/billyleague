"use client";

import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { getPlayers, addPlayer, deletePlayer, Player, PlayerWithGameHistory } from "../../lib/api";
import { supabase } from "../../lib/supabase"; // supabase 임포트 추가

export default function RegisterPlayer() {
  const [playerName, setPlayerName] = useState("");
  const [handicap, setHandicap] = useState<number | "">("");
  const [players, setPlayers] = useState<PlayerWithGameHistory[]>([]); // PlayerWithGameHistory[] 타입 사용
  const [loading, setLoading] = useState(true);

  const fetchPlayers = async () => {
    setLoading(true);
    const fetchedPlayers = await getPlayers();
    const playersWithGameHistory = await Promise.all(
      fetchedPlayers.map(async (player: Player) => {
        const { data: games, error: gameError } = await supabase.from("game").select("id").or(`winner_name.eq.${player.player_name},loser_name.eq.${player.player_name}`);
        if (gameError) {
          console.error("Error checking game history:", gameError);
        }
        return { ...player, hasGameHistory: !!(games && games.length > 0) }; // Explicitly cast to boolean
      })
    );
    setPlayers(playersWithGameHistory);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const handleSave = async () => {
    if (!playerName || handicap === "") {
      alert("선수 이름과 핸디캡을 입력해주세요.");
      return;
    }
    await addPlayer(playerName, Number(handicap));
    setPlayerName("");
    setHandicap("");
    fetchPlayers();
  };

  const handleDelete = async (name: string) => {
    if (confirm(`${name} 선수를 삭제하시겠습니까?`)) {
      await deletePlayer(name);
      fetchPlayers();
    }
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
        <h1 className="text-3xl font-bold text-center my-6">선수 핸디 등록</h1>

        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          
          <div className="space-y-4">
            <div>
              <label htmlFor="playerName" className="block text-gray-700 text-sm font-bold mb-2">
                선수 이름:
              </label>
              <input
                type="text"
                id="playerName"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="선수 이름을 입력하세요"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="handicap" className="block text-gray-700 text-sm font-bold mb-2">
                핸디캡:
              </label>
              <input
                type="number"
                id="handicap"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="핸디캡을 입력하세요"
                value={handicap}
                onChange={(e) => setHandicap(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleSave}
            >
              저장
            </button>
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">등록된 선수 목록 ({players.length}명)</h2>
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">이름</th>
                <th className="py-2 px-4 border-b">핸디</th>
                <th className="py-2 px-4 border-b">삭제</th>
              </tr>
            </thead>
            <tbody>
              {players.length > 0 ? (
                players.map((player) => (
                  <tr key={player.player_name}>
                    <td className="py-2 px-4 border-b text-center">{player.player_name}</td>
                    <td className="py-2 px-4 border-b text-center">{player.handicap}</td>
                    <td className="py-2 px-4 border-b text-center">
                      <button
                        className={`bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm ${player.hasGameHistory ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => handleDelete(player.player_name)}
                        disabled={player.hasGameHistory}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-gray-500">
                    등록된 선수가 없습니다.
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
