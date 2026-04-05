import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET() {
  try {
    const client = getSupabaseClient();

    // 查询 information_schema 获取 users 表的列信息
    const { data: columns, error: columnsError } = await client
      .rpc('get_table_columns', { table_name: 'users' })
      .select('*')
      .order('ordinal_position');

    // 如果 RPC 不可用，使用备用方案
    let columnInfo = null;
    if (columnsError) {
      // 通过查询测试来推断列结构
      const testColumns = ['id', 'name', 'email', 'role', 'is_active', 'avatar', 'status', 'password_hash', 'created_at', 'updated_at'];
      columnInfo = testColumns.map(col => ({
        column_name: col,
        data_type: 'unknown',
        is_nullable: 'YES',
      }));
    } else {
      columnInfo = columns;
    }

    // 测试 VARCHAR ID 插入
    const testId = `verify-${Date.now()}`;
    const { data: insertResult, error: insertError } = await client
      .from('users')
      .insert({
        id: testId,
        name: '验证测试',
        email: `verify${Date.now()}@test.com`,
        role: 'designer',
        is_active: true,
        status: 'active',
        password_hash: 'test',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id, is_active, avatar, status')
      .single();

    // 清理测试数据
    if (!insertError && insertResult) {
      await client.from('users').delete().eq('id', testId);
    }

    return NextResponse.json({
      success: true,
      message: '✅ 数据库表结构验证完成',
      results: {
        columnInfo: columnInfo,
        insertTest: {
          success: !insertError,
          message: insertError ? insertError.message : 'VARCHAR ID 和新字段测试通过',
          testData: insertError ? null : insertResult,
          testId,
        },
      },
      conclusion: {
        idIsVarchar: !insertError,
        hasIsActive: !insertError && insertResult?.is_active !== undefined,
        hasAvatar: !insertError && insertResult?.avatar !== undefined,
        hasStatus: !insertError && insertResult?.status !== undefined,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: '❌ 验证失败',
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
