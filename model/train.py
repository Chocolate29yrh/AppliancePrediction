# appliance_prediction/model/train.py
import pandas as pd
import sys
from pathlib import Path
import os

# 获取项目根目录（假设脚本在 model/ 子目录中）
PROJECT_ROOT = Path(__file__).parent.parent # 向上两级到根目录
# 将根目录添加到 Python 路径
sys.path.append(str(PROJECT_ROOT))
# 现在可以使用绝对导入
from AppliancePrediction.model.classifier import ApplianceClassifier

def load_data():
    df = pd.read_csv('D:/1yrh/PythonProject/AppliancePrediction/data/SixtyTest.csv')
    X = df[['Unix', 'Aggregate', 'season', 'weekday', 'month',
            'hour', 'night', 'morning', 'noon', 'evening']]  # 你的特征列
    Y = df[['Appliance_binary7','Appliance_binary1','Appliance_binary2','Appliance_binary3','Appliance_binary4']]
    return X, Y

if __name__ == '__main__':
    # 确保saved_models目录存在
    saved_models_dir = os.path.join(PROJECT_ROOT, 'saved_models')
    os.makedirs(saved_models_dir, exist_ok=True)
    
    # 设置模型保存路径
    model_path = os.path.join(saved_models_dir, 'appliance_classifier.pkl')
    
    # 加载数据并训练模型
    X, Y = load_data()
    classifier = ApplianceClassifier()
    classifier.train(X, Y, save_path=model_path)
    
    print(f"模型已保存到: {model_path}")