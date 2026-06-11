# SciPy 全面使用总结

## 1. 简介

SciPy 是建立在 NumPy 之上的科学计算库，覆盖数值积分、优化、信号处理、统计、线性代数等领域。

```python
import numpy as np
import scipy
from scipy import constants, special, integrate, optimize, interpolate
from scipy import fft, signal, linalg, sparse, stats, ndimage
from scipy import io, spatial, cluster

print(scipy.__version__)
```

---

## 2. 常量模块 — `scipy.constants`

### 物理常量

```python
from scipy.constants import c, g, G, h, e, k, N_A, R, pi, golden
# c=光速, g=重力加速度, G=引力常数, h=普朗克常数
# e=元电荷, k=玻尔兹曼常数, N_A=阿伏伽德罗常数, R=气体常数

from scipy.constants import physical_constants
# physical_constants['electron mass']  # (值, 单位, 不确定度)
# physical_constants['speed of light in vacuum']
# physical_constants['Planck constant']
# physical_constants['Boltzmann constant']
```

### 单位转换

```python
from scipy.constants import kilo, mega, milli, micro, nano, pico
from scipy.constants import inch, foot, mile, km, cm, mm
from scipy.constants import hour, minute, day, year
from scipy.constants import atm, bar, psi, mmHg, torr
from scipy.constants import eV, calorie, horsepower

# 使用
distance = 100 * mile  # 英里转米
pressure = 3 * atm     # 大气压转帕斯卡
energy = 5 * eV        # 电子伏特转焦耳
```

---

## 3. 特殊函数 — `scipy.special`

```python
from scipy import special

# 贝塞尔函数
special.jv(0, 1.5)       # 第一类贝塞尔函数 J0(1.5)
special.jv(1, np.linspace(0, 10, 100))
special.yv(0, 1.5)       # 第二类贝塞尔函数

# Gamma 与阶乘
special.gamma(5)          # = 24.0
special.factorial(5)      # = 120.0
special.gammaln(100)      # ln(Gamma(100))，避免溢出
special.beta(2, 3)        # Beta 函数
special.comb(10, 3)       # 组合数 C(10,3)
special.perm(10, 3)       # 排列数 P(10,3)

# 误差函数
special.erf(1.0)          # 误差函数
special.erfc(1.0)         # 互补误差函数 1-erf(x)
special.erfinv(0.5)       # 逆误差函数

# 椭圆积分
special.ellipe(0.5)       # 第二类完全椭圆积分

# 艾里、勒让德、拉盖尔、埃尔米特、切比雪夫多项式等
special.legendre(3)       # 3 阶勒让德多项式
special.eval_legendre(3, 0.5)  # P3(0.5)
special.hermite(4)        # 4 阶 Hermite 多项式
```

---

## 4. 数值积分 — `scipy.integrate`

### 定积分

```python
from scipy import integrate

# 自适应积分
result, error = integrate.quad(lambda x: np.sin(x)**2, 0, np.pi)
# result=1.5708, error≈1e-14

# 带参数的积分
integrate.quad(lambda x, a, b: a*x**2 + b, 0, 1, args=(2, 3))

# 无穷积分
integrate.quad(lambda x: np.exp(-x**2), -np.inf, np.inf)  # → sqrt(pi)

# 奇点积分（points 指定奇点位置）
integrate.quad(lambda x: 1/np.sqrt(np.abs(x)), -1, 1, points=[0])
```

### 多重积分

```python
# 二重积分
integrate.dblquad(lambda y, x: x*y, 0, 1, lambda x: 0, lambda x: 1-x)

# 三重积分
integrate.tplquad(lambda z, y, x: x*y*z, 0, 1,
                  lambda x: 0, lambda x: 1-x,
                  lambda x, y: 0, lambda x, y: 1-x-y)
```

### 常微分方程 ODE

```python
# 求解 dy/dt = f(t, y)
def f(t, y):
    return -2 * y + np.sin(t)  # dy/dt = -2y + sin(t)

sol = integrate.solve_ivp(f, [0, 10], [1.0],  # t 范围, 初始值 y(0)=1
                          t_eval=np.linspace(0, 10, 100),
                          method='RK45')  # 默认方法
# sol.t → 时间点, sol.y[0] → y 值

# 刚性 ODE 用 method='Radau' 或 'BDF'
# method 选项: 'RK45'(默认), 'RK23', 'DOP853', 'Radau', 'BDF', 'LSODA'
```

### 梯形法则与辛普森

```python
x = np.linspace(0, np.pi, 100)
y = np.sin(x)

integrate.trapezoid(y, x)     # 梯形法
integrate.simpson(y, x)       # 辛普森法
integrate.romb(y, dx=x[1]-x[0])  # Romberg 法（需要 2^k+1 个点）
```

---

## 5. 优化与求根 — `scipy.optimize`

### 函数最小化

```python
from scipy import optimize

# 局部优化
def f(x):
    return (x[0] - 1)**2 + (x[1] - 2.5)**2

result = optimize.minimize(f, [0, 0], method='BFGS')
# result.x → 最优点, result.fun → 最小值

# 方法选择
# 'Nelder-Mead' — 无梯度，非光滑函数
# 'BFGS', 'L-BFGS-B' — 拟牛顿法，后者支持边界
# 'CG' — 共轭梯度
# 'Powell' — 不需要导数
# 'trust-constr' — 约束优化
# 'SLSQP' — 序列最小二乘

# 带边界
bounds = [(0, None), (0, None)]  # x0≥0, x1≥0
optimize.minimize(f, [0, 0], bounds=bounds, method='L-BFGS-B')

# 带约束
cons = ({'type': 'eq', 'fun': lambda x: x[0] + x[1] - 1})  # x0 + x1 = 1
optimize.minimize(f, [0, 0], constraints=cons, method='SLSQP')
```

### 全局优化

```python
# 差分进化
optimize.differential_evolution(f, bounds=[(-5, 5), (-5, 5)])

# basin-hopping
optimize.basinhopping(f, [0, 0], niter=100)
```

### 方程求根

```python
# 单变量求根
f = lambda x: x**3 - 2*x - 5
optimal = optimize.root_scalar(f, method='brentq', bracket=[2, 3])
# 或 optimize.newton(f, x0=2) — 牛顿法

# 多变量方程组
def system(v):
    x, y = v
    return [x**2 + y**2 - 4, x*y - 1]

sol = optimize.root(system, [1, 1])
# sol.x → 解
```

### 曲线拟合

```python
# 最小二乘拟合
def model(x, a, b, c):
    return a * np.exp(-b * x) + c

xdata = np.linspace(0, 4, 50)
ydata = 2.5 * np.exp(-1.3 * xdata) + 0.5 + 0.1 * np.random.randn(50)

popt, pcov = optimize.curve_fit(model, xdata, ydata, p0=[1, 1, 0])
# popt → [a, b, c] 最优参数
# pcov → 协方差矩阵
# np.sqrt(np.diag(pcov)) → 参数标准差
```

### 线性规划

```python
# minimize: c @ x  subject to  A_ub @ x <= b_ub, A_eq @ x == b_eq
c = [-1, 4]  # 目标函数系数（最小化）
A_ub = [[-3, 1], [1, 2]]
b_ub = [6, 4]
bounds = [(None, None), (-3, None)]

result = optimize.linprog(c, A_ub=A_ub, b_ub=b_ub, bounds=bounds, method='highs')
```

---

## 6. 插值 — `scipy.interpolate`

### 一维插值

```python
from scipy import interpolate

x = np.linspace(0, 10, 10)
y = np.sin(x)
f = interpolate.interp1d(x, y, kind='cubic', fill_value='extrapolate')
xnew = np.linspace(0, 10, 100)
ynew = f(xnew)

# kind: 'linear'(默认), 'nearest', 'nearest-up', 'zero',
#       'slinear', 'quadratic', 'cubic', 'previous', 'next'
```

### 样条插值

```python
# B-样条
tck = interpolate.splrep(x, y, s=0)       # 求样条表示(s=0=精确插值)
ynew = interpolate.splev(xnew, tck)

# CubicSpline（推荐）
cs = interpolate.CubicSpline(x, y, bc_type='natural')
ynew = cs(xnew)
# 可直接求导
dydx = cs.derivative()(xnew)
d2y = cs.derivative(nu=2)(xnew)

# 光滑样条（s 越大越光滑）
spl = interpolate.UnivariateSpline(x, y, s=2)
```

### 二维插值

```python
# 规则网格
z = np.random.rand(5, 5)
f = interpolate.interp2d(np.arange(5), np.arange(5), z, kind='cubic')
f(np.linspace(0, 4, 100), np.linspace(0, 4, 100))

# 散乱数据
points = np.random.rand(100, 2)
values = np.random.rand(100)
interpolate.griddata(points, values, (grid_x, grid_y), method='cubic')
# method: 'linear', 'nearest', 'cubic'
```

---

## 7. 快速傅里叶变换 — `scipy.fft`

```python
from scipy import fft

N = 600
T = 1.0 / 800.0
x = np.linspace(0, N*T, N)
y = np.sin(50*2*np.pi*x) + 0.5*np.sin(80*2*np.pi*x) + np.random.randn(N)*0.1

yf = fft.fft(y)                           # 正变换
xf = fft.fftfreq(N, T)[:N//2]             # 频率轴

# 功率谱
power = 2.0/N * np.abs(yf[:N//2])

# 逆变换
y_reconstructed = fft.ifft(yf)

# 实信号优化
yf = fft.rfft(y)                          # 仅正频率
xf = fft.rfftfreq(N, T)

# 二维 FFT
fft.fft2(image)
fft.ifft2(spectrum)

# FFT 卷积（比直接卷积快）
fft.fftconvolve(signal, kernel)
```

---

## 8. 信号处理 — `scipy.signal`

### 滤波

```python
from scipy import signal

# 设计滤波器
b, a = signal.butter(4, 0.1, 'low')      # 4 阶 Butterworth 低通
b, a = signal.butter(4, [0.1, 0.4], 'bandpass')
b, a = signal.cheby1(4, 0.5, 0.1, 'low') # Chebyshev I 型

# 应用滤波器
filtered = signal.filtfilt(b, a, y)       # 零相位滤波（前向+反向）
filtered = signal.lfilter(b, a, y)        # 单向滤波

# 直接频率域滤波
sos = signal.butter(4, 0.1, 'low', output='sos')  # 推荐 sos 格式
filtered = signal.sosfiltfilt(sos, y)
```

### 频谱分析

```python
f, Pxx = signal.periodogram(y, fs=800)
f, Pxx = signal.welch(y, fs=800, nperseg=256)  # Welch 平均周期图
f, t, Sxx = signal.spectrogram(y, fs=800)      # 时频谱
```

### 峰值检测

```python
peaks, properties = signal.find_peaks(y, height=0.5, distance=20,
                                      prominence=0.3, width=5)
# 低谷
valleys, _ = signal.find_peaks(-y)
```

### 卷积与相关

```python
# 卷积
signal.convolve(a, b, mode='same')
signal.fftconvolve(a, b, mode='same')    # FFT 卷积

# 相关
signal.correlate(a, b, mode='same')
```

### 其他

```python
# 重采样
signal.resample(y, num)                  # FFT 重采样
signal.resample_poly(y, up=3, down=2)    # 有理数倍重采样

# 去趋势
signal.detrend(y)

# Hilbert 变换
signal.hilbert(y)

# 下采样（先低通滤波防混叠）
signal.decimate(y, q=4)

# 中值滤波
signal.medfilt(y, kernel_size=5)
```

---

## 9. 线性代数 — `scipy.linalg`

```python
from scipy import linalg

A = np.array([[3, 2], [1, 4]])
b = np.array([5, 6])
```

### 矩阵分解

```python
# LU 分解
P, L, U = linalg.lu(A)

# QR 分解
Q, R = linalg.qr(A)

# Cholesky 分解（对称正定）
L = linalg.cholesky(A)

# 特征值
eigenvalues, eigenvectors = linalg.eig(A)
# 对称矩阵用 eigh 更快
eigenvalues, eigenvectors = linalg.eigh(A)

# SVD
U, s, Vh = linalg.svd(A)
```

### 求解线性方程组

```python
x = linalg.solve(A, b)         # Ax = b
# 最小二乘
x, residuals, rank, s = linalg.lstsq(A, b)
```

### 矩阵函数

```python
linalg.inv(A)                  # 逆矩阵
linalg.det(A)                  # 行列式
linalg.norm(A)                 # 范数
linalg.expm(A)                 # 矩阵指数
linalg.logm(A)                 # 矩阵对数
linalg.sqrtm(A)                # 矩阵平方根
linalg.expm_multiply(A, b)     # exp(A) @ b（无需显式计算 expm）
linalg.pinv(A)                 # Moore-Penrose 伪逆
linalg.kron(A, B)              # Kronecker 积
```

### 特殊矩阵

```python
linalg.hilbert(5)              # Hilbert 矩阵
linalg.toeplitz([1, 2, 3])     # Toeplitz 矩阵
linalg.circulant([1, 2, 3, 4]) # 循环矩阵
linalg.hadamard(4)             # Hadamard 矩阵
```

---

## 10. 稀疏矩阵 — `scipy.sparse`

```python
from scipy import sparse

# 创建稀疏矩阵
row = [0, 0, 1, 1, 2]
col = [0, 2, 1, 2, 2]
data = [1, 2, 3, 4, 5]

csr = sparse.csr_matrix((data, (row, col)), shape=(3, 3))
csc = sparse.csc_matrix((data, (row, col)), shape=(3, 3))
coo = sparse.coo_matrix((data, (row, col)), shape=(3, 3))

# 格式转换
csr.tocsc().todense().toarray()

# 从密集矩阵创建
csr = sparse.csr_matrix(np.eye(1000))

# 线性运算
csr @ x_vector                # 矩阵-向量乘法，自动用稀疏算法
b = sparse.linalg.spsolve(A_sparse, b_vector)  # 稀疏求解
```

### 稀疏格式选择

| 格式 | 适用场景 |
|------|----------|
| `csr` | 行切片、矩阵-向量积（最常用） |
| `csc` | 列切片（类似 csr 但对列） |
| `coo` | 增量构建 |
| `lil` | 逐步修改元素 |
| `dok` | 按坐标读写 |
| `dia` | 对角带状矩阵 |
| `bsr` | 块稀疏矩阵 |

---

## 11. 统计 — `scipy.stats`

```python
from scipy import stats
```

### 概率分布

```python
# 所有分布均为 rvs/pdf/cdf/ppf 统一接口
dist = stats.norm(loc=0, scale=1)   # 正态分布

samples = dist.rvs(size=1000)       # 随机采样
p = dist.pdf(0)                     # 概率密度 f(0)
P = dist.cdf(1.96)                  # 累积概率 F(1.96)
q = dist.ppf(0.975)                 # 分位数（逆 CDF）
mean, var = dist.stats(moments='mv')

# 常用分布
stats.norm(loc, scale)              # 正态（高斯）
stats.lognorm(s, loc, scale)        # 对数正态
stats.uniform(loc, scale)           # 均匀
stats.expon(loc, scale)             # 指数
stats.gamma(a, loc, scale)          # Gamma
stats.beta(a, b)                    # Beta
stats.t(df)                         # t 分布
stats.f(dfn, dfd)                   # F 分布
stats.chi2(df)                      # χ² 分布
stats.binom(n, p)                   # 二项
stats.poisson(mu)                   # 泊松
stats.bernoulli(p)                  # 伯努利
stats.geom(p)                       # 几何
```

### 描述统计

```python
stats.describe(data)                # 综合描述
stats.gmean(data)                   # 几何平均
stats.hmean(data)                   # 调和平均
stats.trim_mean(data, 0.1)          # 10% 截尾均值
stats.mode(data)                    # 众数
stats.skew(data)                    # 偏度
stats.kurtosis(data)                # 峰度（超额峰度）
stats.iqr(data)                     # 四分位距
stats.sem(data)                     # 均值标准误
stats.zscore(data)                  # Z 分数标准化
```

### 统计检验

```python
# t 检验
stats.ttest_1samp(data, popmean=0)           # 单样本 t 检验
stats.ttest_ind(group1, group2)              # 独立双样本 t 检验
stats.ttest_rel(before, after)               # 配对 t 检验

# 非参数检验
stats.mannwhitneyu(group1, group2)           # Mann-Whitney U
stats.wilcoxon(before, after)                # Wilcoxon 符号秩
stats.kruskal(*groups)                       # Kruskal-Wallis H

# 正态性检验
stats.shapiro(data)                          # Shapiro-Wilk
stats.normaltest(data)                       # D'Agostino's K²
stats.kstest(data, 'norm', args=(mu, sigma)) # Kolmogorov-Smirnov

# 方差检验
stats.levene(*groups)                        # Levene 检验
stats.bartlett(*groups)                      # Bartlett 检验

# 其他
stats.pearsonr(x, y)                         # Pearson 相关系数
stats.spearmanr(x, y)                        # Spearman 秩相关
stats.chi2_contingency(contingency_table)    # χ² 独立性检验
stats.f_oneway(*groups)                      # 单因素 ANOVA
```

### 线性回归

```python
slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)
```

### 概率图

```python
stats.probplot(data, dist='norm', plot=plt)  # Q-Q 图
```

---

## 12. 图像处理 — `scipy.ndimage`

```python
from scipy import ndimage

img = np.random.rand(100, 100)
```

### 滤波

```python
# 高斯滤波
ndimage.gaussian_filter(img, sigma=2)
ndimage.gaussian_filter1d(signal, sigma=3)

# 其他滤波
ndimage.median_filter(img, size=3)           # 中值滤波
ndimage.uniform_filter(img, size=5)          # 均值滤波
ndimage.minimum_filter(img, size=3)          # 最小值（腐蚀）
ndimage.maximum_filter(img, size=3)          # 最大值（膨胀）
ndimage.sobel(img, axis=0)                   # Sobel 边缘检测
ndimage.laplace(img)                         # 拉普拉斯
ndimage.prewitt(img)                         # Prewitt
```

### 形态学操作

```python
ndimage.binary_erosion(mask, iterations=2)
ndimage.binary_dilation(mask, iterations=2)
ndimage.binary_opening(mask, iterations=2)
ndimage.binary_closing(mask, iterations=2)
```

### 几何变换

```python
ndimage.rotate(img, angle=45, reshape=True)
ndimage.zoom(img, zoom=(0.5, 0.5))           # 缩放
ndimage.shift(img, shift=(10, -5))           # 平移
ndimage.affine_transform(img, matrix)        # 仿射变换
ndimage.map_coordinates(img, coords)         # 按坐标映射
```

### 测量与标记

```python
# 连通域标记
labeled, num_features = ndimage.label(mask > threshold)
sizes = ndimage.sum(mask, labeled, range(num_features + 1))

# 质心
com = ndimage.center_of_mass(img)

# 距离变换
ndimage.distance_transform_edt(mask)         # 欧几里得距离

# 插值
ndimage.zoom(img, 2.0, order=3)              # order: 0(nearest), 1(linear), 3(cubic)
```

---

## 13. 空间算法 — `scipy.spatial`

### 距离计算

```python
from scipy.spatial import distance

distance.euclidean(p1, p2)               # 欧几里得
distance.manhattan(p1, p2)               # 曼哈顿
distance.chebyshev(p1, p2)               # 切比雪夫
distance.cosine(p1, p2)                  # 余弦距离
distance.correlation(p1, p2)             # 相关系数距离
distance.jaccard(b1, b2)                 # Jaccard

# 成对距离
distance.cdist(XA, XB, metric='euclidean')
distance.pdist(X, metric='euclidean')    # 压缩形式
distance.squareform(d)                   # 压缩→方阵
```

### KDTree — 最近邻搜索

```python
from scipy.spatial import KDTree

points = np.random.rand(1000, 3)
tree = KDTree(points)

# 查询最近的 k 个邻居
distances, indices = tree.query(query_point, k=5)
# 范围查询
indices = tree.query_ball_point(query_point, r=0.1)
# 批量查询
distances, indices = tree.query(query_points, k=5)
```

### Delaunay 三角剖分与凸包

```python
from scipy.spatial import Delaunay, ConvexHull

points = np.random.rand(30, 2)

tri = Delaunay(points)                   # Delaunay 三角剖分
# tri.simplices → 每个三角形的顶点索引

hull = ConvexHull(points)                # 凸包
# hull.vertices → 凸包顶点索引
# hull.area → 面积
# hull.volume → 体积(D>2)

from scipy.spatial import Voronoi
vor = Voronoi(points)                    # Voronoi 图
```

---

## 14. 聚类 — `scipy.cluster`

### 层次聚类

```python
from scipy.cluster import hierarchy
from scipy.cluster.hierarchy import dendrogram, linkage, fcluster

X = np.random.rand(20, 2)
Z = linkage(X, method='ward')            # 层次聚类
# method: 'single', 'complete', 'average', 'weighted', 'centroid', 'median', 'ward'

# 树状图
dendrogram(Z, labels=labels)
plt.show()

# 切分聚类
clusters = fcluster(Z, t=3, criterion='maxclust')  # 3 个簇
clusters = fcluster(Z, t=1.5, criterion='distance')  # 距离阈值
```

### K-means

```python
from scipy.cluster.vq import kmeans, vq

centroids, distortion = kmeans(data, k_or_guess=3, iter=20)
cluster_ids, distances = vq(data, centroids)  # 分配簇
```

---

## 15. 文件 I/O — `scipy.io`

### MATLAB 文件

```python
from scipy import io

# 读写 .mat 文件
data = io.loadmat('data.mat')            # 返回 dict
io.savemat('output.mat', {'x': x, 'A': A})

# WAV 音频
from scipy.io import wavfile
rate, audio = wavfile.read('audio.wav')
wavfile.write('output.wav', rate, audio)

# ARFF（Weka 格式）
# io.arff.loadarff('data.arff')
```

### 稀疏矩阵文件

```python
# Matrix Market 格式
sparse_matrix = io.mmread('matrix.mtx')
io.mmwrite('matrix.mtx', sparse_matrix)
```

---

## 16. ODR（正交距离回归）— `scipy.odr`

当 x 和 y 都有测量误差时使用（普通回归只考虑 y 的误差）：

```python
from scipy import odr

def linear_func(params, x):
    return params[0] * x + params[1]

model = odr.Model(linear_func)
data = odr.RealData(x, y, sx=x_err, sy=y_err)
odr_obj = odr.ODR(data, model, beta0=[1.0, 0.0])
result = odr_obj.run()

# result.beta → 参数
# result.sd_beta → 参数标准差
```

---

## 17. 常用模块速查

| 模块 | 典型用途 |
|------|----------|
| `scipy.constants` | 物理常量、单位转换 |
| `scipy.special` | Gamma、贝塞尔、误差函数 |
| `scipy.integrate` | 定积分、ODE 求解 |
| `scipy.optimize` | 最小化、求根、曲线拟合、线性规划 |
| `scipy.interpolate` | 样条插值、griddata |
| `scipy.fft` | 傅里叶变换、功率谱 |
| `scipy.signal` | 滤波器设计、频谱、卷积 |
| `scipy.linalg` | 矩阵分解、求解 Ax=b、特殊矩阵 |
| `scipy.sparse` | CSR/CSC 稀疏矩阵、稀疏求解 |
| `scipy.stats` | 概率分布、统计检验 |
| `scipy.ndimage` | 高斯滤波、形态学、几何变换 |
| `scipy.spatial` | KDTree、距离、Delaunay、凸包 |
| `scipy.cluster` | 层次聚类、K-means |
| `scipy.io` | 读写 .mat、wav 文件 |
| `scipy.odr` | 正交距离回归 |
