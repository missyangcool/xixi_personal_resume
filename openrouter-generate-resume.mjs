import fs from "fs/promises";

// 需要：Node.js 18+（内置 fetch）
// 使用前请先在系统环境变量中配置：OPENROUTER_API_KEY

const API_URL = "https://openrouter.ai/api/v1/chat/completions";
// 使用 auto 由 OpenRouter 自动选择当前区域可用模型，避免地区限制报错
const MODEL = "openrouter/auto";

async function main() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error("请先在环境变量中设置 OPENROUTER_API_KEY 再运行该脚本。");
    process.exit(1);
  }

  // 这里是你的简历“事实信息”，模型会基于这些内容生成 HTML
  const resumeData = {
    name: "杨茜茜",
    role: "AI 产品运营 / Web Experience",
    education: [
      {
        school: "香港中文大学（深圳）",
        major: "社会计算科学（硕士）",
        time: "2025.09 – 2027.06",
        city: "深圳，中国",
      },
      {
        school: "首都师范大学",
        major: "应用心理学（硕士，保研）",
        time: "2023.09 – 2024.09",
        city: "北京，中国",
      },
      {
        school: "广州中医药大学",
        major: "应用心理学（本科）",
        time: "2019.09 – 2023.06",
        city: "广州，中国",
      },
    ],
    skills: {
      languages: "普通话，英语，日语",
      data: "Python、R、SPSS",
      tools: "GPT、Gemini、Word、Excel、PowerPoint 等",
      hobbies: "户外徒步、网球、摄影、健身",
    },
  };

  const prompt = `
你是资深 Apple 风格视觉与交互工程师。请用 HTML + CSS + 原生 JavaScript（不依赖框架，不用构建工具）
为下述候选人生成一个「单文件」个人简历网站：

候选人信息（必须如实使用，允许你做轻微润色，但不要虚构经历）：
- 姓名：${resumeData.name}
- 一句话定位 / 角色：${resumeData.role}
- 教育背景：
  1）${resumeData.education[0].school} · ${resumeData.education[0].major} · ${resumeData.education[0].time} · ${resumeData.education[0].city}
  2）${resumeData.education[1].school} · ${resumeData.education[1].major} · ${resumeData.education[1].time} · ${resumeData.education[1].city}
  3）${resumeData.education[2].school} · ${resumeData.education[2].major} · ${resumeData.education[2].time} · ${resumeData.education[2].city}
- 技能掌握：
  · 语言：${resumeData.skills.languages}
  · 数据类：${resumeData.skills.data}
  · 办公 & AI 工具：${resumeData.skills.tools}
- 兴趣爱好：${resumeData.skills.hobbies}

视觉与交互要求（非常重要）：
- 整体风格：高级感、极简、硅谷科技风，参考 Apple.com 的克制留白、精致排版、玻璃拟态质感。
- 同时具有「时尚杂志 editorial」的版式张力：大标题、小字注释、双栏网格、强层级、留白舒适。
- 使用柔和渐变 + 轻微噪点质感背景、细线边框、软阴影、浅玻璃感。

页面结构与交互（核心要求）：
1）整体是一个「横向幻灯片 / 杂志章节」体验：
   - 页面由若干个全屏 section 组成（100vw / 100vh），比如：About / Experience / Projects / Skills / Education / Contact。
   - 用户滚轮向下滚动时，实质是横向切换到下一个 section（类似横向 PPT）；滚轮向上则回到上一页。
   - 支持键盘左右方向键切换上一页/下一页。
   - 支持简单的触控滑动（左右滑动）切换。

2）每一页的动效：
   - 章节切换时，有淡入 + 轻微位移（translate）+ 模糊到清晰的过渡动画。
   - 可以为图片或装饰块添加轻微视差感，但要克制，不要眼花缭乱。

3）顶部导航：
   - 顶部有一个极简的导航条，固定在顶部（sticky），显示各章节名称（About / Experience / Projects / Skills / Education / Contact）。
   - 当前所在章节在导航中有高亮状态（细线框 / 色块 / 下划线均可，但要细腻）。
   - 点击导航项时，平滑切换到对应的章节（横向滑动 + 过渡动效）。

4）首屏（About）设计：
   - 左侧为候选人照片区域（可以用占位图/边框标明 "Your Photo Here"），下方有姓名 + 英文名字 + 角色。
   - 右侧为一句话定位 + 个人简介（建议 3–5 句，突出 AI 产品运营、跨学科背景与数据能力）。

实现要求：
- 输出一个完整的 HTML 文档（包含 <head>、<style>、<body>、<script>），不依赖外部 CSS/JS 文件。
- 不要使用任何前端框架（React/Vue 等），只用原生 JS。
- JS 中请实现：
  · 横向分页容器（如 .slides-wrapper），内部每一页为一个 .slide，宽度 100vw，高度 100vh。
  · 监听滚轮事件，将「纵向滚轮」转译为「横向索引 +1 / -1」（注意节流和触控板的连续滚动，避免过于敏感）。
  · 监听键盘左右方向键进行上一页/下一页切换。
  · 监听触控事件（touchstart / touchmove / touchend）实现基本的左右滑动切换。
  · 处理好当前索引的边界（不能超出第一页和最后一页）。
  · 使用 CSS class（例如 .is-active）配合过渡动画控制每一页的显隐、淡入淡出与位移动效。

重要：直接输出最终 HTML 源码，不要包裹 Markdown 代码块，也不要解释说明。
`;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "你是资深 Apple 风格视觉与交互工程师，专注于高质感、极简、硅谷科技风的 Web 设计与实现。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    console.error("OpenRouter 请求失败:", response.status, response.statusText);
    const text = await response.text();
    console.error(text);
    process.exit(1);
  }

  const data = await response.json();
  const html = data?.choices?.[0]?.message?.content;

  if (!html) {
    console.error("未从 OpenRouter 返回有效的 HTML 内容：", JSON.stringify(data, null, 2));
    process.exit(1);
  }

  const outputPath = "./generated-resume.html";
  await fs.writeFile(outputPath, html, "utf8");
  console.log(`已生成简历页面：${outputPath}`);
}

main().catch((err) => {
  console.error("脚本运行出错：", err);
  process.exit(1);
});

