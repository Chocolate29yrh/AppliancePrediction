# 部署指南

## 系统要求
- Docker 20.10.0 或更高版本
- Docker Compose 2.0.0 或更高版本
- 至少 2GB RAM
- 至少 10GB 磁盘空间

## 快速开始

### 1. 克隆仓库
```bash
git clone <repository-url>
cd AppliancePrediction
```

### 2. 构建和启动容器
```bash
docker-compose up --build
```

### 3. 访问应用
打开浏览器访问 http://localhost:5000

## 生产环境部署

### 1. 环境变量配置
创建 `.env` 文件：
```bash
FLASK_ENV=production
FLASK_APP=api/app.py
```

### 2. 使用 Gunicorn 运行
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 3. 监控
- 健康检查: http://localhost:5000/health
- 日志位置: ./logs/app.log

## 维护

### 更新应用
```bash
git pull
docker-compose down
docker-compose up --build -d
```

### 查看日志
```bash
docker-compose logs -f
```

### 备份
```bash
# 备份模型
cp saved_models/appliance_classifier.pkl backup/

# 备份日志
cp -r logs backup/
```

## 故障排除

### 常见问题
1. 容器无法启动
   - 检查端口占用
   - 检查日志文件权限
   - 验证环境变量配置

2. 模型加载失败
   - 确认模型文件存在
   - 检查模型文件权限
   - 验证模型版本兼容性

3. 性能问题
   - 检查系统资源使用情况
   - 调整容器资源限制
   - 优化模型参数

## 安全建议
1. 定期更新依赖包
2. 使用强密码
3. 启用HTTPS
4. 限制API访问
5. 定期备份数据 