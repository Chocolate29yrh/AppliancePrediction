// appliance_prediction/web/static/script.js

// 存储历史记录
const MAX_HISTORY = 10;
let predictionHistory = JSON.parse(localStorage.getItem('predictionHistory') || '[]');
let resultChart = null;

// 显示加载动画
function showLoading() {
    document.querySelector('.loading-overlay').classList.add('active');
}

// 隐藏加载动画
function hideLoading() {
    document.querySelector('.loading-overlay').classList.remove('active');
}

// 显示结果面板
function showResultPanel() {
    const resultContainer = document.getElementById('result-container');
    resultContainer.style.display = 'block';
    resultContainer.style.opacity = '0';
    resultContainer.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        resultContainer.style.opacity = '1';
        resultContainer.style.transform = 'translateY(0)';
    }, 50);
}

// 清空历史记录
function clearHistory() {
    predictionHistory = [];
    localStorage.removeItem('predictionHistory');
    updateHistoryDisplay();
}

// 格式化时间
function formatTime(hour) {
    return `${hour.toString().padStart(2, '0')}:00`;
}

// 初始化小时选择器
function initializeHourSelect() {
    const hourSelect = document.getElementById('hour');
    hourSelect.innerHTML = '<option value="">请选择小时</option>';
    for (let i = 0; i < 24; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = formatTime(i);
        hourSelect.appendChild(option);
    }
}

// 从时间戳解析日期信息
function parseDateFromTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);
    
    // 获取月份 (1-12)
    const month = date.getMonth() + 1;
    
    // 获取星期 (0-6)
    const weekday = date.getDay();
    
    // 获取小时 (0-23)
    const hour = date.getHours();
    
    // 判断季节 (1-4)
    let season;
    if (month >= 3 && month <= 5) season = 1; // 春
    else if (month >= 6 && month <= 8) season = 2; // 夏
    else if (month >= 9 && month <= 11) season = 3; // 秋
    else season = 4; // 冬
    
    // 判断时间段
    const night = (hour >= 22 || hour < 6) ? 1 : 0;
    const morning = (hour >= 6 && hour < 12) ? 1 : 0;
    const noon = (hour >= 12 && hour < 14) ? 1 : 0;
    const evening = (hour >= 18 && hour < 22) ? 1 : 0;
    
    return {
        month,
        weekday,
        hour,
        season,
        night,
        morning,
        noon,
        evening
    };
}

// 填充日期相关字段
function fillDateFields(timestamp) {
    const dateInfo = parseDateFromTimestamp(timestamp);
    
    // 填充各个字段
    document.getElementById('month').value = dateInfo.month;
    document.getElementById('weekday').value = dateInfo.weekday;
    document.getElementById('hour').value = dateInfo.hour;
    document.getElementById('season').value = dateInfo.season;
    
    // 设置时间段复选框
    document.getElementById('night').checked = dateInfo.night === 1;
    document.getElementById('morning').checked = dateInfo.morning === 1;
    document.getElementById('noon').checked = dateInfo.noon === 1;
    document.getElementById('evening').checked = dateInfo.evening === 1;
}

// 填充当前时间
function fillCurrentTime() {
    const now = new Date();
    const timestamp = Math.floor(now.getTime() / 1000);
    document.getElementById('unix').value = timestamp;
    fillDateFields(timestamp);
    updatePredictionInfo(timestamp);
}

// 监听Unix时间戳输入变化
document.getElementById('unix').addEventListener('change', function(e) {
    const timestamp = parseInt(this.value);
    if (!isNaN(timestamp) && timestamp > 0) {
        fillDateFields(timestamp);
    }
});

// 格式化日期时间
function formatDateTime(timestamp) {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 获取季节名称
function getSeasonName(season) {
    const seasons = {
        1: '春季',
        2: '夏季',
        3: '秋季',
        4: '冬季'
    };
    return seasons[season] || '未知';
}

// 获取星期几名称
function getWeekdayName(weekday) {
    const names = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return names[weekday] || '';
}

// 获取时间段描述
function getTimePeriodDescription(dateInfo) {
    const periods = [];
    if (dateInfo.night) periods.push('夜间');
    if (dateInfo.morning) periods.push('早晨');
    if (dateInfo.noon) periods.push('中午');
    if (dateInfo.evening) periods.push('晚上');
    return periods.length > 0 ? periods.join('、') : '无特殊时段';
}

// 新增：获取表单勾选的时间段
function getTimePeriodFromForm() {
    return {
        night: document.getElementById('night').checked ? 1 : 0,
        morning: document.getElementById('morning').checked ? 1 : 0,
        noon: document.getElementById('noon').checked ? 1 : 0,
        evening: document.getElementById('evening').checked ? 1 : 0
    };
}

// 更新预测信息显示
function updatePredictionInfo(timestamp) {
    const dateInfo = parseDateFromTimestamp(timestamp);
    const datetime = formatDateTime(timestamp);
    
    console.log(dateInfo);
    
    document.getElementById('prediction-datetime').textContent = datetime;
    document.getElementById('prediction-timestamp').textContent = timestamp;
    document.getElementById('prediction-season').textContent = getSeasonName(dateInfo.season);
    document.getElementById('prediction-timeperiod').textContent = getTimePeriodDescription(dateInfo);
}

// 获取设备显示名称
function getDeviceDisplayName(device) {
    if (device === 'Appliance_binary1') return 'Fridge';
    if (device === 'Appliance_binary2') return 'Freezer';
    if (device === 'Appliance_binary3') return 'Kettle';
    if (device === 'Appliance_binary4') return 'Washing Machine';
    if (device === 'Appliance_binary7') return 'Television Site';
    return device.replace('Appliance_binary', '设备 ');
}

// 更新图表
function updateChart(prediction) {
    const canvas = document.getElementById('resultChart');
    const ctx = canvas.getContext('2d');
    
    // 设置canvas的DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    // 准备数据
    const labels = Object.keys(prediction).map(key => getDeviceDisplayName(key));
    const data = Object.values(prediction);
    
    // 销毁已存在的图表
    if (resultChart) {
        resultChart.destroy();
    }
    
    const isMobile = window.innerWidth <= 768;
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // 配置颜色
    const colors = {
        on: {
            background: isDarkMode ? 'rgba(75, 192, 192, 0.2)' : 'rgba(0, 200, 83, 0.2)',
            border: isDarkMode ? 'rgba(75, 192, 192, 1)' : 'rgba(0, 200, 83, 1)'
        },
        off: {
            background: isDarkMode ? 'rgba(255, 99, 132, 0.2)' : 'rgba(255, 82, 82, 0.2)',
            border: isDarkMode ? 'rgba(255, 99, 132, 1)' : 'rgba(255, 82, 82, 1)'
        },
        text: isDarkMode ? '#f5f5f7' : '#1d1d1f',
        grid: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
    };
    
    // 调整图表配置
    const options = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '设备状态',
                data: data,
                backgroundColor: data.map(value => value === 1 ? colors.on.background : colors.off.background),
                borderColor: data.map(value => value === 1 ? colors.on.border : colors.off.border),
                borderWidth: 2,
                borderRadius: 8,
                maxBarThickness: 50
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            devicePixelRatio: dpr,
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,
                    grid: {
                        color: colors.grid,
                        drawBorder: false
                    },
                    ticks: {
                        stepSize: 1,
                        padding: 10,
                        color: colors.text,
                        callback: function(value) {
                            return value === 1 ? '开启' : '关闭';
                        },
                        font: {
                            size: isMobile ? 12 : 14,
                            family: "'Inter', sans-serif",
                            weight: '500'
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        padding: 10,
                        color: colors.text,
                        font: {
                            size: isMobile ? 12 : 14,
                            family: "'Inter', sans-serif",
                            weight: '500'
                        },
                        maxRotation: isMobile ? 45 : 0,
                        autoSkip: true,
                        maxTicksLimit: isMobile ? 6 : 10
                    }
                }
            },
            plugins: {
                tooltip: {
                    enabled: true,
                    mode: isMobile ? 'nearest' : 'index',
                    intersect: false,
                    backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                    titleColor: isDarkMode ? '#fff' : '#1d1d1f',
                    bodyColor: isDarkMode ? '#fff' : '#1d1d1f',
                    titleFont: {
                        size: 14,
                        family: "'Inter', sans-serif",
                        weight: '600'
                    },
                    bodyFont: {
                        size: 13,
                        family: "'Inter', sans-serif",
                        weight: '500'
                    },
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: true,
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return context.raw === 1 ? '状态：开启' : '状态：关闭';
                        }
                    }
                },
                legend: {
                    display: !isMobile,
                    position: 'top',
                    align: 'center',
                    labels: {
                        color: colors.text,
                        padding: 20,
                        font: {
                            size: 14,
                            family: "'Inter', sans-serif",
                            weight: '500'
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            }
        }
    };
    
    // 创建新图表
    resultChart = new Chart(ctx, options);
    
    // 监听暗色模式变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        updateChart(prediction);
    });
}

// 添加历史记录
function addToHistory(input, prediction) {
    const timestamp = new Date().toLocaleString();
    const record = {
        timestamp,
        input,
        prediction
    };
    
    // 添加到历史记录开头
    predictionHistory.unshift(record);
    
    // 保持最大记录数
    if (predictionHistory.length > MAX_HISTORY) {
        predictionHistory.pop();
    }
    
    // 保存到localStorage
    localStorage.setItem('predictionHistory', JSON.stringify(predictionHistory));
    
    // 更新显示
    updateHistoryDisplay();
}

// 更新历史记录显示
function updateHistoryDisplay() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';
    
    if (predictionHistory.length === 0) {
        historyList.innerHTML = '<div class="text-center text-muted">暂无历史记录</div>';
        return;
    }
    
    predictionHistory.forEach((record, index) => {
        const recordDiv = document.createElement('div');
        recordDiv.className = 'history-record';
        recordDiv.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <strong>预测时间:</strong> ${record.timestamp}<br>
                    <strong>总用电量:</strong> ${record.input.Aggregate} kWh<br>
                    <small class="text-muted">
                        ${record.input.month}月${record.input.hour}时 | 
                        ${['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][record.input.weekday]}
                    </small>
                </div>
                <button class="btn btn-sm btn-outline-primary load-history" data-index="${index}">
                    加载此记录
                </button>
            </div>
        `;
        historyList.appendChild(recordDiv);
    });
    
    // 绑定加载历史记录事件
    document.querySelectorAll('.load-history').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = e.target.dataset.index;
            const record = predictionHistory[index];
            loadHistoryRecord(record);
        });
    });
}

// 加载历史记录
function loadHistoryRecord(record) {
    // 填充表单
    Object.entries(record.input).forEach(([key, value]) => {
        const element = document.getElementById(key.toLowerCase());
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = value === 1;
            } else {
                element.value = value;
            }
        }
    });
    
    // 显示预测结果
    displayPredictionResult({
        status: 'success',
        prediction: record.prediction
    });
}

// 显示预测结果
function displayPredictionResult(result) {
    const resultContainer = document.getElementById('result-container');
    const resultDiv = document.getElementById('result');
    
    if (result.status === 'success') {
        const prediction = result.prediction;
        let html = '<div class="table-responsive"><table class="table">';
        html += '<thead><tr><th>设备</th><th>状态</th></tr></thead><tbody>';
        
        for (const [device, status] of Object.entries(prediction)) {
            const deviceName = getDeviceDisplayName(device);
            const statusText = status === 1 ? '开启' : '关闭';
            const statusClass = status === 1 ? 'status-on' : 'status-off';
            html += `
                <tr>
                    <td>${deviceName}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                </tr>`;
        }
        
        html += '</tbody></table></div>';
        resultDiv.innerHTML = html;
        
        // 更新时间信息
        const timestamp = parseInt(document.getElementById('unix').value);
        const weekday = parseInt(document.getElementById('weekday').value);
        document.getElementById('prediction-datetime').textContent = formatDateTime(timestamp);
        document.getElementById('prediction-timestamp').textContent = timestamp;
        document.getElementById('prediction-season').textContent = getSeasonName(parseInt(document.getElementById('season').value));
        document.getElementById('prediction-timeperiod').textContent = getWeekdayName(weekday);
        
        // 更新图表
        try {
            updateChart(prediction);
        } catch (error) {
            console.error('图表更新失败:', error);
            document.getElementById('chart-content').innerHTML = '<div class="alert alert-warning">图表显示失败</div>';
        }
    } else {
        resultDiv.innerHTML = `<div class="alert alert-danger">${result.message || '预测失败'}</div>`;
    }
    
    showResultPanel();
}

// 表单验证
(function () {
    'use strict'
    const forms = document.querySelectorAll('.needs-validation')
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }
            form.classList.add('was-validated')
        }, false)
    })
})()

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 显示页面过渡效果
    document.querySelector('.page-transition').classList.add('active');
    
    // 初始化小时选择器
    initializeHourSelect();
    
    // 绑定填充当前时间按钮事件
    document.getElementById('fillCurrentTime').addEventListener('click', fillCurrentTime);
    
    // 绑定清空历史记录按钮事件
    document.getElementById('clearHistory').addEventListener('click', () => {
        if (confirm('确定要清空所有历史记录吗？')) {
            clearHistory();
        }
    });
    
    // 显示历史记录
    updateHistoryDisplay();
    
    // 添加移动端优化
    if ('ontouchstart' in window) {
        addTouchSupport();
        handleKeyboard();
        optimizeHistoryForMobile();
        handleOrientationChange();
    }
    
    // 优化图表尺寸计算
    window.addEventListener('resize', () => {
        if (resultChart) {
            resultChart.resize();
        }
        optimizeHistoryForMobile();
    });

    // 绑定功能框点击事件
    document.querySelectorAll('.feature-box[role="button"]').forEach(box => {
        box.addEventListener('click', handleFeatureClick);
    });
    
    // 添加滚动监听以高亮当前部分
    window.addEventListener('scroll', debounce(() => {
        const scrollPosition = window.scrollY + window.innerHeight / 2;
        
        // 找到当前滚动位置对应的部分
        const sections = ['prediction-section', 'visualization-section', 'history-section'];
        let currentSection = null;
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
                    currentSection = sectionId;
                }
            }
        });
        
        // 更新功能框的激活状态
        if (currentSection) {
            document.querySelectorAll('.feature-box').forEach(box => {
                box.classList.remove('active');
                if (box.dataset.target === currentSection) {
                    box.classList.add('active');
                }
            });
        }
    }, 100));
});

// 预测功能
document.getElementById('prediction-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!e.target.checkValidity()) {
        return;
    }
    
    // 显示加载状态
    showLoading();
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = '预测中...';
    
    try {
        // 收集表单数据
        const input = {
            Unix: parseInt(document.getElementById('unix').value),
            Aggregate: parseFloat(document.getElementById('aggregate').value),
            season: parseInt(document.getElementById('season').value),
            weekday: parseInt(document.getElementById('weekday').value),
            month: parseInt(document.getElementById('month').value),
            hour: parseInt(document.getElementById('hour').value),
            night: document.getElementById('night').checked ? 1 : 0,
            morning: document.getElementById('morning').checked ? 1 : 0,
            noon: document.getElementById('noon').checked ? 1 : 0,
            evening: document.getElementById('evening').checked ? 1 : 0
        };

        // 发送预测请求
        const response = await fetch('/predict', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(input)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        // 显示结果
        displayPredictionResult(result);
        
        // 添加到历史记录
        if (result.status === 'success') {
            addToHistory(input, result.prediction);
        }
        
    } catch (error) {
        console.error('错误:', error);
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = `<div class="alert alert-danger">预测失败: ${error.message}</div>`;
        showResultPanel();
    } finally {
        // 恢复按钮状态
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        hideLoading();
    }
});

// 移动端优化：添加触摸事件支持
function addTouchSupport() {
    // 防止双击缩放
    document.addEventListener('touchstart', function(e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });

    // 优化图表触摸交互
    if (resultChart) {
        resultChart.options.interaction = {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        };
    }
}

// 移动端优化：处理软键盘弹出
function handleKeyboard() {
    const inputs = document.querySelectorAll('input[type="number"], select');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            // 延迟滚动以确保软键盘完全展开
            setTimeout(() => {
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        });
    });
}

// 移动端优化：优化历史记录显示
function optimizeHistoryForMobile() {
    const isMobile = window.innerWidth <= 768;
    const historyRecords = document.querySelectorAll('.history-record');
    
    historyRecords.forEach(record => {
        if (isMobile) {
            // 在移动端优化按钮位置
            const button = record.querySelector('.load-history');
            if (button) {
                button.classList.add('mt-2');
                button.style.width = '100%';
            }
        }
    });
}

// 移动端优化：处理方向变化
function handleOrientationChange() {
    window.addEventListener('orientationchange', () => {
        // 重新调整图表大小
        if (resultChart) {
            setTimeout(() => {
                resultChart.resize();
            }, 300);
        }
        
        // 重新优化历史记录显示
        optimizeHistoryForMobile();
    });
}

// 处理功能框点击事件
function handleFeatureClick(event) {
    const featureBox = event.currentTarget;
    const targetId = featureBox.dataset.target;
    const targetSection = document.getElementById(targetId);
    
    // 移除所有功能框的active类
    document.querySelectorAll('.feature-box').forEach(box => {
        box.classList.remove('active');
    });
    
    // 添加active类到当前点击的功能框
    featureBox.classList.add('active');
    
    // 移除所有卡片的高亮动画
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('scroll-highlight');
    });
    
    if (targetSection) {
        // 平滑滚动到目标部分
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // 添加高亮动画
        setTimeout(() => {
            targetSection.classList.add('scroll-highlight');
        }, 500); // 等待滚动完成后添加动画
        
        // 如果是数据可视化部分，自动切换到图表视图
        if (targetId === 'visualization-section' && resultChart) {
            const chartTab = document.getElementById('chart-tab');
            if (chartTab) {
                const tabInstance = new bootstrap.Tab(chartTab);
                tabInstance.show();
            }
        }
    }
}

// 添加防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}