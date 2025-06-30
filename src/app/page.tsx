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
  playerProgressRate: number;
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
          {/* 데스크톱용 헤더 (모바일에서는 숨김) */}
          <div className="hidden md:grid md:grid-cols-8 gap-4 py-2 px-4 border-b font-bold text-center">
            <div>순위</div>
            <div>이름</div>
            <div>핸디</div>
            <div>진행률</div>
            <div>승</div>
            <div>패</div>
            <div>보너스</div>
            <div>승점</div>
          </div>

          {/* 모바일용 헤더 (데스크톱에서는 숨김) */}
          <div className="md:hidden border-b py-2 px-4 font-bold text-center">
            <div className="grid grid-cols-4 gap-4">
              <div>순위</div>
              <div>이름</div>
              <div>핸디</div>
              <div>진행률</div>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-2">
              <div></div> {/* 빈 공간 */}
              <div>승패</div>
              <div>보너스</div>
              <div>승점</div>
            </div>
          </div>

          {playerStats.length > 0 ? (
            playerStats.map((player) => (
              <div key={player.player_name} className="border-b py-4 flex flex-col md:grid md:grid-cols-8 md:gap-4">
                <div className="grid grid-cols-4 gap-4 md:contents text-center">
                  <div className="">{player.rank}</div>
                  <div className="">
                    <Link href={`/player/${player.player_name}`} className="text-blue-600 hover:underline">
                      {player.player_name}
                    </Link>
                  </div>
                  <div className="">{player.handicap}</div>
                  <div className={`${player.playerProgressRate >= 70 ? 'font-bold text-red-500' : ''}`}>
                    {player.playerProgressRate}%
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 md:contents mt-2 md:mt-0 text-center">
                  {/* 모바일에서만 보이는 승패, 보너스, 승점 */}
                  <div className="md:hidden"></div> {/* 빈 공간 */}
                  <div className="md:hidden">{player.wins}:{player.losses}</div>
                  <div className="md:hidden">{player.bonus}</div>
                  <div className="md:hidden">{player.totalScore}</div>

                  {/* 데스크톱에서만 보이는 승, 패, 보너스, 승점 */}
                  <div className="hidden md:block">{player.wins}</div>
                  <div className="hidden md:block">{player.losses}</div>
                  <div className="hidden md:block">{player.bonus}</div>
                  <div className="hidden md:block">{player.totalScore}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              데이터 없음
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
