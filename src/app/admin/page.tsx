"use client";

import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import { createClient } from '@/lib/supabase/client';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminRecordCount, setAdminRecordCount] = useState<number | null>(null);
  const [insertStatus, setInsertStatus] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        // Check if user is in admin table
        const { data } = await supabase
          .from('admin')
          .select('id')
          .eq('id', user.id)
          .single();
        setIsAdmin(!!data);

        // Get total count of admin records
        const { count } = await supabase
          .from('admin')
          .select('id', { count: 'exact' });
        setAdminRecordCount(count);

        // If no records, insert current user as admin
        if (count === 0) {
          const { error: insertError } = await supabase
            .from('admin')
            .insert({ id: user.id });
          if (insertError) {
            setInsertStatus(`입력 실패: ${insertError.message}`);
          } else {
            setInsertStatus("관리자로 등록하였습니다.");
            // Re-fetch count after successful insert
            const { count: newCount } = await supabase
              .from('admin')
              .select('id', { count: 'exact' });
            setAdminRecordCount(newCount);
          }
        } else if (count > 0 && !data) { // data는 isAdmin 여부
          // adminRecordCount > 0 이고 isAdmin이 false인 경우 logout 처리
          await supabase.auth.signOut();
          setInsertStatus("관리자가 아닙니다.");
        }

      } else {
        setIsAdmin(false);
        setAdminRecordCount(0);
      }
      setLoading(false);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const checkAdminStatus = async () => {
          const { data } = await supabase
            .from('admin')
            .select('id')
            .eq('id', session.user.id)
            .single();
          setIsAdmin(!!data);

          const { count } = await supabase
            .from('admin')
            .select('id', { count: 'exact' });
          setAdminRecordCount(count);

          if (count > 0 && !data) { // data는 isAdmin 여부
            await supabase.auth.signOut();
            setInsertStatus("관리자가 아닙니다.");
            alert("관리자가 아닙니다. 로그아웃합니다.");
          }
        };
        checkAdminStatus();
      } else {
        setIsAdmin(false);
        setAdminRecordCount(0);
      }
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

  const handleDeleteAdmin = async () => {
    if (!confirm("정말로 관리자 테이블의 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('admin')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 모든 레코드를 삭제하기 위한 조건 (실제 ID가 아닌 더미 ID를 사용하여 모든 레코드와 일치하지 않도록 함)

    if (error) {
      alert(`관리자 테이블 삭제 중 오류가 발생했습니다: ${error.message}`);
    } else {
      alert("관리자 테이블의 모든 데이터가 성공적으로 삭제되었습니다.");
      await supabase.auth.signOut(); // 삭제 후 로그아웃
    }
    setLoading(false);
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
            
            {isAdmin !== null && (
              <p className="text-sm text-gray-600 hidden">
                관리자 테이블에 {isAdmin ? "있다" : "없다"}
              </p>
            )}
            {adminRecordCount !== null && adminRecordCount === 0 && (
              <p className="text-sm text-gray-600">자료없다. 최초등록해라</p>
            )}
            {adminRecordCount !== null && adminRecordCount > 0 && !isAdmin && (
              <p className="text-sm text-gray-600 hidden">기등록. 확인해라</p>
            )}
            {insertStatus && (
              <p className="text-sm text-gray-600">{insertStatus}</p>
            )}
            <div className="flex space-x-4">
              <button
                onClick={handleLogout}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                로그아웃
              </button>
              <button
                onClick={handleDeleteAdmin}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                관리자삭제
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
