import pandas as pd
import sys
from pathlib import Path

# 获取项目根目录（假设脚本在 model/ 子目录中）
PROJECT_ROOT = Path(__file__).parent.parent # 向上两级到根目录

# 将根目录添加到 Python 路径
sys.path.append(str(PROJECT_ROOT))

# 现在可以使用绝对导入
from AppliancePrediction.model.classifier import ApplianceClassifier
print(sys.path)  # 检查是否包含 "D:\1yrh\PythonProject\AppliancePrediction"
import model
print(model.__file__)  # 应该输出 model/__init__.py 的路径
import model.classifier  # 测试是否能找到模块
print(model.classifier.__file__)  # 应该输出 classifier.py 的路径
import sys
from pathlib import Path

print("Python Path:", sys.path)
print("Current File:", Path(__file__).resolve())
print("Project Root:", Path(__file__).parent.parent.resolve())

try:
    from model.classifier import ApplianceClassifier
    print("✅ 导入成功！")
except ImportError as e:
    print("❌ 导入失败:", e)