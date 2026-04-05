import { NextResponse } from 'next/server';
import { dbAdapter } from '@/storage/database/database-adapter';

export async function GET() {
  try {
    // 初始化数据库适配器
    const mode = await dbAdapter.initialize();

    // 测试连接：查询工作室信息
    const studioData = await dbAdapter.getStudioInfo();

    return NextResponse.json({
      success: true,
      message: '数据库连接成功',
      mode: mode,
      data: {
        studioInfo: studioData,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: '数据库连接失败',
      error: error.message,
      suggestion: '数据库不可用，系统会自动降级到 localStorage 模式',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
