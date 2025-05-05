# AppliancePrediction

智能设备状态预测系统（Flask + Docker）

## 项目简介
本项目基于 Flask 框架，结合机器学习模型，实现对智能家居设备状态的预测。支持本地和云端（如 Railway/Render）一键部署。

## 本地运行

1. 安装依赖
   ```bash
   pip install -r api/requirements.txt
   ```

2. 运行 Flask 应用
   ```bash
   python api/app.py
   ```

3. 浏览器访问 [http://localhost:5000](http://localhost:5000)

---

## Docker 运行

1. 构建并启动
   ```bash
   docker-compose up --build
   ```

2. 访问 [http://localhost:5000](http://localhost:5000)

---

## 云端部署（Railway/Render）

1. 上传本项目到 GitHub（包含模型文件）
2. 在 Railway/Render 新建项目，选择本仓库，自动检测 Dockerfile
3. 等待构建完成，获得公网访问地址
4. 如需自定义端口，平台会自动设置 `PORT` 环境变量

---

## 目录结构

```
AppliancePrediction/
├── api/
│   ├── app.py
│   └── requirements.txt
├── model/
├── web/
├── saved_models/
│   └── appliance_classifier.pkl
├── Dockerfile
├── .gitignore
├── README.md
```

---

## 注意事项

- **模型文件（saved_models/appliance_classifier.pkl）必须上传，否则云端无法预测。**
- 如需持久化数据，建议使用云数据库或对象存储。
- 免费云平台有资源/流量/休眠限制，适合毕业展示和小型项目。

---

## 联系方式
如有问题请联系：Chocolate29yrh 