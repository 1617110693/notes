# Python案例



## Python批量爬取图片小案例

```python
"""
图片爬虫脚本
用于从指定URL模式批量下载图片
"""

import requests
import os
from concurrent.futures import ThreadPoolExecutor, as_completed

# ==================== 配置区域 ====================

# 图片保存目录（相对于当前脚本位置）
SAVE_DIR = "images"

# 图片URL基础路径，使用 {} 作为编号占位符
# 示例: https://univs-news-1256833609.file.myqcloud.com/123/upload/resources/image/10022{}.jpg
BASE_URL = "https://univs-news-1256833609.file.myqcloud.com/123/upload/resources/image/100230{}.jpg"

# 编号前缀（{} 之前的内容，用于生成文件名）
# 例如编号为 683 时，生成文件名: 10022683.jpg
FILENAME_PREFIX = "100230"

# 下载范围
START_NUM = 15   # 起始编号
END_NUM = 79     # 结束编号

# 并发线程数（同时下载的图片数量）
MAX_WORKERS = 10

# 请求超时时间（秒）
TIMEOUT = 30

# ==================== 配置区域结束 ====================

# 确保保存目录存在
os.makedirs(SAVE_DIR, exist_ok=True)


def download_image(num):
    """
    下载单张图片

    Args:
        num: 图片编号（如 683）
    """
    # 拼接完整URL
    url = BASE_URL.format(num)

    # 生成文件名: 前缀 + 编号
    filename = os.path.join(SAVE_DIR, f"{FILENAME_PREFIX}{num}.jpg")

    # 如果文件已存在，跳过下载
    if os.path.exists(filename):
        print(f"已存在，跳过: {filename}")
        return

    try:
        # 发送HTTP请求
        resp = requests.get(url, timeout=TIMEOUT)

        if resp.status_code == 200:
            # 下载成功，保存文件
            with open(filename, 'wb') as f:
                f.write(resp.content)
            print(f"下载成功: {filename}")
        else:
            # HTTP错误（如404Not Found）
            print(f"失败 [{resp.status_code}]: {url}")
    except Exception as e:
        # 网络异常等错误
        print(f"异常: {url} - {e}")


def main():
    """主函数：批量下载图片"""
    print(f"开始下载图片 {START_NUM} - {END_NUM}...")

    # 使用线程池并发下载
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        # 提交所有下载任务
        futures = {executor.submit(download_image, i): i for i in range(START_NUM, END_NUM + 1)}

        # 等待所有任务完成
        for future in as_completed(futures):
            future.result()

    print("下载完成!")


if __name__ == "__main__":
    main()
```

