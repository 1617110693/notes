var e=`# Pandas 用法总结

## 1. 基础数据结构

| 结构 | 说明 |
|------|------|
| \`pd.Series\` | 一维数组，带索引 |
| \`pd.DataFrame\` | 二维表格，每列可以是不同类型 |

\`\`\`python
import pandas as pd
import numpy as np

s = pd.Series([1, 2, 3], index=['a', 'b', 'c'])
df = pd.DataFrame({'col1': [1, 2], 'col2': [3, 4]})
\`\`\`

---

## 2. 数据 I/O

\`\`\`python
df = pd.read_csv('data.csv')
df = pd.read_excel('data.xlsx')
df = pd.read_sql('SELECT * FROM table', conn)
df.to_csv('out.csv', index=False)
\`\`\`

---

## 3. 数据探索（拿到数据第一件事）

\`\`\`python
df.head()        # 前5行
df.info()        # 每列的类型、非空数量
df.describe()    # 数值列的统计量（mean, std, min, 25%, 50%, 75%, max）
df.shape         # (行数, 列数)
df.columns       # 所有列名
df.dtypes        # 每列类型
df.isnull().sum()  # 每列缺失值数量
df['col'].value_counts()  # 分类列的值分布
df.corr()        # 数值列之间的相关系数矩阵
\`\`\`

---

## 4. 数据清洗（ML 预处理核心）

### 缺失值处理

\`\`\`python
df.dropna()                        # 删除含缺失值的行
df.dropna(subset=['col1', 'col2']) # 按指定列删除
df.fillna(0)                       # 用0填充
df.fillna(df.median())             # 用中位数填充（数值型常用）
df.fillna(df.mode().iloc[0])       # 用众数填充（分类型常用）
\`\`\`

### 重复值

\`\`\`python
df.duplicated().sum()  # 查看重复行数
df.drop_duplicates(inplace=True)
\`\`\`

### 异常值检测

\`\`\`python
# IQR 方法
Q1 = df['col'].quantile(0.25)
Q3 = df['col'].quantile(0.75)
IQR = Q3 - Q1
df = df[(df['col'] >= Q1 - 1.5 * IQR) & (df['col'] <= Q3 + 1.5 * IQR)]
\`\`\`

---

## 5. 特征工程（ML 最常用）

### loc 详解（按标签选择）

\`loc\` 是 pandas 最核心的选择器，按**索引标签**选取，格式：\`df.loc[行, 列]\`。

**与 iloc 的根本区别：** \`loc\` 按标签名，\`iloc\` 按整数位置。\`loc\` 的切片**包含右端点**（与 Python 普通切片不同）。

---

#### 准备示例数据

\`\`\`python
df = pd.DataFrame(
    {'name': ['Alice', 'Bob', 'Cathy', 'David'],
     'age': [25, 30, 22, 35],
     'city': ['NY', 'LA', 'SF', 'TX']},
    index=['a', 'b', 'c', 'd']   # 自定义索引，不是 0,1,2,3
)
\`\`\`

#### 选行

\`\`\`python
df.loc['a']                      # 单行 → Series，索引 a
df.loc[['a', 'c']]               # 多行 → DataFrame，传入列表
df.loc['a':'c']                  # 切片，包含 'a','b','c'（右端点包含！）
df.loc[df['age'] > 25]           # 布尔条件筛选
df.loc[lambda df: df['age'] > 25]  # callable，等价写法
\`\`\`

#### 选列

\`\`\`python
df.loc[:, 'name']                # 全部行，单列 → Series
df.loc[:, ['name', 'city']]      # 全部行，多列
df.loc[:, 'name':'city']         # 全部行，列切片
\`\`\`

#### 行+列同时选

\`\`\`python
df.loc['a':'c', ['name', 'age']]           # 前3行的name和age
df.loc[df['age'] > 25, ['name', 'city']]   # age>25的行的name和city
\`\`\`

#### 赋值（loc 最常用的写操作）

\`\`\`python
df.loc[df['age'] < 25, 'age'] = 0           # 条件赋值
df.loc['a', 'city'] = 'Beijing'             # 单点赋值
df.loc[:, 'new_col'] = 0                    # 创建新列
\`\`\`

#### 配合 isnull / str 方法

\`\`\`python
df.loc[df['name'].isnull(), 'name'] = 'unknown'
df.loc[df['city'].str.startswith('N'), :]   # city 以 N 开头的所有列
\`\`\`

---

#### iloc（快速对比）

\`\`\`python
df.iloc[0]         # 第1行（整数位置）
df.iloc[0:3]       # 前3行，不含索引3（左闭右开，与 Python 一致）
df.iloc[0:3, 1:3]  # 前3行，第2-3列
df.iloc[[0, 2]]    # 第1和第3行
\`\`\`

---

#### loc vs iloc 要点

| 维度 | \`loc\` | \`iloc\` |
|------|-------|--------|
| 索引方式 | 标签名 | 整数位置 |
| 切片右端点 | **包含** | **不包含** |
| 索引不存在时 | KeyError | 可能越界 IndexError |
| 典型场景 | "选 age>30 的 name 列" | "选前100行" |

#### ML 中常见 loc 模式

\`\`\`python
# 按条件拆分验证集
train = df.loc[df['date'] < '2024-01-01']
val = df.loc[df['date'] >= '2024-01-01']

# 对预测概率分段打标签
df.loc[df['prob'] >= 0.7, 'label'] = 'high'
df.loc[(df['prob'] >= 0.3) & (df['prob'] < 0.7), 'label'] = 'mid'
df.loc[df['prob'] < 0.3, 'label'] = 'low'

# 修正模型预测中的特定错误
df.loc[(df['pred'] == 'cat') & (df['truth'] == 'dog'), 'is_wrong'] = 1
\`\`\`

### 条件筛选

\`\`\`python
df[df['age'] > 30]
df[(df['age'] > 30) & (df['salary'] < 5000)]
\`\`\`

### 创建新特征

\`\`\`python
df['new_col'] = df['a'] + df['b']
df['age_bin'] = pd.cut(df['age'], bins=[0, 18, 35, 60, 100], labels=['少年','青年','中年','老年'])
df['log_price'] = np.log1p(df['price'])
\`\`\`

### groupby + agg（聚合特征）

\`\`\`python
df.groupby('user_id')['amount'].agg(['sum', 'mean', 'count'])
df.groupby('city')['price'].transform('mean')  # 保持原行数
\`\`\`

### 排序和排名

\`\`\`python
df.sort_values('col', ascending=False)
df['rank'] = df['score'].rank()
\`\`\`

### merge / join / concat

\`\`\`python
pd.merge(df1, df2, on='key', how='left')
pd.concat([df1, df2], axis=0)   # 纵向拼接
pd.concat([df1, df2], axis=1)   # 横向拼接
\`\`\`

### One-Hot 编码

\`\`\`python
pd.get_dummies(df['category'], prefix='cat')
\`\`\`

### apply / map

\`\`\`python
df['col'].map({'yes': 1, 'no': 0})
df['len'] = df['text'].apply(len)
df.apply(lambda row: row['a'] + row['b'], axis=1)
\`\`\`

---

## 6. 与 sklearn 无缝衔接

\`\`\`python
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

X = df.drop('target', axis=1)
y = df['target']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = RandomForestClassifier()
model.fit(X_train, y_train)
preds = model.predict(X_test)
\`\`\`

---

## 7. 常见 ML 场景速查

### 场景一：时间特征处理

\`\`\`python
df['date'] = pd.to_datetime(df['date'])
df['year'] = df['date'].dt.year
df['month'] = df['date'].dt.month
df['dayofweek'] = df['date'].dt.dayofweek
df['is_weekend'] = df['dayofweek'].isin([5, 6]).astype(int)
\`\`\`

### 场景二：文本特征（配合 NLP）

\`\`\`python
df['text_len'] = df['text'].str.len()
df['word_count'] = df['text'].str.split().str.len()
df['contains_keyword'] = df['text'].str.contains('关键词').astype(int)
\`\`\`

### 场景三：交叉特征

\`\`\`python
df['age_income'] = df['age'] * df['income']
df['city_gender'] = df['city'] + '_' + df['gender']
\`\`\`

### 场景四：目标编码

\`\`\`python
# 用目标变量的均值对分类变量编码（需注意避免泄露）
target_mean = df.groupby('cat_col')['target'].mean()
df['cat_target_enc'] = df['cat_col'].map(target_mean)
\`\`\`

### 场景五：pivot / melt（宽表 ↔ 长表）

\`\`\`python
df.pivot_table(index='user', columns='item', values='rating', aggfunc='mean')
pd.melt(df, id_vars=['id'], value_vars=['col1', 'col2'])
\`\`\`

---

## 8. 性能技巧

\`\`\`python
df['col'] = df['col'].astype('category')  # 分类列降内存
df['int_col'] = pd.to_numeric(df['int_col'], downcast='integer')  # 整数精度下调
df.query('age > 30 and salary < 5000')  # 比多层布尔索引更快
\`\`\`
`;export{e as default};