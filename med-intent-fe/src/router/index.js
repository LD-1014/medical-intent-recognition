import { createRouter, createWebHistory } from 'vue-router';
import Recognition from '@/views/Recognition.vue';

const routes = [
  {
    path: '/',
    name: 'Recognition',
    component: Recognition,
    meta: {
      title: '医疗咨询意图识别'
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

/**
 * 路由守卫 - 简单标题设置
 */
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title;
  }
  next();
});

export default router;
