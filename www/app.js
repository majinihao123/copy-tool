const { createApp, ref, computed, watch, nextTick, onMounted, onUnmounted } = Vue;

const STORAGE_KEY      = 'clipdock_items_v1';
const CATS_KEY         = 'clipdock_cats_v1';
const WINDOW_SIZE_KEY  = 'clipdock_window_size_v1';
const DEFAULT_CATS     = ['联系', '话术', '模板', '开发', '链接'];

const SEED = [
  { id: 's1', title: '公司邮箱',        body: 'zhangwei@example.com',                                                     category: '联系' },
  { id: 's2', title: '工位地址',        body: '上海市浦东新区 张江高科技园区 博云路 2 号 5 楼 502 工位',                   category: '联系' },
  { id: 's3', title: '客服话术 · 致歉', body: '您好,非常抱歉给您带来不便。我们已记录您的问题并将在 24 小时内回复,感谢您的耐心等待。', category: '话术' },
  { id: 's4', title: '客服话术 · 结束', body: '感谢您的反馈,如还有其他问题,随时联系我们。祝您生活愉快。',               category: '话术' },
  { id: 's5', title: '周报标题',        body: '周报 · 第 W 周 · 张伟',                                                    category: '模板' },
  { id: 's6', title: 'Git 提交模板',    body: 'feat(scope): 简短描述\n\n- 改动点 1\n- 改动点 2\n\nRefs: #issue',           category: '开发' },
  { id: 's7', title: '服务器 IP',       body: '10.24.108.221',                                                             category: '开发' },
  { id: 's8', title: '会议室预订链接',  body: 'https://meet.example.com/book?room=A302',                                   category: '链接' },
];

function uid() {
  return 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

const Icons = {
  copy:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>`,
  check:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  edit:   `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>`,
  trash:  `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>`,
  plus:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  search: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  pin:    `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 10.76V6h6v4.76a2 2 0 0 0 .59 1.42L18 14.59V17H6v-2.41l2.41-2.41A2 2 0 0 0 9 10.76z"/></svg>`,
  close:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>`,
  min:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  dots:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>`,
  drag:   `<svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor"><circle cx="2.5" cy="3" r="1.1"/><circle cx="7.5" cy="3" r="1.1"/><circle cx="2.5" cy="7" r="1.1"/><circle cx="7.5" cy="7" r="1.1"/><circle cx="2.5" cy="11" r="1.1"/><circle cx="7.5" cy="11" r="1.1"/></svg>`,
  tag:    `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
};

// ── Tray ─────────────────────────────────────────────────────────────────────
let _winVisible = true;

async function _setTrayMenu(visible) {
  if (typeof Neutralino === 'undefined') return;
  try {
    await Neutralino.app.setTray({
      icon: '/www/icon.png',
      menuItems: [
        { id: 'TOGGLE', text: visible ? '隐藏窗口' : '显示窗口' },
        { id: 'SEP',    text: '-' },
        { id: 'QUIT',   text: '退出' },
      ]
    });
  } catch (e) {}
}

async function initTray() {
  if (typeof Neutralino === 'undefined') return;
  await _setTrayMenu(true);
  Neutralino.events.on('trayMenuItemClicked', async (evt) => {
    const id = evt.detail.id;
    if (id === 'TOGGLE') {
      if (_winVisible) {
        await Neutralino.window.hide();
        _winVisible = false;
      } else {
        await Neutralino.window.show();
        await Neutralino.window.focus();
        _winVisible = true;
      }
      await _setTrayMenu(_winVisible);
    } else if (id === 'QUIT') {
      await Neutralino.app.exit();
    }
  });
  Neutralino.events.on('windowClose', async () => {
    await Neutralino.window.hide();
    _winVisible = false;
    await _setTrayMenu(false);
  });
}

// ── Storage helpers ──────────────────────────────────────────────────────────
let _appDataDir = null;

async function initStoragePath() {
  if (typeof Neutralino === 'undefined') return;
  try {
    const home = await Neutralino.os.getPath('home');
    _appDataDir = home + '/.clipdock';
    try { await Neutralino.filesystem.createDirectory(_appDataDir); } catch (e) {}
  } catch (e) {}
}

async function storageGet(key) {
  try {
    if (typeof Neutralino !== 'undefined') {
      if (_appDataDir) return await Neutralino.filesystem.readFile(_appDataDir + '/' + key + '.json');
      return await Neutralino.storage.getData(key);
    }
    return localStorage.getItem(key);
  } catch (e) { return null; }
}

async function storageSet(key, val) {
  try {
    if (typeof Neutralino !== 'undefined') {
      if (_appDataDir) { await Neutralino.filesystem.writeFile(_appDataDir + '/' + key + '.json', val); return; }
      await Neutralino.storage.setData(key, val);
    } else {
      localStorage.setItem(key, val);
    }
  } catch (e) {}
}

async function loadItems() {
  const raw = await storageGet(STORAGE_KEY);
  try { if (raw) return JSON.parse(raw); } catch (e) {}
  return SEED.map(s => ({ ...s }));
}
async function saveItems(items) { await storageSet(STORAGE_KEY, JSON.stringify(items)); }

async function loadCats() {
  const raw = await storageGet(CATS_KEY);
  try { if (raw) return JSON.parse(raw); } catch (e) {}
  return [...DEFAULT_CATS];
}
async function saveCats(cats) { await storageSet(CATS_KEY, JSON.stringify(cats)); }

async function copyToClipboard(text) {
  try { if (typeof Neutralino !== 'undefined') { await Neutralino.clipboard.writeText(text); return; } } catch (e) {}
  try { await navigator.clipboard.writeText(text); return; } catch (e) {}
  const ta = document.createElement('textarea');
  ta.value = text; document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); } catch (e) {}
  document.body.removeChild(ta);
}

// ── SnippetRow ───────────────────────────────────────────────────────────────
const SnippetRow = {
  name: 'SnippetRow',
  props: ['item', 'copied', 'dragging', 'canReorder'],
  emits: ['copy', 'edit', 'delete', 'togglePin', 'dragStart'],
  setup() { return { hover: ref(false), Icons }; },
  computed: {
    rowClass() {
      return ['row', this.copied?'copied':'', this.item.pinned?'pinned':'', this.dragging?'is-dragging':''].join(' ');
    },
  },
  template: `
    <div :class="rowClass"
         @mouseenter="hover=true" @mouseleave="hover=false"
         @click="!dragging && $emit('copy')">
      <button :class="'drag-handle'+(canReorder?'':' disabled')"
              @pointerdown.stop="$emit('dragStart', $event)" @click.stop
              :title="canReorder?'拖拽排序':'清除搜索/分类后可拖拽'"
              v-html="Icons.drag"></button>
      <div class="row-side">
        <span class="cat" :data-cat="item.category">{{ item.category }}</span>
        <span v-if="item.pinned" class="pin-mark" title="已置顶" v-html="Icons.pin"></span>
      </div>
      <div class="row-main">
        <div class="row-title">
          <span v-if="item.title">{{ item.title }}</span>
          <span v-else class="muted">(未命名)</span>
        </div>
        <div class="row-body">{{ item.body }}</div>
        <div :class="'row-act'+(hover?' show':'')">
          <button :class="'act copy-act'+(copied?' ok':'')"
                  @click.stop="$emit('copy')" :title="copied?'已复制':'复制'"
                  v-html="copied ? Icons.check : Icons.copy"></button>
          <button class="act" @click.stop="$emit('togglePin')"
                  :title="item.pinned?'取消置顶':'置顶'" v-html="Icons.pin"></button>
          <button class="act" @click.stop="$emit('edit')" title="编辑" v-html="Icons.edit"></button>
          <button class="act danger" @click.stop="$emit('delete')" title="删除" v-html="Icons.trash"></button>
        </div>
      </div>
      <div class="copy-flash"></div>
    </div>
  `,
};

// ── EditModal ────────────────────────────────────────────────────────────────
const EditModal = {
  name: 'EditModal',
  props: ['draft', 'categories'],
  emits: ['save', 'cancel', 'update:draft'],
  setup(props, { emit }) {
    const titleInput = ref(null);
    onMounted(() => nextTick(() => titleInput.value && titleInput.value.focus()));
    function up(k, v) { emit('update:draft', { ...props.draft, [k]: v }); }
    const charInfo = computed(() => {
      const b = props.draft.body || '';
      return `${b.length} 字符 · ${b.split('\n').length} 行`;
    });
    return { titleInput, up, charInfo, Icons };
  },
  computed: {
    disabled() { return !(this.draft.title||'').trim() && !(this.draft.body||'').trim(); },
  },
  template: `
    <div class="modal-wrap" @click="$emit('cancel')">
      <div class="modal" @click.stop>
        <div class="modal-hd">
          <div class="modal-ttl">{{ draft.id ? '编辑条目' : '新增条目' }}</div>
          <button class="ico-btn" @click="$emit('cancel')" v-html="Icons.close"></button>
        </div>
        <div class="modal-body">
          <label class="fld">
            <span class="fld-l">标题</span>
            <input ref="titleInput" :value="draft.title"
                   @input="up('title',$event.target.value)"
                   placeholder="给这条信息起个名字" maxlength="40"/>
          </label>
          <label class="fld">
            <span class="fld-l">分类</span>
            <div class="seg">
              <button v-for="c in categories" :key="c"
                      :class="'seg-b'+(draft.category===c?' on':'')"
                      @click="up('category',c)">{{ c }}</button>
            </div>
          </label>
          <label class="fld">
            <span class="fld-l">内容</span>
            <textarea rows="6" :value="draft.body"
                      @input="up('body',$event.target.value)"
                      placeholder="粘贴或输入要复制的文本…支持多行"></textarea>
            <span class="fld-h">{{ charInfo }}</span>
          </label>
        </div>
        <div class="modal-ft">
          <button class="btn ghost" @click="$emit('cancel')">取消</button>
          <button class="btn primary" @click="$emit('save')" :disabled="disabled">
            {{ draft.id ? '保存' : '添加' }}
          </button>
        </div>
      </div>
    </div>
  `,
};

// ── ConfirmDelete ────────────────────────────────────────────────────────────
const ConfirmDelete = {
  name: 'ConfirmDelete',
  props: ['item'],
  emits: ['cancel', 'ok'],
  setup() { return { Icons }; },
  template: `
    <div class="modal-wrap" @click="$emit('cancel')">
      <div class="modal small" @click.stop>
        <div class="modal-body">
          <div class="cd-ic" v-html="Icons.trash"></div>
          <div class="cd-t">删除「{{ item.title || '未命名' }}」?</div>
          <div class="cd-s">删除后无法恢复。</div>
        </div>
        <div class="modal-ft">
          <button class="btn ghost" @click="$emit('cancel')">取消</button>
          <button class="btn danger" @click="$emit('ok')">删除</button>
        </div>
      </div>
    </div>
  `,
};

// ── CategoryModal ────────────────────────────────────────────────────────────
const CategoryModal = {
  name: 'CategoryModal',
  props: ['categories', 'itemCounts'],
  emits: ['close', 'add', 'rename', 'delete'],
  setup(props, { emit }) {
    const newName    = ref('');
    const editingIdx = ref(-1);
    const editingVal = ref('');
    const confirmIdx = ref(-1);

    const editInputRef = ref(null);
    function startEdit(i) {
      editingIdx.value = i;
      editingVal.value = props.categories[i];
      confirmIdx.value = -1;
      nextTick(() => { if (editInputRef.value) editInputRef.value.focus(); });
    }
    function saveEdit(i) {
      const v = editingVal.value.trim();
      if (v && v !== props.categories[i]) emit('rename', { index: i, name: v });
      editingIdx.value = -1;
    }
    function cancelEdit() { editingIdx.value = -1; }

    function tryDelete(i) { confirmIdx.value = i; editingIdx.value = -1; }
    function confirmDelete(i) { emit('delete', i); confirmIdx.value = -1; }
    function cancelDelete() { confirmIdx.value = -1; }

    function addCat() {
      const v = newName.value.trim();
      if (!v) return;
      emit('add', v);
      newName.value = '';
    }

    return { newName, editingIdx, editingVal, confirmIdx, editInputRef, Icons,
             startEdit, saveEdit, cancelEdit, tryDelete, confirmDelete, cancelDelete, addCat };
  },
  template: `
    <div class="modal-wrap" @click="$emit('close')">
      <div class="modal" @click.stop style="max-width:320px">
        <div class="modal-hd">
          <div class="modal-ttl">管理分类</div>
          <button class="ico-btn" @click="$emit('close')" v-html="Icons.close"></button>
        </div>
        <div class="modal-body" style="gap:6px; padding-bottom:6px">

          <!-- category list -->
          <div v-for="(cat, i) in categories" :key="cat" class="cat-row">
            <!-- confirm delete state -->
            <template v-if="confirmIdx===i">
              <div class="cat-confirm">
                <span class="cat-confirm-text">删除「{{ cat }}」及其 {{ itemCounts[cat]||0 }} 条条目？</span>
                <button class="btn danger" style="padding:4px 10px;font-size:11.5px" @click="confirmDelete(i)">确认</button>
                <button class="btn ghost"  style="padding:4px 10px;font-size:11.5px" @click="cancelDelete">取消</button>
              </div>
            </template>
            <!-- edit state -->
            <template v-else-if="editingIdx===i">
              <input :ref="el => { if(el) editInputRef = el }" class="cat-edit-input"
                     v-model="editingVal"
                     @keydown.enter="saveEdit(i)"
                     @keydown.escape="cancelEdit"
                     maxlength="20"/>
              <button class="act" style="opacity:1;color:var(--accent)" @click="saveEdit(i)" v-html="Icons.check"></button>
              <button class="act" @click="cancelEdit" v-html="Icons.close"></button>
            </template>
            <!-- normal state -->
            <template v-else>
              <span class="cat" :data-cat="cat" style="font-size:11px">{{ cat }}</span>
              <span class="cat-count">{{ itemCounts[cat]||0 }} 条</span>
              <div style="flex:1"></div>
              <button class="act" title="重命名" @click="startEdit(i)" v-html="Icons.edit"></button>
              <button class="act danger" title="删除分类" @click="tryDelete(i)" v-html="Icons.trash"></button>
            </template>
          </div>

          <div v-if="categories.length===0" class="cat-empty">暂无自定义分类</div>
        </div>

        <!-- add new category -->
        <div class="cat-add-row">
          <input class="cat-add-input" v-model="newName"
                 placeholder="新分类名称…" maxlength="20"
                 @keydown.enter="addCat"/>
          <button class="btn primary" style="padding:6px 12px" @click="addCat"
                  :disabled="!newName.trim()" v-html="Icons.plus"></button>
        </div>
        <div class="modal-ft" style="padding-top:8px">
          <button class="btn ghost" @click="$emit('close')">关闭</button>
        </div>
      </div>
    </div>
  `,
};

// ── Root App ─────────────────────────────────────────────────────────────────
createApp({
  components: { SnippetRow, EditModal, ConfirmDelete, CategoryModal },

  setup() {
    const items        = ref([]);
    const categories   = ref([...DEFAULT_CATS]);   // custom cats (no '全部')
    const query        = ref('');
    const activeCat    = ref('全部');
    const copiedId     = ref(null);
    const editingItem  = ref(null);
    const confirmDel   = ref(null);
    const catManage    = ref(false);
    const menuOpen     = ref(false);
    const hint         = ref('');
    const theme        = ref('light');
    const accent       = ref('#3B6EF5');
    const drag         = ref(null);
    const rowEls       = {};
    const listEl       = ref(null);
    const catsEl       = ref(null);
    let catsDrag       = null;

    onMounted(async () => {
      await initStoragePath();
      await initTray();
      [items.value, categories.value] = await Promise.all([loadItems(), loadCats()]);
      if (typeof Neutralino !== 'undefined') {
        const raw = await storageGet(WINDOW_SIZE_KEY);
        if (raw) {
          try {
            const { width, height } = JSON.parse(raw);
            await Neutralino.window.setSize({ width, height });
          } catch(e) {}
        }
      }
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) theme.value = 'dark';
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        theme.value = e.matches ? 'dark' : 'light';
      });
    });

    watch(items,      val => saveItems(val),          { deep: true });
    watch(categories, val => saveCats(val),            { deep: true });

    // all categories including '全部'
    const allCats = computed(() => ['全部', ...categories.value]);

    const visible = computed(() => {
      const q = query.value.trim().toLowerCase();
      return items.value
        .filter(it => activeCat.value === '全部' || it.category === activeCat.value)
        .filter(it => !q || (it.title + ' ' + it.body).toLowerCase().includes(q))
        .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    });

    const canReorder = computed(() => !query.value.trim() && activeCat.value === '全部');

    const catCounts = computed(() => {
      const counts = { '全部': items.value.length };
      for (const c of categories.value) {
        counts[c] = items.value.filter(it => it.category === c).length;
      }
      return counts;
    });

    function setHint(msg, ms = 1400) {
      hint.value = msg;
      setTimeout(() => { if (hint.value === msg) hint.value = ''; }, ms);
    }

    async function copyItem(it) {
      await copyToClipboard(it.body);
      copiedId.value = it.id;
      setHint(`已复制 「${it.title}」`, 1600);
      setTimeout(() => { if (copiedId.value === it.id) copiedId.value = null; }, 1200);
    }

    function startNew() {
      const defaultCat = activeCat.value === '全部'
        ? (categories.value[0] || '联系')
        : activeCat.value;
      editingItem.value = { title: '', body: '', category: defaultCat };
    }
    function startEdit(it) { editingItem.value = { ...it }; }

    function saveEdit() {
      const d = editingItem.value;
      if (!d) return;
      if (!d.title.trim() && !d.body.trim()) { editingItem.value = null; return; }
      if (d.id) {
        items.value = items.value.map(it => it.id === d.id ? { ...it, ...d } : it);
        setHint('已更新');
      } else {
        items.value = [{ id: uid(), pinned: false, ...d }, ...items.value];
        setHint('已新增');
      }
      editingItem.value = null;
    }

    function deleteItem(id) {
      items.value = items.value.filter(it => it.id !== id);
      confirmDel.value = null;
      setHint('已删除');
    }
    function togglePin(id) {
      items.value = items.value.map(it => it.id === id ? { ...it, pinned: !it.pinned } : it);
    }

    // ── category management ──────────────────────────────────────────────────
    function addCategory(name) {
      if (!name || categories.value.includes(name)) return;
      categories.value = [...categories.value, name];
      setHint(`已添加分类「${name}」`);
    }

    function renameCategory({ index, name }) {
      if (!name || categories.value.includes(name)) return;
      const old = categories.value[index];
      categories.value = categories.value.map((c, i) => i === index ? name : c);
      // rename all items in this category
      items.value = items.value.map(it => it.category === old ? { ...it, category: name } : it);
      if (activeCat.value === old) activeCat.value = name;
      setHint(`已重命名为「${name}」`);
    }

    function deleteCategory(index) {
      const cat = categories.value[index];
      categories.value = categories.value.filter((_, i) => i !== index);
      items.value = items.value.filter(it => it.category !== cat);
      if (activeCat.value === cat) activeCat.value = '全部';
      setHint(`已删除分类「${cat}」`);
    }

    // ── misc ─────────────────────────────────────────────────────────────────
    function restoreSeed() { items.value = SEED.map(s => ({ ...s })); menuOpen.value = false; }
    function clearAll()    { items.value = []; menuOpen.value = false; }

    async function exportJson() {
      const json = JSON.stringify(items.value, null, 2);
      try {
        if (typeof Neutralino !== 'undefined') {
          const path = await Neutralino.os.showSaveDialog('导出 JSON', { defaultPath: 'snippets.json', filters: [{ name: 'JSON', extensions: ['json'] }] });
          if (path) await Neutralino.filesystem.writeFile(path, json);
        } else {
          const blob = new Blob([json], { type: 'application/json' });
          const u = URL.createObjectURL(blob); const a = document.createElement('a');
          a.href = u; a.download = 'snippets.json'; a.click(); URL.revokeObjectURL(u);
        }
      } catch (e) {}
      menuOpen.value = false;
    }

    async function minimize() { try { if (typeof Neutralino !== 'undefined') await Neutralino.window.minimize(); } catch (e) {} }
    async function closeApp() {
      try {
        if (typeof Neutralino !== 'undefined') {
          await Neutralino.window.hide();
          _winVisible = false;
          await _setTrayMenu(false);
        }
      } catch (e) {}
    }

    // ── window dragging (manual window.move, works reliably on Windows) ────────
    let winDrag       = null;   // { startX, startY, winX, winY }
    let winDragActive = false;  // guard: pointerup before getPosition resolves
    let winRafId      = null;
    let winLatestX    = 0, winLatestY = 0;

    async function startWindowDrag(e) {
      if (typeof Neutralino === 'undefined') return;
      if (e.button !== 0) return;
      e.preventDefault();
      winDragActive = true;
      const sx = e.screenX, sy = e.screenY;
      try {
        const pos = await Neutralino.window.getPosition();
        if (!winDragActive) return;
        winDrag = { startX: sx, startY: sy, winX: pos.x, winY: pos.y };
        winLatestX = sx; winLatestY = sy;
      } catch(err) {}
    }

    function onWinPointerMove(e) {
      if (!winDrag) return;
      winLatestX = e.screenX; winLatestY = e.screenY;
      if (!winRafId) {
        winRafId = requestAnimationFrame(() => {
          winRafId = null;
          if (!winDrag) return;
          Neutralino.window.move(
            winDrag.winX + winLatestX - winDrag.startX,
            winDrag.winY + winLatestY - winDrag.startY
          ).catch(() => {});
        });
      }
    }

    function onWinPointerUp() {
      winDrag = null;
      winDragActive = false;
      if (winRafId) { cancelAnimationFrame(winRafId); winRafId = null; }
    }

    // ── edge resize ──────────────────────────────────────────────────────────
    const MIN_W = 300, MIN_H = 420, MAX_W = 600, MAX_H = 900;
    let resizeDrag    = null;
    let resizeRafId   = null;
    let resizePending = null;

    async function startResize(dir, e) {
      if (typeof Neutralino === 'undefined') return;
      if (e.button !== 0) return;
      e.preventDefault(); e.stopPropagation();
      try {
        const [size, pos] = await Promise.all([Neutralino.window.getSize(), Neutralino.window.getPosition()]);
        resizeDrag = { dir, startX: e.screenX, startY: e.screenY,
          startW: size.width, startH: size.height, startWinX: pos.x, startWinY: pos.y };
      } catch(err) {}
    }

    function onResizeMove(e) {
      if (!resizeDrag) return;
      const { dir, startX, startY, startW, startH, startWinX, startWinY } = resizeDrag;
      const dx = e.screenX - startX, dy = e.screenY - startY;
      let newW = startW, newH = startH, newX = startWinX, newY = startWinY;
      if (dir.includes('e')) newW = Math.round(Math.min(MAX_W, Math.max(MIN_W, startW + dx)));
      if (dir.includes('w')) { newW = Math.round(Math.min(MAX_W, Math.max(MIN_W, startW - dx))); newX = Math.round(startWinX + startW - newW); }
      if (dir.includes('s')) newH = Math.round(Math.min(MAX_H, Math.max(MIN_H, startH + dy)));
      if (dir.includes('n')) { newH = Math.round(Math.min(MAX_H, Math.max(MIN_H, startH - dy))); newY = Math.round(startWinY + startH - newH); }
      resizePending = { dir, newW, newH, newX, newY };
      if (!resizeRafId) {
        resizeRafId = requestAnimationFrame(() => {
          resizeRafId = null;
          if (!resizePending) return;
          const { dir: d, newW, newH, newX, newY } = resizePending;
          resizePending = null;
          const ops = [Neutralino.window.setSize({ width: newW, height: newH })];
          if (d.includes('w') || d.includes('n')) ops.push(Neutralino.window.move(newX, newY));
          Promise.all(ops).catch(() => {});
        });
      }
    }

    async function onResizeEnd() {
      if (!resizeDrag) return;
      resizeDrag = null;
      if (resizeRafId) { cancelAnimationFrame(resizeRafId); resizeRafId = null; }
      resizePending = null;
      try {
        if (typeof Neutralino !== 'undefined') {
          const size = await Neutralino.window.getSize();
          await storageSet(WINDOW_SIZE_KEY, JSON.stringify({ width: size.width, height: size.height }));
        }
      } catch(err) {}
    }

    // ── cats horizontal drag-scroll ──────────────────────────────────────────
    function onCatsDragStart(e) {
      if (e.button !== 0) return;
      catsDrag = { startX: e.pageX, scrollLeft: catsEl.value.scrollLeft, moved: false };
    }
    function onCatsDragMove(e) {
      if (!catsDrag) return;
      const dx = e.pageX - catsDrag.startX;
      if (Math.abs(dx) > 3) catsDrag.moved = true;
      if (catsDrag.moved) {
        e.preventDefault();
        catsEl.value.scrollLeft = catsDrag.scrollLeft - dx;
      }
    }
    function onCatsDragEnd(e) {
      if (catsDrag && catsDrag.moved) e.stopPropagation();
      catsDrag = null;
    }

    // ── drag & drop ──────────────────────────────────────────────────────────
    function startDrag(item, e) {
      if (!canReorder.value) { setHint('清除搜索与分类后可拖拽排序', 1800); return; }
      e.preventDefault(); e.stopPropagation();
      const node = rowEls[item.id]; if (!node) return;
      const rect = node.getBoundingClientRect();
      const fromIdx = items.value.findIndex(it => it.id === item.id);
      drag.value = { id: item.id, fromIdx, overIdx: fromIdx, y: e.clientY, offsetY: e.clientY - rect.top, height: rect.height };
      e.currentTarget && e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId);
    }
    function onDragMove(e) {
      if (!drag.value) return;
      const y = e.clientY; const ids = items.value.map(it => it.id);
      let overIdx = drag.value.fromIdx;
      for (let i = 0; i < ids.length; i++) {
        const node = rowEls[ids[i]]; if (!node) continue;
        const r = node.getBoundingClientRect();
        if (y < r.top + r.height / 2) { overIdx = i; break; }
        overIdx = i + 1;
      }
      drag.value = { ...drag.value, y, overIdx: Math.max(0, Math.min(ids.length, overIdx)) };
    }
    function endDrag() {
      if (!drag.value) return;
      const { fromIdx, overIdx } = drag.value;
      if (fromIdx !== overIdx && fromIdx !== overIdx - 1) {
        const next = items.value.slice();
        const [moved] = next.splice(fromIdx, 1);
        next.splice(overIdx > fromIdx ? overIdx - 1 : overIdx, 0, moved);
        items.value = next; setHint('顺序已更新', 1200);
      }
      drag.value = null;
    }
    onMounted(() => {
      window.addEventListener('pointermove', onDragMove);
      window.addEventListener('pointerup',   endDrag);
      window.addEventListener('pointercancel', endDrag);
      window.addEventListener('pointermove', onWinPointerMove);
      window.addEventListener('pointerup',   onWinPointerUp);
      window.addEventListener('pointercancel', onWinPointerUp);
      window.addEventListener('pointermove', onResizeMove);
      window.addEventListener('pointerup',   onResizeEnd);
      window.addEventListener('pointercancel', onResizeEnd);
    });
    onUnmounted(() => {
      window.removeEventListener('pointermove', onDragMove);
      window.removeEventListener('pointerup',   endDrag);
      window.removeEventListener('pointercancel', endDrag);
      window.removeEventListener('pointermove', onWinPointerMove);
      window.removeEventListener('pointerup',   onWinPointerUp);
      window.removeEventListener('pointercancel', onWinPointerUp);
      window.removeEventListener('pointermove', onResizeMove);
      window.removeEventListener('pointerup',   onResizeEnd);
      window.removeEventListener('pointercancel', onResizeEnd);
    });

    function regRow(id, el) { if (el) rowEls[id] = el.$el || el; else delete rowEls[id]; }

    return {
      items, categories, query, activeCat, copiedId, editingItem, confirmDel,
      catManage, menuOpen, hint, theme, accent, drag, listEl, catsEl,
      allCats, visible, canReorder, catCounts, Icons,
      copyItem, startNew, startEdit, saveEdit, deleteItem, togglePin,
      addCategory, renameCategory, deleteCategory,
      restoreSeed, clearAll, exportJson, minimize, closeApp,
      startWindowDrag, startResize,
      startDrag, regRow,
      onCatsDragStart, onCatsDragMove, onCatsDragEnd,
    };
  },

  template: `
    <div :class="['widget', theme]" :style="{'--accent': accent}"
         @click="menuOpen && (menuOpen=false)">

      <!-- resize handles -->
      <div class="resize-handle resize-n"  @pointerdown.stop="startResize('n',  $event)"></div>
      <div class="resize-handle resize-s"  @pointerdown.stop="startResize('s',  $event)"></div>
      <div class="resize-handle resize-e"  @pointerdown.stop="startResize('e',  $event)"></div>
      <div class="resize-handle resize-w"  @pointerdown.stop="startResize('w',  $event)"></div>
      <div class="resize-handle resize-ne" @pointerdown.stop="startResize('ne', $event)"></div>
      <div class="resize-handle resize-nw" @pointerdown.stop="startResize('nw', $event)"></div>
      <div class="resize-handle resize-se" @pointerdown.stop="startResize('se', $event)"></div>
      <div class="resize-handle resize-sw" @pointerdown.stop="startResize('sw', $event)"></div>

      <!-- titlebar -->
      <div class="titlebar">
        <div id="drag-titlebar" class="titlebar-drag" @pointerdown="startWindowDrag"></div>
        <div class="titlebar-wc">
          <button class="wc-btn wc-close" title="关闭" @click="closeApp"></button>
          <button class="wc-btn wc-min"   title="最小化" @click="minimize"></button>
        </div>
      </div>

      <!-- header -->
      <header class="hd">
        <div id="drag-header" class="hd-l" @pointerdown="startWindowDrag">
          <div class="logo"></div>
          <div>
            <div class="ttl">速贴</div>
            <div class="sub">{{ items.length }} 条 · 单击即复制</div>
          </div>
        </div>
        <div class="hd-r">
          <button class="ico-btn" title="新增" @click.stop="startNew" v-html="Icons.plus"></button>
          <button class="ico-btn" title="更多" @click.stop="menuOpen=!menuOpen" v-html="Icons.dots"></button>
          <div v-if="menuOpen" class="menu" @mouseleave="menuOpen=false">
            <button @click="catManage=true; menuOpen=false">🏷 管理分类</button>
            <button @click="restoreSeed">恢复示例数据</button>
            <button @click="clearAll">清空全部</button>
            <button @click="exportJson">导出 JSON</button>
            <button @click="theme=theme==='light'?'dark':'light'; menuOpen=false">
              切换{{ theme==='light'?'深色':'浅色' }}主题
            </button>
          </div>
        </div>
      </header>

      <!-- search -->
      <div class="search">
        <span class="search-ico" v-html="Icons.search"></span>
        <input v-model="query" placeholder="搜索条目内容…"/>
        <button v-if="query" class="clr" @click="query=''">清除</button>
      </div>

      <!-- categories -->
      <div class="cats" ref="catsEl"
           @wheel.prevent="e => catsEl.scrollLeft += e.deltaY || e.deltaX"
           @mousedown="onCatsDragStart"
           @mousemove="onCatsDragMove"
           @mouseup="onCatsDragEnd"
           @mouseleave="onCatsDragEnd">
        <button v-for="c in allCats" :key="c"
                :class="'chip'+(c===activeCat?' on':'')"
                @click="activeCat=c">
          {{ c }}<span class="chip-n">{{ catCounts[c] || 0 }}</span>
        </button>
      </div>

      <!-- list -->
      <div class="list" ref="listEl">
        <div v-if="visible.length===0" class="empty">
          <div class="empty-dot"></div>
          <div class="empty-t">{{ query ? '没有匹配条目' : '暂无条目' }}</div>
          <div class="empty-s">{{ query ? '试试别的关键字' : '点击右上角 + 新增一条' }}</div>
          <button v-if="!query" class="empty-btn" @click="startNew">
            <span v-html="Icons.plus"></span><span>新增条目</span>
          </button>
        </div>
        <template v-for="it in visible" :key="it.id">
          <div v-if="drag && canReorder
                     && drag.overIdx===items.indexOf(it)
                     && drag.fromIdx!==items.indexOf(it)
                     && drag.fromIdx!==items.indexOf(it)-1"
               class="drop-line"></div>
          <snippet-row :ref="el=>regRow(it.id,el)" :item="it"
            :copied="copiedId===it.id" :dragging="drag&&drag.id===it.id" :can-reorder="canReorder"
            @copy="copyItem(it)" @edit="startEdit(it)" @delete="confirmDel=it"
            @toggle-pin="togglePin(it.id)" @drag-start="e=>startDrag(it,e)"/>
        </template>
        <div v-if="drag&&canReorder&&drag.overIdx===items.length&&drag.fromIdx!==items.length-1" class="drop-line"></div>
        <div v-if="visible.length>0" class="list-end">— 没有更多了 —</div>
      </div>

      <!-- footer -->
      <footer class="ft">
        <span class="ft-l"><span class="dot"></span> 已就绪</span>
        <span class="ft-r">{{ hint || '单击条目复制到剪贴板' }}</span>
      </footer>

      <!-- modals -->
      <edit-modal v-if="editingItem" :draft="editingItem" :categories="categories"
        @update:draft="editingItem=$event" @save="saveEdit" @cancel="editingItem=null"/>
      <confirm-delete v-if="confirmDel" :item="confirmDel"
        @cancel="confirmDel=null" @ok="deleteItem(confirmDel.id)"/>
      <category-modal v-if="catManage" :categories="categories" :item-counts="catCounts"
        @close="catManage=false" @add="addCategory" @rename="renameCategory" @delete="deleteCategory"/>
    </div>
  `,
}).mount('#app');
