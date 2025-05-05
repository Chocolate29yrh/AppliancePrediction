# appliance_prediction/api/app.py
from flask import Flask, request, jsonify, render_template
from model.classifier import ApplianceClassifier
import os
from pathlib import Path
import logging
from logging.handlers import RotatingFileHandler
import time
import psutil


# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 设置日志文件
log_file = os.path.join(Path(__file__).parent.parent, 'logs', 'app.log')
os.makedirs(os.path.dirname(log_file), exist_ok=True)
file_handler = RotatingFileHandler(log_file, maxBytes=1024*1024, backupCount=10)
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
))
logger.addHandler(file_handler)

# 获取项目根目录
PROJECT_ROOT = Path(__file__).parent.parent
# 设置模型路径
MODEL_PATH = os.path.join(PROJECT_ROOT, 'saved_models', 'appliance_classifier.pkl')

app = Flask(__name__, 
            template_folder=os.path.join(PROJECT_ROOT, 'web', 'templates'),
            static_folder=os.path.join(PROJECT_ROOT, 'web', 'static'))
classifier = ApplianceClassifier(model_path=MODEL_PATH)

# 请求计时中间件
@app.before_request
def start_timer():
    request.start_time = time.time()

@app.after_request
def log_request(response):
    if hasattr(request, 'start_time'):
        duration = time.time() - request.start_time
        logger.info(f'Request to {request.path} took {duration:.2f}s')
    return response

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/health')
def health_check():
    """健康检查端点"""
    try:
        # 检查系统资源
        cpu_percent = psutil.cpu_percent()
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # 检查模型是否加载
        model_status = classifier.model is not None
        
        return jsonify({
            'status': 'healthy',
            'timestamp': time.time(),
            'system': {
                'cpu_percent': cpu_percent,
                'memory_percent': memory.percent,
                'disk_percent': disk.percent
            },
            'model_loaded': model_status
        })
    except Exception as e:
        logger.error(f'Health check failed: {str(e)}')
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    try:
        prediction = classifier.predict(data)
        return jsonify({'status': 'success', 'prediction': prediction.to_dict('records')[0]})
    except Exception as e:
        logger.error(f'Prediction error: {str(e)}')
        return jsonify({'status': 'error', 'message': str(e)})

if __name__ == '__main__':
    app.run(debug=True)