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
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// 处理HTML内容
const processHtmlContent = (content) => {
  // 优化图片标签
  return content.replace(
    /<img([^>]*)src="([^"]*)"([^>]*)>/g,
    (match, before, src, after) => {
      // 添加加载和错误处理属性
      return `<img${before}src="${src}"${after} 
        onerror="this.onerror=null; this.style.display='none'; this.insertAdjacentHTML('afterend', '<div class=\\'image-error\\'>图片加载失败</div>')"
        loading="lazy"
        style="max-width: 100%; height: auto; display: block; margin: 20px auto;"
      >`;
    }
  );
};

try {
  // 读取文件内容
  let content = fs.readFileSync(normalizedPath, 'utf8');

  // 处理HTML内容
  content = processHtmlContent(content);

  // 从HTML中提取标题
  const titleMatch = content.match(/<title>(.*?)<\/title>/);
  const title = titleMatch ? titleMatch[1] : path.basename(sourceFile, '.html');

  // 从HTML中提取描述
  const descMatch = content.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/);
  const description = descMatch ? descMatch[1] : `${title} - 详细内容`;

  // 从HTML中提取封面图
  const imageMatch = content.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/);
  const coverImage = imageMatch ? imageMatch[1] : null;

  // 生成slug
  const slug = generateSlug(title);

  // 复制文章文件
  const targetHtmlPath = path.join(POSTS_DIR, `${slug}.html`);
  fs.writeFileSync(targetHtmlPath, content);

  // 创建元数据
  const metadata = {
    title,
    date: new Date().toISOString().split('T')[0],
    excerpt: description,
    author: 'Aitrainee',
    slug,
    coverImage
  };

  // 保存元数据
  const metadataPath = path.join(METADATA_DIR, `${slug}.json`);
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

  console.log('\n✅ 文章添加成功！');
  console.log('文章信息：');
  console.log(`- 标题：${title}`);
  console.log(`- Slug：${slug}`);
  console.log(`- 封面图：${coverImage || '无'}`);
  console.log('\n文件位置：');
  console.log(`- HTML：${targetHtmlPath}`);
  console.log(`- 元数据：${metadataPath}`);
  console.log('\n访问地址：');
  console.log(`- http://localhost:3000/blog/${slug}`);
  console.log('\n提示：');
  console.log('1. 请确保开发服务器正在运行(npm run dev)');
  console.log('2. 如果文章包含外部图片，请确保在next.config.js中配置了对应的域名\n');

} catch (error) {
  console.error('\n❌ 处理文章时出错：');
  console.error(error.message);
  console.error('\n如果是编码问题，请确保文件使用UTF-8编码保存');
  process.exit(1);
}