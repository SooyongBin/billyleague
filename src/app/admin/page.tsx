"use client";

import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl font-semibold">데이터 로딩 중...</p>
      </div>
    );
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback?next=/admin`,
      },
    });
  };

  const handleKakaoLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${location.origin}/auth/callback?next=/admin`,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex justify-center space-x-4 mt-8">
        {!user && (
          <>
            <button
              onClick={handleGoogleLogin}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              구글
            </button>
            <button
              onClick={handleKakaoLogin}
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
            >
              카카오
            </button>
          </>
        )}
        {user && (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-lg font-semibold">환영합니다, {user.email}님!</p>
            <div className="flex space-x-4">
              <button
                onClick={handleLogout}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                로그아웃
              </button>
              <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                관리자삭제
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
