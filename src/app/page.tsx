"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header";
import Link from "next/link";
import { getPlayers, getAllGames } from "../lib/api";

interface Player {
  player_name: string;
  handicap: number;
}

interface Game {
  id: string;
  winner_name: string;
  loser_name: string;
  score: string;
  played_at: string;
  bonus: number;
}

interface PlayerStat extends Player {
  wins: number;
  losses: number;
  totalPlayerGames: number;
  playerProgressRate: string | number;
  totalScore: number;
  bonus: number;
  rank?: number;
}

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const fetchedPlayers = await getPlayers();
      setPlayers(fetchedPlayers);

      const fetchedGames = await getAllGames();
      setGames(fetchedGames);
      setLoading(false);
    }
    fetchData();
  }, []);

  // 현황판 데이터 계산
  const totalPlayers = players.length;
  const totalGamesPlayed = games.length;
  // 총 경기수 계산 (풀리그 기준: n * (n-1) / 2)
  const totalPossibleGames = totalPlayers * (totalPlayers - 1) / 2;
  const progressRate = totalPossibleGames > 0 ? Math.round(totalGamesPlayed / totalPossibleGames * 100) : 0;

  // 순위 리스트 데이터 계산
  const playerStats: PlayerStat[] = players.map(player => {
    let wins = 0;
    let losses = 0;
    let totalPlayerGames = 0;
    let totalScore = 0;
    let bonus = 0;

    games.forEach(game => {
      if (game.winner_name === player.player_name) {
        wins++;
        totalPlayerGames++;
        totalScore += 3; // 승리 시 3점
        totalScore += game.bonus; // 보너스 점수 추가
        bonus += game.bonus;
      } else if (game.loser_name === player.player_name) {
        losses++;
        totalPlayerGames++;
        totalScore += 1; // 패배 시 1점
      }
    });

    const playerProgressRate = totalPlayerGames > 0 ? Math.floor(totalPlayerGames / (totalPlayers - 1) * 100) : 0; // 한 선수가 풀리그일때 전체 게임수 = 총 참가인원 - 1

    return {
      ...player,
      wins,
      losses,
      totalPlayerGames,
      playerProgressRate,
      totalScore,
      bonus,
    };
  });

  // 승점 기준으로 내림차순 정렬
  playerStats.sort((a, b) => b.totalScore - a.totalScore);

  // 순위 부여 (동점 처리)
  let rank = 1;
  for (let i = 0; i < playerStats.length; i++) {
    if (i > 0 && playerStats[i].totalScore < playerStats[i - 1].totalScore) {
      rank = i + 1;
    }
    playerStats[i].rank = rank;
  }

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
        <h1 className="text-3xl font-bold text-center my-6">제1회 세븐당구클럽 리그전</h1>

        

        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-gray-600">참가 인원</p>
              <p className="text-3xl font-bold">{totalPlayers}명</p>
            </div>
            <div>
              <p className="text-gray-600">경기 수</p>
              <p className="text-3xl font-bold">{totalGamesPlayed}</p>
            </div>
            <div>
              <p className="text-gray-600">총 경기 수</p>
              <p className="text-3xl font-bold">{totalPossibleGames}</p>
            </div>
            <div>
              <p className="text-gray-600">진행률</p>
              <p className="text-3xl font-bold">{progressRate}%</p>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-md">
          
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">순위</th>
                <th className="py-2 px-4 border-b">이름</th>
                <th className="py-2 px-4 border-b">핸디</th>
                <th className="py-2 px-4 border-b">진행률</th>
                <th className="py-2 px-4 border-b">승</th>
                <th className="py-2 px-4 border-b">패</th>
                <th className="py-2 px-4 border-b">보너스</th>
                <th className="py-2 px-4 border-b">승점</th>
              </tr>
            </thead>
            <tbody>
              {playerStats.length > 0 ? (
                playerStats.map((player) => (
                  <tr key={player.player_name}>
                    <td className="py-2 px-4 border-b text-center">{player.rank}</td>
                    <td className="py-2 px-4 border-b">
                      <Link href={`/player/${player.player_name}`} className="text-blue-600 hover:underline">
                        {player.player_name}
                      </Link>
                    </td>
                    <td className="py-2 px-4 border-b text-center">{player.handicap}</td>
                    <td className={`py-2 px-4 border-b text-center ${player.playerProgressRate >= 70 ? 'font-bold text-red-500' : ''}`}>
                      {player.playerProgressRate}%
                    </td>
                    <td className="py-2 px-4 border-b text-center">{player.wins}</td>
                    <td className="py-2 px-4 border-b text-center">{player.losses}</td>
                    <td className="py-2 px-4 border-b text-center">{player.bonus}</td>
                    <td className="py-2 px-4 border-b text-center">{player.totalScore}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">
                    데이터 없음
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
