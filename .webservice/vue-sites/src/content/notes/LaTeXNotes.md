# LaTeX笔记

[toc]



## 常用的package及说明

```latex
\usepackage{ctex}
\usepackage{setspace}
\usepackage{tabularray}
\usepackage{graphicx}
\usepackage{amsmath}
\usepackage{mathtools}
\usepackage{geometry}
\usepackage{xcolor}
\UseTblrLibrary{amsmath}
\usepackage{xeCJKfntef}
```

说明：

```latex
\usepackage{ctex} 
```

用于支持中文，但是如果`\documentclass{ctexart}`已经由ctex开头了就不必使用这个包了

```latex
\usepackage{tabularray} 
```

`tabularx`的升级版，提供`tblr`环境，功能强大,用法：

```latex
\begin{table}
	\centering
	\caption{xxx}
	\label{tab:xxx}
	\begin{tblr}
	
	\end{tblr}
\end{table}
```

首先说明，一般表格要放在一个**浮动环境**即

```latex
\begin{table}
	\centering
	\caption{xxx}
	\label{tab:xxx}
	
\end{table}
```

中，其中`\centering`是使这个**作用域**中内容居中，`\caption{}`是这个表格显示出来的标签

`\label{tab:xxx}`是这个表格的唯一标识，可以通过`\ref(tab:xxx)`引用







## LaTeX基本结构

```latex
\documentclass[10pt,oneside,openany]{article}
							  
%一般在这里(documentclass下面)导入package
\usepackage{ctex}
\usepackage[style=gb7714-2015]{biblatex} %用于文献引用
\addbibresource{ref.bib} %指定参考文献来源于该文件所在目录下的ref.bib文件

\title{文章标题} %标题
\author{xxx\thanks{Email:xxx@gmail.com} \and xxx} %作者，若有多个，用\and连接，邮箱可选
\date{\today} %或手动输入日期

%以上区域称作导言区Preamble
%以下区域称作正文区Body
\begin{document}


\printbibliography %渲染参考文献
\end{document}
```

关于`\documentclass[10pt,oneside,openany]{article}` 

`{}`中除了`article`,还可以设置为`book`,`report`等，以及对应的中文版本`ctexart`,`ctexbook`,...
`[ ]`是可选的，可以设置字号
仅可选`9pt`,`10pt`,`11pt`,其中`pt`是指磅（与Word中的磅不完全一样）
还可以在这里设置这篇文章为单页模式`oneside`（双页模式奇数页整页内容将不居中，这是为了方便装订成书）；还能设置为`openany`,该模式下不强制那些章节页必须出现在奇数页

像这样

```latex
\begin{}

\end{}
```

包裹住的区域称作**环境**



## 数学公式

### 公式环境

行内公式用`$ $`包裹
行间公式用\[ \]包裹`\[ \]`
或者用`equation`环境包裹

```latex
\begin{equation}

\end{equation}
```

### 符号表示

注：当`^{}`或`_{}`后面的的`{}`中只有一个字符（变量）时`{}`可以省略



|        符号         |  代码(公式环境下)   |
| :-----------------: | :-----------------: |
|         $+$         |         `+`         |
|         $-$         |         `-`         |
|         $*$         |         `*`         |
|       $\div$        |       `\div`        |
|    $\frac{a}{b}$    |    `\frac{a}{b}`    |
|        $x^n$        |        `x^n`        |
|        $x_n$        |        `x_n`        |
|      $\sqrt n$      |      `\sqrt n`      |
|    $\sqrt[n] x$     |    `\sqrt[n] x`     |
|       $\sum$        |       `\sum`        |
| $\sum_{i=1}^n a_i$  | `\sum_{i=1}^n a_i`  |
|      $\infty$       |      `\infty`       |
|        $\to$        |        `\to`        |
|    $\rightarrow$    |    `\rightarrow`    |
|       $\lim$        |       `\lim`        |
| $\lim_{n\to\infty}$ | `\lim_{n\to\infty}` |
|       $\int$        |       `\int`        |
|  $\int_a^b f(x)dx$  |  `\int_a^b f(x)dx`  |
|       $\iint$       |       `\iint`       |
|       $\oint$       |       `\oint`       |
|         $$          |         ``          |
|         $$          |         ``          |
|         $$          |         ``          |

**矩阵**的表示

```latex
\left [
\begin{array}{ccc}
	a & b & c\\
	d & e & f\\
	g & h & i\\
\end{array}
\right ]
```

\[
\left [
\begin{array}{ccc}
	a & b & c\\
	d & e & f\\
	g & h & i\\
\end{array}
\right ]
\]



还可以用`matrix`,`pmatrix`,`bmatrix`,`Bmatrix`环境更方便地表示矩阵,`vmatrix`,`Vmatrix`表示行列式，可以省去`\left`,`\right`

前面加上`+`还能优化显示如`+pmatrix`

示例：







我们发现有时候巨型算子的行内形式非常不美观，这时可以在算子前加上`\limits`就可以变回行间形式

如

`$\sum_{i=1}^n a_i$`即$\sum_{i=1}^n a_i$ 可以写成`$\sum\limits_{i=1}^n a_i$`即$\sum\limits_{i=1}^n a_i$ 

`$\lim_{n\to\infty}$`即$\lim_{n\to\infty}$ 可以写成`$\lim\limits_{n\to\infty}$`即$\lim\limits_{n\to\infty}$ 

另外，分数`\frac{}{}`写成`\dfrac{}{}`可以更美观

## 一些琐碎的语法点

### 角标微调

有时候角标位置不尽人意，这时可以用`\uproot{}`和`\leftroot{}`对角标进行微调

示例：

`$\sqrt[3]{\dfrac{x+y}{x-y}}$`

$\sqrt[3]{\dfrac{x+y}{x-y}}$

式中角标3的位置就不尽人意

用`\uproot{}`和`\leftroot{}`微调

`$\sqrt[\uproot{18}\leftroot{-4} 3]{\dfrac{x+y}{x-y}}$`

$\sqrt[\uproot{18}\leftroot{-4} 3]{\dfrac{x+y}{x-y}}$ 

这样就比较漂亮了

## 公式中使字母直立

公式

```latex
\[ 
\int_a^bf(x)dx 
\]
```

即
\[
\int_a^bf(x)dx
\]
中可以看出`d`是倾斜的，与我们平常看到的不太一致，为此，可以使用`\mathrm{}`使`d`直立

即

```latex
\[ 
\int_a^bf(x) \mathrm{d}x 
\]
```

\[
\int_a^bf(x) \mathrm{d}x
\]

