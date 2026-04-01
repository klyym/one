import { NextRequest, NextResponse } from 'next/server';
import { S3Storage } from 'coze-coding-dev-sdk';

// 初始化 S3 存储
const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: '',
  secretKey: '',
  bucketName: process.env.COZE_BUCKET_NAME,
  region: 'cn-beijing',
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '未找到上传文件' },
        { status: 400 }
      );
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件类型，仅支持 JPG、PNG、GIF、WebP 格式' },
        { status: 400 }
      );
    }

    // 验证文件大小（最大 10MB）
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件大小超过限制，最大支持 10MB' },
        { status: 400 }
      );
    }

    // 读取文件内容
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 生成文件名（使用时间戳和原始文件名）
    const timestamp = Date.now();
    const fileName = `cases/${timestamp}_${file.name}`;

    // 上传文件
    const fileKey = await storage.uploadFile({
      fileContent: buffer,
      fileName,
      contentType: file.type,
    });

    // 生成签名 URL（有效期 30 天）
    const imageUrl = await storage.generatePresignedUrl({
      key: fileKey,
      expireTime: 30 * 24 * 60 * 60, // 30 天
    });

    return NextResponse.json({
      success: true,
      data: {
        key: fileKey,
        url: imageUrl,
        name: file.name,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error) {
    console.error('图片上传失败:', error);
    return NextResponse.json(
      { error: '图片上传失败，请重试' },
      { status: 500 }
    );
  }
}
