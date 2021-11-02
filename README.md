# 交易所H5

#### 技术介绍
umi + dva + antd-mobile + workbox

|库|功能|
|---|---|
|umi|编译时提供webpack配置、打包部署。运行时提供router|
|dva|纯粹状态管理|
|antd-mobile|UI组件|
|workbox|渐进app|

#### 目录架构
- /config/
1. config.js umi/webpack配置
2. routes app路由配置。topBar字段，页面是否有顶部页头，一般包含返回按钮、tab切换等操作。Routes字段用于鉴权守卫
- /dist/ 打包输出路径
- /public/ copy到根目录的资源，webpack不会打包，请把三方库放入library目录下
- /src/
1. /assets/ 需要打包的非js资源
2. /components/ 可复用组件
3. /layouts/ 全局布局，以及布局组件。**theme.js 全局theme变量设置，使用标准CSS变量**， 颜色变量都放这里
4. /locales/ i18n
5. /models/ dva models，已基本定义好。可根据业务需要进行增添文件，**单个model文件的数据层级最好不要超过2级，层级太深请拆分文件**
6. /pages/ app页面组成，与/config/routes关联。所有页面已基本创建好。
7. /services/ api目录，http请求都放在api.js下。
8. /utils/ 工具库。重型工具请在单独文件完成。轻量工具放在index里。
9. app.js umi运行时配置文件，一般不要修改
10. global.js 一些全局性代码, pwa代码, 谨慎修改
11. global.less 全局样式，import三方样式库，全局性的三方样式override。不需在各组件less文件中额外引入。
12. mixins.less 工具样式，需要在各组件less文件中引入。

#### 命令说明

1. npm run start **端口 9000** 。用localhost开发时，由于服务端回写cookie到localhost域下不会成功。在后端不改代码的情况下，可以通过修改hosts文件实现，例如
```js
127.0.0.1 t.mxctest.com
```
2. npm run build 打生产包
3. npm run build-test 打测试包
4. npm run analyze 生产包质量分析
5. precommit 提交commit时自动执行eslint的hooks

#### 开发约定

- 移动端页面比较零碎，涉及很多前后关联的页面之间传递数据。这种数据传递一般通过Url参数或者redux实现。
- **元素尺寸就按照lanhuapp设计图（375px大小的）上标的px尺寸来，webpack插件会自动对 px 进行转换为 vw 单位**
- **lanhuapp上切图时，请选择2倍图 web@2x ！！**

- **dva最小范围化。不需组件间共享的数据，不要放在model里。也不需要都通过dispatch来执行请求，尽量在当事组件里通过api调用得到数据，消化数据**
- 只在某个组件才需要override第三方UI库的组件样式时，请在该组件的less文件里完成，不要放到global.less里面
```less
.local-class {
  :global {
    .am-button {
      color: blue
    }
  }
}
```
- **一定注重代码复用， 复用组件提取到@/components里；复用方法提取到@/utils里；复用样式提取到mixins.less，多多使用混入**
- antd-mobile的用户反馈型/交互型组件，如modal, toast等，都提供了函数式api，尽量使用这类轻量的方式。**页面上的post/delete类型请求，无论成功失败都要给予用户反馈**，一般情况下请使用toast。
- 只有需要路由数据的容器组件才采用withRouter高阶组件，不要滥用。
- **变量/类/字段 命名要规范，语义化！！使用完整英文单次，不要拼音！！**，注释要精炼
- 各组件的less文件与组件的js文件并行罗列，不要把样式都写到页面的index.less里面
- 页面中用户输入提交的，原则上都要包裹在rc-form里面，输入控件需要对用户输入做校验. **校验规则能够复用的，要提取出来，放到 utils里面**
- ... 待补充


# 页面分工

|人员|分工|
|---|---|
|王炳乂|框架搭建；socket服务；插件、全局组件；trade/spot、 trade/spot-kline、 404 页面|
|张宋辉|home、market、labs、pos 页面|
|张小浪|auth、assets 页面|
|杨建波|otc、event、invite 页面|
|曾扬|ucenter、info、trade/spot-orders  页面|
|邱泰鑫|合约 页面|

**整个初始化阶段，都使用 init/page-xxx 方式来命名分支， 我会建一个init/main分支作为临时开发主分支，基本开发完成后，再把init/main合并进develop**


# MXC_temp
