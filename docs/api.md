# API 文档

## 概述
本文档描述了智能设备状态预测系统的API接口。所有API端点都返回JSON格式的响应。

## 基础URL
```
http://localhost:5000
```

## 健康检查
### GET /health
检查系统健康状态。

**响应示例：**
```json
{
    "status": "healthy",
    "timestamp": 1647123456.789,
    "system": {
        "cpu_percent": 25.5,
        "memory_percent": 60.2,
        "disk_percent": 45.8
    },
    "model_loaded": true
}
```

## 预测接口
### POST /predict
预测设备状态。

**请求体：**
```json
{
    "Unix": 1647123456,
    "Aggregate": 100.5,
    "season": 2,
    "weekday": 1,
    "month": 3,
    "hour": 14,
    "night": 0,
    "morning": 0,
    "noon": 1,
    "evening": 0
}
```

**响应示例：**
```json
{
    "status": "success",
    "prediction": {
        "Appliance_binary1": 1,
        "Appliance_binary2": 0,
        "Appliance_binary3": 1,
        "Appliance_binary4": 0,
        "Appliance_binary7": 1
    }
}
```

## 错误处理
所有API在发生错误时都会返回适当的HTTP状态码和错误信息。

**错误响应示例：**
```json
{
    "status": "error",
    "message": "Invalid input data"
}
```

## 状态码
- 200: 成功
- 400: 请求参数错误
- 500: 服务器内部错误

## 速率限制
API请求限制为每分钟100次。 