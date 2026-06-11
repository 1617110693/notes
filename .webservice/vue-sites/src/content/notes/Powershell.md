为了帮你大幅提升在 PowerShell 中的工作效率，我把最常用的命令按照**实际工作场景**进行了分类总结。

PowerShell 的高效率秘诀在于它的**对象管道**、**一致的命名规律（动词-名词）\**以及大量的\**快捷简写（别名）**。

### 一、 核心提效三板斧（记不住命令时的救星）

在 PowerShell 中，你不需要死记硬背所有命令，学会这三个命令，你可以自己查到任何你想用的命令：

- **`Get-Command`（简写：`gcm`）**：查找命令。
  - *示例：* `Get-Command *service*`（查找所有包含 "service" 的命令）。
- **`Get-Help`（简写：`help`）**：查看命令怎么用。
  - *示例：* `help Get-Process -Online`（在浏览器中打开该命令的官方详细文档）。
- **`Get-Member`（简写：`gm`）**：查看对象有哪些“属性”和“方法”（PowerShell 高级玩法的核心）。
  - *示例：* `Get-Service | Get-Member`（查看服务对象可以提取哪些列）。

### 二、 文件与目录操作（比传统 CMD 快数倍）

PowerShell 完美支持 Linux 习惯的 `ls`, `cd`, `pwd`, `mkdir`, `rm`, `cp`, `mv`，但它原生的命令功能更强：

| **场景**     | **原生命令**    | **常用提效简写** | **绝活示例（高效率用法）**                                   |
| ------------ | --------------- | ---------------- | ------------------------------------------------------------ |
| **列出文件** | `Get-ChildItem` | `ls` / `dir`     | `ls -Recurse *.log`（递归查找当前文件夹及子文件夹下所有 log 文件） |
| **查找文本** | `Select-String` | `sls`            | `sls "error" *.log`（在当前所有 log 文件中瞬间搜出包含 error 的行） |
| **读取文件** | `Get-Content`   | `cat` / `gc`     | `gc log.txt -Tail 20 -Wait`（**实时追踪**日志最后20行的动态更新，等同于 Linux 的 `tail -f`） |
| **新建文件** | `New-Item`      | `ni`             | `ni test.txt -Value "hello"`（创建文件并直接写入内容）       |

### 三、 系统、进程与服务管理（运维利器）

不用再打开任务管理器，用命令行操作既快又准：

- **查看&过滤进程：**
  - `gps chrome`（获取所有 Chrome 进程，`gps` 是 `Get-Process` 的简写）。
- **精准杀进程：**
  - `Stop-Process -Name "notepad" -Force`（强制关闭所有记事本）。
  - `gps | where {$_.CPU -gt 50} | stop-process`（管道连招：找出 CPU 占用超过 50% 的进程并直接杀掉）。
- **管理 Windows 服务：**
  - `Get-Service | where {$_.Status -eq "Running"}`（只列出当前正在运行的服务）。
  - `Restart-Service -Name "wuauserv"`（重启 Windows 更新服务）。

### 四、 终极杀手锏：数据导出与格式化

PowerShell 最强的地方在于可以一句话把命令行结果变成精美的报告、表格或文件。

#### 1. 弹窗表格搜索 (`Out-GridView` / 简写: `ogv`)

这是 Windows 用户的专属福利。把你获取的任何数据丢给 `ogv`，它会弹出一个支持**高亮、多条件筛选、排序**的独立可视化表格：

PowerShell

```
Get-Process | ogv
```

#### 2. 一键导出为 Excel/CSV 文件 (`Export-Csv`)

不管是什么数据，后面加个管道就能直接生成报表：

PowerShell

```
Get-Service | Export-Csv -Path "C:\services_report.csv" -Encoding UTF8 -NoTypeInformation
```

#### 3. 转换为 JSON 格式 (`ConvertTo-Json`)

开发人员和前端对接时的神器，直接把系统对象转成标准的 JSON 字符串：

PowerShell

```
Get-NetworkAdapter | ConvertTo-Json
```

### 💡 附：PowerShell 效率倍增快捷键

除了命令，熟练使用终端快捷键可以让你省去大量敲键盘的时间：

- **`Tab` 键：** **绝对的王牌！** 不仅可以自动补全命令、补全文件名，还能自动补全命令的**参数**（按住 `Ctrl + Space` 可以直接列出所有可选参数）。
- **`Ctrl + R`：** 搜索历史命令输入记录（只要你以前输入过，输入几个字母就能秒找出来）。
- **`F7`：** 弹窗显示最近输入过的所有命令历史列表。
- **`Alt + .`：** 自动把上一个命令的最后一个参数复制到当前光标处。