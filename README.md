# 晴屿天气

一个可直接部署的静态天气网站。
https://add12891.github.io/weather/
## 文件结构

- `index.html`：主页面
- `assets/styles.css`：样式
- `assets/main.js`：真实天气数据请求与交互逻辑
- `vercel.json`：Vercel 静态部署配置
- `netlify.toml`：Netlify 静态部署配置
- `.nojekyll`：GitHub Pages 静态站兼容文件

## 本地预览

如果你的电脑装了 Python，可以在当前目录运行：

```powershell
python -m http.server 8080
```

然后打开：

```text
http://localhost:8080
```

## 部署方式

### 1. GitHub Pages

1. 在 GitHub 新建一个仓库
2. 把当前目录所有文件上传到仓库根目录
3. 在仓库 `Settings` -> `Pages`
4. 选择：
   `Deploy from a branch`
5. 分支选择：
   `main`
6. 文件夹选择：
   `/ (root)`
7. 保存后等待几分钟，GitHub 会生成公开网址

### 2. Netlify

1. 登录 Netlify
2. 选择 `Add new site` -> `Import an existing project`
3. 连接 GitHub 仓库
4. 构建设置保持为空
5. 发布目录填写：
   `.`
6. 点击部署

### 3. Vercel

1. 登录 Vercel
2. 导入当前项目仓库
3. Framework Preset 选择：
   `Other`
4. Build Command 留空
5. Output Directory 留空
6. 点击部署

## 数据来源

页面当前接入的是公开可访问的 Open-Meteo 接口：

- 预报数据：`api.open-meteo.com`
- 空气质量：`air-quality-api.open-meteo.com`
- 地理编码：`geocoding-api.open-meteo.com`

`weather.com` 目前保留为参考链接，没有直接接它的官方 API，因为官方接口需要单独申请 API Key。
