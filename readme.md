# Hide Chrome History 
## 说明
Chrome在地址栏输入关键字搜索后，会保留记录，在点击地址栏时，会显示这些内容，并且没有关闭选项，于是花了半天时间，用gpt生成了一个扩展程序，用于解决这个问题。
## 使用插件前
![](https://github.com/LinYi-101/hide_chrome_history/blob/main/imgs/before.png "使用插件前")
## 使用插件后
![](https://github.com/LinYi-101/hide_chrome_history/blob/main/imgs/after.png "使用插件后")
## 使用方式
- 下载压缩包
- 将压缩包解压（建议解压到不容易删除的地方，因为采用本地导入插件的方式，如果不小心删除这个文件夹，会导致插件失效）
- 打开chrome
  - 管理扩展程序
  ![](https://github.com/LinYi-101/hide_chrome_history/blob/main/imgs/manage_ext.png "管理扩展程序")
  - 打开开发者模式
  ![](https://github.com/LinYi-101/hide_chrome_history/blob/main/imgs/load_unzip_ext.png "开发者模式")
  - 加载已解压的扩展程序
  ![](https://github.com/LinYi-101/hide_chrome_history/blob/main/imgs/load_unzip_ext.png "加载已解压的扩展程序")
  - 选择之前解压的目录
  ![](https://github.com/LinYi-101/hide_chrome_history/blob/main/imgs/choose_unzip_path.png "选择之前解压的目录")
## 插件设置
目前已经默认了一条规则，每秒钟执行一次，会删除掉与表达式相匹配的历史记录（也就是显示在地址栏的那些记录）。如果有
其他需求，也可根据自身情况定制。
## 使用细则
![](https://github.com/LinYi-101/hide_chrome_history/blob/main/imgs/describe.png "描述")
- 关键词可以是普通字符串
- 如果想用正则，需要将正则表达式包含在//中
- 默认清理周期为1秒，搜完立即就消失，支持自定义