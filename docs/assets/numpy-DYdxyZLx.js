var e=`# NumPy 全面使用总结

## 1. 简介

NumPy 是 Python 科学计算的基石，提供高性能多维数组（ndarray）及向量化运算。底层由 C/Fortran 实现，比 Python 原生循环快 10-100 倍。

\`\`\`python
import numpy as np

print(np.__version__)
\`\`\`

---

## 2. 数组创建

### 从 Python 数据创建

\`\`\`python
# 从列表创建
a = np.array([1, 2, 3])                  # 一维
b = np.array([[1, 2, 3], [4, 5, 6]])     # 二维
c = np.array([1, 2, 3], dtype=np.float32)  # 指定类型
\`\`\`

### 快速创建函数

\`\`\`python
np.zeros((3, 4))            # 全 0 数组
np.ones((2, 3))             # 全 1 数组
np.full((2, 2), 7)          # 全为指定值
np.eye(3)                   # 单位矩阵
np.diag([1, 2, 3])          # 对角矩阵
np.empty((2, 3))            # 未初始化（快但不安全）
\`\`\`

### 序列与网格

\`\`\`python
np.arange(0, 10, 2)          # [0, 2, 4, 6, 8] — 类似 Python range
np.linspace(0, 1, 5)         # [0.  , 0.25, 0.5 , 0.75, 1.  ] — 等间距
np.logspace(0, 3, 4)         # [1., 10., 100., 1000.] — 对数等间距
np.meshgrid(x, y)            # 生成网格坐标矩阵
np.mgrid[0:3, 0:3]           # 紧凑网格生成
np.ogrid[0:3, 0:3]           # 稀疏网格（省内存）
\`\`\`

### 特殊数组

\`\`\`python
np.random.rand(3, 4)         # [0, 1) 均匀分布
np.random.randn(3, 4)        # 标准正态分布
np.random.randint(0, 10, 5)  # 随机整数
np.identity(3)               # 同 eye()
np.tri(3)                    # 下三角全 1 矩阵
\`\`\`

| 函数 | 说明 | 何时用 |
|------|------|--------|
| \`arange\` | 整数步长序列 | 知道步长时 |
| \`linspace\` | 指定个数的等间距 | 知道点数时 |
| \`logspace\` | 对数等间距 | 对数域采样时 |

---

## 3. 数组属性

\`\`\`python
a = np.array([[1, 2, 3], [4, 5, 6]])

a.shape          # (2, 3) — 形状
a.ndim           # 2 — 维度数
a.size           # 6 — 元素总数
a.dtype          # dtype('int64') — 数据类型
a.itemsize       # 8 — 每个元素字节数
a.nbytes         # 48 — 总字节数
a.T              # 转置（与 a.transpose() 等价）
a.real, a.imag   # 实部/虚部（复数数组）
a.flat           # 扁平迭代器
\`\`\`

### 数据类型速查

| dtype | 说明 |
|-------|------|
| \`np.int32\`, \`np.int64\` | 有符号整数 |
| \`np.uint8\`, \`np.uint16\` | 无符号整数 |
| \`np.float16\`, \`np.float32\`, \`np.float64\` | 浮点数 |
| \`np.complex64\`, \`np.complex128\` | 复数 |
| \`np.bool_\` | 布尔值 |
| \`np.object_\` | Python 对象 |
| \`np.str_\` | 字符串 |

\`\`\`python
# 类型转换
a.astype(np.float32)
np.array([1, 2, 3], dtype=np.int8)
\`\`\`

---

## 4. 索引与切片

### 基本索引

\`\`\`python
a = np.array([[1, 2, 3, 4],
              [5, 6, 7, 8],
              [9, 10, 11, 12]])

a[0, 2]           # 3 — 第0行第2列
a[1, :]           # [5, 6, 7, 8] — 第1行全部
a[:, 1]           # [2, 6, 10] — 第1列全部
a[1:3, 1:3]       # [[6, 7], [10, 11]] — 子矩阵
a[:, ::2]         # 每两列取一列
a[::-1, :]        # 行倒序
\`\`\`

### 花式索引（Fancy Indexing）

\`\`\`python
# 整数数组索引
a[[0, 2]]                          # 第 0 行和第 2 行
a[[0, 2], [1, 3]]                  # (0,1) 和 (2,3) 两个点 → [2, 12]
a[np.ix_([0, 2], [1, 3])]          # 行[0,2] × 列[1,3] 的交叉子矩阵

# 布尔索引（ML 最常用）
a[a > 5]                           # 所有大于 5 的值
a[(a > 3) & (a < 9)]               # 3 < x < 9
a[(a == 3) | (a == 7)]             # 等于 3 或 7
\`\`\`

### \`np.where\` — 条件选择

\`\`\`python
# 返回满足条件的索引
idx = np.where(a > 5)              # (array([1, 1, 1, 2, 2, 2]), array([1, 2, 3, 0, 1, 2]))

# 三目运算符式
np.where(a > 5, a, 0)              # >5 保留原值，否则设 0
np.where(a > 5, 1, 0)              # >5 设为 1，否则 0
\`\`\`

### 切片 vs 花式索引：拷贝差异

\`\`\`python
b = a[:2, :2]      # 切片 → 视图（view），修改 b 会影响 a
b = a[[0, 1]][:, [0, 1]]  # 花式索引 → 拷贝（copy），独立
\`\`\`

---

## 5. 形状操作

\`\`\`python
a = np.arange(12).reshape(3, 4)    # [[0,1,2,3], [4,5,6,7], [8,9,10,11]]
\`\`\`

### 改变形状

\`\`\`python
a.reshape(4, 3)         # 改形状（返回视图/copy，不保证总是视图）
a.reshape(-1)           # 展平为一维 → [0,1,2,...,11]
a.ravel()               # 展平（返回视图，更快）
a.flatten()             # 展平（始终返回拷贝）
a.reshape(2, -1)        # 2 行，列数自动计算 → (2, 6)
a.reshape(3, 2, 2)      # 3 维 (3, 2, 2)
\`\`\`

### 增删维度

\`\`\`python
a = np.array([1, 2, 3])            # shape (3,)

a[np.newaxis, :]     # shape (1, 3) — 增加一个维度在行方向
a[:, np.newaxis]     # shape (3, 1) — 增加一个维度在列方向
np.expand_dims(a, axis=0)   # shape (1, 3)
np.expand_dims(a, axis=1)   # shape (3, 1)

np.squeeze(a)                  # 删除所有大小为 1 的维度
\`\`\`

### 拼接与堆叠

\`\`\`python
a = np.array([[1, 2], [3, 4]])
b = np.array([[5, 6], [7, 8]])

np.concatenate([a, b], axis=0)  # [[1,2],[3,4],[5,6],[7,8]] — 纵向
np.concatenate([a, b], axis=1)  # [[1,2,5,6],[3,4,7,8]] — 横向
np.vstack([a, b])               # 同 axis=0，垂直堆叠
np.hstack([a, b])               # 同 axis=1，水平堆叠
np.dstack([a, b])               # 深度堆叠 → shape (2, 2, 2)
np.column_stack([a, b])         # 按列堆叠（一维数组会被当成列）
np.row_stack([a, b])            # 按行堆叠
\`\`\`

### 分割

\`\`\`python
np.split(a, 2, axis=0)           # 等分为 2 份
np.array_split(a, 3, axis=1)     # 不等分 3 份（允许不等长）
np.hsplit(a, 2)                  # 水平分割
np.vsplit(a, 2)                  # 垂直分割
\`\`\`

### 重复与平铺

\`\`\`python
np.repeat([1, 2], 3)             # [1, 1, 1, 2, 2, 2] — 元素级重复
np.tile([1, 2], 3)               # [1, 2, 1, 2, 1, 2] — 整体平铺
np.pad(a, pad_width=1, mode='constant', constant_values=0)  # 填充
\`\`\`

---

## 6. 向量化运算（核心优势）

### 算术运算（逐元素）

\`\`\`python
a + b, a - b, a * b, a / b      # 逐元素加减乘除
a ** 2                           # 逐元素平方
np.sqrt(a)                       # 开方
np.exp(a), np.log(a)             # 指数、自然对数
np.log2(a), np.log10(a)          # 以 2/10 为底对数
np.sin(a), np.cos(a), np.tan(a)  # 三角函数
np.abs(a)                        # 绝对值
np.sign(a)                       # 符号函数 +1/-1/0
np.clip(a, min_val, max_val)     # 截断到范围内
np.round(a, 2)                   # 四舍五入
np.floor(a), np.ceil(a)          # 向下/向上取整
\`\`\`

### 聚合函数

\`\`\`python
a.sum(), a.sum(axis=0)           # 求和（axis=0 按列, axis=1 按行）
a.mean(), a.mean(axis=1)         # 均值
a.min(), a.max()                 # 最小/最大值
a.std(), a.var()                 # 标准差、方差
a.prod()                         # 累乘
a.cumsum()                       # 累加和
a.cumprod()                      # 累乘积
np.median(a)                     # 中位数
np.percentile(a, 50)             # 百分位数
np.quantile(a, 0.5)              # 分位数
np.ptp(a)                        # 极差（peak-to-peak）= max - min
np.nanmean(a), np.nanstd(a)      # 忽略 NaN 的均值/标准差
\`\`\`

### \`axis\` 参数口诀

\`\`\`
axis=0 → 沿行方向操作 → 压缩行 → 对每列计算
axis=1 → 沿列方向操作 → 压缩列 → 对每行计算
axis=-1 → 最后一个维度
\`\`\`

\`\`\`python
a = np.array([[1, 2, 3],
              [4, 5, 6]])

a.sum(axis=0)   # [5, 7, 9] — 每列求和
a.sum(axis=1)   # [6, 15]    — 每行求和
a.sum()         # 21         — 全部求和
\`\`\`

### 比较运算

\`\`\`python
a > b, a == b, a != b            # 逐元素比较，返回布尔数组
np.all(a > 0)                    # 全为 True？
np.any(a > 0)                    # 至少一个 True？
np.isclose(a, b, rtol=1e-5)      # 浮点近似相等
np.isnan(a), np.isinf(a)         # 检测 NaN / Inf
np.isfinite(a)                   # 检测有限值
np.allclose(a, b)                # 数组近似相等
\`\`\`

---

## 7. 广播 (Broadcasting)

广播是最核心的机制，让不同形状的数组进行向量化运算。

### 规则

1. 从尾端维度开始对齐比较
2. 维度相同或任一维度为 1 即可广播
3. 缺失维度自动补 1

\`\`\`python
a = np.array([[1, 2, 3], [4, 5, 6]])    # (2, 3)
b = np.array([10, 20, 30])              # (3,) → (1, 3) → (2, 3)

a + b   # [[11, 22, 33],
        #  [14, 25, 36]]
\`\`\`

### ML 中最常见的广播模式

\`\`\`python
# 标准化（减均值除标准差）
data = np.random.randn(100, 5)          # (100, 5)
mean = data.mean(axis=0)                # (5,)
std = data.std(axis=0)                  # (5,)
normalized = (data - mean) / std        # (100, 5) — 广播

# 向量化外积
x = np.array([1, 2, 3])                 # (3,)
y = np.array([4, 5, 6])                 # (3,)
outer = x[:, np.newaxis] * y            # (3, 3) — 外积矩阵

# 批量加偏置
features = np.random.randn(32, 128)     # (batch, features)
bias = np.random.randn(128)             # (features,)
result = features + bias                # (32, 128) — 广播
\`\`\`

---

## 8. 线性代数 — \`np.linalg\`

\`\`\`python
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])
v = np.array([1, 2])
\`\`\`

### 矩阵乘法

\`\`\`python
A @ B                              # 矩阵乘法（推荐）
np.dot(A, B)                       # 同 @（二维时为矩阵乘）
np.matmul(A, B)                    # 矩阵乘法
a * b                              # 逐元素乘法（不是矩阵乘！）
np.inner(v, w)                     # 向量内积
np.outer(v, w)                     # 向量外积
np.tensordot(A, B, axes=1)         # 沿指定轴收缩
np.einsum('ij,jk->ik', A, B)       # Einstein 求和（最通用，读数学公式直译）
\`\`\`

### 矩阵运算

\`\`\`python
np.linalg.inv(A)                   # 逆矩阵
np.linalg.pinv(A)                  # Moore-Penrose 伪逆
np.linalg.det(A)                   # 行列式
np.linalg.norm(v)                  # 向量范数（默认 L2）
np.linalg.norm(v, ord=1)           # L1 范数
np.linalg.matrix_rank(A)           # 矩阵的秩
np.linalg.trace(A)                 # 迹（对角线之和）
np.linalg.matrix_power(A, 3)       # A^3
\`\`\`

### 特征值与分解

\`\`\`python
eigenvalues, eigenvectors = np.linalg.eig(A)         # 特征值与特征向量
eigenvalues, eigenvectors = np.linalg.eigh(A_sym)     # 对称矩阵版本（更快）
Q, R = np.linalg.qr(A)                                # QR 分解
U, s, Vh = np.linalg.svd(A)                           # SVD 奇异值分解
\`\`\`

### 求解线性方程组

\`\`\`python
# Ax = b
x = np.linalg.solve(A, b)
# 最小二乘
x, residuals, rank, s = np.linalg.lstsq(A, b)
\`\`\`

### \`einsum\` 速查（高级）

\`\`\`python
# 约定：输入用 -> 分隔，左边是输入下标，右边是输出下标
np.einsum('ii->i', A)              # 对角线
np.einsum('ii', A)                 # 迹（标量）
np.einsum('ij->ji', A)             # 转置
np.einsum('ij,ij->ij', A, B)       # 逐元素乘
np.einsum('ij,kj->ik', A, B)       # 矩阵乘（内积）
np.einsum('i,j->ij', v, w)         # 外积
np.einsum('bij,bjk->bik', A3d, B3d)  # 批量矩阵乘
\`\`\`

---

## 9. 统计与排序

### 排序

\`\`\`python
a = np.array([3, 1, 2, 5, 4])

a.sort()                           # 原地排序
np.sort(a)                         # 返回新数组
np.argsort(a)                      # 返回排序后的索引 → [1, 2, 0, 4, 3]
sorted_a = a[np.argsort(a)]        # 用索引排序
\`\`\`

### 沿轴排序

\`\`\`python
np.sort(a, axis=0)                 # 每列排序
np.argsort(a, axis=1)              # 每行排序的索引
\`\`\`

### 极值与位置

\`\`\`python
np.argmax(a)                       # 最大值的索引（扁平后）
np.argmin(a)                       # 最小值的索引
np.argmax(a, axis=1)               # 每行最大值的列索引
np.argmin(a, axis=0)               # 每列最小值的行索引
np.argwhere(a > 0.5)               # 满足条件的元素坐标
np.nanargmax(a)                    # 忽略 NaN 的 argmax
\`\`\`

### 分区（Top-K）

\`\`\`python
a = np.random.rand(100)
np.partition(a, 5)                 # 最小的 5 个元素在左边（不保证内序）
np.argpartition(a, 5)              # 分区后的索引（比 full sort 快）
# 取 Top-10
idx = np.argpartition(a, -10)[-10:]  # 最大 10 个的索引
\`\`\`

---

## 10. 随机数 — \`np.random\`

\`\`\`python
rng = np.random.default_rng(seed=42)  # 新版推荐方式
\`\`\`

### 新版 API（推荐，v1.17+）

\`\`\`python
rng = np.random.default_rng(42)

rng.random((3, 4))                 # [0, 1) 均匀分布
rng.integers(0, 10, size=5)        # [0, 10) 随机整数
rng.standard_normal((100, 5))      # 标准正态
rng.normal(loc=5, scale=2, size=100)  # N(5, 2²)
rng.uniform(-1, 1, size=(2, 3))    # [-1, 1) 均匀
rng.choice(a, size=10, replace=True, p=probs)  # 带概率随机抽取
rng.shuffle(arr)                   # 就地打乱
rng.permutation(10)                # 返回打乱后的 0-9
rng.binomial(n=10, p=0.5, size=100)   # 二项分布
rng.poisson(lam=3, size=100)          # 泊松分布
rng.exponential(scale=2, size=100)    # 指数分布
rng.gamma(shape=2, scale=2, size=100) # Gamma 分布
rng.beta(a=2, b=5, size=100)          # Beta 分布
rng.laplace(loc=0, scale=1, size=100) # Laplace 分布
\`\`\`

### 旧版 API（仍常见，但不推荐新代码使用）

\`\`\`python
np.random.seed(42)
np.random.rand(3, 4)
np.random.randn(3, 4)
np.random.randint(0, 10, 5)
np.random.choice(a, 10)
np.random.shuffle(arr)
np.random.permutation(10)
\`\`\`

### 常用采样技巧

\`\`\`python
# 按概率权重采样
idx = rng.choice(len(data), size=1000, p=data['prob'])

# 训练/验证/测试随机分割
idx = rng.permutation(len(X))
train_idx, val_idx, test_idx = np.split(idx, [int(0.6*n), int(0.8*n)])

# 随机种子（不污染全局）
rng = np.random.default_rng(42)
# 等价于旧版
np.random.RandomState(42)
\`\`\`

---

## 11. 集合与唯一值

\`\`\`python
np.unique(a)                       # 唯一值（排序后）
np.unique(a, return_counts=True)   # 唯一值 + 计数
np.unique(a, return_index=True)    # 唯一值 + 首次出现索引
np.unique(a, return_inverse=True)  # 唯一值 + 重建索引

np.in1d(a, b)                      # a 中每个元素是否在 b 中
np.intersect1d(a, b)               # 交集
np.union1d(a, b)                   # 并集
np.setdiff1d(a, b)                 # 差集（a 有 b 无）
np.setxor1d(a, b)                  # 对称差集
\`\`\`

---

## 12. 缺失值与掩码

\`\`\`python
# NaN 操作
np.isnan(a)
np.isinf(a)
np.nan_to_num(a, nan=0.0)          # NaN → 0, Inf → 大值
np.nan_to_num(a, nan=-1.0, posinf=1e10, neginf=-1e10)

# 聚合忽略 NaN
np.nansum(a), np.nanmean(a), np.nanstd(a), np.nanvar(a)
np.nanmin(a), np.nanmax(a), np.nanmedian(a)
np.nanpercentile(a, 50)
np.nanprod(a)

# 掩码数组（带 mask 的数组）
ma = np.ma.masked_where(a < 0, a)   # 将所有负值 mask 掉
ma = np.ma.masked_array(a, mask=np.isnan(a))
ma.mean(), ma.std()                  # 自动忽略被 mask 的值
\`\`\`

---

## 13. 文件 I/O

\`\`\`python
# 二进制格式（最快）
np.save('arr.npy', a)                        # 单个数组
np.load('arr.npy')
np.savez('data.npz', x=x_train, y=y_train)   # 多个数组（压缩可选 .npz）
np.savez_compressed('data.npz', x=x, y=y)    # 压缩存储
data = np.load('data.npz')
data['x'], data['y']

# 文本格式
np.savetxt('arr.txt', a, delimiter=',', fmt='%.4f')
np.loadtxt('arr.txt', delimiter=',')
np.genfromtxt('data.csv', delimiter=',', skip_header=1,
              missing_values='NA', filling_values=0)  # 更鲁棒（处理缺失）

# 内存映射（大文件不加载到内存）
mmap = np.memmap('large.dat', dtype=np.float32, mode='r', shape=(1000000, 100))
# 像普通数组一样使用，只在使用时从磁盘读取
\`\`\`

---

## 14. 常用 ML 场景速查

### 场景一：数据标准化

\`\`\`python
# Z-score 标准化
X = (X - X.mean(axis=0)) / X.std(axis=0)

# Min-Max 缩放到 [0, 1]
X = (X - X.min(axis=0)) / (X.max(axis=0) - X.min(axis=0))
\`\`\`

### 场景二：One-Hot 编码

\`\`\`python
def one_hot(labels, num_classes):
    one_hot = np.zeros((len(labels), num_classes))
    one_hot[np.arange(len(labels)), labels] = 1
    return one_hot

# 或用 np.eye
one_hot = np.eye(num_classes)[labels]
\`\`\`

### 场景三：混淆矩阵计算

\`\`\`python
def confusion_matrix_vals(y_true, y_pred, num_classes):
    cm = np.zeros((num_classes, num_classes), dtype=int)
    np.add.at(cm, (y_true, y_pred), 1)    # ufunc.at 无缓冲加法
    return cm
\`\`\`

### 场景四：滑动窗口 / 时间序列样本生成

\`\`\`python
def create_sequences(data, seq_len):
    """将时序数据转为 (samples, seq_len, features)"""
    n = len(data) - seq_len + 1
    strides = (data.strides[0], data.strides[0])
    return np.lib.stride_tricks.sliding_window_view(data, seq_len)
\`\`\`

### 场景五：距离计算

\`\`\`python
# 欧几里得距离矩阵 (batch 版)
# X: (m, d), Y: (n, d) → 距离矩阵: (m, n)
dist = np.sqrt(((X[:, np.newaxis] - Y)**2).sum(axis=2))

# 余弦相似度
X_norm = X / np.linalg.norm(X, axis=1, keepdims=True)
Y_norm = Y / np.linalg.norm(Y, axis=1, keepdims=True)
cosine_sim = X_norm @ Y_norm.T
\`\`\`

### 场景六：批量采样索引

\`\`\`python
# 随机批量采样
batch_indices = rng.choice(n_samples, size=batch_size, replace=False)
X_batch, y_batch = X[batch_indices], y[batch_indices]

# 顺序批量
for i in range(0, n_samples, batch_size):
    batch = slice(i, min(i + batch_size, n_samples))
    X[batch], y[batch]
\`\`\`

### 场景七：Softmax

\`\`\`python
def softmax(logits):
    exp = np.exp(logits - np.max(logits, axis=1, keepdims=True))
    return exp / exp.sum(axis=1, keepdims=True)
\`\`\`

### 场景八：NMS (非极大值抑制)

\`\`\`python
def nms(boxes, scores, threshold):
    """boxes: (N, 4) [x1,y1,x2,y2], scores: (N,)"""
    order = scores.argsort()[::-1]
    keep = []
    while order.size > 0:
        i = order[0]
        keep.append(i)
        xx1 = np.maximum(boxes[i, 0], boxes[order[1:], 0])
        yy1 = np.maximum(boxes[i, 1], boxes[order[1:], 1])
        xx2 = np.minimum(boxes[i, 2], boxes[order[1:], 2])
        yy2 = np.minimum(boxes[i, 3], boxes[order[1:], 3])
        w = np.maximum(0.0, xx2 - xx1)
        h = np.maximum(0.0, yy2 - yy1)
        iou = (w * h) / (np.maximum((boxes[order[1:],2]-boxes[order[1:],0]) *
                                     (boxes[order[1:],3]-boxes[order[1:],1]), 1e-8))
        order = order[1:][iou < threshold]
    return keep
\`\`\`

---

## 15. 性能技巧

### 向量化 > 循环

\`\`\`python
# ❌ 慢
for i in range(len(a)):
    result[i] = a[i] * 2 + b[i]

# ✅ 快
result = a * 2 + b
\`\`\`

### 用 ufunc.reduce 替代循环聚合

\`\`\`python
np.add.reduce(a, axis=0)          # 等价于 a.sum(axis=0)
np.multiply.reduce(a, axis=1)     # 沿轴累乘
np.maximum.reduce(a)              # 逐元素取最大（不是 reduce 但累积式）
\`\`\`

### 内存优化

\`\`\`python
# 指定恰当的类型
a = np.array([1, 2, 3], dtype=np.int8)    # 1字节/元素 vs 默认int64的8字节

# 使用视图而非拷贝
b = a.reshape(2, 3)         # 视图，0 拷贝
b = a[::2]                  # 视图
b = a[::-1]                 # 视图

# 检查是否共享内存
np.shares_memory(a, b)

# 就地操作避免分配
a += 1                       # 就地
a *= 2                       # 就地
np.add(a, 1, out=a)          # 就地（ufunc 的 out 参数）
\`\`\`

### 常用速度对比

\`\`\`python
a = np.random.rand(1000000)

a.sum()                    # C 实现，快
sum(a)                     # Python 循环，慢 10x+
np.vectorize(func)(a)      # 仅语法糖，不加速！用 ufunc 原生函数
\`\`\`

### 不要这样用 NumPy

\`\`\`python
# ❌ 不要在循环中不断 append → 每次重新分配内存
for x in range(100000):
    arr = np.append(arr, x)   # O(n²)!

# ✅ 预分配或用 list 再转换
result = np.empty(100000)
for i, x in enumerate(range(100000)):
    result[i] = x
\`\`\`

---

## 16. 常用函数速查表

| 类别 | 常用函数 |
|------|----------|
| 创建 | \`array\`, \`zeros\`, \`ones\`, \`eye\`, \`arange\`, \`linspace\`, \`meshgrid\` |
| 形状 | \`reshape\`, \`ravel\`, \`flatten\`, \`T\`, \`expand_dims\`, \`squeeze\` |
| 拼接 | \`concatenate\`, \`vstack\`, \`hstack\`, \`stack\` |
| 数学 | \`sum\`, \`mean\`, \`std\`, \`min\`, \`max\`, \`argmin\`, \`argmax\`, \`clip\` |
| 线性代数 | \`@\`, \`dot\`, \`linalg.inv\`, \`linalg.svd\`, \`linalg.solve\`, \`einsum\` |
| 随机 | \`default_rng()\`, \`normal\`, \`uniform\`, \`choice\`, \`shuffle\` |
| 逻辑 | \`where\`, \`all\`, \`any\`, \`isnan\`, \`isclose\`, \`logical_and\` |
| 排序 | \`sort\`, \`argsort\`, \`argpartition\`, \`unique\` |
| I/O | \`save\`, \`load\`, \`loadtxt\`, \`genfromtxt\` |

---

## 17. 与 Pandas / sklearn / PyTorch 衔接

\`\`\`python
# NumPy → Pandas
import pandas as pd
df = pd.DataFrame(X, columns=['f1', 'f2', 'f3'])
df['target'] = y

# Pandas → NumPy
X = df[['f1', 'f2']].values     # 或 .to_numpy()
y = df['target'].values

# NumPy → sklearn
from sklearn.linear_model import LogisticRegression
model = LogisticRegression()
model.fit(X_np, y_np)

# NumPy → PyTorch
import torch
tensor = torch.from_numpy(X_np)       # 共享内存
X_np_back = tensor.numpy()            # 转回 NumPy

# NumPy → TensorFlow
import tensorflow as tf
tensor = tf.convert_to_tensor(X_np)
\`\`\`
`;export{e as default};