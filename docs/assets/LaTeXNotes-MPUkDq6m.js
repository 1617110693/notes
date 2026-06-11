var e=`# LaTeX笔记\r
\r
[toc]\r
\r
\r
\r
## 常用的package及说明\r
\r
\`\`\`latex\r
\\usepackage{ctex}\r
\\usepackage{setspace}\r
\\usepackage{tabularray}\r
\\usepackage{graphicx}\r
\\usepackage{amsmath}\r
\\usepackage{mathtools}\r
\\usepackage{geometry}\r
\\usepackage{xcolor}\r
\\UseTblrLibrary{amsmath}\r
\\usepackage{xeCJKfntef}\r
\`\`\`\r
\r
说明：\r
\r
\`\`\`latex\r
\\usepackage{ctex} \r
\`\`\`\r
\r
用于支持中文，但是如果\`\\documentclass{ctexart}\`已经由ctex开头了就不必使用这个包了\r
\r
\`\`\`latex\r
\\usepackage{tabularray} \r
\`\`\`\r
\r
\`tabularx\`的升级版，提供\`tblr\`环境，功能强大,用法：\r
\r
\`\`\`latex\r
\\begin{table}\r
	\\centering\r
	\\caption{xxx}\r
	\\label{tab:xxx}\r
	\\begin{tblr}\r
	\r
	\\end{tblr}\r
\\end{table}\r
\`\`\`\r
\r
首先说明，一般表格要放在一个**浮动环境**即\r
\r
\`\`\`latex\r
\\begin{table}\r
	\\centering\r
	\\caption{xxx}\r
	\\label{tab:xxx}\r
	\r
\\end{table}\r
\`\`\`\r
\r
中，其中\`\\centering\`是使这个**作用域**中内容居中，\`\\caption{}\`是这个表格显示出来的标签\r
\r
\`\\label{tab:xxx}\`是这个表格的唯一标识，可以通过\`\\ref(tab:xxx)\`引用\r
\r
\r
\r
\r
\r
\r
\r
## LaTeX基本结构\r
\r
\`\`\`latex\r
\\documentclass[10pt,oneside,openany]{article}\r
							  \r
%一般在这里(documentclass下面)导入package\r
\\usepackage{ctex}\r
\\usepackage[style=gb7714-2015]{biblatex} %用于文献引用\r
\\addbibresource{ref.bib} %指定参考文献来源于该文件所在目录下的ref.bib文件\r
\r
\\title{文章标题} %标题\r
\\author{xxx\\thanks{Email:xxx@gmail.com} \\and xxx} %作者，若有多个，用\\and连接，邮箱可选\r
\\date{\\today} %或手动输入日期\r
\r
%以上区域称作导言区Preamble\r
%以下区域称作正文区Body\r
\\begin{document}\r
\r
\r
\\printbibliography %渲染参考文献\r
\\end{document}\r
\`\`\`\r
\r
关于\`\\documentclass[10pt,oneside,openany]{article}\` \r
\r
\`{}\`中除了\`article\`,还可以设置为\`book\`,\`report\`等，以及对应的中文版本\`ctexart\`,\`ctexbook\`,...\r
\`[ ]\`是可选的，可以设置字号\r
仅可选\`9pt\`,\`10pt\`,\`11pt\`,其中\`pt\`是指磅（与Word中的磅不完全一样）\r
还可以在这里设置这篇文章为单页模式\`oneside\`（双页模式奇数页整页内容将不居中，这是为了方便装订成书）；还能设置为\`openany\`,该模式下不强制那些章节页必须出现在奇数页\r
\r
像这样\r
\r
\`\`\`latex\r
\\begin{}\r
\r
\\end{}\r
\`\`\`\r
\r
包裹住的区域称作**环境**\r
\r
\r
\r
## 数学公式\r
\r
### 公式环境\r
\r
行内公式用\`$ $\`包裹\r
行间公式用\\[ \\]包裹\`\\[ \\]\`\r
或者用\`equation\`环境包裹\r
\r
\`\`\`latex\r
\\begin{equation}\r
\r
\\end{equation}\r
\`\`\`\r
\r
### 符号表示\r
\r
注：当\`^{}\`或\`_{}\`后面的的\`{}\`中只有一个字符（变量）时\`{}\`可以省略\r
\r
\r
\r
|        符号         |  代码(公式环境下)   |\r
| :-----------------: | :-----------------: |\r
|         $+$         |         \`+\`         |\r
|         $-$         |         \`-\`         |\r
|         $*$         |         \`*\`         |\r
|       $\\div$        |       \`\\div\`        |\r
|    $\\frac{a}{b}$    |    \`\\frac{a}{b}\`    |\r
|        $x^n$        |        \`x^n\`        |\r
|        $x_n$        |        \`x_n\`        |\r
|      $\\sqrt n$      |      \`\\sqrt n\`      |\r
|    $\\sqrt[n] x$     |    \`\\sqrt[n] x\`     |\r
|       $\\sum$        |       \`\\sum\`        |\r
| $\\sum_{i=1}^n a_i$  | \`\\sum_{i=1}^n a_i\`  |\r
|      $\\infty$       |      \`\\infty\`       |\r
|        $\\to$        |        \`\\to\`        |\r
|    $\\rightarrow$    |    \`\\rightarrow\`    |\r
|       $\\lim$        |       \`\\lim\`        |\r
| $\\lim_{n\\to\\infty}$ | \`\\lim_{n\\to\\infty}\` |\r
|       $\\int$        |       \`\\int\`        |\r
|  $\\int_a^b f(x)dx$  |  \`\\int_a^b f(x)dx\`  |\r
|       $\\iint$       |       \`\\iint\`       |\r
|       $\\oint$       |       \`\\oint\`       |\r
|         $$          |         \`\`          |\r
|         $$          |         \`\`          |\r
|         $$          |         \`\`          |\r
\r
**矩阵**的表示\r
\r
\`\`\`latex\r
\\left [\r
\\begin{array}{ccc}\r
	a & b & c\\\\\r
	d & e & f\\\\\r
	g & h & i\\\\\r
\\end{array}\r
\\right ]\r
\`\`\`\r
\r
\\[\r
\\left [\r
\\begin{array}{ccc}\r
	a & b & c\\\\\r
	d & e & f\\\\\r
	g & h & i\\\\\r
\\end{array}\r
\\right ]\r
\\]\r
\r
\r
\r
还可以用\`matrix\`,\`pmatrix\`,\`bmatrix\`,\`Bmatrix\`环境更方便地表示矩阵,\`vmatrix\`,\`Vmatrix\`表示行列式，可以省去\`\\left\`,\`\\right\`\r
\r
前面加上\`+\`还能优化显示如\`+pmatrix\`\r
\r
示例：\r
\r
\r
\r
\r
\r
\r
\r
我们发现有时候巨型算子的行内形式非常不美观，这时可以在算子前加上\`\\limits\`就可以变回行间形式\r
\r
如\r
\r
\`$\\sum_{i=1}^n a_i$\`即$\\sum_{i=1}^n a_i$ 可以写成\`$\\sum\\limits_{i=1}^n a_i$\`即$\\sum\\limits_{i=1}^n a_i$ \r
\r
\`$\\lim_{n\\to\\infty}$\`即$\\lim_{n\\to\\infty}$ 可以写成\`$\\lim\\limits_{n\\to\\infty}$\`即$\\lim\\limits_{n\\to\\infty}$ \r
\r
另外，分数\`\\frac{}{}\`写成\`\\dfrac{}{}\`可以更美观\r
\r
## 一些琐碎的语法点\r
\r
### 角标微调\r
\r
有时候角标位置不尽人意，这时可以用\`\\uproot{}\`和\`\\leftroot{}\`对角标进行微调\r
\r
示例：\r
\r
\`$\\sqrt[3]{\\dfrac{x+y}{x-y}}$\`\r
\r
$\\sqrt[3]{\\dfrac{x+y}{x-y}}$\r
\r
式中角标3的位置就不尽人意\r
\r
用\`\\uproot{}\`和\`\\leftroot{}\`微调\r
\r
\`$\\sqrt[\\uproot{18}\\leftroot{-4} 3]{\\dfrac{x+y}{x-y}}$\`\r
\r
$\\sqrt[\\uproot{18}\\leftroot{-4} 3]{\\dfrac{x+y}{x-y}}$ \r
\r
这样就比较漂亮了\r
\r
## 公式中使字母直立\r
\r
公式\r
\r
\`\`\`latex\r
\\[ \r
\\int_a^bf(x)dx \r
\\]\r
\`\`\`\r
\r
即\r
\\[\r
\\int_a^bf(x)dx\r
\\]\r
中可以看出\`d\`是倾斜的，与我们平常看到的不太一致，为此，可以使用\`\\mathrm{}\`使\`d\`直立\r
\r
即\r
\r
\`\`\`latex\r
\\[ \r
\\int_a^bf(x) \\mathrm{d}x \r
\\]\r
\`\`\`\r
\r
\\[\r
\\int_a^bf(x) \\mathrm{d}x\r
\\]\r
\r
`;export{e as default};