// backend/index.js

const express = require('express');
const fetch = require('node-fetch');
const app = express();

// 使用 express.json() 中间件来解析 JSON 请求体
app.use(express.json());

// 创建一个代理 API 端点
app.post('/api/proxy', async (req, res) => {
  // 1. 从环境变量中安全地读取 API 密钥
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server.' });
  }

  // 2. 构造发往 Google Gemini API 的请求
  const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  try {
    const apiResponse = await fetch(geminiApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // 3. 将前端发来的请求体转发给 Google API
      body: JSON.stringify(req.body),
    });

    const data = await apiResponse.json();

    // 4. 将 Google API 的响应返回给前端
    res.status(apiResponse.status).json(data);

  } catch (error) {
    console.error('Error proxying to Gemini API:', error);
    res.status(500).json({ error: 'Failed to proxy request.' });
  }
});

// 导出 app 以便 Google Cloud Functions 使用
exports.handler = app;
