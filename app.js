const express = require("express");
const axios = require("axios");
const { createCanvas, registerFont } = require("canvas");
const { Canvas, FontLibrary } = require("skia-canvas");
const moment = require("moment");

const app = express();
const port = 3000;

// 注册字体
FontLibrary.use("WQY-ZenHei", __dirname + "/wqy-zenhei.ttc");
// FontLibrary.use("Noto Color Emoji", __dirname + "/NotoColorEmoji.ttf");
FontLibrary.use("Segoe UI Emoji", __dirname + "/seguiemj.ttf");

app.get("/status", async (req, res) => {
  try {
    const apiUrl = process.env.API_URL?.replace(/\/$/, ""); // 去掉结尾的斜杠
    const response = await axios.get(`${apiUrl}/api/v1/server/details`, {
      headers: {
        Authorization: process.env.TOKEN,
      },
    });

    // Check for unauthorized access error
    if (response.data.code === 403) {
      throw new Error(response.data.message);
    }

    // Check if response data and result exist
    if (!response.data || !response.data.result) {
      throw new Error("Invalid API response structure");
    }

    const servers = response.data.result
      .filter((server) => server.status.Uptime > 0 && !server.hide_for_guest)
      .sort((a, b) => b.display_index - a.display_index);

    // Create a canvas
    let canvas = new Canvas(800, servers.length * 100 + 20),
      ctx = canvas.getContext("2d");
    ctx.textDrawingMode = "glyph"; // https://github.com/Automattic/node-canvas/issues/760#issuecomment-2260271607

    // 背景
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 800, canvas.height);

    servers.forEach((server, index) => {
      const y = index * 100 + 20;

      // 服务器名称
      ctx.fillStyle = "#000";
      // ctx.font = 'bold 16px "Noto Color Emoji", "WQY-ZenHei"';
      ctx.font = 'bold 16px "Segoe UI Emoji", "WQY-ZenHei"';
      ctx.fillText(server.name, 20, y);

      // 系统
      ctx.font = '14px "Segoe UI Emoji", "WQY-ZenHei", Arial';
      ctx.fillText(
        `🖥️ ${server.host.Platform} ${server.host.PlatformVersion}`,
        20,
        y + 25
      );

      // 国家
      ctx.fillText(`📍 ${server.host.CountryCode.toUpperCase()}`, 20, y + 45);

      // Uptime
      ctx.fillText(
        `⏱️ Uptime: ${moment
          .duration(server.status.Uptime, "seconds")
          .humanize()}`,
        20,
        y + 65
      );

      // CPU Usage
      ctx.fillText("💻 CPU:", 300, y + 25);
      drawProgressBar(ctx, 365, y + 12, 200, server.status.CPU);

      // RAM Usage
      ctx.fillText("🧠 RAM:", 300, y + 55);
      const ramUsage = (server.status.MemUsed / server.host.MemTotal) * 100;
      drawProgressBar(ctx, 365, y + 42, 200, ramUsage);

      // 网络流量
      ctx.fillText("总下载:", 620, y + 25);
      ctx.fillText(formatBytes(server.status.NetInTransfer), 670, y + 25);

      ctx.fillText("总上传:", 620, y + 55);
      ctx.fillText(formatBytes(server.status.NetOutTransfer), 670, y + 55);
    });

    ctx.font = "10px Arial";
    ctx.fillStyle = "rgba(0, 0, 0, 0.54)";
    ctx.fillText(
      "Powered By PicNezha (https://github.com/SkyAerope/PicNezha)",
      800 - 350,
      servers.length * 100 + 10
    );

    const buffer = await canvas.toBuffer("image/png");
    res.set("Content-Type", "image/png");
    res.send(buffer);
  } catch (error) {
    console.error("Error:", error);
    // res.status(500).send("Error generating status page: " + error.message);
    let canvas = new Canvas(800, 200),
      ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffebee"; // 背景颜色：浅红色
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#b71c1c"; // 字体颜色：深红色
    ctx.font = 'bold 20px "Segoe UI Emoji", "WQY-ZenHei", Arial';
    ctx.fillText("生成图片出错", 50, 60);

    ctx.fillStyle = "#000000"; // 错误详情字体颜色
    ctx.font = '16px "Segoe UI Emoji", "WQY-ZenHei", Arial';

    const lines = wrapText(ctx, error.message, 700);
    lines.forEach((line, index) => {
      ctx.fillText(line, 50, 100 + index * 20);
    });

    const buffer = await canvas.toBuffer("image/png");
    res.set("Content-Type", "image/png");
    res.send(buffer);
  }
});

// 画进度条
function drawProgressBar(ctx, x, y, width, value) {
  const height = 15;
  const radius = height / 2; // 圆角半径（高度的一半）
  const progressWidth = width * (value / 100); // 根据进度计算宽度
  // 创建渐变
  const gradient = ctx.createLinearGradient(x, y, x + width, y);
  gradient.addColorStop(0, "#22c55e"); // 起始颜色：绿色
  gradient.addColorStop(0.5, "#f59e0b"); // 中间颜色：橙色
  gradient.addColorStop(1, "#ef4444"); // 结束颜色：红色

  // 背景条
  ctx.fillStyle = "#e5e7eb"; // 背景颜色
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  ctx.fill();

  // 进度条
  ctx.fillStyle = gradient;
  ctx.beginPath();
  if (value >= 5) {
    // 正常绘制圆角条形
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + progressWidth, y, x + progressWidth, y + height, radius);
    ctx.arcTo(x + progressWidth, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + progressWidth, y, radius);
  } else {
    // 绘制左边圆角，右边直边，怎么画进度条还要做数学题啊
    const cosTheta = (height - progressWidth * 2) / height;
    ctx.moveTo(x, y + radius);
    ctx.arc(
      x + height / 2,
      y + height / 2,
      radius,
      Math.PI,
      Math.PI + Math.acos(cosTheta),
      false
    ); // 左上圆角
    ctx.lineTo(x + progressWidth, y + height / 2 + progressWidth); // 右边
    ctx.arc(
      x + height / 2,
      y + height / 2,
      radius,
      Math.PI - Math.acos(cosTheta),
      Math.PI,
      false
    ); // 左下圆角
  }
  ctx.closePath();
  ctx.fill();

  // 百分比文字
  ctx.fillStyle = "#000000";
  ctx.fillText(Math.round(value) + "%", x + width + 5, y + 12);
}

// 自动换行
function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";

  for (let word of words) {
    const testLine = line + word + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth) {
      lines.push(line.trim());
      line = word + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());
  return lines;
}

// 流量单位换算
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/status`);
});
