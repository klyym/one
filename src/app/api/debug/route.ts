import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET() {
  try {
    // 尝试获取 Supabase 客户端
    const client = getSupabaseClient();

    // 测试连接：查询健康检查表
    const { data, error } = await client
      .from('health_check')
      .select('*')
      .limit(1);

    if (error) {
      throw new Error(`数据库查询失败: ${error.message}`);
    }

    // 查询工作室信息
    const { data: studioData, error: studioError } = await client
      .from('studio_info')
      .select('*');

    if (studioError) {
      throw new Error(`查询工作室信息失败: ${studioError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: '数据库连接成功',
      database: {
        healthCheck: data,
        studioInfo: studioData,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: '数据库连接失败',
      error: error.message,
      suggestion: '请检查 Supabase 环境变量配置',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
