const fs = require('fs');
const path = require('path');

// 配置
const POSTS_DIR = path.join(process.cwd(), 'app/content/posts');
const METADATA_DIR = path.join(process.cwd(), 'app/content/metadata');

// 确保目录存在
if (!fs.existsSync(POSTS_DIR)) {
  fs.mkdirSync(POSTS_DIR, { recursive: true });
}
if (!fs.existsSync(METADATA_DIR)) {
  fs.mkdirSync(METADATA_DIR, { recursive: true });
}

// 获取命令行参数
const sourceFile = process.argv[2];
if (!sourceFile) {
  console.error('请提供文章文件路径');
  process.exit(1);
}

// 检查文件是否存在
const normalizedPath = path.resolve(sourceFile);
if (!fs.existsSync(normalizedPath)) {
  console.error(`错误: 找不到文件 "${sourceFile}"`);
  console.error('请确保：');
  console.error('1. 文件名输入正确');
  console.error('2. 文件确实存在于当前目录');
  console.error('3. 如果文件名包含空格，请用引号包裹');
  process.exit(1);
}

// 生成slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-') // 保留中文字符
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

try {
  // 读取文件内容
  const content = fs.readFileSync(normalizedPath, 'utf8');

  // 从HTML中提取标题
  const titleMatch = content.match(/<title>(.*?)<\/title>/);
  const title = titleMatch ? titleMatch[1] : path.basename(sourceFile, '.html');

  // 从HTML中提取描述
  const descMatch = content.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/);
  const description = descMatch ? descMatch[1] : `${title} - 详细内容`;

  // 生成slug
  const slug = generateSlug(title);

  // 复制文章文件
  const targetHtmlPath = path.join(POSTS_DIR, `${slug}.html`);
  fs.copyFileSync(normalizedPath, targetHtmlPath);

  // 创建元数据
  const metadata = {
    title,
    date: new Date().toISOString().split('T')[0],
    excerpt: description,
    author: 'Aitrainee',
    slug
  };

  // 保存元数据
  const metadataPath = path.join(METADATA_DIR, `${slug}.json`);
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

  console.log('\n✅ 文章添加成功！');
  console.log('文章信息：');
  console.log(`- 标题：${title}`);
  console.log(`- Slug：${slug}`);
  console.log('\n文件位置：');
  console.log(`- HTML：${targetHtmlPath}`);
  console.log(`- 元数据：${metadataPath}`);
  console.log('\n访问地址：');
  console.log(`- http://localhost:3000/blog/${slug}`);
  console.log('\n提示：请确保开发服务器正在运行(npm run dev)\n');

} catch (error) {
  console.error('\n❌ 处理文章时出错：');
  console.error(error.message);
  console.error('\n如果是编码问题，请确保文件使用UTF-8编码保存');
  process.exit(1);
}