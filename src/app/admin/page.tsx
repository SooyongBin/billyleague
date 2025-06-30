"use client"
import Header from "@/components/Header";

export default function AdminPage() {
  return (
    <div>
      <Header />
      <div className="flex justify-center space-x-4 mt-8">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          구글
        </button>
        <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
          카카오
        </button>
        <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
          로그아웃
        </button>
        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          관리자삭제
        </button>
      </div>
    </div>
  );
}
