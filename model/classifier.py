# appliance_prediction/model/classifier.py
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import ClassifierChain
from pathlib import Path
from AppliancePrediction.config import MODEL_DIR
import os

class ApplianceClassifier:
    """封装多标签分类模型的预测逻辑"""

    def __init__(self, model_path=None):
        self.model = self._load_model(model_path) if model_path else None

    def _load_model(self, path):
        return joblib.load(path)

    def train(self, X, Y, save_path=os.path.join(MODEL_DIR, 'appliance_classifier.pkl')):
        self.model = ClassifierChain(
            RandomForestClassifier(n_estimators=100, max_depth=20, random_state=20),
            order='random',
            random_state=42
        )
        self.model.fit(X, Y)
        if save_path:
            # 自动创建目录（如果不存在）
            Path(save_path).parent.mkdir(parents=True, exist_ok=True)
            joblib.dump(self.model, save_path)

    def predict(self, input_data):
        """
        输入: DataFrame 或 Dict（如 {'Unix': 1620000000, 'Aggregate': 25, ...}）
        输出: DataFrame（预测的Y值，列名同训练时的Y）
        """
        if isinstance(input_data, dict):
            input_data = pd.DataFrame([input_data])

        # 确保输入数据包含所有训练时的特征，且顺序一致
        required_columns = [
            'Unix', 'Aggregate', 'season', 'weekday', 'month',
            'hour', 'night', 'morning', 'noon', 'evening'
        ]

        # 检查缺失特征
        missing_cols = [col for col in required_columns if col not in input_data.columns]
        if missing_cols:
            raise ValueError(f"输入数据缺少以下特征: {missing_cols}")

        # 按训练时的特征顺序排列
        input_data = input_data[required_columns]

        # 预测并返回DataFrame
        y_pred = self.model.predict(input_data)
        return pd.DataFrame(y_pred, columns=[
            'Appliance_binary7', 'Appliance_binary1',
            'Appliance_binary2', 'Appliance_binary3', 'Appliance_binary4'
        ])

    def predict_proba(self, input_data):
        """返回预测概率（如果基分类器支持）"""
        if not hasattr(self.model, 'predict_proba'):
            raise ValueError("当前基分类器不支持概率预测")

        if isinstance(input_data, dict):
            input_data = pd.DataFrame([input_data])

        input_data = input_data[[
            'Unix', 'Aggregate', 'season', 'weekday', 'month',
            'hour', 'night', 'morning', 'noon', 'evening'
        ]]

        y_proba = self.model.predict_proba(input_data)
        return pd.DataFrame(y_proba, columns=[
            'Appliance_binary7', 'Appliance_binary1',
            'Appliance_binary2', 'Appliance_binary3', 'Appliance_binary4'
        ])
