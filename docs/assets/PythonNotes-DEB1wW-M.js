var e=`# Python笔记



[toc]

---

## Python 原地修改 vs 返回新值

### 核心

1. **不可变类型**：所有操作**只返回新值**，**绝不修改原变量**

2. **可变类型**：分两种

   - 增 / 删 / 改 / 排序 / 清空 → **原地修改原变量**
   - 切片 / 复制 / 集合运算 → **返回新对象，不改动原变量**

   

3. **全局内置函数**：一律**返回新值**，不修改原数据

### 不可变类型

包含：\`str\`字符串、\`tuple\`元组、\`int/float\`数值、\`bool\`布尔

特性：

本身**不可被原地修改**，所有方法、运算都只会生成**新值**，原变量保持不变。

示例：

\`\`\`python
# 字符串
s = "python"
s.upper()   # 返回新字符串 "PYTHON"，原s不变
print(s)    # 仍输出 python

# 元组
t = (1,2,3)
t + (4,)    # 返回新元组，原t不变
\`\`\`

### 可变类型分类

1. 原地修改（改原变量，返回 None）

直接在自身上增删改，**无有效返回值**

|   类型    |                       原地修改常用方法                       |
| :-------: | :----------------------------------------------------------: |
| 列表 list | \`append\`、\`pop\`、\`remove\`、\`sort\`、\`extend\`、\`insert\`、\`reverse\`、\`clear\` |
| 集合 set  |        \`add\`、\`remove\`、\`update\`、\`clear\`、\`discard\`         |
| 字典 dict |             \`update\`、\`pop\`、\`clear\`、\`popitem\`              |

示例：

\`\`\`python
ls = [3,1,2]
ls.sort()   # 原地排序，直接改原列表
print(ls)   # [1,2,3]
\`\`\`

2. 返回新值（不改原变量）

只生成新对象，原数据保持原样

|   类型    |              返回新值常用操作 / 方法              |
| :-------: | :-----------------------------------------------: |
| 列表 list |              切片 \`ls[1:]\`、\`copy()\`              |
| 集合 set  | \`union\`并集、\`intersection\`交集、\`difference\`差集 |
| 字典 dict |                     \`copy()\`                      |

### 高频易混淆对比

|      写法      |   类型   | 是否原地修改 |        作用        |
| :------------: | :------: | :----------: | :----------------: |
|  \`ls.sort()\`   | 列表方法 |  ✅ 改原列表  |    原地升序排序    |
|  \`sorted(ls)\`  | 内置函数 | ❌ 不改原列表 | 返回排序后的新列表 |
| \`ls.reverse()\` | 列表方法 |  ✅ 改原列表  |      原地反转      |
| \`reversed(ls)\` | 内置函数 | ❌ 不改原列表 |   返回反转迭代器   |

### 万能 3 秒判断流程

1. 先看**数据类型**：是字符串 / 元组 / 数字 → 直接判定：**只返回新值**
2. 是列表 / 集合 / 字典：看**动作**
   - 增、删、改、排序、清空 → **原地修改**
   - 切片、复制、求交集并集 → **返回新值**
3. 是 \`sorted/reversed/len\` 等全局函数 → **必返回新值**

### 极简记忆口诀

不可变，只出新；

可变分，改自身；

内置函数不动原，

排序反转要分清。

---



## Python在数模中的应用

### 主要用途

- **分析数据 (\`Pandas\`)**：
  - 能够快速读取 Excel 或 CSV 数据，进行清洗、缺失值处理和统计描述。
  - 例如：\`df.describe()\` 可以一键获取均值、标准差等。
- **数值求解 (\`SciPy\` / \`SymPy\`)**：
  - 如果你有复杂的非线性方程或微分方程（ODE），\`scipy.optimize\`（如 \`fsolve\`）和 \`scipy.integrate\`（如 \`solve_ivp\`）非常高效。
  - 如果你需要先进行符号推导（比如化简方程），\`SymPy\` 可以像 MATLAB 一样帮你推公式。
- **绘制曲线 (\`Matplotlib\` / \`Seaborn\`)**：
  - 能精确控制每一个绘图细节（线宽、颜色、坐标轴标签）。
  - **关键点**：你可以轻松将西文字体设为 \`Times New Roman\`，中文字体设为 \`SimSun\`（宋体），直接生成符合论文规范的高清插图。

------

### 实战代码模板

\`\`\`python
import numpy as np
import matplotlib.pyplot as plt
from scipy.optimize import fsolve

# 1. 定义方程 (例如: x^2 - 5 = 0)
def my_equation(x):
    return x**2 - 5

# 2. 求数值解
initial_guess = 2
solution = fsolve(my_equation, initial_guess)
print(f"方程的数值解为: {solution[0]}")

# 3. 绘制趋势曲线
x_values = np.linspace(0, 5, 100)
y_values = my_equation(x_values)

plt.figure(figsize=(8, 5))
plt.plot(x_values, y_values, label='Trend Curve', color='blue', linewidth=2)
plt.axhline(0, color='black', linestyle='--') # 画出 y=0 的参考线
plt.scatter(solution, 0, color='red', label='Root') # 标记解的位置

# 字体设置 (务必匹配你的论文规范)
plt.rcParams['font.sans-serif'] = ['SimSun']    # 宋体处理中文
plt.rcParams['axes.unicode_minus'] = False      # 正常显示负号
plt.xlabel('变量 X (Units)')
plt.ylabel('函数值 f(X)')
plt.title('趋势曲线分析')
plt.legend()
plt.grid(True)
plt.show()
\`\`\`

---

### scipy的使用

在数学建模竞赛中，\`scipy\` 是处理方程求解和趋势曲线分析的核心工具。针对“分析数据”、“求数值解”和“绘制曲线”的需求，需要掌握 \`scipy.optimize\`（求解方程）和 \`scipy.interpolate\`（插值/趋势平滑）这两个模块。

以下是竞赛中最常用的三个实战场景及代码示例：

#### 1. 非线性方程求解 (\`scipy.optimize.fsolve\`)

当你建立了一个复杂的模型方程（如食物链中的平衡方程），无法得出解析解时，可以使用 \`fsolve\` 求数值根。

**场景示例：** 求解 $x^2 + 2\\sin(x) - 5 = 0$ 的根。

\`\`\`python
from scipy.optimize import fsolve
import numpy as np

# 1. 定义方程，使其等于 0
def func(x):
    return x**2 + 2*np.sin(x) - 5

# 2. 给出初始猜测值（可以通过画图大致确定）
initial_guess = 2

# 3. 求解
root = fsolve(func, initial_guess)
print(f"方程的数值解为: {root[0]}")
\`\`\`

#### 2. 趋势曲线拟合 (\`scipy.optimize.curve_fit\`)

当你有一组离散的观测数据，想要找到一个符合某种物理规律（如指数增长、S型增长）的方程时使用。

**场景示例：** 根据人口数据拟合 Logistic 模型 $y = \\frac{L}{1 + e^{-k(x-x_0)}}$。

\`\`\`python
from scipy.optimize import curve_fit
import matplotlib.pyplot as plt

# 1. 定义想要拟合的模型函数
def logistic_model(x, L, k, x0):
    return L / (1 + np.exp(-k * (x - x0)))

# 2. 准备你的实验数据 (x_data, y_data)
x_data = np.array([0, 1, 2, 3, 4, 5])
y_data = np.array([1.2, 2.5, 4.8, 7.1, 8.5, 9.2])

# 3. 拟合，得到最优参数 popt
popt, pcov = curve_fit(logistic_model, x_data, y_data)

# 4. 绘制结果
x_fit = np.linspace(0, 6, 100)
y_fit = logistic_model(x_fit, *popt)

plt.scatter(x_data, y_data, label='原始数据')
plt.plot(x_fit, y_fit, color='red', label='拟合趋势线')
plt.legend()
plt.show()
\`\`\`



#### 3. 数据平滑与插值 (\`scipy.interpolate.interp1d\`)

如果你有一组很稀疏的数据点，想画出平滑的趋势曲线，而不是生硬的折线。

**场景示例：** 将离散点用三次样条插值连成平滑曲线。

\`\`\`python
from scipy.interpolate import interp1d

x = np.array([0, 1, 2, 3, 4, 5])
y = np.array([0, 0.8, 0.9, 0.1, -0.8, -1.0])

# 创建插值函数，'cubic' 表示三次样条插值（最平滑）
f_smooth = interp1d(x, y, kind='cubic')

x_new = np.linspace(0, 5, 100)
y_new = f_smooth(x_new)

plt.plot(x, y, 'o', label='原始离散点')
plt.plot(x_new, y_new, '-', label='平滑趋势线')
plt.legend()
plt.show()
\`\`\`



---

| **复制方式** | **语法示例**           | **外层对象内存 ID**         | **修改 A 的外层元素(如 A[0]=X)** | **修改 A 的深层嵌套元素(如 A[2][0]=Y)** |
| ------------ | ---------------------- | --------------------------- | -------------------------------- | --------------------------------------- |
| **直接赋值** | \`B = A\`                | **相同** (完全是同一个东西) | ❌ **\`B\` 会跟着变**               | ❌ **\`B\` 会跟着变**                      |
| **浅拷贝**   | \`B = A.copy()\`         | **不同** (外层已经独立)     | **\`B\` 保持原样**                 | ❌ **\`B\` 会跟着变**                      |
| **深拷贝**   | \`B = copy.deepcopy(A)\` | **不同** (内外层全部独立)   | **\`B\` 保持原样**                 | **\`B\` 保持原样**                        |



## Python包管理

| **操作功能**           | **1. Python 原生 (venv + pip)** | **2. 现代极速专家 (uv)**                      | **3. 系统级全家桶 (conda)**                      |
| ---------------------- | ------------------------------- | --------------------------------------------- | ------------------------------------------------ |
| **创建虚拟环境**       | \`python -m venv .venv\`          | \`uv venv\`                                     | \`conda create -n my_env python=3.11\`             |
| **激活环境 (Windows)** | \`.venv\\Scripts\\activate\`        | \`.venv\\Scripts\\activate\` *(与原生相同)*       | \`conda activate my_env\`                          |
| **退出当前环境**       | \`deactivate\`                    | \`deactivate\`                                  | \`conda deactivate\`                               |
| **安装软件包**         | \`pip install numpy\`             | \`uv add numpy\` 或 \`uv pip install numpy\`      | \`conda install numpy\` *(或 \`pip install numpy\`)* |
| **卸载软件包**         | \`pip uninstall numpy\`           | \`uv remove numpy\` 或 \`uv pip uninstall numpy\` | \`conda remove numpy\`                             |
| **查看当前已安装**     | \`pip list\`                      | \`uv pip list\`                                 | \`conda list\`                                     |
| **导出依赖列表**       | \`pip freeze > reqs.txt\`         | 自动生成 \`uv.lock\` *(或 \`uv pip freeze\`)*     | \`conda env export > env.yml\`                     |
| **从文件批量安装**     | \`pip install -r reqs.txt\`       | \`uv pip install -r reqs.txt\`                  | \`conda env create -f env.yml\`                    |
| **查看所有已创环境**   | *(无原生命令，需手动看目录)*    | *(无原生命令，需手动看目录)*                  | \`conda env list\`                                 |
| **删除整个环境**       | 直接手动删除 \`.venv\` 文件夹     | 直接手动删除 \`.venv\` 文件夹                   | \`conda env remove -n my_env\`                     |





### UV常用命令

| **分类**                                 | **操作功能**               | **核心命令**                 | **备注 / 提效说明**                             |
| ---------------------------------------- | -------------------------- | ---------------------------- | ----------------------------------------------- |
| **项目初始化**                           | 创建现代工程项目           | \`uv init <项目名>\`           | 自动生成 \`pyproject.toml\` 等工程结构            |
|                                          | 自动同步项目依赖           | \`uv sync\`                    | 检查配置文件，一键补齐所有缺失的包并创建环境    |
| **Python 版本管理**                      | 列出所有可用 Python 版本   | \`uv python list\`             | 包含本地已装和云端可自动下载的版本              |
|                                          | 下载特定 Python 版本       | \`uv python install 3.11\`     | 无需去官网，\`uv\` 直接帮你下载并配好             |
|                                          | 锁定当前项目的 Python 版本 | \`uv python pin 3.11\`         | 在本地生成 \`.python-version\` 锁死版本           |
| **环境与包管理** *(现代项目流)*          | 创建默认虚拟环境           | \`uv venv\`                    | 默认在当前目录下创建极速的 \`.venv\`              |
|                                          | 创建并指定 Python 版本     | \`uv venv -p 3.11\`            | 临时指定该环境搭载的 Python 版本                |
|                                          | **添加/安装软件包**        | \`uv add numpy\`               | **最常用**。自动下载并将其写入 \`pyproject.toml\` |
|                                          | **卸载/移除软件包**        | \`uv remove numpy\`            | 自动卸载并从项目依赖配置文件中剔除              |
| **兼容经典 pip 流** *(单文件或传统习惯)* | 极速安装单个包             | \`uv pip install numpy\`       | 速度比原生 \`pip\` 快数十倍，支持全局硬链接       |
|                                          | 极速卸载单个包             | \`uv pip uninstall numpy\`     | 干净利落                                        |
|                                          | 查看当前环境已安装的包     | \`uv pip list\`                | 替代传统的 \`pip list\`                           |
|                                          | 从依赖文件批量安装         | \`uv pip install -r reqs.txt\` | 完美兼容传统项目的 \`requirements.txt\`           |
| **脚本极速运行**                         | 单文件免环境直接运行       | \`uv run demo.py\`             | 如果脚本声明了依赖，\`uv\` 会在后台自动处理       |



### Conda命令（更推荐UV）

| **分类**     | **操作功能**          | **核心命令**                                | **提效说明 / 避坑指南**                                      |
| ------------ | --------------------- | ------------------------------------------- | ------------------------------------------------------------ |
| **环境管理** | **创建新虚拟环境**    | \`conda create -n <环境名> python=3.11\`      | **最常用**。\`-n\` 代表 Name，强烈建议带上 \`python=x.xx\` 指定版本 |
|              | **激活/进入虚拟环境** | \`conda activate <环境名>\`                   | 激活后，命令行最前端的小括号会切换为该环境名                 |
|              | **退出当前虚拟环境**  | \`conda deactivate\`                          | 退回系统默认状态（或退回 \`base\`）                            |
|              | 查看所有已创环境      | \`conda env list\` 或 \`conda info --envs\`     | 忘记自己建过什么环境时用它查，会列出所有环境的绝对路径       |
|              | 克隆/复制一个环境     | \`conda create -n <新环境> --clone <老环境>\` | 非常实用！想在现有环境中做破坏性实验前，先克隆一个备份       |
|              | **删除整个虚拟环境**  | \`conda env remove -n <环境名>\`              | 连同该环境下的所有第三方包一起连根拔起                       |
| **包管理**   | **安装软件包**        | \`conda install <包名>\`                      | 比如 \`conda install numpy\`                                   |
|              | 指定渠道（源）安装    | \`conda install -c conda-forge <包名>\`       | \`-c\` 代表 Channel。很多最新 AI 库都在 \`conda-forge\` 频道里   |
|              | 卸载软件包            | \`conda remove <包名>\`                       | 从当前激活的环境中卸载该库                                   |
|              | 查看当前环境已安装    | \`conda list\`                                | 列出当前环境下所有的包和具体版本                             |
| **项目迁移** | 导出环境配置文件      | \`conda env export > environment.yml\`        | 类似于 pip 的 freeze，会把环境和底层 C++ 依赖一起导出        |
|              | 从配置文件克隆环境    | \`conda env create -f environment.yml\`       | 别人分享给你项目时，一键复现对方的 conda 环境                |
| **日常清理** | 清理缓存与无用包      | \`conda clean --all\`                         | **C盘/D盘救星**！定期清理下载的压缩包缓存，能释放大几个G的空间 |



## Jupyter快捷键

Jupyter 的快捷键有一个核心逻辑：它有两种**模式**。

- **命令模式（Command Mode）**：按下 **\`Esc\`** 键进入。此时单元格框线变成**蓝色**（或当前主题的单色）。这时候你的键盘按键是在对“整个格子”进行操作（比如复制、删除、新增）。
- **编辑模式（Edit Mode）**：按下 **\`Enter\`** 键（或鼠标点进格子里）进入。此时单元格框线变成**绿色**或有光标闪烁。这时候你是在“格子内部”写代码。

### 1. 核心运行快捷键（两种模式通用）

这两组快捷键是你每天要敲几百遍的绝对主力：

| **快捷键**          | **功能**                               | **提效说明**                                                 |
| ------------------- | -------------------------------------- | ------------------------------------------------------------ |
| **\`Shift + Enter\`** | **运行当前格子，并自动跳到下一个格子** | 如果下面没有格子了，会自动在下方**新建一个空格子**（最常用）。 |
| **\`Ctrl + Enter\`**  | **运行当前格子，光标保持留在原处**     | 适合当你需要反复修改、测试同一个格子里的代码时。             |

### 2. 命令模式（Command Mode）常用快捷键

> 💡 **使用前提**：先按一下 **\`Esc\`**，确保光标不在输入框里闪烁。

| **分类**      | **快捷键**              | **功能**                                      | **记忆小窍门 / 动作**                 |
| ------------- | ----------------------- | --------------------------------------------- | ------------------------------------- |
| **新增格子**  | **\`A\`**                 | 在当前格子**上方**插入一个新格子              | **A**bove（在...上面）                |
|               | **\`B\`**                 | 在当前格子**下方**插入一个新格子              | **B**elow（在...下面）                |
| **删除/撤销** | **\`D, D\`** *(连按两下)* | **删除**当前格子                              | **D**elete                            |
|               | **\`Z\`**                 | 撤销删除（把刚刚误删的格子复活）              | 类似于全局的 \`Ctrl + Z\`               |
| **切换属性**  | **\`M\`**                 | 把当前格子变成 **Markdown（文本/笔记）** 模式 | **M**arkdown                          |
|               | **\`Y\`**                 | 把当前格子变回 **Code（代码）** 模式          | Python 的 ──**Y**──                   |
| **复制剪切**  | **\`C\`**                 | 复制当前整个格子                              | **C**opy                              |
|               | **\`X\`**                 | 剪切当前整个格子                              | 类似于剪切文本                        |
|               | **\`V\`**                 | 粘贴格子到当前格子的**下方**                  | **V**（粘贴）                         |
| **美化调整**  | **\`L\`**                 | 切换是否显示**代码行号**                      | **L**ine number（看报错行数极其方便） |
|               | **\`O\`**                 | 隐藏/显示当前格子的**运行输出结果**           | **O**utput                            |

### 3. 编辑模式（Edit Mode）常用快捷键

> 💡 **使用前提**：光标正在格子里闪烁，处于写代码的状态。

| **快捷键**        | **功能**                           | **提效说明**                                                 |
| ----------------- | ---------------------------------- | ------------------------------------------------------------ |
| **\`Tab\`**         | **代码智能补全 / 缩进**            | 敲完 \`np.ra\` 之后按一下 \`Tab\`，会自动跳出 \`random\` 提示。    |
| **\`Shift + Tab\`** | **查看函数的官方文档（悬浮提示）** | 比如光标停在 \`np.random.randn()\` 括号内部时，按下它会直接弹窗告诉你这个函数的参数该怎么填。 |
| **\`Ctrl + /\`**    | **一键注释/取消注释**              | 选中多行代码后按下，可以批量给代码打上 \`#\` 或者去掉 \`#\`。    |

### `;export{e as default};