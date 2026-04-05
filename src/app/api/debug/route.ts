import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET() {
  try {
    const client = getSupabaseClient();

    // 1. 检查 users 表结构
    const { data: usersData, error: usersError } = await client
      .from('users')
      .select('id, name, email, role, is_active, avatar, status')
      .limit(1);

    // 2. 检查 studio_info 表
    const { data: studioData, error: studioError } = await client
      .from('studio_info')
      .select('*')
      .limit(1);

    // 3. 检查 health_check 表
    const { data: healthData, error: healthError } = await client
      .from('health_check')
      .select('*')
      .limit(1);

    // 4. 测试插入用户（验证 VARCHAR id）
    const testId = `test-${Date.now()}`;
    const { data: insertData, error: insertError } = await client
      .from('users')
      .insert({
        id: testId,
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        role: 'designer',
        is_active: true,
        status: 'active',
        password_hash: 'test_hash',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    // 清理测试数据
    if (insertData) {
      await client.from('users').delete().eq('id', testId);
    }

    // 汇总结果
    const checks = {
      usersTable: {
        success: !usersError,
        message: usersError ? usersError.message : 'users 表正常',
        data: usersData,
      },
      studioInfoTable: {
        success: !studioError,
        message: studioError ? studioError.message : 'studio_info 表正常',
        data: studioData,
      },
      healthCheckTable: {
        success: !healthError,
        message: healthError ? healthError.message : 'health_check 表正常',
        data: healthData,
      },
      insertTest: {
        success: !insertError,
        message: insertError ? insertError.message : 'VARCHAR ID 插入测试通过',
        testId,
      },
    };

    const allSuccess = Object.values(checks).every(c => c.success);

    return NextResponse.json({
      success: allSuccess,
      message: allSuccess ? '✅ 数据库表结构验证通过' : '⚠️ 数据库表结构存在问题',
      checks,
      timestamp: new Date().toISOString(),
    }, { status: allSuccess ? 200 : 500 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: '❌ 数据库验证失败',
      error: error.message,
      suggestion: '请在 Supabase Dashboard SQL Editor 中执行修复脚本',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
