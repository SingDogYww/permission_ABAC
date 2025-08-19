# ABAC权限管理系统 - 样式系统文档

## 概述

本样式系统基于登录注册界面的设计提取而成，采用现代化的设计语言，提供了完整的 CSS 变量系统和组件样式，便于后续前端开发时保持设计一致性。

## 样式文件结构

```
src/styles/
├── global.css      # 全局样式和CSS变量
├── components.css  # 组件特定样式
└── README.md       # 样式系统说明文档
```

## 引入方式

在 `main.ts` 中引入样式文件：

```typescript
import './styles/global.css'
import './styles/components.css'
```

## 设计系统

### 1. 色彩系统

#### 主色调
- **主品牌色**: `#00eeff` (青蓝色)
- **主色调浅色**: `#00b4db`
- **主色调深色**: `#0083b0`
- **主渐变**: `linear-gradient(45deg, #00eeff, #00b4db)`

#### 状态色
- **成功色**: `#51cf66`
- **错误色**: `#ff6b6b`
- **警告色**: `#feca57`
- **信息色**: `#48dbfb`

#### 密码强度色
- **弱密码**: `#ff6b6b`
- **中等密码**: `#feca57`
- **强密码**: `#48dbfb`
- **非常强密码**: `#00eeff`

### 2. 文本色系统

- **主要文本**: `#ffffff`
- **次要文本**: `rgba(255, 255, 255, 0.8)`
- **三级文本**: `rgba(255, 255, 255, 0.6)`
- **禁用文本**: `rgba(255, 255, 255, 0.4)`
- **强调文本**: `#00eeff`

### 3. 背景色系统

- **主背景**: `linear-gradient(135deg, #0f2027, #203a43, #2c5364)`
- **容器背景**: `rgba(15, 23, 42, 0.8)`
- **卡片背景**: `rgba(255, 255, 255, 0.05)`
- **悬停背景**: `rgba(0, 238, 255, 0.1)`
- **激活背景**: `rgba(0, 238, 255, 0.15)`

### 4. 字体系统

- **字体家族**: `'Segoe UI', 'Microsoft YaHei', sans-serif`
- **字体粗细**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **字体大小**: 12px (xs) ~ 48px (5xl)

### 5. 间距系统

- **极小间距**: `4px`
- **小间距**: `8px`
- **中等间距**: `16px`
- **大间距**: `24px`
- **超大间距**: `32px`

### 6. 圆角系统

- **小圆角**: `4px`
- **中等圆角**: `8px`
- **大圆角**: `10px`
- **超大圆角**: `16px`
- **完全圆形**: `50%`

## CSS 变量使用

### 基础用法

```css
.my-component {
  background: var(--bg-container);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  transition: var(--transition-normal);
}
```

### 状态变化

```css
.my-button {
  background: var(--primary-gradient);
  color: var(--text-on-primary);
  box-shadow: var(--shadow-button);
}

.my-button:hover {
  background: var(--primary-gradient-reverse);
  box-shadow: var(--shadow-glow-strong);
  transform: translateY(-2px);
}
```

## 组件样式类

### 1. 按钮组件

```html
<!-- 主要按钮 -->
<button class="btn btn-primary">登录</button>

<!-- 次要按钮 -->
<button class="btn btn-secondary">取消</button>

<!-- 小尺寸按钮 -->
<button class="btn btn-primary btn-sm">确定</button>

<!-- 大尺寸按钮 -->
<button class="btn btn-primary btn-lg">提交</button>

<!-- 全宽按钮 -->
<button class="btn btn-primary btn-full">注册</button>
```

### 2. 输入框组件

```html
<div class="input-group">
  <svg class="input-icon"><!-- 图标 --></svg>
  <input type="text" class="input" placeholder="请输入用户名" />
</div>

<!-- 验证状态 -->
<input type="text" class="input error" />
<input type="text" class="input success" />
```

### 3. 卡片组件

```html
<div class="card">
  <div class="card-header">
    <h3>标题</h3>
  </div>
  <div class="card-body">
    <p>内容</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">确定</button>
  </div>
</div>
```

### 4. 表单验证

```html
<div class="validation-message error">
  密码不能为空
</div>

<div class="validation-message success">
  用户名可用
</div>

<div class="validation-message warning">
  密码强度较弱
</div>
```

### 5. 进度指示器

```html
<div class="progress-bar">
  <div class="progress-fill primary" style="width: 60%"></div>
</div>
```

### 6. 标签

```html
<span class="tag primary">主要</span>
<span class="tag success">成功</span>
<span class="tag error">错误</span>
<span class="tag warning">警告</span>
```

## 认证页面组件

### 1. 认证容器

```html
<div class="auth-container">
  <div id="particles-js" class="particles-background"></div>
  <div class="auth-card active">
    <!-- 内容 -->
  </div>
</div>
```

### 2. Logo 区域

```html
<div class="logo-section">
  <i class="logo-icon fas fa-user-astronaut"></i>
  <h2 class="logo-title">未来科技平台</h2>
  <p class="logo-subtitle">创建新账户</p>
</div>
```

### 3. 标签页

```html
<div class="tab-container">
  <button class="tab-button active">用户名登录</button>
  <button class="tab-button">手机登录</button>
</div>
```

### 4. 进度指示器

```html
<div class="progress-indicator">
  <div class="progress-step active">
    <div class="step-number">1</div>
    <span class="step-label">账户信息</span>
  </div>
  <div class="step-connector active"></div>
  <div class="progress-step">
    <div class="step-number">2</div>
    <span class="step-label">身份验证</span>
  </div>
</div>
```

### 5. 密码强度指示器

```html
<div class="password-strength">
  <div class="strength-bar">
    <div class="strength-fill strong" style="width: 75%"></div>
  </div>
  <span class="strength-text strong">强</span>
</div>
```

## 工具类

### 1. 间距工具类

```css
.m-0    /* margin: 0 */
.m-1    /* margin: 4px */
.m-2    /* margin: 8px */
.m-3    /* margin: 16px */
.m-4    /* margin: 24px */

.mt-0   /* margin-top: 0 */
.mb-2   /* margin-bottom: 8px */
.p-3    /* padding: 16px */
```

### 2. 文本工具类

```css
.text-xs       /* font-size: 12px */
.text-sm       /* font-size: 14px */
.text-base     /* font-size: 16px */
.text-lg       /* font-size: 18px */

.font-normal   /* font-weight: 400 */
.font-medium   /* font-weight: 500 */
.font-semibold /* font-weight: 600 */
.font-bold     /* font-weight: 700 */

.text-left     /* text-align: left */
.text-center   /* text-align: center */
.text-right    /* text-align: right */
```

### 3. 颜色工具类

```css
.text-primary   /* color: #ffffff */
.text-secondary /* color: rgba(255, 255, 255, 0.8) */
.text-accent    /* color: #00eeff */
.text-success   /* color: #51cf66 */
.text-error     /* color: #ff6b6b */
```

### 4. 布局工具类

```css
.flex          /* display: flex */
.flex-col      /* flex-direction: column */
.items-center  /* align-items: center */
.justify-center /* justify-content: center */
.gap-2         /* gap: 8px */

.w-full        /* width: 100% */
.h-full        /* height: 100% */
.hidden        /* display: none */
.visible       /* display: block */
```

## 动画效果

### 1. 内置动画类

```css
.fade-enter-active    /* 淡入动画 */
.slide-up-enter-active /* 滑入动画 */
```

### 2. 科技光效

```css
.glow-container::before /* 旋转光效边框 */
```

## 响应式设计

样式系统包含完整的响应式支持：

```css
/* 平板设备 */
@media (max-width: 768px) {
  /* 样式调整 */
}

/* 手机设备 */
@media (max-width: 480px) {
  /* 样式调整 */
}
```

## 最佳实践

### 1. 使用 CSS 变量

优先使用 CSS 变量而不是硬编码值：

```css
/* ✅ 推荐 */
.component {
  color: var(--text-primary);
  background: var(--bg-container);
  border-radius: var(--radius-lg);
}

/* ❌ 不推荐 */
.component {
  color: #ffffff;
  background: rgba(15, 23, 42, 0.8);
  border-radius: 10px;
}
```

### 2. 组合使用工具类

```html
<!-- ✅ 推荐：组合工具类 -->
<div class="flex items-center gap-2 p-3 text-center">
  <span class="text-primary font-medium">标题</span>
</div>
```

### 3. 保持设计一致性

统一使用系统定义的间距、颜色和字体：

```css
/* ✅ 推荐：使用系统间距 */
.card {
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

/* ❌ 不推荐：随意间距 */
.card {
  padding: 25px;
  margin-bottom: 35px;
}
```

### 4. 合理使用过渡动画

为交互元素添加平滑过渡：

```css
.button {
  transition: var(--transition-normal);
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow);
}
```

## 扩展指南

### 1. 添加新的 CSS 变量

在 `global.css` 的 `:root` 中添加：

```css
:root {
  /* 新的颜色变量 */
  --new-color: #123456;
  --new-gradient: linear-gradient(45deg, #123456, #789abc);
}
```

### 2. 创建新的组件样式

在 `components.css` 中添加：

```css
/* ========== 新组件样式 ========== */
.new-component {
  /* 样式定义 */
}
```

### 3. 添加工具类

在 `global.css` 的工具类部分添加：

```css
/* 新的工具类 */
.new-utility { /* 样式 */ }
```

## 注意事项

1. **浏览器兼容性**: CSS变量需要现代浏览器支持
2. **性能考虑**: 避免过度使用动画和特效
3. **可访问性**: 确保颜色对比度符合无障碍要求
4. **一致性**: 新增样式应与现有设计系统保持一致

## 更新记录

- v1.0.0: 初始版本，基于登录注册界面提取设计系统
- 后续版本将根据新功能需求进行扩展更新 