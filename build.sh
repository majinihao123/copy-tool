#!/usr/bin/env bash
set -e

echo "==> 构建中..."
neu build

echo "==> 打包 Windows 发布包..."
cd dist
zip -j copy-tool-release.zip \
    copy-tool/copy-tool-win_x64.exe \
    copy-tool/resources.neu
cd ..

SIZE=$(du -sh dist/copy-tool-release.zip | cut -f1)
echo "==> 完成！dist/copy-tool-release.zip（${SIZE}）"
