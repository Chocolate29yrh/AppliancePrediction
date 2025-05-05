# appliance_prediction/config.py
import os

# 路径配置
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, 'saved_models')
os.makedirs(MODEL_DIR, exist_ok=True)  # 确保目录存在
DATA_DIR = os.path.join(BASE_DIR, 'data')

# 模型配置
MODEL_NAME = 'appliance_classifier.pkl'
MODEL_PATH = os.path.join(MODEL_DIR, MODEL_NAME)