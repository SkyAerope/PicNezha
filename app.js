const express = require("express");
const axios = require("axios");
const { createCanvas, registerFont } = require("canvas");
const moment = require("moment");

const app = express();
const port = 3000;

// 注册字体
registerFont(__dirname + "/wqy-zenhei.ttc", { family: "WQY-ZenHei" });
registerFont(__dirname + "/seguiemj.ttf", { family: "Segoe UI Emoji" });

app.get("/status", async (req, res) => {
  try {
    const apiUrl = process.env.API_URL?.replace(/\/$/, ''); // 去掉结尾的斜杠
    const response = await axios.get(
      `${apiUrl}/api/v1/server/details`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TOKEN}`,
        },
      }
    );

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
    const canvas = createCanvas(800, servers.length * 100 + 20);
    const ctx = canvas.getContext("2d");
    ctx.textDrawingMode = "glyph"; // https://github.com/Automattic/node-canvas/issues/760#issuecomment-2260271607

    // 背景
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 800, canvas.height);

    // Text settings
    ctx.font = "14px Arial";
    ctx.fillStyle = "#000000";

    servers.forEach((server, index) => {
      const y = index * 100 + 20;

      // 服务器名称
      ctx.fillStyle = "#000";
      ctx.font = 'bold 16px "Segoe UI Emoji", "WQY-ZenHei"';
      ctx.fillText(server.name, 20, y);

      // 系统
      ctx.font = "14px Arial";
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

    // Send image as response
    res.setHeader("Content-Type", "image/png");
    canvas.createPNGStream().pipe(res);
  } catch (error) {
    console.error("Error:", error);
    // res.status(500).send("Error generating status page: " + error.message);
    const canvas = createCanvas(800, 200);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffebee"; // 背景颜色：浅红色
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#b71c1c"; // 字体颜色：深红色
    ctx.font = "bold 20px Arial";
    ctx.fillText("Error Generating Status Page", 50, 60);

    ctx.fillStyle = "#000000"; // 错误详情字体颜色
    ctx.font = "16px Arial";

    const lines = wrapText(ctx, error.message, 700);
    lines.forEach((line, index) => {
      ctx.fillText(line, 50, 100 + index * 20);
    });

    res.setHeader("Content-Type", "image/png");
    canvas.createPNGStream().pipe(res);
  }
});

// 画进度条
function drawProgressBar(ctx, x, y, width, value) {
  const height = 15;
  // Background
  ctx.fillStyle = "#e5e7eb";
  ctx.fillRect(x, y, width, height);
  // Progress
  ctx.fillStyle = value > 80 ? "#ef4444" : value > 60 ? "#f59e0b" : "#22c55e";
  ctx.fillRect(x, y, width * (value / 100), height);
  // Percentage text
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
