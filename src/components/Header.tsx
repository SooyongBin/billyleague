"use client";

import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-gray-800 text-white p-4 flex items-center justify-between">
      <Link href="/">
        <div className="flex items-center space-x-2">
          <Image
            src="/sevenball.jpeg"
            alt="세븐당구클럽 로고"
            width={50}
            height={50}
            className="rounded-full"
          />
          <h1 className="text-2xl font-bold">세븐당구클럽</h1>
        </div>
      </Link>
      <div className="flex items-center space-x-4">
        <Link href="/register-player">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            선수핸디
          </button>
        </Link>
        <Link href="/record-game">
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            게임결과
          </button>
        </Link>
        <Link href="/admin">
          <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
            관리자
          </button>
        </Link>
      </div>
    </header>
  );
}
