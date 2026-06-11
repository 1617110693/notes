var e=`# Python案例\r
\r
\r
\r
## Python批量爬取图片小案例\r
\r
\`\`\`python\r
"""\r
图片爬虫脚本\r
用于从指定URL模式批量下载图片\r
"""\r
\r
import requests\r
import os\r
from concurrent.futures import ThreadPoolExecutor, as_completed\r
\r
# ==================== 配置区域 ====================\r
\r
# 图片保存目录（相对于当前脚本位置）\r
SAVE_DIR = "images"\r
\r
# 图片URL基础路径，使用 {} 作为编号占位符\r
# 示例: https://univs-news-1256833609.file.myqcloud.com/123/upload/resources/image/10022{}.jpg\r
BASE_URL = "https://univs-news-1256833609.file.myqcloud.com/123/upload/resources/image/100230{}.jpg"\r
\r
# 编号前缀（{} 之前的内容，用于生成文件名）\r
# 例如编号为 683 时，生成文件名: 10022683.jpg\r
FILENAME_PREFIX = "100230"\r
\r
# 下载范围\r
START_NUM = 15   # 起始编号\r
END_NUM = 79     # 结束编号\r
\r
# 并发线程数（同时下载的图片数量）\r
MAX_WORKERS = 10\r
\r
# 请求超时时间（秒）\r
TIMEOUT = 30\r
\r
# ==================== 配置区域结束 ====================\r
\r
# 确保保存目录存在\r
os.makedirs(SAVE_DIR, exist_ok=True)\r
\r
\r
def download_image(num):\r
    """\r
    下载单张图片\r
\r
    Args:\r
        num: 图片编号（如 683）\r
    """\r
    # 拼接完整URL\r
    url = BASE_URL.format(num)\r
\r
    # 生成文件名: 前缀 + 编号\r
    filename = os.path.join(SAVE_DIR, f"{FILENAME_PREFIX}{num}.jpg")\r
\r
    # 如果文件已存在，跳过下载\r
    if os.path.exists(filename):\r
        print(f"已存在，跳过: {filename}")\r
        return\r
\r
    try:\r
        # 发送HTTP请求\r
        resp = requests.get(url, timeout=TIMEOUT)\r
\r
        if resp.status_code == 200:\r
            # 下载成功，保存文件\r
            with open(filename, 'wb') as f:\r
                f.write(resp.content)\r
            print(f"下载成功: {filename}")\r
        else:\r
            # HTTP错误（如404Not Found）\r
            print(f"失败 [{resp.status_code}]: {url}")\r
    except Exception as e:\r
        # 网络异常等错误\r
        print(f"异常: {url} - {e}")\r
\r
\r
def main():\r
    """主函数：批量下载图片"""\r
    print(f"开始下载图片 {START_NUM} - {END_NUM}...")\r
\r
    # 使用线程池并发下载\r
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:\r
        # 提交所有下载任务\r
        futures = {executor.submit(download_image, i): i for i in range(START_NUM, END_NUM + 1)}\r
\r
        # 等待所有任务完成\r
        for future in as_completed(futures):\r
            future.result()\r
\r
    print("下载完成!")\r
\r
\r
if __name__ == "__main__":\r
    main()\r
\`\`\`\r
\r
`;export{e as default};