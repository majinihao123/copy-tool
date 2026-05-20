# 速贴 · ClipDock

一款轻量的桌面剪贴板片段管理工具。将常用文本保存为条目，单击即可复制到剪贴板。

基于 [NeutralinoJS](https://neutralino.js.org/) + Vue 3 构建，无需 Node.js 运行时，安装包极小。

---

## 功能特性

- **单击复制** — 点击任意条目立即写入剪贴板
- **分类管理** — 内置联系、话术、模板、开发、链接等分类，支持自定义增删改名
- **搜索过滤** — 实时搜索标题和内容
- **置顶** — 将常用条目固定在列表顶部
- **拖拽排序** — 无搜索/全部分类状态下可自由拖拽调整顺序
- **导出 JSON** — 一键导出全部条目
- **明暗主题** — 自动跟随系统，也可手动切换
- **可拖移窗口** — 拖动标题栏自由移动
- **系统托盘** — 关闭窗口后缩至托盘常驻后台，右键可显示/退出

---

## 技术栈

| 层次 | 技术 |
|------|------|
| 桌面框架 | NeutralinoJS 6.7.0 |
| 前端框架 | Vue 3（CDN 引入，无构建步骤） |
| 样式 | 纯 CSS，无第三方 UI 库 |
| 存储 | 文件系统（`~/.clipdock/`）/ localStorage（浏览器降级） |

---

## 项目结构

```
copy-tool/
├── www/
│   ├── index.html        # 应用入口
│   ├── app.js            # Vue 3 应用逻辑
│   ├── app.css           # 样式
│   ├── icon.png          # 应用图标
│   ├── neutralino.js     # Neutralino 客户端库
│   └── vue.global.prod.js
├── bin/                  # 各平台 Neutralino 运行时
├── dist/                 # 构建输出目录
├── neutralino.config.json
└── ~/.clipdock/          # 持久化数据（运行时自动生成，位于用户主目录）
```

---

## 快速开始

### 直接运行（推荐）

下载对应平台的二进制文件后，在项目根目录执行：

```bash
# Windows
./bin/neutralino-win_x64.exe

# macOS (Apple Silicon)
./bin/neutralino-mac_arm64

# Linux
./bin/neutralino-linux_x64
```

### 使用 neu CLI 开发

```bash
npm install -g @neutralinojs/neu
neu run
```

---

## 构建与发布

### 一键构建并打包

```bash
bash build.sh
```

脚本自动完成：`neu build` 构建 → zip 打包，输出到 `dist/copy-tool-release.zip`。

发布包仅包含两个文件，解压后双击 exe 即可运行：

```
copy-tool-release.zip
├── copy-tool-win_x64.exe   # 主程序
└── resources.neu            # 资源包（须与 exe 同目录）
```

> 发布包约 1.5 MB，无需安装任何运行时。

---

## 使用说明

| 操作 | 方式 |
|------|------|
| 复制条目 | 单击列表中的任意条目 |
| 新增条目 | 点击右上角 **+** 按钮 |
| 编辑条目 | 悬停条目 → 点击编辑图标 |
| 置顶条目 | 悬停条目 → 点击图钉图标 |
| 删除条目 | 悬停条目 → 点击删除图标 |
| 拖拽排序 | 清除搜索且选中「全部」分类后拖动左侧手柄 |
| 管理分类 | 右上角菜单 → 管理分类 |
| 导出数据 | 右上角菜单 → 导出 JSON |
| 切换主题 | 右上角菜单 → 切换深色/浅色主题 |

---

## License

[MIT](LICENSE)
