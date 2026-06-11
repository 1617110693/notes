# Matplotlib 全面使用总结

## 1. 基本概念

### 架构层次

Matplotlib 有三层架构：

| 层级 | 说明 |
|------|------|
| `pyplot` | 高层命令式 API，类似 MATLAB 风格，适合快速绘图 |
| `Artist` | 中间层，所有可见元素（图形、坐标轴、线条等）都是 Artist 对象 |
| `Backend` | 底层渲染层，负责将图形输出到屏幕/文件 |

### Figure 和 Axes

- **Figure**：整个图形窗口/画布，可以包含多个子图
- **Axes**：实际的绘图区域（一个 Figure 可以有多个 Axes）

```python
import matplotlib.pyplot as plt
import numpy as np

fig = plt.figure()          # 创建 Figure
ax = fig.add_subplot(111)   # 添加 Axes（1行1列第1个）
# 或一步到位：fig, ax = plt.subplots()
```

---

## 2. 导入与基本设置

```python
import matplotlib.pyplot as plt
import matplotlib
import numpy as np

# 中文支持
plt.rcParams['font.sans-serif'] = ['SimHei', 'Microsoft YaHei', 'WenQuanYi Micro Hei']
plt.rcParams['axes.unicode_minus'] = False  # 解决负号显示问题

# 全局设置
plt.rcParams['figure.figsize'] = (10, 6)
plt.rcParams['figure.dpi'] = 100
```

### 绘图风格

```python
print(plt.style.available)   # 查看可用风格
plt.style.use('ggplot')      # 使用 ggplot 风格
plt.style.use('seaborn-v0_8-darkgrid')
plt.style.use('default')     # 恢复默认
```

常用风格：`'ggplot'`, `'seaborn-v0_8'`, `'fivethirtyeight'`, `'bmh'`, `'dark_background'`, `'grayscale'`

---

## 3. 折线图 (Line Plot)

```python
x = np.linspace(0, 10, 100)
y = np.sin(x)

# 基本折线图
plt.plot(x, y, color='blue', linestyle='-', linewidth=2, marker='o', markersize=4, label='sin(x)')
plt.xlabel('X 轴')
plt.ylabel('Y 轴')
plt.title('折线图示例')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()
```

### 线条样式

- **颜色**：`'r'`, `'g'`, `'b'`, `'c'`, `'m'`, `'y'`, `'k'`, `'w'` 或十六进制 `'#FF0000'`
- **线型**：`'-'`实线, `'--'`虚线, `'-.'`点划线, `':'`点线
- **标记**：`'o'`圆, `'s'`正方形, `'^'`三角, `'*'`星号, `'D'`菱形, `'+'`加号, `'x'`叉号

---

## 4. 散点图 (Scatter Plot)

```python
x = np.random.randn(100)
y = np.random.randn(100)
colors = np.random.rand(100)
sizes = np.random.rand(100) * 100

plt.scatter(x, y, c=colors, s=sizes, alpha=0.6, cmap='viridis', edgecolors='w', linewidth=0.5)
plt.colorbar(label='颜色映射')
plt.show()
```

- `c`：颜色或数值数组
- `s`：点的大小
- `cmap`：颜色映射（`'viridis'`, `'plasma'`, `'coolwarm'`, `'RdYlBu'` 等）
- `alpha`：透明度

---

## 5. 柱状图 (Bar Chart)

### 垂直柱状图

```python
categories = ['A', 'B', 'C', 'D', 'E']
values = [23, 45, 56, 78, 32]

bars = plt.bar(categories, values, color='steelblue', edgecolor='black', width=0.6)
# 在柱子上标注数值
for bar, val in zip(bars, values):
    plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1, str(val),
             ha='center', va='bottom')
plt.show()
```

### 水平柱状图

```python
plt.barh(categories, values, color='coral', edgecolor='black')
```

### 分组柱状图

```python
x = np.arange(len(categories))
width = 0.35
plt.bar(x - width/2, values1, width, label='组1')
plt.bar(x + width/2, values2, width, label='组2')
plt.xticks(x, categories)
plt.legend()
```

### 堆叠柱状图

```python
plt.bar(categories, values1, label='部分1')
plt.bar(categories, values2, bottom=values1, label='部分2')
plt.legend()
```

---

## 6. 直方图 (Histogram)

```python
data = np.random.randn(1000)

plt.hist(data, bins=30, color='skyblue', edgecolor='black', density=True, alpha=0.7)
plt.axvline(np.mean(data), color='red', linestyle='--', label=f'均值={np.mean(data):.2f}')
plt.xlabel('数值')
plt.ylabel('频率密度' if density else '频数')
plt.legend()
plt.show()
```

- `bins`：柱子数量或区间边界数组
- `density=True`：显示概率密度而非频数
- `cumulative=True`：累积直方图
- `histtype`：`'bar'`, `'step'`, `'stepfilled'`

---

## 7. 饼图 (Pie Chart)

```python
labels = ['Python', 'Java', 'C++', 'JavaScript', 'Other']
sizes = [35, 25, 20, 15, 5]
explode = (0.05, 0, 0, 0, 0)  # 突出第一块
colors = plt.cm.Set3(range(len(labels)))

plt.pie(sizes, labels=labels, autopct='%1.2f%%', startangle=90,
        explode=explode, colors=colors, shadow=False,
        wedgeprops={'edgecolor': 'white', 'linewidth': 1})
plt.axis('equal')  # 确保是正圆
plt.title('编程语言使用比例')
plt.show()
```

- `autopct`：百分比格式字符串
- `startangle`：起始角度
- `pctdistance`：百分比文字距圆心距离
- `labeldistance`：标签距圆心距离

---

## 8. 箱线图 (Box Plot)

```python
data = [np.random.randn(100) for _ in range(4)]

bp = plt.boxplot(data, labels=['A', 'B', 'C', 'D'], patch_artist=True,
                 showmeans=True, meanline=True)
# 自定义颜色
for patch, color in zip(bp['boxes'], ['lightblue', 'lightgreen', 'lightsalmon', 'plum']):
    patch.set_facecolor(color)

plt.ylabel('数值')
plt.title('箱线图示例')
plt.show()
```

- `showfliers`：是否显示异常值
- `showmeans`：是否显示均值
- `vert=False`：水平箱线图

---

## 9. 热力图 (Heatmap)

```python
data = np.random.rand(10, 10)

plt.imshow(data, cmap='hot', interpolation='nearest', aspect='auto')
plt.colorbar(label='强度')
plt.xticks(range(10))
plt.yticks(range(10))

# 在每个格子标注数值
for i in range(10):
    for j in range(10):
        plt.text(j, i, f'{data[i,j]:.2f}', ha='center', va='center',
                 color='white' if data[i,j] < 0.5 else 'black')

plt.show()
```

也可以使用 `plt.matshow()` 或 `seaborn.heatmap()`（更推荐后者）。

---

## 10. 等高线图 (Contour)

```python
x = np.linspace(-3, 3, 100)
y = np.linspace(-3, 3, 100)
X, Y = np.meshgrid(x, y)
Z = np.sin(X) * np.cos(Y)

# 填充等高线
plt.contourf(X, Y, Z, levels=20, cmap='RdYlBu', alpha=0.8)
# 等高线
contours = plt.contour(X, Y, Z, levels=10, colors='black', linewidths=0.5)
plt.clabel(contours, inline=True, fontsize=8)  # 标注等高线值
plt.colorbar()
plt.show()
```

---

## 11. 3D 绘图

```python
from mpl_toolkits.mplot3d import Axes3D

fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')

# 3D 散点
x, y, z = np.random.randn(3, 100)
ax.scatter(x, y, z, c=z, cmap='viridis')

# 3D 曲面
X = np.linspace(-5, 5, 100)
Y = np.linspace(-5, 5, 100)
X, Y = np.meshgrid(X, Y)
Z = np.sin(np.sqrt(X**2 + Y**2))
ax.plot_surface(X, Y, Z, cmap='coolwarm', alpha=0.8)

# 3D 线图
theta = np.linspace(-4*np.pi, 4*np.pi, 200)
z = np.linspace(-2, 2, 200)
r = z**2 + 1
x = r * np.sin(theta)
y = r * np.cos(theta)
ax.plot(x, y, z, label='3D 螺旋线')

ax.set_xlabel('X'), ax.set_ylabel('Y'), ax.set_zlabel('Z')
plt.show()
```

---

## 12. 极坐标图

```python
theta = np.linspace(0, 2*np.pi, 100)
r = 1 + np.sin(6*theta)

fig, ax = plt.subplots(subplot_kw={'projection': 'polar'})
ax.plot(theta, r, color='red', linewidth=2)
ax.fill(theta, r, alpha=0.3)
ax.set_title('极坐标图', va='bottom')
plt.show()
```

---

## 13. 子图布局 (Subplots)

### 基本 subplots

```python
fig, axes = plt.subplots(2, 3, figsize=(12, 8))  # 2行3列
axes = axes.flatten()  # 展平为一维数组方便索引

for i, ax in enumerate(axes):
    ax.plot(x, np.sin(x + i), color=f'C{i}')
    ax.set_title(f'Plot {i+1}')

plt.tight_layout()  # 自动调整间距
plt.show()
```

### GridSpec 复杂布局

```python
from matplotlib.gridspec import GridSpec

fig = plt.figure(figsize=(12, 8))
gs = GridSpec(3, 3, figure=fig)

ax1 = fig.add_subplot(gs[0, :])      # 第一行占满
ax2 = fig.add_subplot(gs[1, :2])     # 第二行占两列
ax3 = fig.add_subplot(gs[1, 2])      # 第二行第三列
ax4 = fig.add_subplot(gs[2, 0])      # 第三行每列各一个
ax5 = fig.add_subplot(gs[2, 1])
ax6 = fig.add_subplot(gs[2, 2])

plt.tight_layout()
```

### 不等比例

```python
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5),
                                gridspec_kw={'width_ratios': [3, 1]})
```

### 共享坐标轴

```python
fig, (ax1, ax2) = plt.subplots(1, 2, sharey=True)   # 共享 Y 轴
fig, (ax1, ax2) = plt.subplots(2, 1, sharex=True)   # 共享 X 轴
```

---

## 14. 图例 (Legend)

```python
plt.plot(x, y1, label='Line 1')
plt.plot(x, y2, label='Line 2')

plt.legend(
    loc='upper right',       # 位置
    fontsize=10,             # 字体大小
    frameon=True,            # 边框
    fancybox=True,           # 圆角边框
    shadow=True,             # 阴影
    ncol=2,                  # 列数
    bbox_to_anchor=(1.05, 1) # 放在图外
)
```

常用 `loc` 值：`'best'`, `'upper right'`, `'upper left'`, `'lower left'`, `'lower right'`, `'center'`

---

## 15. 坐标轴与刻度

```python
# 设置范围
plt.xlim(0, 10)
plt.ylim(-2, 2)

# 对数坐标
plt.xscale('log')
plt.yscale('log')

# 刻度
plt.xticks([0, 2, 4, 6, 8, 10], ['零', '二', '四', '六', '八', '十'])
plt.yticks(np.arange(-2, 2.5, 0.5))

# 次刻度
from matplotlib.ticker import AutoMinorLocator
ax.xaxis.set_minor_locator(AutoMinorLocator(5))
ax.grid(which='minor', alpha=0.2)

# 双 Y 轴
ax2 = ax1.twinx()
ax2.plot(x, y2, color='red', label='第二个Y轴')
ax2.set_ylabel('右侧Y轴')
```

### 自定义刻度格式

```python
from matplotlib.ticker import FuncFormatter, MultipleLocator, FormatStrFormatter

ax.xaxis.set_major_locator(MultipleLocator(0.5))  # 主刻度间距
ax.yaxis.set_major_formatter(FormatStrFormatter('%.2f'))  # 保留两位小数
ax.yaxis.set_major_formatter(FuncFormatter(lambda x, p: f'{x:.1f}%'))
```

---

## 16. 注释与文本

```python
# 基本文本
plt.text(x, y, '文字内容', fontsize=12, ha='center', va='center',
         bbox=dict(boxstyle='round,pad=0.3', facecolor='yellow', alpha=0.5))

# 带箭头的注释
plt.annotate('关键点', xy=(x0, y0), xytext=(x0+1, y0+1),
             arrowprops=dict(arrowstyle='->', color='red', lw=1.5),
             fontsize=10, ha='center')

# 数学公式（LaTeX）
plt.title(r'$\sin(x) = \sum_{n=0}^{\infty} \frac{(-1)^n x^{2n+1}}{(2n+1)!}$')
```

箭头样式：`'->'`, `'<-'`, `'<->'`, `'fancy'`, `'simple'`, `'wedge'`

---

## 17. 颜色与颜色映射 (Colormap)

### 常用 Colormap

| 类型 | 示例 |
|------|------|
| 顺序型 | `'viridis'`, `'plasma'`, `'inferno'`, `'magma'`, `'cividis'`, `'Blues'` |
| 发散型 | `'coolwarm'`, `'RdBu'`, `'seismic'`, `'bwr'`, `'PiYG'` |
| 循环型 | `'twilight'`, `'hsv'` |
| 定性型 | `'Set1'`, `'Set2'`, `'Set3'`, `'tab10'`, `'Pastel1'` |

```python
# 查看所有 colormap
plt.colormaps()

# 提取颜色
colors = plt.cm.viridis(np.linspace(0, 1, 10))

# 颜色循环（默认 10 种）
print(plt.rcParams['axes.prop_cycle'].by_key()['color'])  # C0~C9
```

### 自定义颜色

```python
# RGB/RGBA
plt.plot(x, y, color=(0.2, 0.4, 0.6))
plt.plot(x, y, color=(0.2, 0.4, 0.6, 0.5))  # 带透明度
# 十六进制
plt.plot(x, y, color='#FF5733')
# 调色板
plt.plot(x, y, color=plt.cm.tab10(0))
```

---

## 18. 保存与导出

```python
# 保存（放在 show() 之前）
plt.savefig('output.png', dpi=300, bbox_inches='tight', transparent=False,
            facecolor='white', edgecolor='none')

# 支持格式：png, jpg, pdf, svg, eps, tiff
plt.savefig('output.svg', format='svg')
plt.savefig('output.pdf', format='pdf', bbox_inches='tight')
```

---

## 19. 面向对象 API（推荐用于复杂图形）

```python
fig, ax = plt.subplots(figsize=(10, 6))

ax.plot(x, y, color='steelblue', linewidth=2)
ax.set_xlabel('X Label', fontsize=12)
ax.set_ylabel('Y Label', fontsize=12)
ax.set_title('Title', fontsize=14, fontweight='bold')
ax.set_xlim(0, 10)
ax.set_ylim(-1.5, 1.5)
ax.grid(True, alpha=0.3, linestyle='--')
ax.legend()

# Spine（边框）
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.spines['left'].set_position(('data', 0))  # 将左轴移到 x=0 处

plt.show()
```

---

## 20. 动态与交互

### 动画

```python
from matplotlib.animation import FuncAnimation

fig, ax = plt.subplots()
line, = ax.plot([], [], lw=2)
xdata, ydata = [], []

def init():
    ax.set_xlim(0, 2*np.pi)
    ax.set_ylim(-1, 1)
    return line,

def update(frame):
    xdata.append(frame)
    ydata.append(np.sin(frame))
    line.set_data(xdata, ydata)
    return line,

ani = FuncAnimation(fig, update, frames=np.linspace(0, 2*np.pi, 128),
                    init_func=init, blit=True, interval=20)
# ani.save('animation.gif', writer='pillow', fps=30)
plt.show()
```

### 交互模式

```python
plt.ion()   # 开启交互模式
plt.ioff()  # 关闭交互模式
plt.pause(0.1)  # 暂停并更新图形
```

---

## 21. 误差线与填充

```python
x = np.linspace(0, 10, 20)
y = np.sin(x)
error = 0.1 + 0.1 * np.sqrt(x)

# 误差线
plt.errorbar(x, y, yerr=error, fmt='o-', capsize=3, capthick=1, ecolor='red')

# 填充区域
plt.fill_between(x, y - error, y + error, alpha=0.3, color='blue')
# 两条线之间填充
plt.fill_between(x, y1, y2, alpha=0.5)
```

---

## 22. 常用快捷函数

| 函数 | 用途 |
|------|------|
| `plt.axhline(y, **kw)` | 水平参考线 |
| `plt.axvline(x, **kw)` | 垂直参考线 |
| `plt.axline((x1,y1), (x2,y2), **kw)` | 任意参考线 |
| `plt.axhspan(ymin, ymax, **kw)` | 水平区域填充 |
| `plt.axvspan(xmin, xmax, **kw)` | 垂直区域填充 |

---

## 23. 常见问题与技巧

### 中文显示

```python
# 方法1：设置字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 方法2：使用 FontProperties
from matplotlib.font_manager import FontProperties
font = FontProperties(fname=r'C:\Windows\Fonts\simhei.ttf', size=14)
plt.title('中文标题', fontproperties=font)
```

### 内存管理

```python
# 及时关闭图形释放内存
plt.close('all')
plt.close(fig)

# 使用 `cla()` 清除 Axes，`clf()` 清除 Figure
ax.cla()
fig.clf()
```

### 后端切换

```python
# 在导入 pyplot 之前设置
import matplotlib
matplotlib.use('Agg')     # 非交互后端（服务器）
matplotlib.use('TkAgg')   # Tkinter
matplotlib.use('Qt5Agg')  # Qt5
```

### 常用 rcParams

```python
plt.rcParams.update({
    'figure.figsize': (10, 6),
    'figure.dpi': 100,
    'savefig.dpi': 300,
    'savefig.bbox': 'tight',
    'font.size': 12,
    'axes.titlesize': 14,
    'axes.labelsize': 12,
    'xtick.labelsize': 10,
    'ytick.labelsize': 10,
    'legend.fontsize': 10,
    'lines.linewidth': 2,
    'lines.markersize': 6,
})
```

### 在 Jupyter Notebook 中使用

```python
%matplotlib inline     # 静态图内嵌
%matplotlib notebook   # 可交互图
%matplotlib widget     # ipympl 交互式后端
```

### 在 Flask/Django 中返回图片

```python
import io
import base64
from matplotlib.backends.backend_agg import FigureCanvasAgg

def fig_to_base64(fig):
    buf = io.BytesIO()
    FigureCanvasAgg(fig).print_png(buf)
    buf.seek(0)
    return base64.b64encode(buf.read()).decode()
```

---

## 24. 逐步绘图流程总结

```
1. 准备数据
   └── np.linspace, np.random, pd.DataFrame, 列表...

2. 创建画布
   └── plt.figure() 或 fig, ax = plt.subplots()

3. 绘图
   └── plot, scatter, bar, hist, pie, imshow, contour...

4. 美化
   └── title, xlabel, ylabel, legend, grid, xlim, ylim,
       刻度, spine, 注释, 文本...

5. 布局
   └── tight_layout, subplots_adjust

6. 输出
   └── show() 或 savefig()
```
