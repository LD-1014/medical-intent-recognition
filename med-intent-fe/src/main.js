import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

import App from './App.vue';
import router from './router';

const app = createApp(App);

/**
 * 注册所有Element Plus图标
 */
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

/**
 * 创建Pinia实例
 */
const pinia = createPinia();

/**
 * 全局错误处理
 */
app.config.errorHandler = (err, instance, info) => {
  console.error('全局错误:', err);
  console.error('错误信息:', info);
};

/**
 * Vue警告处理
 */
app.config.warnHandler = (msg, instance, trace) => {
  console.warn('Vue警告:', msg);
};

app.use(pinia);
app.use(router);
app.use(ElementPlus);

app.mount('#app');
