# Seaborn 全面使用总结

## 1. 简介

Seaborn 是基于 Matplotlib 的高级统计数据可视化库，特点：

- 内置漂亮的默认样式和配色方案
- 与 Pandas DataFrame 深度集成
- 高阶统计图表（回归线、分布拟合、分类汇总等）
- 自动处理分组、聚合、误差带等统计需求

```python
import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

# 内置示例数据集
print(sns.get_dataset_names())
# ['anscombe', 'attention', 'car_crashes', 'diamonds', 'dots', 'exercise',
#  'flights', 'fmri', 'geyser', 'iris', 'mpg', 'penguins', 'planets',
#  'taxis', 'tips', 'titanic']

df = sns.load_dataset('tips')  # 加载示例数据
```

---

## 2. 样式与主题

### 图表样式

```python
sns.set_theme()                    # 重置为默认主题（推荐，v0.11+）
sns.set_theme(style='darkgrid')    # 深色网格
sns.set_theme(style='whitegrid')   # 白色网格
sns.set_theme(style='dark')        # 深色背景无网格
sns.set_theme(style='white')       # 白色背景无网格
sns.set_theme(style='ticks')       # 仅刻度线

sns.set_style('darkgrid')          # 仅改样式（老 API）
sns.axes_style()                   # 查看当前样式字典
```

### 上下文（缩放）

```python
sns.set_context('paper')    # 最小（论文）
sns.set_context('notebook') # 默认（笔记本）
sns.set_context('talk')     # 较大（演示）
sns.set_context('poster')   # 最大（海报）

# 自定义上下文
sns.set_context('notebook', font_scale=1.5, rc={'lines.linewidth': 2.5})
```

### 配色方案

```python
# 调色板类型
sns.color_palette()                # 当前默认
sns.color_palette('deep')          # 深度色
sns.color_palette('muted')         # 柔和色
sns.color_palette('pastel')        # 淡色
sns.color_palette('bright')        # 明亮色
sns.color_palette('dark')          # 深色
sns.color_palette('colorblind')    # 色盲友好

# 顺序调色板
sns.color_palette('rocket', n_colors=5)
sns.color_palette('Blues', n_colors=5)
sns.color_palette('flare', n_colors=5)

# 发散调色板
sns.color_palette('coolwarm', n_colors=7)
sns.color_palette('RdBu', n_colors=7)
sns.color_palette('icefire', n_colors=7, as_cmap=True)

# 展示调色板
sns.color_palette('Set2')          # 列表
sns.cubehelix_palette(8)           # cubehelix 算法
sns.light_palette('navy')          # 从亮到指定色
sns.dark_palette('green')          # 从暗到指定色

# 设置为全局
sns.set_palette('Set2')
# 获取连续色 map
cmap = sns.color_palette('rocket', as_cmap=True)
```

### 移除/恢复

```python
sns.reset_orig()    # 恢复到 matplotlib 默认风格
sns.set_theme()     # 重置到 seaborn 默认
```

---

## 3. 关系图 (Relational) — `relplot`

`relplot` 是散点图和折线图的统一入口（Figure 级别，返回 FacetGrid）。

### 散点图

```python
# 基本散点
sns.scatterplot(data=df, x='total_bill', y='tip')
plt.show()

# 用颜色和形状区分类别
sns.scatterplot(data=df, x='total_bill', y='tip', hue='day', style='time', size='size')

# relplot 版本（支持分面）
sns.relplot(data=df, x='total_bill', y='tip', hue='day', col='time', kind='scatter')
plt.show()
```

### 折线图

```python
fmri = sns.load_dataset('fmri')

sns.lineplot(data=fmri, x='timepoint', y='signal', hue='event',
             estimator='mean', errorbar=('ci', 95), n_boot=100)

# relplot 版本
sns.relplot(data=fmri, x='timepoint', y='signal', hue='event',
            kind='line', col='region', estimator='mean', errorbar=None)
plt.show()
```

- `estimator`：聚合方式（`'mean'`, `'median'`, `'sum'`, `None`）
- `errorbar`：误差显示（`('ci', 95)`, `('sd', 1)`, `None`）
- `n_boot`：自助法重复次数
- `sort=True`：按 x 排序再连线

---

## 4. 分布图 (Distribution)

### 直方图

```python
# histplot — 直方图 + KDE
sns.histplot(data=df, x='total_bill', bins=20, kde=True, stat='density')
plt.show()

# 水平直方图
sns.histplot(data=df, y='total_bill')
```

- `stat`：`'count'`(默认), `'density'`, `'probability'`, `'percent'`, `'frequency'`
- `binwidth`：固定柱子宽度
- `binrange`：柱子范围
- `kde=True`：叠加核密度估计曲线
- `element`：`'bars'`, `'step'`, `'poly'`
- `hue`：分组（默认堆叠，`multiple='layer'` 改为重叠）
- `multiple`：`'layer'`, `'stack'`, `'dodge'`, `'fill'`

### 核密度估计 KDE

```python
sns.kdeplot(data=df, x='total_bill', fill=True, alpha=0.3, linewidth=2)
# 二维 KDE
sns.kdeplot(data=df, x='total_bill', y='tip', fill=True, cmap='Blues', thresh=0.1)
plt.show()

# 对比分组
sns.kdeplot(data=df, x='total_bill', hue='time', fill=True, alpha=0.3, common_norm=False)
```

- `bw_adjust`：带宽调节（越大越平滑）
- `cut`：超过数据范围的扩展量
- `levels`：二维 KDE 的等高线数量
- `thresh`：低于此密度不填充

### 经验分布 ECDF

```python
sns.ecdfplot(data=df, x='total_bill', hue='day')
plt.show()
```

### 地毯图

```python
sns.rugplot(data=df, x='total_bill', hue='time', height=0.05)
```

### 联合分布

```python
# displot — Figure 级别（v0.11+，替代 distplot）
sns.displot(data=df, x='total_bill', kind='hist', kde=True, hue='time', col='day')
plt.show()

# jointplot — 联合 + 边缘分布
sns.jointplot(data=df, x='total_bill', y='tip', kind='scatter')  # 默认散点
sns.jointplot(data=df, x='total_bill', y='tip', kind='hex')      # 六边形
sns.jointplot(data=df, x='total_bill', y='tip', kind='kde')      # 二维 KDE
sns.jointplot(data=df, x='total_bill', y='tip', kind='reg')      # 回归
sns.jointplot(data=df, x='total_bill', y='tip', kind='resid')    # 残差
plt.show()

# pairplot — 成对关系矩阵
sns.pairplot(df, hue='day', corner=True, diag_kind='hist')
plt.show()
```

---

## 5. 分类图 (Categorical)

### 分类散点

```python
# strip — 随机抖动散点
sns.stripplot(data=df, x='day', y='total_bill', hue='sex', dodge=True, jitter=0.2)

# swarm — 不重叠的蜂群图
sns.swarmplot(data=df, x='day', y='total_bill', hue='sex', dodge=True)
```

### 分类统计

```python
# box — 箱线图
sns.boxplot(data=df, x='day', y='total_bill', hue='time')
plt.show()

# violin — 小提琴图
sns.violinplot(data=df, x='day', y='total_bill', hue='time', split=True,
               inner='quartile', cut=0)
# inner: 'box', 'quartile', 'stick', 'point', None
plt.show()

# boxen — 增强箱线图（大数据集）
sns.boxenplot(data=df, x='day', y='total_bill', hue='time')
plt.show()

# bar — 柱状图（自动聚合 + 误差线）
sns.barplot(data=df, x='day', y='total_bill', hue='sex',
            estimator='mean', errorbar=('ci', 95), palette='Set2')
plt.show()

# point — 点线图
sns.pointplot(data=df, x='day', y='total_bill', hue='sex',
              estimator='median', errorbar=None, markers=['o', 's'])
plt.show()

# count — 计数图
sns.countplot(data=df, x='day', hue='time')
plt.show()
```

### catplot — 分类图的统一入口

```python
sns.catplot(data=df, x='day', y='total_bill', hue='sex',
            kind='boxen', col='time', row='smoker')
plt.show()

# kind: 'strip', 'swarm', 'box', 'violin', 'boxen', 'bar', 'point', 'count'
```

---

## 6. 回归图 (Regression)

### 线性回归

```python
sns.regplot(data=df, x='total_bill', y='tip',
            scatter_kws={'alpha': 0.5}, line_kws={'color': 'red'},
            ci=95, order=1, robust=False)
plt.show()

# 多项式回归
sns.regplot(data=df, x='total_bill', y='tip', order=2)

# 逻辑回归
sns.regplot(data=df, x='total_bill', y='big_tip', logistic=True, y_jitter=0.03)
```

- `ci=95`：置信区间（`None` 关闭）
- `robust=True`：稳健回归（减小异常值影响）
- `x_estimator`：对 x 分组聚合后回归

### 残差图

```python
sns.residplot(data=df, x='total_bill', y='tip', lowess=True)
```

### lmplot — 回归图的 FacetGrid 版本

```python
sns.lmplot(data=df, x='total_bill', y='tip', hue='sex', col='time',
           height=4, aspect=1.2)
plt.show()
```

---

## 7. 矩阵图 (Matrix)

### heatmap — 热力图

```python
# 相关矩阵热力图
corr = df.corr(numeric_only=True)

sns.heatmap(corr, annot=True, fmt='.2f', cmap='coolwarm',
            center=0, vmin=-1, vmax=1,
            square=True, linewidths=0.5,
            cbar_kws={'shrink': 0.8, 'label': '相关性'},
            mask=np.triu(np.ones_like(corr, dtype=bool)))  # 只显示下三角
plt.show()
```

关键参数：
- `annot=True`：单元格内显示数值
- `fmt`：格式字符串
- `center`：颜色映射中心值
- `vmin, vmax`：颜色范围
- `square=True`：正方形单元格
- `mask`：遮蔽部分单元格
- `xticklabels, yticklabels`：刻度标签
- `linewidths`：单元格边框宽度
- `cbar`：是否显示颜色条

### clustermap — 聚类热力图

```python
sns.clustermap(corr, annot=True, cmap='RdBu_r', center=0,
               figsize=(10, 8), row_cluster=True, col_cluster=True,
               method='average', metric='euclidean',
               standard_scale=0,  # 0=行, 1=列
               z_score=0, linewidths=0.5)
plt.show()
```

---

## 8. 分面图 (FacetGrid)

FacetGrid 是 seaborn 最强大的特性，用于按分类变量拆分子图。

```python
# 通用 FacetGrid
g = sns.FacetGrid(df, row='sex', col='time', hue='day',
                  palette='Set2', height=3, aspect=1.2)
g.map(sns.scatterplot, 'total_bill', 'tip')
g.map(sns.regplot, 'total_bill', 'tip')
g.add_legend()
g.set_axis_labels('总账单', '小费')
g.set_titles('性别: {row_name} | 时间: {col_name}')
plt.show()

# 等高阶封装（推荐）
sns.relplot(data=df, x='total_bill', y='tip', hue='day',
            col='time', row='sex', kind='scatter')
sns.displot(data=df, x='total_bill', hue='time', col='day', kind='hist')
sns.catplot(data=df, x='day', y='total_bill', hue='time',
            col='sex', kind='box')
sns.lmplot(data=df, x='total_bill', y='tip', hue='sex', col='time')
```

Figure 级别 vs Axes 级别：
| Figure 级别 (返回 FacetGrid) | Axes 级别 (返回 Axes) |
|---|---|
| `relplot` | `scatterplot`, `lineplot` |
| `displot` | `histplot`, `kdeplot`, `ecdfplot` |
| `catplot` | `stripplot`, `swarmplot`, `boxplot`, `violinplot`, `boxenplot`, `barplot`, `pointplot`, `countplot` |
| `lmplot` | `regplot` |
| `jointplot` | — |
| `pairplot` | — |

---

## 9. 图例与标题

```python
# 移动图例
g = sns.relplot(data=df, x='total_bill', y='tip', hue='day')
g.add_legend()

# 调整图例位置
sns.move_legend(ax, 'upper left', bbox_to_anchor=(1, 1))

# 自定义标题
g.set_titles('Day: {col_name}')

# Figure 级别标题
g.fig.suptitle('总标题', y=1.02, fontsize=16)

# Axes 级别直接使用 plt/ax 方法
ax.set_title('标题', fontsize=14)
```

---

## 10. 高级技巧

### 自定义误差

```python
tips = sns.load_dataset('tips')

# 自定义估计器和误差
from numpy import median
sns.barplot(data=tips, x='day', y='total_bill', estimator=median, errorbar=('se', 2))

# errorbar 选项: ('ci', 95), ('pi', 95), ('sd', 2), ('se', 1), None
# ci=置信区间, pi=百分位区间, sd=标准差, se=标准误差
```

### 排序与分箱

```python
# 按值排序
sns.barplot(data=tips, x='day', y='total_bill', estimator='sum',
            order=['Thur', 'Fri', 'Sun', 'Sat'], palette='Blues_d')

# 对连续变量分箱
bins = pd.cut(df['total_bill'], bins=[0, 15, 25, 60], labels=['低', '中', '高'])
sns.boxplot(x=bins, y=df['tip'])
```

### 多轴组合

```python
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

sns.histplot(data=df, x='total_bill', hue='time', kde=True, ax=ax1)
sns.boxplot(data=df, y='total_bill', x='day', hue='time', ax=ax2)

plt.tight_layout()
```

### 导出 FacetGrid

```python
g = sns.relplot(data=df, x='total_bill', y='tip', col='day')
g.savefig('seaborn_output.png', dpi=300, bbox_inches='tight')
```

---

## 11. 与 Matplotlib 混合使用

```python
fig, ax = plt.subplots(figsize=(10, 6))

# seaborn 绘图
sns.scatterplot(data=df, x='total_bill', y='tip', hue='day', ax=ax)

# matplotlib 叠加
ax.axhline(y=df['tip'].mean(), color='red', linestyle='--', label='均值')
ax.axvline(x=df['total_bill'].mean(), color='gray', linestyle='--')

ax.set_title('Seaborn + Matplotlib 混合', fontsize=16)
ax.legend()
plt.tight_layout()
plt.show()
```

---

## 12. 性能提示

```python
# 大数据集用 hex 而非 scatter
sns.jointplot(data=big_df, x='x', y='y', kind='hex')

# 关闭 bootstrap（大量数据时 CI 计算慢）
sns.barplot(data=big_df, x='category', y='value', errorbar=None)

# 用 histplot 而不用 distplot（distplot 已废弃）

# 设置 rasterized=True（大量散点时减小矢量文件体积）
sns.scatterplot(data=big_df, x='x', y='y', rasterized=True)
```

---

## 13. 常用图表选择速查

| 想要展示 | 推荐函数 |
|----------|----------|
| 两个连续变量关系 | `scatterplot`, `regplot` |
| 一个连续变量分布 | `histplot`, `kdeplot` |
| 连串变量随时间变化 | `lineplot` |
| 分类 vs 连续值 | `boxplot`, `violinplot`, `stripplot` |
| 分类计数 | `countplot` |
| 分类汇总（均值等） | `barplot`, `pointplot` |
| 两连续变量联合分布 | `jointplot` |
| 多变量关系矩阵 | `pairplot` |
| 矩阵数值热力图 | `heatmap` |
| 聚类热力图 | `clustermap` |
| 带分面 | 用对应的 Figure 级别函数或 `FacetGrid` |

---

## 14. 版本注意事项

- **v0.11+**：`distplot` 废弃，用 `displot` / `histplot` / `kdeplot` 替代
- **v0.12+**：`ci` 参数改为 `errorbar`，不再接受 `'sd'` 简写
- **推荐习惯**：优先用 Figure 级别的 `relplot` / `displot` / `catplot`，而非 Axes 级别的对应函数，它们原生支持分面和更高阶的布局

```python
# 检查版本
import seaborn
print(seaborn.__version__)
```
