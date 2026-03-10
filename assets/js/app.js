// SW证书生成器 v2.0 - 主要JavaScript逻辑

// 版本号配置 - 每次更新时递增此版本号
const APP_VERSION = '1.0.5';

class CertificateGenerator {
  constructor() {
    this.canvas = document.getElementById('certificateCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.uidInput = document.getElementById('uidInput');
    this.nameInput = document.getElementById('nameInput');
    this.avatarUpload = document.getElementById('avatarUpload');
    this.coordsDisplay = document.getElementById('coordsDisplay');
    this.loadingOverlay = document.getElementById('loadingOverlay');
    this.errorOverlay = document.getElementById('errorOverlay');
    this.retryBtn = document.getElementById('retryBtn');
    
    // 获取基础路径（用于 GitHub Pages）
    this.basePath = this.getBasePath();
    
    // 遮罩图层
    this.mask = new Image();
    this.mask.crossOrigin = 'anonymous';
    this.mask.src = this.getPath('assets/images/masks/mask1.png');
    this.mask.onload = () => this.safeRedraw('mask1 loaded');
    this.mask.onerror = (e) => console.warn('mask1 load failed', this.mask.src, e);
    
    // 第二个遮罩图层
    this.mask2 = new Image();
    this.mask2.crossOrigin = 'anonymous';
    this.mask2.src = this.getPath('assets/images/masks/mask2.png');
    this.mask2.onload = () => this.safeRedraw('mask2 loaded');
    this.mask2.onerror = (e) => console.warn('mask2 load failed', this.mask2.src, e);
    
    // 第三个遮罩图层（用于实物模板）
    this.mask3 = new Image();
    this.mask3.crossOrigin = 'anonymous';
    this.mask3.src = this.getPath('assets/images/masks/mask3.png');
    this.mask3.onload = () => this.safeRedraw('mask3 loaded');
    this.mask3.onerror = (e) => console.warn('mask3 load failed', this.mask3.src, e);
    
    // 模板配置：晋级证书模板（LV1-LV9）
    this.templates = {
      english: {
        1: "templates/english/English_vip1.jpg",
        2: "templates/english/English_vip2.jpg",
        3: "templates/english/English_vip3.jpg",
        4: "templates/english/English_vip4.jpg",
        5: "templates/english/English_vip5.jpg",
        6: "templates/english/English_vip6.jpg",
        7: "templates/english/English_vip7.jpg",
        8: "templates/english/English_vip8.jpg",
        9: "templates/english/English_vip9.jpg"
      },
      vietnamese: {
        1: "templates/vietnamese/Vietnamese_vip1.jpg",
        2: "templates/vietnamese/Vietnamese_vip2.jpg",
        3: "templates/vietnamese/Vietnamese_vip3.jpg",
        4: "templates/vietnamese/Vietnamese_vip4.jpg",
        5: "templates/vietnamese/Vietnamese_vip5.jpg",
        6: "templates/vietnamese/Vietnamese_vip6.jpg",
        7: "templates/vietnamese/Vietnamese_vip7.jpg",
        8: "templates/vietnamese/Vietnamese_vip8.jpg",
        9: "templates/vietnamese/Vietnamese_vip9.jpg"
      },
      arabic: {
        1: "templates/arabic/Arabic_vip1.jpg",
        2: "templates/arabic/Arabic_vip2.jpg",
        3: "templates/arabic/Arabic_vip3.jpg",
        4: "templates/arabic/Arabic_vip4.jpg",
        5: "templates/arabic/Arabic_vip5.jpg",
        6: "templates/arabic/Arabic_vip6.jpg",
        7: "templates/arabic/Arabic_vip7.jpg",
        8: "templates/arabic/Arabic_vip8.jpg",
        9: "templates/arabic/Arabic_vip9.jpg"
      },
      portuguese: {
        1: "templates/portuguese/Portuguese_vip1.jpg",
        2: "templates/portuguese/Portuguese_vip2.jpg",
        3: "templates/portuguese/Portuguese_vip3.jpg",
        4: "templates/portuguese/Portuguese_vip4.jpg",
        5: "templates/portuguese/Portuguese_vip5.jpg",
        6: "templates/portuguese/Portuguese_vip6.jpg",
        7: "templates/portuguese/Portuguese_vip7.jpg",
        8: "templates/portuguese/Portuguese_vip8.jpg",
        9: "templates/portuguese/Portuguese_vip9.jpg"
      },
      reward500: {
        english: "templates/reward500/english/Reward500_english.jpg",
        vietnamese: "templates/reward500/vietnamese/Reward500_vietnamese.jpg",
        arabic: "templates/reward500/arabic/Reward500_arabic.jpg",
        portuguese: "templates/reward500/portuguese/Reward500_portuguese.jpg"
      },
      goldbar: {
        english: "templates/goldbar/english/GoldBar_english.jpg",
        arabic: "templates/goldbar/arabic/GoldBar_arabic.jpg"
      },
      phone1699: {
        english: "templates/phone1699/english/Phone1699_english.jpg"
      },
      phone1800: {
        english: "templates/phone1800/english/Phone1800_english.jpg",
        arabic: "templates/phone1800/arabic/Phone1800_arabic.jpg"
      },
      birthday: {
        "50": "templates/birthday/english/Birthday_50_english.jpg",
        "100": "templates/birthday/english/Birthday_100_english.jpg"
      },
      fund5000: {
        english: "templates/fund5000/english/Fund5000_english.jpg"
      }
    };
    
    // 语言代码对应的中文名称
    this.countryNames = {
      english: '晋级 - 英语',
      vietnamese: '晋级 - 越南语',
      arabic: '晋级 - 阿拉伯语',
      portuguese: '晋级 - 葡萄牙语',
      reward500: '实物 - 500美金',
      goldbar: '实物 - 3888金条',
      phone1699: '实物 - 1699手机',
      phone1800: '实物 - 1800手机',
      birthday: '实物 - 生日奖励',
      fund5000: '实物 - 5000基金'
    };
    
    // 默认位置配置（基于新时代模板尺寸）
    this.defaultPositions = {
      default: {
        avatarX: 450,
        avatarY: 820,
        avatarSize: 690,
        uidX: 546,
        uidY: 1744,
        uidSize: 110,
        // UID 字间距（tracking），新时代模板默认不额外加字距
        uidLetterSpacing: 0,
        nameX: 802,
        nameY: 1545,
        nameSize: 114
      },
      reward500: {
        avatarX: 333,
        avatarY: 962,
        avatarSize: 700,
        uidX: 1412,
        uidY: 1391,
        uidSize: 110,
        uidLetterSpacing: 0,
        nameX: 1546,
        nameY: 1190,
        nameSize: 144
      },
      goldbar: {
        avatarX: 333,
        avatarY: 962,
        avatarSize: 700,
        uidX: 1412,
        uidY: 1391,
        uidSize: 110,
        uidLetterSpacing: 0,
        nameX: 1546,
        nameY: 1190,
        nameSize: 144
      },
      phone1699: {
        avatarX: 333,
        avatarY: 962,
        avatarSize: 700,
        uidX: 1412,
        uidY: 1391,
        uidSize: 110,
        uidLetterSpacing: 0,
        nameX: 1546,
        nameY: 1190,
        nameSize: 144
      },
      phone1800: {
        avatarX: 333,
        avatarY: 962,
        avatarSize: 700,
        uidX: 1412,
        uidY: 1391,
        uidSize: 110,
        uidLetterSpacing: 0,
        nameX: 1546,
        nameY: 1190,
        nameSize: 144
      },
      birthday: {
        avatarX: 333,
        avatarY: 962,
        avatarSize: 700,
        uidX: 1412,
        uidY: 1391,
        uidSize: 110,
        uidLetterSpacing: 0,
        nameX: 1546,
        nameY: 1190,
        nameSize: 144
      },
      fund5000: {
        avatarX: 333,
        avatarY: 962,
        avatarSize: 700,
        uidX: 1412,
        uidY: 1391,
        uidSize: 110,
        uidLetterSpacing: 0,
        nameX: 1546,
        nameY: 1190,
        nameSize: 144
      }
    };
    
    // 当前状态
    this.template = new Image();
    this.template.crossOrigin = 'anonymous'; // 设置跨域，避免 canvas 被污染
    this.currentCountry = 'english';
    this.currentVip = 1;
    this.avatar = null;
    
    // 位置和大小参数（初始化为默认位置）
    this.avatarX = this.defaultPositions.default.avatarX;
    this.avatarY = this.defaultPositions.default.avatarY;
    this.avatarSize = this.defaultPositions.default.avatarSize;
    this.uidX = this.defaultPositions.default.uidX;
    this.uidY = this.defaultPositions.default.uidY;
    this.uidSize = this.defaultPositions.default.uidSize;
    this.uidLetterSpacing = this.defaultPositions.default.uidLetterSpacing;
    this.nameX = this.defaultPositions.default.nameX;
    this.nameY = this.defaultPositions.default.nameY;
    this.nameSize = this.defaultPositions.default.nameSize;
    
    // 拖拽状态
    this.dragging = null;
    this.offsetX = 0;
    this.offsetY = 0;
    
    this.init();
  }

  // 避免在模板尚未加载完成时重绘导致异常
  safeRedraw(reason = '') {
    try {
      if (this.template && this.template.complete && this.template.naturalWidth > 0) {
        // console.debug('[safeRedraw]', reason);
        this.drawAll();
      }
    } catch (e) {
      console.warn('safeRedraw failed', reason, e);
    }
  }
  
  // 获取基础路径（用于 GitHub Pages）
  getBasePath() {
    // 如果是 file:// 协议（本地文件），返回空字符串
    if (window.location.protocol === 'file:') {
      console.log('检测到 file:// 协议，使用空基础路径');
      return '';
    }
    
    const hostname = window.location.hostname;
    const path = window.location.pathname;
    const origin = window.location.origin;
    
    console.log('路径检测信息:', {
      protocol: window.location.protocol,
      hostname: hostname,
      pathname: path,
      origin: origin
    });
    
    // 如果是 GitHub Pages (github.io 域名)
    if (hostname.includes('github.io')) {
      // 提取仓库名，格式通常是 username.github.io/repo-name/
      const parts = path.split('/').filter(p => p && p !== 'index.html');
      if (parts.length > 0) {
        // 第一个部分通常是仓库名
        const repoName = parts[0];
        // 排除 index.html 等文件名
        if (repoName && !repoName.includes('.')) {
          const basePath = '/' + repoName + '/';
          console.log('检测到 GitHub Pages，基础路径:', basePath);
          return basePath;
        }
      }
      // 如果路径是根路径，可能是自定义域名，返回空字符串
      console.log('GitHub Pages 根路径，使用空基础路径');
      return '';
    }
    
    // 对于其他情况，检查路径是否包含仓库名
    // 排除常见的系统路径（如 /Users/, /home/ 等）
    const match = path.match(/^\/([^\/]+)\//);
    if (match && match[1] !== '' && 
        match[1] !== 'Users' && 
        match[1] !== 'home' && 
        match[1] !== 'var' && 
        match[1] !== 'tmp' &&
        match[1] !== 'index.html') {
      const basePath = '/' + match[1] + '/';
      console.log('检测到子路径，基础路径:', basePath);
      return basePath;
    }
    // 否则返回空字符串（用于本地开发服务器或根路径）
    console.log('使用空基础路径（本地开发服务器或根路径）');
    return '';
  }
  
  // 修正资源路径
  getPath(relativePath) {
    // 如果路径已经是绝对路径（http/https/绝对路径），直接返回
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://') || 
        (relativePath.startsWith('/') && !relativePath.startsWith('//'))) {
      return relativePath;
    }
    // 如果基础路径为空，直接返回相对路径
    if (this.basePath === '') {
      return relativePath;
    }
    // 否则添加基础路径
    return this.basePath + relativePath;
  }
  
  async init() {
    // 等待字体加载完成
    await document.fonts.ready;
    
    // 显示版本号
    this.displayVersion();
    
    this.setupEventListeners();
    // 初始显示加载动画
    this.showLoading();
    this.loadTemplate();
  }
  
  // 显示版本号
  displayVersion() {
    const versionElement = document.getElementById('versionInfo');
    if (versionElement) {
      versionElement.textContent = `v${APP_VERSION}`;
    }
  }
  
  // 根据语言设置默认位置
  setDefaultPositions(country) {
    // 根据模板类型选择对应的默认位置配置
    const positions = this.defaultPositions[country] || this.defaultPositions.default;
    
    this.avatarX = positions.avatarX;
    this.avatarY = positions.avatarY;
    this.avatarSize = positions.avatarSize;
    this.uidX = positions.uidX;
    this.uidY = positions.uidY;
    this.uidSize = positions.uidSize;
    this.uidLetterSpacing = positions.uidLetterSpacing;
    this.nameX = positions.nameX;
    this.nameY = positions.nameY;
    this.nameSize = positions.nameSize;
  }

  // 带字间距的文本绘制（用于 UID）
  drawTextWithLetterSpacing(ctx, text, x, y, letterSpacing) {
    if (!text) return;
    const spacing = Number(letterSpacing) || 0;
    if (spacing === 0) {
      ctx.fillText(text, x, y);
      return;
    }

    let currentX = x;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      ctx.fillText(ch, currentX, y);
      const chWidth = ctx.measureText(ch).width;
      currentX += chWidth + spacing;
    }
  }

  measureTextWithLetterSpacing(ctx, text, letterSpacing) {
    if (!text) return 0;
    const spacing = Number(letterSpacing) || 0;
    if (spacing === 0) return ctx.measureText(text).width;

    let width = 0;
    for (let i = 0; i < text.length; i++) {
      width += ctx.measureText(text[i]).width;
      if (i !== text.length - 1) width += spacing;
    }
    return width;
  }
  
  setupEventListeners() {
    // 国家标题点击事件（手风琴效果，现仅用于新时代英文）
    document.querySelectorAll('.country-title').forEach(title => {
      title.addEventListener('click', () => {
        this.toggleCountry(title);
      });
    });
    
    // 模板选择事件
    document.querySelectorAll('.vip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectTemplate(btn);
      });
    });
    
    // 头像上传
    this.avatarUpload.addEventListener('change', (e) => {
      this.handleAvatarUpload(e);
    });
    
    // 粘贴上传头像
    document.addEventListener('paste', (e) => {
      this.handlePasteUpload(e);
    });
    
    // 拖拽事件（在主canvas上）
    this.canvas.addEventListener('mousedown', (e) => this.startDrag(e));
    this.canvas.addEventListener('mousemove', (e) => this.duringDrag(e));
    this.canvas.addEventListener('mouseup', () => this.stopDrag());
    
    // 右键菜单处理
    this.canvas.addEventListener('contextmenu', (e) => this.handleContextMenu(e));
    
    
    // 姓名大小调整按钮（增大步长）
    const nameBigger = document.getElementById('nameBigger');
    const nameSmaller = document.getElementById('nameSmaller');
    if (nameBigger) nameBigger.onclick = () => { this.nameSize += 10; this.drawAll(); };
    if (nameSmaller) nameSmaller.onclick = () => { this.nameSize = Math.max(10, this.nameSize - 10); this.drawAll(); };
    
    // 姓名位置调整按钮
    const nameUp = document.getElementById('nameUp');
    const nameDown = document.getElementById('nameDown');
    const nameLeft = document.getElementById('nameLeft');
    const nameRight = document.getElementById('nameRight');
    if (nameUp) nameUp.onclick = () => { this.nameY -= 5; this.drawAll(); };
    if (nameDown) nameDown.onclick = () => { this.nameY += 5; this.drawAll(); };
    if (nameLeft) nameLeft.onclick = () => { this.nameX -= 5; this.drawAll(); };
    if (nameRight) nameRight.onclick = () => { this.nameX += 5; this.drawAll(); };
    
    // 头像大小 & 位置调整按钮

    // 下载功能
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) downloadBtn.onclick = () => this.downloadCertificate();
    
    // 复制功能
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) copyBtn.onclick = () => this.copyCertificate();
    
    // 重试按钮
    if (this.retryBtn) {
      this.retryBtn.addEventListener('click', () => {
        this.loadTemplate();
      });
    }
    
    // 输入监听（UID 和姓名）
    if (this.uidInput) this.uidInput.addEventListener('input', () => this.drawAll());
    if (this.nameInput) this.nameInput.addEventListener('input', () => {
      this.handleNameInputFormat();
      this.drawAll();
    });
    
    // 默认展开第一个国家 & 选中第一个按钮（脚本在 body 底部加载时，DOM 通常已就绪）
    const initSidebarState = () => {
      const firstCountry = document.querySelector('.country-title');
      if (firstCountry) {
        const country = firstCountry.dataset.country;
        const vipGrid = document.querySelector(`.vip-grid[data-country="${country}"]`);
        if (vipGrid) {
          vipGrid.classList.add('expanded');
          firstCountry.classList.remove('collapsed');
        }
      }
      const firstBtn = document.querySelector('.vip-btn');
      if (firstBtn) firstBtn.classList.add('active');
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initSidebarState);
    } else {
      initSidebarState();
    }
  }
  
  toggleCountry(clickedTitle) {
    const country = clickedTitle.dataset.country;
    
    // 检查是否是批次标题（batch1, batch2）
    if (clickedTitle.classList.contains('batch-title')) {
      const batchContent = document.querySelector(`.batch-content[data-country="${country}"]`);
      const isExpanded = batchContent && batchContent.classList.contains('expanded');
      
      // 关闭所有批次内容
      document.querySelectorAll('.batch-content').forEach(content => {
        content.classList.remove('expanded');
      });
      document.querySelectorAll('.batch-title').forEach(title => {
        title.classList.add('collapsed');
      });
      
      // 如果点击的是当前展开的批次，则关闭；否则展开
      if (isExpanded) {
        // 关闭当前批次
        batchContent.classList.remove('expanded');
        clickedTitle.classList.add('collapsed');
      } else if (batchContent) {
        // 展开当前批次
        batchContent.classList.add('expanded');
        clickedTitle.classList.remove('collapsed');
      }
    } else {
      // 普通的国家/语言标题（包括嵌套的二级菜单）
      const vipGrid = document.querySelector(`.vip-grid[data-country="${country}"]`);
      const isExpanded = vipGrid && vipGrid.classList.contains('expanded');
      
      // 如果点击的是嵌套在批次内容中的标题，只关闭同批次内的其他vip-grid
      const isInBatch = clickedTitle.closest('.batch-content');
      if (isInBatch) {
        // 只关闭同一批次内的其他vip-grid
        const batchContent = clickedTitle.closest('.batch-content');
        batchContent.querySelectorAll('.vip-grid').forEach(grid => {
          if (grid !== vipGrid) {
            grid.classList.remove('expanded');
          }
        });
        batchContent.querySelectorAll('.country-title').forEach(title => {
          if (title !== clickedTitle && !title.classList.contains('batch-title')) {
            title.classList.add('collapsed');
          }
        });
      } else {
        // 关闭所有其他vip-grid（但不关闭批次内容中的）
        document.querySelectorAll('.vip-grid').forEach(grid => {
          if (!grid.closest('.batch-content')) {
            grid.classList.remove('expanded');
          }
        });
        document.querySelectorAll('.country-title').forEach(title => {
          if (!title.classList.contains('batch-title') && !title.closest('.batch-content')) {
            title.classList.add('collapsed');
          }
        });
      }
      
      // 如果点击的是当前展开的，则关闭；否则展开
      if (isExpanded) {
        // 关闭当前vip-grid
        vipGrid.classList.remove('expanded');
        clickedTitle.classList.add('collapsed');
      } else if (vipGrid) {
        // 展开当前vip-grid
        vipGrid.classList.add('expanded');
        clickedTitle.classList.remove('collapsed');
      }
    }
  }
  
  selectTemplate(btn) {
    // 移除所有活动状态
    document.querySelectorAll('.vip-btn').forEach(b => b.classList.remove('active'));
    
    // 添加当前活动状态
    btn.classList.add('active');
    
    // 获取新选择的语言
    const newCountry = btn.dataset.country;
    
    // 如果语言发生变化，更新位置为对应语言的默认位置
    if (this.currentCountry !== newCountry) {
      this.setDefaultPositions(newCountry);
    }
    
    // 更新当前选择
    this.currentCountry = newCountry;
    // 对于 reward500 类型，vip 值是语言代码（字符串），否则是数字
    const vipValue = btn.dataset.vip;
    this.currentVip = isNaN(parseInt(vipValue)) ? vipValue : parseInt(vipValue);
    
    // 加载新模板
    this.loadTemplate();
  }
  
  loadTemplate() {
    // 隐藏错误提示，显示加载动画
    this.hideError();
    this.showLoading();
    
    // 获取模板路径：对于 reward500，vip 是语言代码；对于其他类型，vip 是数字
    const templatePath = this.templates[this.currentCountry][this.currentVip];
    const fullPath = this.getPath(templatePath);
    
    // 调试信息
    console.log('Loading template:', {
      country: this.currentCountry,
      vip: this.currentVip,
      templatePath: templatePath,
      basePath: this.basePath,
      fullPath: fullPath,
      hostname: window.location.hostname,
      pathname: window.location.pathname
    });
    
    // 先尝试使用 crossOrigin 加载（避免 canvas 被污染）
    this.template.crossOrigin = 'anonymous';
    this.template.src = fullPath;
    
    this.template.onload = () => {
      // 根据模板实际尺寸自适应画布大小
      this.canvas.width = this.template.width;
      this.canvas.height = this.template.height;
      // 设置canvas样式，使其自适应容器宽度，保持宽高比
      this.canvas.style.maxWidth = '100%';
      this.canvas.style.height = 'auto';

      this.hideLoading();
      this.drawAll();
    };
    
    this.template.onerror = (error) => {
      console.error('图片加载错误:', {
        error: error,
        fullPath: fullPath,
        templatePath: templatePath,
        basePath: this.basePath,
        currentURL: window.location.href,
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        pathname: window.location.pathname
      });
      
      // 如果 crossOrigin 导致加载失败，尝试不使用 crossOrigin
      if (this.template.crossOrigin === 'anonymous') {
        console.warn('使用 crossOrigin 加载失败，尝试不使用 crossOrigin');
        this.template.crossOrigin = null;
        this.template.src = fullPath;
        return;
      }
      
      // 如果仍然失败，尝试使用绝对路径
      if (!fullPath.startsWith('http://') && !fullPath.startsWith('https://')) {
        const absolutePath = window.location.origin + (this.basePath || '/') + templatePath;
        console.warn('尝试使用绝对路径:', absolutePath);
        this.template.crossOrigin = null;
        this.template.src = absolutePath;
        return;
      }
      
      console.error(`模板文件加载失败: ${fullPath}`);
      this.hideLoading();
      this.showError();
    };
  }
  
  showLoading() {
    if (this.loadingOverlay) {
      this.loadingOverlay.classList.remove('hidden');
    }
  }
  
  hideLoading() {
    if (this.loadingOverlay) {
      this.loadingOverlay.classList.add('hidden');
    }
  }
  
  showError() {
    if (this.errorOverlay) {
      this.errorOverlay.classList.remove('hidden');
    }
  }
  
  hideError() {
    if (this.errorOverlay) {
      this.errorOverlay.classList.add('hidden');
    }
  }
  
  handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (file) {
      this.loadAvatarFromFile(file);
    }
  }
  
  handlePasteUpload(e) {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        this.loadAvatarFromFile(file);
        e.preventDefault();
        break;
      }
    }
  }
  
  loadAvatarFromFile(file) {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        this.avatar = new Image();
        this.avatar.crossOrigin = 'anonymous'; // 设置跨域，避免 canvas 被污染
        this.avatar.onload = () => this.drawAll();
        this.avatar.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // 姓名输入转为每个单词首字母大写
  handleNameInputFormat() {
    const raw = this.nameInput.value || '';
    const words = raw.split(' ').filter(w => w.length > 0);
    const formatted = words
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
    if (formatted !== this.nameInput.value) {
      this.nameInput.value = formatted;
    }
  }
  
  drawAll() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // 绘制背景模板，使用实际尺寸
    this.ctx.drawImage(this.template, 0, 0, this.canvas.width, this.canvas.height);

    // 绘制头像（圆形裁切 + 居中填充，无外框）
    if (this.avatar) {
      const imgW = this.avatar.width;
      const imgH = this.avatar.height;
      const cropSide = Math.min(imgW, imgH);
      const sx = (imgW - cropSide) / 2;
      const sy = (imgH - cropSide) / 2;

      const centerX = this.avatarX + this.avatarSize / 2;
      const centerY = this.avatarY + this.avatarSize / 2;
      const radius = this.avatarSize / 2;

      // 裁切并绘制头像（圆形，无外框）
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      this.ctx.clip();
      this.ctx.drawImage(
        this.avatar,
        sx,
        sy,
        cropSide,
        cropSide,
        centerX - radius,
        centerY - radius,
        radius * 2,
        radius * 2
      );
      this.ctx.restore();
    }

    // 绘制遮罩图层（覆盖在头像之上）
    // 实物奖励模板不绘制遮罩1和遮罩2，但绘制遮罩3
    if (this.currentCountry === 'reward500' || this.currentCountry === 'goldbar' || this.currentCountry === 'phone1699' || this.currentCountry === 'phone1800' || this.currentCountry === 'birthday' || this.currentCountry === 'fund5000') {
      // 实物模板：只绘制遮罩3
      if (this.mask3 && this.mask3.complete) {
        this.ctx.drawImage(this.mask3, 0, 0, this.canvas.width, this.canvas.height);
      }
    } else {
      // 其他模板：绘制遮罩1和遮罩2
      if (this.mask && this.mask.complete) {
        this.ctx.drawImage(this.mask, 0, 0, this.canvas.width, this.canvas.height);
      }
      
      // 绘制第二个遮罩图层（叠加在第一个遮罩之上）
      if (this.mask2 && this.mask2.complete) {
        this.ctx.drawImage(this.mask2, 0, 0, this.canvas.width, this.canvas.height);
      }
    }

    // 绘制 UID：CanvaSans 字体 + 白色填充，左对齐
    const uidText = this.uidInput.value || '';
    if (uidText) {
      this.ctx.save();
      this.ctx.font = `${this.uidSize}px "CanvaSans", sans-serif`;
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'alphabetic';
      this.ctx.fillStyle = '#ffffff';

      this.drawTextWithLetterSpacing(this.ctx, uidText, this.uidX, this.uidY, this.uidLetterSpacing);
      this.ctx.restore();
    }

    // 绘制姓名：AlexBrush 字体 + 竖向渐变填充 + 外圈描边 + 居中
    const nameText = this.nameInput.value;
    if (nameText) {
      this.ctx.save();
      // 实物奖励模板不加粗，其他模板加粗
      const fontWeight = (this.currentCountry === 'reward500' || this.currentCountry === 'goldbar' || this.currentCountry === 'phone1699' || this.currentCountry === 'phone1800' || this.currentCountry === 'birthday' || this.currentCountry === 'fund5000') ? '' : 'bold ';
      this.ctx.font = `${fontWeight}${this.nameSize}px "AlexBrush", "Arial", sans-serif`;
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'alphabetic';
      const nameWidth = this.ctx.measureText(nameText).width;
      const nameXCentered = this.nameX - nameWidth / 2;

      // 创建竖向渐变（180°）
      const top = this.nameY - this.nameSize;
      const bottom = this.nameY + this.nameSize * 0.3;
      const grad = this.ctx.createLinearGradient(this.nameX, top, this.nameX, bottom);
      
      // 如果是实物奖励模板，使用特殊的渐变颜色
      if (this.currentCountry === 'reward500' || this.currentCountry === 'goldbar' || this.currentCountry === 'phone1699' || this.currentCountry === 'phone1800' || this.currentCountry === 'birthday' || this.currentCountry === 'fund5000') {
        grad.addColorStop(0, '#faf5d7');
        grad.addColorStop(0.25, '#f8f2d2');
        grad.addColorStop(0.5, '#e5be79');
        grad.addColorStop(0.75, '#ad752f');
        grad.addColorStop(1, '#d6a659');
      } else {
        // 晋级模板：从上到下渐变
        grad.addColorStop(0, '#d88920');
        grad.addColorStop(0.33, '#381909');
        grad.addColorStop(0.67, '#341b08');
        grad.addColorStop(1, '#341b08');
      }

      // 描边（加粗描边以增强视觉效果）
      this.ctx.lineWidth = Math.max(3, this.nameSize * 0.02);
      this.ctx.strokeStyle = '#fff2cf';
      this.ctx.strokeText(nameText, nameXCentered, this.nameY);

      // 填充（使用渐变）
      this.ctx.fillStyle = grad;
      this.ctx.fillText(nameText, nameXCentered, this.nameY);
      this.ctx.restore();
    }

    // 更新坐标显示
    this.updateCoordsDisplay();
  }
  
  updateCoordsDisplay() {
    const countryName =
      (this.countryNames && this.countryNames[this.currentCountry]) || this.currentCountry;
    // 对于 reward500、goldbar、phone1699、phone1800、birthday 和 fund5000 类型，显示语言名称；对于其他类型，显示 VIP 等级
    let templateInfo = '';
    if (this.currentCountry === 'reward500' || this.currentCountry === 'goldbar' || this.currentCountry === 'phone1699' || this.currentCountry === 'phone1800' || this.currentCountry === 'birthday' || this.currentCountry === 'fund5000') {
      const langNames = {
        english: '英语',
        vietnamese: '越南语',
        arabic: '阿拉伯语',
        portuguese: '葡萄牙语',
        '50': '50英语',
        '100': '100英语'
      };
      const langName = langNames[this.currentVip] || this.currentVip;
      templateInfo = `${countryName} - ${langName}`;
    } else {
      templateInfo = `${countryName} VIP${this.currentVip}`;
    }
    this.coordsDisplay.innerHTML =
      `当前模板: ${templateInfo}<br>` +
      `UID: x=${Math.round(this.uidX)}, y=${Math.round(this.uidY)}, size=${Math.round(this.uidSize)}<br>` +
      `姓名: x=${Math.round(this.nameX)}, y=${Math.round(this.nameY)}, size=${Math.round(this.nameSize)}<br>` +
      `头像: x=${Math.round(this.avatarX)}, y=${Math.round(this.avatarY)}, size=${Math.round(this.avatarSize)}`;
  }
  
  startDrag(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    // 计算文本宽度（用于拖拽检测）
    this.ctx.font = `${this.uidSize}px "CanvaSans", sans-serif`;
    const uidWidth = this.measureTextWithLetterSpacing(this.ctx, this.uidInput.value, this.uidLetterSpacing) || 50;
    
    this.ctx.font = `${this.nameSize}px "AlexBrush", "Arial", sans-serif`;
    const nameWidth = this.ctx.measureText(this.nameInput.value).width || 50;
    
    // 检查头像区域（圆形）
    const avatarCenterX = this.avatarX + this.avatarSize / 2;
    const avatarCenterY = this.avatarY + this.avatarSize / 2;
    const avatarRadius = this.avatarSize / 2;
    const distFromAvatarCenter = Math.sqrt(
      Math.pow(mouseX - avatarCenterX, 2) + Math.pow(mouseY - avatarCenterY, 2)
    );
    const avatarHit = distFromAvatarCenter <= avatarRadius;
    
    // 检查UID区域（UID的x为左侧起点）
    const uidHit =
      mouseX > this.uidX - 30 &&
      mouseX < this.uidX + uidWidth + 30 &&
      mouseY > this.uidY - this.uidSize - 10 &&
      mouseY < this.uidY + 10;
    
    // 检查姓名区域（姓名的x为"居中中心点"）
    const nameLeft = this.nameX - nameWidth / 2;
    const nameRight = this.nameX + nameWidth / 2;
    const nameHit =
      mouseX > nameLeft - 30 &&
      mouseX < nameRight + 30 &&
      mouseY > this.nameY - this.nameSize - 10 &&
      mouseY < this.nameY + 10;
    
    // 检查是否点击在可拖拽区域内
    if (avatarHit) {
      this.dragging = 'avatar';
    } else if (uidHit) {
      this.dragging = 'uid';
    } else if (nameHit) {
      this.dragging = 'name';
    }
    
    this.offsetX = mouseX;
    this.offsetY = mouseY;
  }
  
  duringDrag(e) {
    if (!this.dragging) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    const dx = mouseX - this.offsetX;
    const dy = mouseY - this.offsetY;
    
    if (this.dragging === 'avatar') {
      this.avatarX += dx;
      this.avatarY += dy;
    }
    if (this.dragging === 'uid') { 
      this.uidX += dx; 
      this.uidY += dy; 
    }
    if (this.dragging === 'name') {
      this.nameX += dx;
      this.nameY += dy;
    }
    
    this.offsetX = mouseX;
    this.offsetY = mouseY;
    this.drawAll();
  }
  
  stopDrag() {
    this.dragging = null;
  }
  
  // 处理右键菜单：优先"复制完整证书到剪贴板"，失败则打开完整图片让用户右键复制
  async handleContextMenu(e) {
    // 阻止默认右键菜单（否则用户只能复制"半张预览图"）
    e.preventDefault();
    
    // 确保 canvas 有内容
    if (!this.canvas || !this.template.complete) {
      alert('证书尚未加载完成，请稍候再试。');
      return;
    }
    
    // 尝试复制到剪贴板
    const ok = await this.copyFullImageToClipboard();
    if (ok) {
      // 复制成功，显示提示
      const tip = document.createElement('div');
      tip.textContent = '✓ 已复制到剪贴板';
      tip.style.cssText = 'position:fixed;top:20px;right:20px;background:#4caf50;color:#fff;padding:12px 20px;border-radius:8px;z-index:10000;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
      document.body.appendChild(tip);
      setTimeout(() => document.body.removeChild(tip), 2000);
      return;
    }
    
    // 复制失败，打开新标签页让用户右键复制
    this.openFullImageInNewTab();
  }
  
  async copyFullImageToClipboard() {
    // Clipboard API 写入图片通常要求 HTTPS/localhost（安全上下文），并且需要 ClipboardItem 支持
    if (!window.isSecureContext) return false;
    if (!navigator.clipboard || typeof navigator.clipboard.write !== 'function') return false;
    if (typeof window.ClipboardItem !== 'function') return false;
    
    return await new Promise((resolve) => {
      this.canvas.toBlob(async (blob) => {
        try {
          if (!blob) return resolve(false);
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          console.log('完整证书已复制到剪贴板');
          resolve(true);
        } catch (err) {
          console.warn('复制到剪贴板失败，将使用打开新标签页方式:', err);
          resolve(false);
        }
      }, 'image/png');
    });
  }
  
  openFullImageInNewTab() {
    try {
      const dataUrl = this.canvas.toDataURL('image/png');
      const win = window.open('', '_blank');
      
      if (!win) {
        // 弹窗被拦截时，退化为直接下载
        const link = document.createElement('a');
        const langNames = {
          english: '英语',
          vietnamese: '越南语',
          arabic: '阿拉伯语',
          portuguese: '葡萄牙语'
        };
        let fileName = '';
        if (this.currentCountry === 'reward500') {
          fileName = `实物500美金_${langNames[this.currentVip] || this.currentVip}.png`;
        } else if (this.currentCountry === 'goldbar') {
          fileName = `实物金条_${langNames[this.currentVip] || this.currentVip}.png`;
        } else if (this.currentCountry === 'phone1699') {
          fileName = `实物1699手机_${langNames[this.currentVip] || this.currentVip}.png`;
        } else if (this.currentCountry === 'phone1800') {
          fileName = `实物1800手机_${langNames[this.currentVip] || this.currentVip}.png`;
        } else if (this.currentCountry === 'birthday') {
          fileName = `实物生日奖励_${this.currentVip}英语.png`;
        } else if (this.currentCountry === 'fund5000') {
          fileName = `实物5000基金_${langNames[this.currentVip] || this.currentVip}.png`;
        } else {
          fileName = `新时代证书_LV${this.currentVip}.png`;
        }
        link.download = fileName;
        link.href = dataUrl;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => document.body.removeChild(link), 100);
        alert('弹窗被拦截，已自动下载图片。');
        return;
      }
      
      win.document.open();
      win.document.write(`<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>完整证书图片 - 右键复制</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      margin: 0;
      background: #0b0f14;
      color: #fff;
      font-family: Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      gap: 16px;
      padding: 20px;
    }
    .tip {
      opacity: 0.9;
      font-size: 16px;
      text-align: center;
      background: rgba(76, 175, 80, 0.2);
      padding: 12px 20px;
      border-radius: 8px;
      border: 1px solid rgba(76, 175, 80, 0.5);
    }
    img {
      max-width: 95vw;
      max-height: 85vh;
      border-radius: 12px;
      box-shadow: 0 18px 45px rgba(0, 0, 0, 0.6);
      background: #05080c;
      cursor: pointer;
      user-select: none;
    }
    img:hover {
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
    }
  </style>
</head>
<body>
  <div class="tip">📋 请在图片上右键 → 选择"复制图片"（此图片为完整证书）</div>
  <img src="${dataUrl}" alt="完整证书" onclick="this.focus()" />
  <script>
    // 确保图片可以右键复制
    document.querySelector('img').addEventListener('contextmenu', function(e) {
      // 允许默认右键菜单
    });
  </script>
</body>
</html>`);
      win.document.close();
    } catch (err) {
      console.error('打开新标签页失败:', err);
      alert('无法打开新标签页，请尝试使用下载按钮。\n错误信息: ' + err.message);
    }
  }
  
  downloadCertificate() {
    try {
      // 确保 canvas 有内容
      if (!this.canvas || !this.template.complete) {
        alert('证书尚未加载完成，请稍候再试。');
        return;
      }
      
      const link = document.createElement('a');
      const langNames = {
        english: '英语',
        vietnamese: '越南语',
        arabic: '阿拉伯语',
        portuguese: '葡萄牙语'
      };
      let fileName = '';
      if (this.currentCountry === 'reward500') {
        fileName = `实物500美金_${langNames[this.currentVip] || this.currentVip}.png`;
      } else if (this.currentCountry === 'goldbar') {
        fileName = `实物金条_${langNames[this.currentVip] || this.currentVip}.png`;
      } else if (this.currentCountry === 'phone1699') {
        fileName = `实物1699手机_${langNames[this.currentVip] || this.currentVip}.png`;
      } else if (this.currentCountry === 'phone1800') {
        fileName = `实物1800手机_${langNames[this.currentVip] || this.currentVip}.png`;
      } else if (this.currentCountry === 'birthday') {
        fileName = `实物生日奖励_${this.currentVip}英语.png`;
      } else if (this.currentCountry === 'fund5000') {
        fileName = `实物5000基金_${langNames[this.currentVip] || this.currentVip}.png`;
      } else {
        fileName = `新时代证书_LV${this.currentVip}.png`;
      }
      link.download = fileName;
      link.href = this.canvas.toDataURL('image/png');
      
      // 将链接添加到 DOM（某些浏览器需要）
      link.style.display = 'none';
      document.body.appendChild(link);
      
      // 触发下载
      link.click();
      
      // 延迟移除链接（确保下载已开始）
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
    } catch (err) {
      console.error('下载失败:', err);
      alert('下载失败，请尝试右键保存图片。\n错误信息: ' + err.message);
    }
  }
  
  async copyCertificate() {
    try {
      // 确保 canvas 有内容
      if (!this.canvas || !this.template.complete) {
        alert('证书尚未加载完成，请稍候再试。');
        return;
      }
      
      // 尝试使用 Clipboard API 复制
      const ok = await this.copyFullImageToClipboard();
      if (ok) {
        // 复制成功，显示提示
        this.showCopySuccess();
        return;
      }
      
      // 如果 Clipboard API 不可用，打开新标签页让用户复制
      this.openFullImageInNewTab();
      alert('当前浏览器不支持直接复制图片。\n已为你打开"完整证书图片"新标签页：请在新页对图片右键复制。');
    } catch (err) {
      console.error('复制失败:', err);
      alert('复制失败，请尝试使用下载按钮或右键保存图片。\n错误信息: ' + err.message);
    }
  }
  
  showCopySuccess() {
    // 显示成功提示
    const tip = document.createElement('div');
    tip.textContent = '✓ 已复制到剪贴板';
    tip.style.cssText = 'position:fixed;top:20px;right:20px;background:#4caf50;color:#fff;padding:12px 20px;border-radius:8px;z-index:10000;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.3);animation:fadeIn 0.3s ease;';
    document.body.appendChild(tip);
    setTimeout(() => {
      tip.style.opacity = '0';
      tip.style.transition = 'opacity 0.3s ease';
      setTimeout(() => {
        if (tip.parentNode) {
          document.body.removeChild(tip);
        }
      }, 300);
    }, 2000);
  }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
  new CertificateGenerator();
});
