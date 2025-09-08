        // Web Component 定義 - 優惠活動輪播
        class PromotionCarousel extends HTMLElement {
            constructor() {
                super();
                this.attachShadow({ mode: 'open' });
                this.currentSlide = 0;
                this.totalSlides = 0;
                this.cardWidth = 300;
            }
            
            connectedCallback() {
                this.render();
                // 延遲初始化，確保 DOM 完全載入
                setTimeout(() => {
                    this.initCarousel();
                }, 100);
                
                // 添加視窗大小改變監聽器
                this.handleResize = () => {
                    // 重新計算卡片寬度
                    this.cardWidth = window.innerWidth <= 480 ? 240 : (window.innerWidth <= 768 ? 280 : 300);
                    // 重新創建輪播點和更新狀態
                    this.createSmartDots();
                    this.updateCarousel();
                };
                
                window.addEventListener('resize', this.handleResize);
            }
            
            disconnectedCallback() {
                // 清理事件監聽器
                if (this.handleResize) {
                    window.removeEventListener('resize', this.handleResize);
                }
            }
            
            render() {
                let promotions = [];
                const carouselId = this.getAttribute('data-carousel-id') || `promotions-${Date.now()}`;
                
                try {
                    const encodedData = this.getAttribute('data-promotions') || '[]';
                    const promotionsData = decodeURIComponent(encodedData);
                    promotions = JSON.parse(promotionsData);
                    this.totalSlides = promotions.length;
                    console.log('Web Component 解析的優惠數據:', promotions);
                } catch (error) {
                    console.error('JSON 解析錯誤:', error);
                    console.error('原始編碼數據:', this.getAttribute('data-promotions'));
                    this.totalSlides = 0;
                    promotions = [];
                }
                
                // 根據螢幕大小計算卡片寬度
                if (window.innerWidth <= 480) {
                    this.cardWidth = 240;
                } else if (window.innerWidth <= 768) {
                    this.cardWidth = 280;
                }
                
                // 如果沒有數據，顯示錯誤信息
                if (promotions.length === 0) {
                    this.shadowRoot.innerHTML = `
                        <style>
                            :host {
                                display: block;
                                width: 100%;
                                font-family: 'Noto Sans TC', sans-serif;
                            }
                            .error-message {
                                text-align: center;
                                padding: 40px 20px;
                                color: #666;
                                background: #f8f9fa;
                                border-radius: 12px;
                                margin: 20px;
                            }
                        </style>
                        <div class="error-message">
                            <p>優惠活動載入失敗，請稍後再試。</p>
                        </div>
                    `;
                    return;
                }
                
                this.shadowRoot.innerHTML = `
                    <style>
                        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
                        
                        :host {
                            display: block;
                            width: 100%;
                            font-family: 'Noto Sans TC', sans-serif;
                        }
                        
                        /* 確保 Font Awesome icons 在 Shadow DOM 中正常顯示 */
                        .fas, .far, .fab, .fal, .fa {
                            font-family: "Font Awesome 6 Free", "Font Awesome 6 Pro", "Font Awesome 6 Brands" !important;
                            font-weight: 900 !important;
                            font-style: normal !important;
                            font-variant: normal !important;
                            text-rendering: auto !important;
                            line-height: 1 !important;
                            -webkit-font-smoothing: antialiased !important;
                            -moz-osx-font-smoothing: grayscale !important;
                        }
                        
                        .far {
                            font-weight: 400 !important;
                        }
                        
                        .fab {
                            font-family: "Font Awesome 6 Brands" !important;
                            font-weight: 400 !important;
                        }
                        
                        .promotions-carousel {
                            background: transparent;
                            border-radius: 0;
                            padding: 20px;
                            max-width: 100%;
                            margin: 0 auto;
                        }
                        
                        .promotions-header {
                            text-align: center;
                            margin-bottom: 24px;
                        }
                        
                        .promotions-title {
                            font-size: 20px;
                            font-weight: 700;
                            color: #1a1a1a;
                            margin: 0 0 8px 0;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 8px;
                        }
                        
                        .promotions-subtitle {
                            font-size: 14px;
                            color: #666;
                            margin: 0;
                        }
                        
                        .promotions-container {
                            position: relative;
                            overflow: hidden;
                            border-radius: 16px;
                        }
                        
                        .promotions-wrapper {
                            display: flex;
                            overflow-x: auto;
                            padding: 5px 0;
                            scroll-snap-type: x mandatory;
                            scrollbar-width: none;
                            gap: 16px;
                            margin-bottom: 15px;
                            scroll-behavior: smooth;
                        }
                        
                        .promotions-wrapper::-webkit-scrollbar {
                            display: none;
                        }
                        
                        .promotion-card {
                            flex: 0 0 ${this.cardWidth}px;
                            display: flex;
                            flex-direction: column;
                            width: ${this.cardWidth}px;
                            height: 400px;
                            background: #ffffff;
                            border-radius: 16px;
                            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
                            overflow: hidden;
                            margin: 0;
                            transition: all 0.3s ease;
                            border: 1px solid #e1e5e9;
                            box-sizing: border-box;
                            scroll-snap-align: start;
                        }
                        
                        .promotion-card:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                        }
                        
                        .promotion-image {
                            width: 100%;
                            height: 200px;
                            overflow: hidden;
                            position: relative;
                            flex-shrink: 0;
                            background: #f8f9fa;
                        }
                        
                        .promotion-image img {
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                            display: block;
                            transition: transform 0.3s ease;
                        }
                        
                        .promotion-card:hover .promotion-image img {
                            transform: scale(1.05);
                        }
                        
                        .no-image {
                            width: 100%;
                            height: 100%;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            color: #6c757d;
                            background: #f8f9fa;
                        }
                        
                        .no-image i {
                            font-size: 24px;
                            margin-bottom: 8px;
                        }
                        
                        .promotion-content {
                            padding: 16px;
                            height: 200px;
                            display: grid;
                            grid-template-rows: 20px 44px 63px 1fr 36px;
                            grid-template-areas: 
                                "date"
                                "title"
                                "excerpt"
                                "spacer"
                                "button";
                            row-gap: 2px;
                            box-sizing: border-box;
                            background: #ffffff;
                        }
                        
                        .promotion-title {
                            grid-area: title;
                            color: #212529;
                            font-size: 16px;
                            font-weight: 600;
                            line-height: 1.4;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            display: -webkit-box;
                            -webkit-line-clamp: 2;
                            -webkit-box-orient: vertical;
                            font-family: 'Noto Sans TC', sans-serif;
                            height: 44px;
                            display: flex;
                            align-items: flex-start;
                            margin-top: 8px;
                            margin-bottom: 8px;
                        }
                        
                        .promotion-excerpt {
                            grid-area: excerpt;
                            color: #6c757d;
                            font-size: 14px;
                            line-height: 1.5;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            display: -webkit-box;
                            -webkit-line-clamp: 3;
                            -webkit-box-orient: vertical;
                            font-family: 'Noto Sans TC', sans-serif;
                            height: 63px;
                            display: flex;
                            align-items: flex-start;
                        }
                        
                        .promotion-meta {
                            grid-area: date;
                            height: 20px;
                            display: flex;
                            align-items: center;
                        }
                        
                        .promotion-date {
                            color: #6c757d;
                            font-size: 12px;
                            display: flex;
                            align-items: center;
                            gap: 4px;
                            font-family: 'Noto Sans TC', sans-serif;
                        }
                        
                        .promotion-actions {
                            grid-area: button;
                            display: flex;
                            gap: 8px;
                            width: 100%;
                            height: 36px;
                            align-items: center;
                        }
                        
                        .promotion-btn {
                            padding: 8px 16px;
                            border: none;
                            border-radius: 6px;
                            font-size: 13px;
                            font-weight: 500;
                            text-decoration: none;
                            display: inline-flex;
                            align-items: center;
                            gap: 6px;
                            cursor: pointer;
                            transition: all 0.2s ease;
                            width: 100%;
                            justify-content: center;
                            box-sizing: border-box;
                            font-family: 'Noto Sans TC', sans-serif;
                            min-height: 36px;
                        }
                        
                        .promotion-btn.primary {
                            background: #007bff;
                            color: white;
                        }
                        
                        .promotion-btn.primary:hover {
                            background: #0056b3;
                        }
                        
                        .promotion-btn.secondary {
                            background: #f8f9fa;
                            color: #6c757d;
                            border: 1px solid #dee2e6;
                        }
                        
                        .promotion-btn.secondary:hover {
                            background: #e9ecef;
                            color: #495057;
                        }
                        
                        .promotions-nav {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            gap: 15px;
                            margin-top: 15px;
                        }
                        
                        .promotions-dots {
                            display: flex;
                            gap: 10px;
                            margin-top: 0px;
                        }
                        
                        .promotion-dot {
                            width: 8px;
                            height: 8px;
                            border-radius: 50%;
                            background: #ddd;
                            cursor: pointer;
                            transition: all 0.3s;
                        }
                        
                        .promotion-dot.active {
                            background: #2c3e50;
                            transform: scale(1.2);
                        }
                        
                        .promotion-arrow {
                            background: rgba(44, 62, 80, 0.1);
                            color: #2c3e50;
                            width: 32px;
                            height: 32px;
                            border-radius: 50%;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            cursor: pointer;
                            transition: all 0.3s;
                            font-size: 14px;
                        }
                        
                        .promotion-arrow i {
                            font-size: 12px;
                            font-weight: 600;
                        }
                        
                        .promotion-arrow:hover {
                            background: rgba(44, 62, 80, 0.2);
                        }
                        
                        /* 類別切換按鈕樣式 - 統一使用菜單分類按鈕樣式 */
                        .promotion-categories {
                            display: flex;
                            gap: 8px;
                            overflow-x: auto;
                            padding: 8px 0;
                            flex-wrap: nowrap;
                            white-space: nowrap;
                            scroll-behavior: auto;
                            -webkit-overflow-scrolling: touch;
                            touch-action: pan-x;
                            margin-top: 20px;
                        }
                        
                        .category-btn {
                            background: #f8f9fa;
                            border: 1px solid #e0e0e0;
                            border-radius: 20px;
                            font-size: 14px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            color: #2c3e50;
                            padding: 10px 16px;
                            flex-shrink: 0;
                            white-space: nowrap;
                            font-family: 'Noto Sans TC', sans-serif;
                            display: flex;
                            align-items: center;
                            gap: 6px;
                        }
                        
                        .category-btn:hover {
                            background: #2c3e50;
                            color: white;
                            border-color: #2c3e50;
                        }
                        
                        .category-btn.active {
                            background: #2c3e50;
                            color: white;
                            border-color: #2c3e50;
                        }
                        
                        .category-btn.active:hover {
                            background: #2c3e50;
                            color: white;
                            border-color: #2c3e50;
                        }
                        
                        .category-btn i {
                            font-size: 12px;
                        }
                        
                        .promotions-navigation {
                            position: absolute;
                            top: 50%;
                            transform: translateY(-50%);
                            width: 100%;
                            display: flex;
                            justify-content: space-between;
                            pointer-events: none;
                            z-index: 10;
                        }
                        
                        .promotion-nav-btn {
                            width: 40px;
                            height: 40px;
                            border-radius: 50%;
                            background: rgba(255, 255, 255, 0.9);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            pointer-events: auto;
                            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                        }
                        
                        .promotion-nav-btn:hover {
                            background: white;
                            transform: scale(1.1);
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                        }
                        
                        .promotion-nav-btn.prev {
                            left: 10px;
                        }
                        
                        .promotion-nav-btn.next {
                            right: 10px;
                        }
                        
                        .promotions-dots {
                            display: flex;
                            justify-content: center;
                            gap: 8px;
                            margin-top: 0px;
                        }
                        
                        .promotion-dot {
                            width: 8px;
                            height: 8px;
                            border-radius: 50%;
                            background: #ddd;
                            border: none;
                            cursor: pointer;
                            transition: all 0.3s ease;
                        }
                        
                        .promotion-dot.active {
                            background: #2c3e50;
                            transform: scale(1.2);
                        }
                        

                        
                        /* 響應式設計 */
                        @media (max-width: 768px) {
                            .promotions-carousel {
                                padding: 16px;
                            }
                            
                            .promotions-title {
                                font-size: 18px;
                            }
                            
                            .promotion-card {
                                flex: 0 0 280px;
                                width: 280px;
                                height: 380px;
                            }
                            
                            .promotion-image {
                                height: 180px;
                            }
                            
                            .promotion-content {
                                padding: 14px;
                                height: 180px;
                                grid-template-rows: 20px 40px 58px 1fr 36px;
                                row-gap: 2px;
                            }
                            
                            .promotion-title {
                                font-size: 15px;
                                height: 40px;
                            }
                            
                            .promotion-excerpt {
                                font-size: 13px;
                                height: 58px;
                            }
                            
                            .promotion-actions {
                                gap: 8px;
                            }
                            
                            .promotion-btn {
                                font-size: 12px;
                                padding: 6px 12px;
                            }
                        }
                        
                        @media (max-width: 480px) {
                            .promotions-carousel {
                                padding: 12px;
                            }
                            
                            .promotion-card {
                                flex: 0 0 240px;
                                width: 240px;
                                height: 360px;
                            }
                            
                            .promotion-image {
                                height: 160px;
                            }
                            
                            .promotion-content {
                                padding: 12px;
                                height: 160px;
                                grid-template-rows: 20px 36px 54px 1fr 36px;
                                row-gap: 2px;
                            }
                            
                            .promotion-title {
                                font-size: 14px;
                                height: 36px;
                            }
                            
                            .promotion-excerpt {
                                font-size: 12px;
                                height: 54px;
                            }
                            
                            .promotion-actions {
                                gap: 8px;
                            }
                            
                            .promotion-btn {
                                font-size: 11px;
                                padding: 6px 10px;
                            }
                        }
                    </style>
                    
                    <div class="promotions-carousel">
                        <div class="promotions-header">
                            <h3 class="promotions-title">
                                <i class="fas fa-tags"></i>
                                最新優惠活動
                            </h3>
                            <p class="promotions-subtitle">限時優惠，錯過可惜！</p>
                        </div>
                        
                        <div class="promotions-container">
                            <div class="promotions-wrapper">
                                ${promotions.map((promotion, index) => `
                                    <div class="promotion-card" data-index="${index}">
                                        <div class="promotion-image">
                                            ${promotion.featuredImage 
                                                ? `<img src="${promotion.featuredImage}" alt="${promotion.title.replace(/"/g, '&quot;')}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                                   <div class="no-image" style="display: none;">
                                                       <i class="fas fa-image"></i>
                                                       <span>無圖片</span>
                                                   </div>`
                                                : `<div class="no-image">
                                                       <i class="fas fa-image"></i>
                                                       <span>無圖片</span>
                                                   </div>`
                                            }
                                        </div>
                                        <div class="promotion-content">
                                            <div class="promotion-meta">
                                                <div class="promotion-date">
                                                    <i class="fas fa-calendar-alt"></i>
                                                    ${promotion.date}
                                                </div>
                                            </div>
                                            <h4 class="promotion-title">${promotion.title.replace(/"/g, '&quot;').replace(/'/g, '&#39;')}</h4>
                                            <p class="promotion-excerpt">${promotion.excerpt.replace(/"/g, '&quot;').replace(/'/g, '&#39;')}</p>
                                                                                 <div class="promotion-actions">
                                         <a href="${promotion.link}" target="_blank" class="promotion-btn secondary">
                                             <i class="fas fa-external-link-alt"></i>
                                             查看詳情
                                         </a>
                                     </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            
                            <div class="promotions-nav">
                                <div class="promotion-arrow left-arrow" data-direction="-1">
                                    <i class="fas fa-chevron-left"></i>
                                </div>
                                <div class="promotions-dots" id="dots_${carouselId}">
                                    <!-- 輪播點將由 JavaScript 動態生成 -->
                                </div>
                                <div class="promotion-arrow right-arrow" data-direction="1">
                                    <i class="fas fa-chevron-right"></i>
                                </div>
                            </div>
                            
                            <!-- 類別切換按鈕 -->
                            <div class="promotion-categories">
                                <div class="category-btn" data-category="guest">
                                    <i class="fas fa-user"></i>來賓/球友
                                </div>
                                <div class="category-btn" data-category="team">
                                    <i class="fas fa-users"></i>球隊
                                </div>
                                <div class="category-btn" data-category="experience">
                                    <i class="fas fa-graduation-cap"></i>體驗營
                                </div>
                                <div class="category-btn" data-category="dining">
                                    <i class="fas fa-utensils"></i>餐飲優惠
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            initCarousel() {
                const wrapper = this.shadowRoot.querySelector('.promotions-wrapper');
                const cards = this.shadowRoot.querySelectorAll('.promotion-card');
                
                if (!wrapper || cards.length === 0 || this.totalSlides === 0) {
                    console.log('輪播初始化跳過:', { wrapper: !!wrapper, cardsCount: cards.length, totalSlides: this.totalSlides });
                    return;
                }
                
                // 設置初始狀態
                this.currentSlide = 0;
                wrapper.dataset.currentSlide = '0';
                
                // 智能創建輪播點（參考費用資訊卡片的邏輯）
                this.createSmartDots();
                
                // 設置當前類別按鈕為活躍狀態
                this.setActiveCategory();
                
                // 隱藏沒有文章的分類按鈕
                this.hideEmptyCategories();
                
                // 添加事件監聽器
                this.addEventListeners();
                
                // 更新輪播狀態
                this.updateCarousel();
            }
            
            addEventListeners() {
                const leftArrow = this.shadowRoot.querySelector('.left-arrow');
                const rightArrow = this.shadowRoot.querySelector('.right-arrow');
                const dots = this.shadowRoot.querySelectorAll('.promotion-dot');
                const categoryButtons = this.shadowRoot.querySelectorAll('.category-btn');
                
                if (leftArrow) leftArrow.addEventListener('click', () => this.moveCarousel(-1));
                if (rightArrow) rightArrow.addEventListener('click', () => this.moveCarousel(1));
                
                dots.forEach((dot, index) => {
                    dot.addEventListener('click', () => this.goToSlide(index));
                });
                
                categoryButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        const category = button.dataset.category;
                        if (category) {
                            // 調用全局函數來切換類別
                            if (window.showPromotions) {
                                window.showPromotions(category);
                            }
                        }
                    });
                });
            }
            
            moveCarousel(direction) {
                const wrapper = this.shadowRoot.querySelector('.promotions-wrapper');
                if (!wrapper) return;
                
                const cards = this.shadowRoot.querySelectorAll('.promotion-card');
                if (cards.length === 0) return;
                
                // 計算一次可顯示的卡片數量
                const containerWidth = wrapper.parentElement.offsetWidth;
                const cardWidth = this.cardWidth;
                const gap = 16;
                const visibleCount = Math.floor((containerWidth + gap) / (cardWidth + gap));
                
                let newSlide = this.currentSlide + direction;
                const maxSlide = Math.max(0, this.totalSlides - visibleCount);
                
                // 線性輪播（有邊界限制，參考費用資訊卡片）
                newSlide = Math.max(0, Math.min(newSlide, maxSlide));
                
                this.goToSlide(newSlide);
            }
            
            goToSlide(slideIndex) {
                const wrapper = this.shadowRoot.querySelector('.promotions-wrapper');
                const cards = this.shadowRoot.querySelectorAll('.promotion-card');
                
                if (!wrapper || cards.length === 0) return;
                
                // 計算一次可顯示的卡片數量
                const containerWidth = wrapper.parentElement.offsetWidth;
                const cardWidth = this.cardWidth;
                const gap = 16;
                const visibleCount = Math.floor((containerWidth + gap) / (cardWidth + gap));
                const maxSlide = Math.max(0, cards.length - visibleCount);
                
                const targetSlide = Math.max(0, Math.min(slideIndex, maxSlide));
                const scrollPosition = targetSlide * (this.cardWidth + gap);
                
                // 使用平滑滾動
                wrapper.scrollTo({
                    left: scrollPosition,
                    behavior: 'smooth'
                });
                
                this.currentSlide = targetSlide;
                
                // 更新輪播狀態
                this.updateCarousel();
            }
            
            // 智能創建輪播點（參考費用資訊卡片的邏輯）
            createSmartDots() {
                const wrapper = this.shadowRoot.querySelector('.promotions-wrapper');
                const cards = this.shadowRoot.querySelectorAll('.promotion-card');
                const dotsContainer = this.shadowRoot.querySelector('.promotions-dots');
                const nav = this.shadowRoot.querySelector('.promotions-nav');
                
                if (!wrapper || !dotsContainer || !nav) return;
                
                const totalSlides = cards.length;
                
                // 計算一次可顯示的卡片數量
                const containerWidth = wrapper.parentElement.offsetWidth;
                const cardWidth = this.cardWidth;
                const gap = 16;
                const visibleCount = Math.floor((containerWidth + gap) / (cardWidth + gap));
                
                console.log(`優惠文章容器寬度: ${containerWidth}px, 卡片寬度: ${cardWidth}px, 一次可顯示: ${visibleCount}張`);
                
                // 清空現有的點
                dotsContainer.innerHTML = '';
                
                // 如果所有卡片都能顯示，就不需要輪播點
                if (totalSlides <= visibleCount) {
                    nav.style.display = 'none';
                    return;
                }
                
                // 需要輪播時，確保導航顯示
                nav.style.display = 'flex';
                
                // 計算實際需要的輪播點數
                let actualDotsNeeded = totalSlides - visibleCount + 1;
                
                // 創建輪播點
                for (let i = 0; i < actualDotsNeeded; i++) {
                    const dot = document.createElement('div');
                    dot.className = `promotion-dot ${i === 0 ? 'active' : ''}`;
                    dot.onclick = () => this.goToSlide(i);
                    dot.tabIndex = 0;
                    dotsContainer.appendChild(dot);
                }
            }
            
            updateCarousel() {
                const wrapper = this.shadowRoot.querySelector('.promotions-wrapper');
                const cards = this.shadowRoot.querySelectorAll('.promotion-card');
                const dots = this.shadowRoot.querySelectorAll('.promotion-dot');
                const leftArrow = this.shadowRoot.querySelector('.left-arrow');
                const rightArrow = this.shadowRoot.querySelector('.right-arrow');
                
                if (!wrapper || cards.length === 0) return;
                
                // 計算滾動位置
                const gap = 16;
                const scrollPosition = this.currentSlide * (this.cardWidth + gap);
                
                wrapper.scrollTo({
                    left: scrollPosition,
                    behavior: 'smooth'
                });
                
                // 更新指示點
                dots.forEach((dot, index) => {
                    if (index === this.currentSlide) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
                
                // 計算一次可顯示的卡片數量
                const containerWidth = wrapper.parentElement.offsetWidth;
                const cardWidth = this.cardWidth;
                const gap2 = 16;
                let visibleCount = Math.floor((containerWidth + gap2) / (cardWidth + gap2));
                visibleCount = Math.max(1, Math.min(visibleCount, cards.length));
                
                // 更新箭頭狀態（參考費用資訊卡片的邏輯）
                const maxSlide = Math.max(0, cards.length - visibleCount);
                if (leftArrow) leftArrow.style.opacity = this.currentSlide === 0 ? '0.5' : '1';
                if (rightArrow) rightArrow.style.opacity = this.currentSlide >= maxSlide ? '0.5' : '1';
            }
            
            updateDots() {
                const dots = this.shadowRoot.querySelectorAll('.promotion-dot');
                dots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === this.currentSlide);
                });
            }
            
            setActiveCategory() {
                const categoryButtons = this.shadowRoot.querySelectorAll('.category-btn');
                const currentCategory = this.getAttribute('data-category') || 'all';
                
                categoryButtons.forEach(button => {
                    const buttonCategory = button.dataset.category;
                    if (buttonCategory === currentCategory) {
                        button.classList.add('active');
                    } else {
                        button.classList.remove('active');
                    }
                });
            }
            
            hideEmptyCategories() {
                // 使用全局分類配置
                const categoryButtons = this.shadowRoot.querySelectorAll('.category-btn');
                
                categoryButtons.forEach(btn => {
                    const category = btn.getAttribute('data-category');
                    
                    // 檢查該分類是否有文章
                    const hasArticles = GLOBAL_PROMOTION_CATEGORIES[category] && GLOBAL_PROMOTION_CATEGORIES[category].length > 0;
                    
                    if (!hasArticles) {
                        btn.style.display = 'none';
                    } else {
                        btn.style.display = 'flex';
                    }
                });
            }
        }
        
        // 註冊 Web Component
        customElements.define('promotion-carousel', PromotionCarousel);
        
        const chatMessages = document.getElementById('chatMessages');
        const userInput = document.getElementById('userInput');
        let currentSlide = 0;
        let totalSlides = 0;
        let maxSlideIndex = 0;
        
        // 初始化
        function init() {
            chatMessages.scrollTop = chatMessages.scrollHeight;
            document.getElementById('userInput').focus();
        }
        
        // 發送訊息
        function sendMessage() {
            try {
                if (!userInput) {
                    console.error('找不到用戶輸入框');
                    return;
                }
                
                const message = userInput.value.trim();
                if (message === '') return;
                
                addMessage(message, 'user');
                userInput.value = '';
                
                // 模擬AI回應
                setTimeout(generateBotResponse, 1000);
            } catch (error) {
                console.error('發送訊息時發生錯誤:', error);
            }
        }
        
        // 處理按鍵事件
        function handleKeyPress(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        }
        
        // 添加訊息到聊天室
        function addMessage(text, sender) {
            try {
                console.log('addMessage 被調用，sender:', sender, 'text:', text.substring(0, 100) + '...');
                
                if (!chatMessages) {
                    console.error('找不到聊天訊息容器');
                    return;
                }
                
                const messageElement = document.createElement('div');
                messageElement.classList.add('message');
                messageElement.classList.add(sender + '-message');
                
                const messageContent = document.createElement('div');
                messageContent.classList.add('message-content');
                messageContent.innerHTML = text;
                messageElement.appendChild(messageContent);
                
                const messageTime = document.createElement('div');
                messageTime.classList.add('message-time');
                messageTime.textContent = getCurrentTime();
                messageElement.appendChild(messageTime);
                
                chatMessages.appendChild(messageElement);
                chatMessages.scrollTop = chatMessages.scrollHeight;
                
                console.log('訊息已成功添加到聊天室');
            } catch (error) {
                console.error('添加訊息時發生錯誤:', error);
            }
        }
        
                // 產生機器人回應
        function generateBotResponse() {
            // 顯示輸入指示器
            const typingIndicator = document.createElement('div');
            typingIndicator.classList.add('typing-indicator');
            typingIndicator.id = 'typingIndicator';
            typingIndicator.innerHTML = `
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            `;
            chatMessages.appendChild(typingIndicator);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // 模擬思考時間後回覆
            setTimeout(() => {
                try {
                    // 安全地移除打字指示器
                    const indicator = document.getElementById('typingIndicator');
                    if (indicator) {
                        indicator.remove();
                    }
                    
                    // 根據用戶輸入生成回應
                    const lastUserMessage = chatMessages.querySelector('.user-message:last-child');
                    console.log('找到最後一條用戶訊息:', lastUserMessage);
                    
                    if (lastUserMessage) {
                        const messageContent = lastUserMessage.querySelector('.message-content') || lastUserMessage;
                        const userMessage = (messageContent.textContent || messageContent.innerText || '').toLowerCase();
                        console.log('用戶訊息內容:', userMessage);
                        
                        if (userMessage.includes('擊球費用') || userMessage.includes('費用') || userMessage.includes('價格')) {
                            console.log('檢測到費用查詢，顯示費用分類');
                            addMessage(`
                                <div>
                                    <p>好的！我來為您介紹幸福高爾夫俱樂部的擊球費用方案：</p>
                                    <br>
                                    <div class="fee-categories">
                                        <div class="category-option" onclick="showFeeCategory('earlybird')">
                                            <div class="category-icon">1</div>
                                            <div class="category-info">
                                                <p>週一高球日/平日早球</p>
                                            </div>
                                            <div class="category-arrow">→</div>
                                        </div>
                                        
                                        <div class="category-option" onclick="showFeeCategory('guest')">
                                            <div class="category-icon">2</div>
                                            <div class="category-info">
                                                <p>平日/假日擊球 (來賓)</p>
                                            </div>
                                            <div class="category-arrow">→</div>
                                        </div>
                                        
                                        <div class="category-option" onclick="showFeeCategory('team')">
                                            <div class="category-icon">3</div>
                                            <div class="category-info">
                                                <p>平日/假日擊球 (球隊)</p>
                                            </div>
                                            <div class="category-arrow">→</div>
                                        </div>
                                    </div>
                                    <p style="margin-top: 16px; font-size: 13px; color: #666;">
                                        💡 請點擊上方選項查看詳細費用資訊
                                    </p>
                                </div>
                            `, 'bot');
                            console.log('費用分類訊息已添加');
                        } else if (userMessage.includes('餐廳') || userMessage.includes('餐飲') || userMessage.includes('美食') || userMessage.includes('吃飯')) {
                            showRestaurantOverview();
                        } else if (userMessage.includes('交通') || userMessage.includes('地址') || userMessage.includes('怎麼去') || userMessage.includes('路線') || userMessage.includes('捷運') || userMessage.includes('開車')) {
                            showTrafficInfo();
                        } else if (userMessage.includes('天氣') || userMessage.includes('氣候') || userMessage.includes('下雨') || userMessage.includes('颱風') || userMessage.includes('起霧')) {
                            showWeatherInfo();
                        } else if (userMessage.includes('設施') || userMessage.includes('設備') || userMessage.includes('會館') || userMessage.includes('場地') || userMessage.includes('場地租借') || userMessage.includes('練習場') || userMessage.includes('練習果嶺') || userMessage.includes('會議') || userMessage.includes('停車') || userMessage.includes('停車場')) {
                            showFacilityOverview();
                        } else if (userMessage.includes('優惠') || userMessage.includes('活動') || userMessage.includes('促銷') || userMessage.includes('特價') || userMessage.includes('折扣')) {
                            showPromotions();
                        } else if (userMessage.includes('教練') || userMessage.includes('教學') || userMessage.includes('下場') || userMessage.includes('九洞') || userMessage.includes('9洞') || userMessage.includes('教練教學') || userMessage.includes('教練帶學員')) {
                            showCoachingProgram();
                        } else if (userMessage.includes('球道') || userMessage.includes('攻略') || userMessage.includes('球場') || userMessage.includes('東區') || userMessage.includes('西區') || userMessage.includes('北區')) {
showCourseGuide();
                        } else if (userMessage.includes('預約') || userMessage.includes('訂場')) {
                            addMessage(`
                                <div class="reservation-card">
                                    <div class="reservation-header">
                                        <h3 class="reservation-title">
                                            <i class="fas fa-calendar-check"></i>
                                            預約服務
                                        </h3>
                                        <p class="reservation-subtitle">擊球/餐廳/專人服務</p>
                                    </div>
                                    <div class="reservation-content">
                                        <div class="contact-info">
                                            <div class="contact-item">
                                                <div class="contact-details">
                                                    <div class="contact-label">線上預約</div>
                                                    <div class="contact-value">LINE搜尋 @HF520</div>
                                                </div>
                                                <div class="contact-action">
                                                    <a href="https://lin.ee/pA07i4z" target="_blank" class="action-btn primary">
                                                        加入
                                                    </a>
                                                </div>
                                            </div>
                                            <div class="contact-item">
                                                <div class="contact-details">
                                                    <div class="contact-label">聯繫電話</div>
                                                    <div class="contact-value">(02) 2606-2345</div>
                                                </div>
                                                <div class="contact-action">
                                                    <a href="tel:+886226062345" class="action-btn secondary">
                                                        撥打
                                                    </a>
                                            </div>
                                        </div>
                                        </div>

                                        <div class="service-info">
                                            <div class="service-time">
                                                <i class="fas fa-clock"></i>
                                                <span>服務時間：週一至週日 06:00-17:00</span>
                                            </div>
                                            <div class="service-note">
                                                💡 預約制，確保最佳服務體驗
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `, 'bot');
                        } else if (userMessage.includes('謝謝') || userMessage.includes('感謝')) {
                            addMessage('不客氣！很高興能協助您。如果還有其他問題，隨時都可以詢問我！', 'bot');
                        } else if (userMessage.includes('高球日') || userMessage.includes('早球')) {
                            showFeeCategory('earlybird');
                        } else if (userMessage.includes('來賓') || userMessage.includes('個人')) {
                            showFeeCategory('guest');
                        } else if (userMessage.includes('球隊') || userMessage.includes('團體')) {
                            showFeeCategory('team');
                        } else {
                            addMessage(`我理解您的問題，但可能需要更多資訊來提供準確的協助。<br><br>您可以詢問：<br><br>• 擊球費用相關問題<br>• 預約服務<br>• 餐廳資訊<br>• 交通資訊<br>• 天氣資訊<br>• 設施介紹<br>• 優惠活動<br><br>或者請提供更具體的問題描述。`, 'bot');
                        }
                    } else {
                        // 如果找不到用戶訊息，提供預設回應
                        addMessage(`您好！我是幸福高爾夫俱樂部的智能客服。<br><br>我可以協助您了解：<br>• 擊球費用相關問題<br>• 預約服務<br>• 餐廳資訊<br>• 交通資訊<br>• 天氣資訊<br>• 設施介紹<br>• 優惠活動<br><br>請輸入您的問題，我會盡力協助您！`, 'bot');
                    }
                } catch (error) {
                    console.error('生成回應時發生錯誤:', error);
                    // 發生錯誤時提供預設回應
                    addMessage(`抱歉，處理您的問題時遇到了一些技術問題。<br><br>請重新輸入您的問題，我會盡力協助您！`, 'bot');
                }
            }, 1500);
        }
        
        // 獲取當前時間
        function getCurrentTime() {
            const now = new Date();
            return now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
        }
        
        // 處理擊球費用查詢
        function getGolfFeeInfo() {
            return `
                <div class="fee-categories">
                    <div class="category-option" onclick="showFeeCategory('earlybird')">
                        <div class="category-icon">1</div>
                        <div class="category-info">
                            <p>週一高球日/平日早球</p>
                        </div>
                        <div class="category-arrow">→</div>
                    </div>
                    
                    <div class="category-option" onclick="showFeeCategory('guest')">
                        <div class="category-icon">2</div>
                        <div class="category-info">
                            <p>平日/假日擊球 (來賓)</p>
                        </div>
                        <div class="category-arrow">→</div>
                    </div>
                    
                    <div class="category-option" onclick="showFeeCategory('team')">
                        <div class="category-icon">3</div>
                        <div class="category-info">
                            <p>平日/假日擊球 (球隊)</p>
                        </div>
                        <div class="category-arrow">→</div>
                    </div>
                </div>
            `;
        }
        
        // 顯示費用分類輪轉
        function showFeeCategory(category) {
            let carouselContent = '';
            let totalSlides = 0;
            
            const carouselId = `feeCarousel_${Date.now()}`;
            
            switch(category) {
                case 'earlybird':
                    totalSlides = 3;
                    carouselContent = `
                        <div class="carousel-item">
                            <img src="https://hsingfu-golf.com.tw/wp-content/uploads/2025/08/資產-4.webp" alt="週一高球日" class="carousel-image">
                        </div>
                        <div class="carousel-item">
                            <img src="https://hsingfu-golf.com.tw/wp-content/uploads/2025/08/資產-3.webp" alt="夏令平日早球" class="carousel-image">
                        </div>
                        <div class="carousel-item">
                            <img src="https://hsingfu-golf.com.tw/wp-content/uploads/2025/08/資產-2.webp" alt="冬令平日早球" class="carousel-image">
                        </div>
                    `;
                    break;
                    
                case 'guest':
                    totalSlides = 3;
                    carouselContent = `
                        <div class="carousel-item">
                            <img src="https://hsingfu-golf.com.tw/wp-content/uploads/2025/08/資產-12.webp" alt="夏令平日" class="carousel-image">
                        </div>
                        <div class="carousel-item">
                            <img src="https://hsingfu-golf.com.tw/wp-content/uploads/2025/08/資產-13.webp" alt="冬令平日" class="carousel-image">
                        </div>
                        <div class="carousel-item">
                            <img src="https://hsingfu-golf.com.tw/wp-content/uploads/2025/08/資產-14.webp" alt="假日擊球" class="carousel-image">
                        </div>
                    `;
                    break;
                    
                case 'team':
                    totalSlides = 4;
                    carouselContent = `
                        <div class="carousel-item">
                            <img src="https://hsingfu-golf.com.tw/wp-content/uploads/2025/08/資產-5.webp" alt="平日 15人以上" class="carousel-image">
                        </div>
                        <div class="carousel-item">
                            <img src="https://hsingfu-golf.com.tw/wp-content/uploads/2025/08/資產-6.webp" alt="平日 40人以上" class="carousel-image">
                        </div>
                        <div class="carousel-item">
                            <img src="https://hsingfu-golf.com.tw/wp-content/uploads/2025/08/資產-7.webp" alt="假日 15人以上" class="carousel-image">
                        </div>
                        <div class="carousel-item">
                            <img src="https://hsingfu-golf.com.tw/wp-content/uploads/2025/08/資產-8.webp" alt="假日 40人以上" class="carousel-image">
                        </div>
                    `;
                    break;
            }
            
            currentSlide = 0;
            totalSlides = totalSlides;
            
            const response = `
                <div class="carousel-wrapper">
                    <div class="carousel-container" id="${carouselId}">
                        ${carouselContent}
                    </div>
                    
                    <div class="carousel-nav">
                        <div class="carousel-arrow left-arrow" onclick="moveCarousel(-1, '${carouselId}')" tabindex="0">
                            <i class="fas fa-chevron-left"></i>
                        </div>
                        <div class="carousel-dots" id="dots_${carouselId}">
                            <!-- 輪播點將由 JavaScript 動態生成 -->
                        </div>
                        <div class="carousel-arrow right-arrow" onclick="moveCarousel(1, '${carouselId}')" tabindex="0">
                            <i class="fas fa-chevron-right"></i>
                        </div>
                    </div>
                </div>
                
                <!-- 简约风格按钮 -->
                <div class="carousel-buttons">
                    ${category !== 'earlybird' ? '<button class="carousel-button" onclick="showFeeCategory(\'earlybird\')"><i class="fas fa-golf-ball"></i>高球日/早球</button>' : ''}
                    ${category !== 'guest' ? '<button class="carousel-button" onclick="showFeeCategory(\'guest\')"><i class="fas fa-user"></i>來賓擊球</button>' : ''}
                    ${category !== 'team' ? '<button class="carousel-button" onclick="showFeeCategory(\'team\')"><i class="fas fa-users"></i>球隊擊球</button>' : ''}
                    <button class="carousel-button" onclick="showReservation()">
                        <i class="fas fa-headset"></i>專人預約
                    </button>
                </div>
            `;
            
            addMessage(response, 'bot');
            
            // 初始化輪播
            setTimeout(() => {
                initCarouselWithRetry(carouselId);
                
                // 添加滑鼠滾輪事件監聽
                const carousel = document.getElementById(carouselId);
                if (carousel) {
                    carousel.addEventListener('wheel', handleWheel, { passive: false });
                }
            }, 200);
        }
        
        // 智能創建輪播點
        function createSmartDots(carouselId) {
            const carousel = document.getElementById(carouselId);
            if (!carousel) return;
            
            const items = carousel.querySelectorAll('.carousel-item');
            const totalSlides = items.length;
            const dotsContainer = document.getElementById(`dots_${carouselId}`);
            if (!dotsContainer) return;
            
            // 計算一次可顯示的圖片數量（基於實際容器寬度和圖片寬度）
            const containerWidth = carousel.offsetWidth;
            const itemWidth = 300; // 圖片寬度 (300px)
            const gap = 3; // 圖片間距 (3px)
            
            // 計算一次能完整顯示幾張圖片
            let visibleCount = Math.floor((containerWidth + gap) / (itemWidth + gap));
            visibleCount = Math.max(1, Math.min(visibleCount, totalSlides)); // 確保在合理範圍內
            
            console.log(`容器寬度: ${containerWidth}px, 圖片寬度: ${itemWidth}px, 一次可顯示: ${visibleCount}張`);
            
            // 清空現有的點
            dotsContainer.innerHTML = '';
            
            // 獲取導航元素，優先使用當前輪播的父元素
            let nav;
            if (carousel.closest('.menu-carousel-wrapper')) {
                // 菜單輪播
                nav = carousel.closest('.menu-carousel-wrapper').querySelector('.carousel-nav');
            } else {
                // 其他輪播
                nav = carousel.parentElement.querySelector('.carousel-nav');
            }
            
            // 如果所有圖片都能顯示，就不需要輪播點
            if (totalSlides <= visibleCount) {
                if (nav) nav.style.display = 'none';
                return;
            }
            
            // 需要輪播時，確保導航顯示
            if (nav) nav.style.display = 'flex';
            
            // 計算實際需要的輪播點數
            let actualDotsNeeded = totalSlides - visibleCount + 1;
            
            // 創建輪播點
            for (let i = 0; i < actualDotsNeeded; i++) {
                const dot = document.createElement('div');
                dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
                dot.onclick = () => {
                    // 確保使用正確的carouselId
                    const currentCarousel = document.getElementById(carouselId);
                    if (currentCarousel) {
                        currentCarousel.dataset.currentSlide = i;
                        updateCarousel(carouselId, i);
                    }
                };
                dot.tabIndex = 0;
                dotsContainer.appendChild(dot);
            }
        }
        
        // 初始化輪播（帶重試機制）
        function initCarouselWithRetry(carouselId, retryCount = 0) {
            const carousel = document.getElementById(carouselId);
            const dotsContainer = document.getElementById(`dots_${carouselId}`);
            
            // 如果元素還沒準備好，重試
            if (!carousel || !dotsContainer) {
                if (retryCount < 5) {
                    setTimeout(() => {
                        initCarouselWithRetry(carouselId, retryCount + 1);
                    }, 100);
                }
                return;
            }
            
            // 重置輪播狀態
            currentSlide = 0;
            
            // 智能創建輪播點
            createSmartDots(carouselId);
            
            updateCarousel(carouselId);
        }
        
        // 初始化輪播
        function initCarousel(carouselId) {
            const carousel = document.getElementById(carouselId);
            if (!carousel) return;
            
            // 重置輪播狀態
            currentSlide = 0;
            carousel.dataset.currentSlide = '0';
            
            // 確保輪播容器有正確的樣式
            carousel.style.position = 'relative';
            carousel.style.overflow = 'hidden';
            
            // 智能創建輪播點
            createSmartDots(carouselId);
            
            updateCarousel(carouselId);
        }
        
        // 移動輪播
        function moveCarousel(direction, carouselId) {
            // 如果沒有指定carouselId，則找到當前活動的輪播
            let carousel;
            if (carouselId) {
                carousel = document.getElementById(carouselId);
            } else {
                // 找到當前可見的菜單輪播
                carousel = document.querySelector('.menu-carousel-wrapper .carousel-container');
            }
            
            if (!carousel) return;
            
            const items = carousel.querySelectorAll('.carousel-item');
            if (items.length === 0) return;
            
            // 獲取當前輪播的slide狀態，如果沒有則初始化為0
            let currentSlideForThisCarousel = parseInt(carousel.dataset.currentSlide) || 0;
            currentSlideForThisCarousel += direction;
            
            // 處理邊界循環
            if (currentSlideForThisCarousel < 0) {
                currentSlideForThisCarousel = items.length - 1;
            } else if (currentSlideForThisCarousel >= items.length) {
                currentSlideForThisCarousel = 0;
            }
            
            // 保存當前輪播的slide狀態
            carousel.dataset.currentSlide = currentSlideForThisCarousel;
            
            updateCarousel(carousel.id, currentSlideForThisCarousel);
        }
        
        // 跳转到特定幻灯片
        function goToSlide(index, carouselId) {
            // 如果沒有指定carouselId，則找到當前活動的輪播
            let carousel;
            if (carouselId) {
                carousel = document.getElementById(carouselId);
            } else {
                // 找到當前可見的菜單輪播
                carousel = document.querySelector('.menu-carousel-wrapper .carousel-container');
            }
            
            if (!carousel) return;
            
            const items = carousel.querySelectorAll('.carousel-item');
            if (items.length === 0) return;
            
            // 確保索引在有效範圍內
            const validIndex = Math.max(0, Math.min(index, items.length - 1));
            
            // 保存當前輪播的slide狀態
            carousel.dataset.currentSlide = validIndex;
            
            updateCarousel(carousel.id, validIndex);
        }
        
        // 更新轮播显示
        function updateCarousel(carouselId, slideIndex = null) {
            const carousel = document.getElementById(carouselId);
            if (!carousel) return;
            
            const items = carousel.querySelectorAll('.carousel-item');
            const dots = document.querySelectorAll(`#dots_${carouselId} .carousel-dot`);
            
            // 找到輪播導航元素，優先使用當前輪播的父元素
            let leftArrow, rightArrow;
            if (carousel.closest('.menu-carousel-wrapper')) {
                // 菜單輪播
                leftArrow = carousel.closest('.menu-carousel-wrapper').querySelector('.left-arrow');
                rightArrow = carousel.closest('.menu-carousel-wrapper').querySelector('.right-arrow');
            } else {
                // 其他輪播
                leftArrow = carousel.parentElement.querySelector('.left-arrow');
                rightArrow = carousel.parentElement.querySelector('.right-arrow');
            }
            
            // 使用傳入的slideIndex，如果沒有則使用輪播自己的狀態
            const currentSlideForThisCarousel = slideIndex !== null ? slideIndex : (parseInt(carousel.dataset.currentSlide) || 0);
            
            // 確保索引在有效範圍內
            const validIndex = Math.max(0, Math.min(currentSlideForThisCarousel, items.length - 1));
            
            // 計算滾動位置 - 使用原始的 offsetLeft 方式
            const scrollPosition = items[validIndex].offsetLeft - carousel.offsetLeft;
            
            carousel.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            });
            
            // 更新指示點
            dots.forEach((dot, index) => {
                if (index === validIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
            
            // 計算一次可顯示的圖片數量（基於實際容器寬度和圖片寬度）
            const containerWidth = carousel.offsetWidth;
            const itemWidth = 300; // 圖片寬度 (300px)
            const gap = 3; // 圖片間距 (3px)
            
            let visibleCount = Math.floor((containerWidth + gap) / (itemWidth + gap));
            visibleCount = Math.max(1, Math.min(visibleCount, items.length));
            
            // 更新箭頭狀態
            const maxSlide = Math.max(0, items.length - visibleCount);
            if (leftArrow) leftArrow.style.opacity = validIndex === 0 ? '0.5' : '1';
            if (rightArrow) rightArrow.style.opacity = validIndex >= maxSlide ? '0.5' : '1';
        }
        
        // 預約功能
        function showReservation() {
            addMessage(`
                <div class="reservation-card">
                    <div class="reservation-header">
                        <h3 class="reservation-title">
                            <i class="fas fa-calendar-check"></i>
                            預約服務
                        </h3>
                        <p class="reservation-subtitle">擊球/餐廳/專人服務</p>
                        </div>
                    <div class="reservation-content">
                        <div class="contact-info">
                            <div class="contact-item">
                            <div class="contact-details">
                                <div class="contact-label">LINE 預約</div>
                                <div class="contact-value">@HF520</div>
                            </div>
                            <div class="contact-action">
                                <a href="https://lin.ee/pA07i4z" target="_blank" class="action-btn primary">
                                    加入
                                </a>
                            </div>
                        </div>
                        
                            <div class="contact-item">
                            <div class="contact-details">
                                <div class="contact-label">服務專線</div>
                                <div class="contact-value">(02) 2606-2345</div>
                            </div>
                            <div class="contact-action">
                                <a href="tel:+886226062345" class="action-btn secondary">
                                    撥打
                                </a>
                            </div>
                        </div>
                    </div>
                    
                        <div class="service-info">
                            <div class="service-time">
                            <i class="fas fa-clock"></i>
                                <span>服務時間：週一至週日 06:00-17:00</span>
                        </div>
                        <div class="service-note">
                                💡 預約制，確保最佳服務體驗
                        </div>
                    </div>
                </div>
                </div>
            `, 'bot');
        }
        
        // 顯示設施總覽
        function showFacilityOverview() {
            addMessage(`
                <div class="facility-overview">
                    <div class="facility-header">
                        <h3 class="facility-title">
                            <i class="fas fa-building"></i>
                            設施介紹
                        </h3>
                        <p class="facility-subtitle">幸福高爾夫俱樂部完善設施</p>
                    </div>
                    
                    <div class="facility-buttons">
                        <button class="facility-btn active" onclick="showFacilityDetail('lounge', this)">
                            <i class="fas fa-users"></i>
                            幸福交誼廳
                        </button>
                        <button class="facility-btn" onclick="showFacilityDetail('parking', this)">
                            <i class="fas fa-parking"></i>
                            停車場
                        </button>
                        <button class="facility-btn" onclick="showFacilityDetail('women', this)">
                            <i class="fas fa-female"></i>
                            女更衣室
                        </button>
                        <button class="facility-btn" onclick="showFacilityDetail('men', this)">
                            <i class="fas fa-male"></i>
                            男更衣室
                        </button>
                        <button class="facility-btn" onclick="showFacilityDetail('putting', this)">
                            <i class="fas fa-flag"></i>
                            練習果嶺
                        </button>
                    </div>
                    
                    <div class="facility-content">
                        <div class="facility-detail" id="facilityDetail">
                            <div class="facility-detail-flex">
                                <div class="facility-detail-text">
                                    <p class="facility-detail-description">容納150位，適合簡報會議或其它各式活動。</p>
                                    <a href="https://hsingfu-golf.com.tw/contact/" target="_blank" class="facility-link-btn">場租諮詢</a>
                                </div>
                                <div class="facility-detail-image">
                                    <img src="https://hsingfu-golf.com.tw/wp-content/uploads/2024/07/1D12E32C-426A-4B80-BF8D-97E6F40A8B43-768x576.jpg" alt="幸福交誼廳" class="facility-image" onerror="handleImageError(this, '幸福交誼廳')" onload="handleImageLoad(this)">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `, 'bot');
        }
        
        // 顯示設施詳細介紹
        function showFacilityDetail(facilityType, buttonElement) {
            let facilityData = {
                'lounge': {
                    title: '幸福交誼廳',
                    icon: 'fas fa-users',
                    description: '容納150位，適合簡報會議或其它各式活動。',
                    image: 'https://hsingfu-golf.com.tw/wp-content/uploads/2024/07/1D12E32C-426A-4B80-BF8D-97E6F40A8B43-768x576.jpg'
                },
                'parking': {
                    title: '停車場',
                    icon: 'fas fa-parking',
                    description: '提供寬敞的室內會員停車場/室外來賓停車空間，規劃整齊、車位明確，車格皆設有標準黃線輪擋。',
                    image: 'https://hsingfu-golf.com.tw/wp-content/uploads/2025/06/chchc.jpg'
                },
                'women': {
                    title: '女更衣室',
                    icon: 'fas fa-female',
                    description: '明亮乾淨的更衣空間，配備齊全的設施。',
                    image: 'https://hsingfu-golf.com.tw/wp-content/uploads/2025/06/1735193922504.jpg'
                },
                'men': {
                    title: '男更衣室',
                    icon: 'fas fa-male',
                    description: '寬敞舒適的更衣空間，提供完善的淋浴設施。',
                    image: 'https://hsingfu-golf.com.tw/wp-content/uploads/2023/08/%E7%94%B7%E6%9B%B4%E8%A1%A31-300x225.jpeg'
                },
                'putting': {
                    title: '練習果嶺',
                    icon: 'fas fa-flag',
                    description: '館前練習果嶺全新開放，設沙坑區與切桿區，實戰坡度與沙坑，強化短桿與困難位攻防體驗。',
                    image: 'https://hsingfu-golf.com.tw/wp-content/uploads/2025/09/資產-1.webp'
                }
            };
            
            const facility = facilityData[facilityType];
            if (!facility) return;
            
            // 移除所有按鈕的 active 類別
            const facilityOverview = buttonElement.closest('.facility-overview');
            const allButtons = facilityOverview.querySelectorAll('.facility-btn');
            allButtons.forEach(btn => btn.classList.remove('active'));
            
            // 為當前按鈕添加 active 類別
            buttonElement.classList.add('active');
            
            // 更新設施詳細內容
            const facilityDetail = facilityOverview.querySelector('#facilityDetail');
            if (facilityDetail) {
                let linkButton = '';
                if (facilityType === 'lounge') {
                    linkButton = '<a href="https://hsingfu-golf.com.tw/page6-3/%e5%a0%b4%e5%9c%b0%e7%a7%9f%e5%80%9f/" target="_blank" class="facility-link-btn">場租諮詢</a>';
                } else if (facilityType === 'putting') {
                    linkButton = '<a href="https://www.facebook.com/share/p/19FK5UuEQQ/" target="_blank" class="facility-link-btn">使用說明</a>';
                }
                
                facilityDetail.innerHTML = `
                    <div class="facility-detail-flex">
                        <div class="facility-detail-text">
                            <p class="facility-detail-description">${facility.description}</p>
                            ${linkButton}
                        </div>
                        <div class="facility-detail-image">
                            <img src="${facility.image}" alt="${facility.title}" class="facility-image" onerror="handleImageError(this, '${facility.title}')" onload="handleImageLoad(this)">
                    </div>
                </div>
            `;
            }
        }
        
        // 顯示天氣資訊
        function showWeatherInfo() {
            addMessage(`
                <div class="weather-info-card">
                    <div class="weather-header">
                        <h3 class="weather-title">
                            <i class="fas fa-cloud-sun"></i>
                            天氣資訊
                        </h3>
                        <p class="weather-subtitle">即時天氣狀況查詢</p>
                    </div>
                    
                    <div class="weather-content">
                        <!-- 天氣查詢說明 -->
                        <div class="weather-section">
                            <div class="weather-section-header">
                                <i class="fas fa-info-circle"></i>
                                <h4>天氣查詢</h4>
                            </div>
                            <div class="weather-section-content">
                                <p class="weather-text">為了提供最準確的即時天氣資訊，歡迎使用幸福球場即時天氣實況，讓你掌握最準確的天氣狀況。</p>
                                <a href="https://hsingfu-golf.com.tw/web/" target="_blank" class="weather-btn">
                                    <i class="fas fa-cloud-rain"></i>
                                    即時天氣
                                </a>
                                <p style="margin-top: 16px; font-size: 13px; color: #666;">
                                    💡 如遇惡劣天氣，球場營業依政府公告為準。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `, 'bot');
        }
        
        // 顯示球道攻略
        function showCourseGuide() {
            addMessage(`
                <div class="course-guide-card">
                    <div class="course-guide-header">
                        <h3 class="course-guide-title">
                            <i class="fas fa-golf-ball"></i>
                            球道攻略
                        </h3>
                        <p class="course-guide-subtitle">幸福高爾夫球場完整攻略指南</p>
                    </div>
                    
                    <div class="course-guide-content">
                        <!-- 球場介紹 -->
                        <div class="course-guide-section">
                            <div class="course-guide-section-header">
                                <i class="fas fa-info-circle"></i>
                                <h4>球場介紹</h4>
                            </div>
                            <div class="course-guide-section-content">
                                <p class="course-guide-text">幸福高爾夫球場擁有東、西、北三大區域，共 27 洞，立即查看完整攻略！</p>
                                <a href="https://hsingfu-golf.com.tw/about/fairway/" target="_blank" class="course-guide-btn">
                                    <i class="fas fa-map-marked-alt"></i>
                                    進入球道攻略
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `, 'bot');
        }
        
        // 顯示教練教學專案
        function showCoachingProgram() {
            addMessage(`
                <div class="coaching-program-card">
                    <div class="coaching-program-header">
                        <h3 class="coaching-program-title">
                            幸福 9 洞教練教學方案
                        </h3>
                    </div>
                    
                    <div class="coaching-program-content">
                        <!-- 專案介紹 -->
                        <div class="coaching-program-section">
                            <div class="coaching-program-section-header">
                                <i class="fas fa-info-circle"></i>
                                專案介紹
                            </div>
                            <div class="coaching-program-section-content">
                                教練北區9洞方案，須提前預約
                            </div>
                        </div>
                        
                        <!-- 時間安排 -->
                        <div class="coaching-program-section">
                            <div class="coaching-program-section-header">
                                <i class="fas fa-clock"></i>
                                時間安排
                            </div>
                            <div class="coaching-program-section-content">
                                夏令（5–10 月）：15:00–18:00<br>
                                冬令（11–4 月）：14:00–17:00
                            </div>
                        </div>
                        
                        <!-- 收費標準 -->
                        <div class="coaching-program-section">
                            <div class="coaching-program-section-header">
                                <i class="fas fa-dollar-sign"></i>
                                收費標準
                            </div>
                            <div class="coaching-program-section-content">
                                <table class="coaching-program-table">
                                    <tr>
                                        <td class="table-label">平日</td>
                                        <td class="table-price">$1,400/人</td>
                                    </tr>
                                    <tr>
                                        <td class="table-label">假日</td>
                                        <td class="table-price">$1,760/人</td>
                                    </tr>
                                </table>
                                <div class="coaching-program-notes">
                                    <p>• 不含桿弟、更衣室、淋浴間</p>
                                    <p>• 球車需另租，由教練駕駛</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <a href="https://hsingfu-golf.com.tw/coaching-program/" target="_blank" class="coaching-program-btn">
                        <i class="fas fa-info-circle"></i>
                        專案詳情
                    </a>
                </div>
            `, 'bot');
        }
        
        // 顯示球道攻略詳細頁面
        function showCourseGuideDetail() {
            addMessage(`
                <div class="course-guide-card">
                    <div class="course-guide-header">
                        <h3 class="course-guide-title">
                            <i class="fas fa-map-marked-alt"></i>
                            球道攻略詳細
                        </h3>
                        <p class="course-guide-subtitle">東、西、北三大區域完整攻略</p>
                    </div>
                    
                    <div class="course-guide-content">
                        <!-- 東區球道 -->
                        <div class="course-guide-section">
                            <div class="course-guide-section-header">
                                <i class="fas fa-sun"></i>
                                <h4>東區球道 (1-9洞)</h4>
                            </div>
                            <div class="course-guide-section-content">
                                <p class="course-guide-text">東區球道以開闊的視野和挑戰性著稱，適合追求距離的球友。</p>
                                <p class="course-guide-text">特色：長距離球道、大型果嶺、風向影響較大</p>
                                <p class="course-guide-text">建議：注意風向變化，選擇合適的球桿</p>
                            </div>
                        </div>
                        
                        <!-- 西區球道 -->
                        <div class="course-guide-section">
                            <div class="course-guide-section-header">
                                <i class="fas fa-tree"></i>
                                <h4>西區球道 (10-18洞)</h4>
                            </div>
                            <div class="course-guide-section-content">
                                <p class="course-guide-text">西區球道環繞樹林，需要精準的擊球技巧。</p>
                                <p class="course-guide-text">特色：樹林環繞、狹窄球道、精準度要求高</p>
                                <p class="course-guide-text">建議：注重準確性，避免進入樹林障礙</p>
                            </div>
                        </div>
                        
                        <!-- 北區球道 -->
                        <div class="course-guide-section">
                            <div class="course-guide-section-header">
                                <i class="fas fa-mountain"></i>
                                <h4>北區球道 (19-27洞)</h4>
                            </div>
                            <div class="course-guide-section-content">
                                <p class="course-guide-text">北區球道地形起伏較大，提供最具挑戰性的體驗。</p>
                                <p class="course-guide-text">特色：地形起伏、水障礙、策略性強</p>
                                <p class="course-guide-text">建議：仔細規劃擊球路線，注意地形變化</p>
                            </div>
                        </div>
                        
                        <!-- 攻略建議 -->
                        <div class="course-guide-section">
                            <div class="course-guide-section-header">
                                <i class="fas fa-lightbulb"></i>
                                <h4>攻略建議</h4>
                            </div>
                            <div class="course-guide-section-content">
                                <p class="course-guide-text">• 建議攜帶多種球桿以應對不同球道特色</p>
                                <p class="course-guide-text">• 注意天氣變化對擊球的影響</p>
                                <p class="course-guide-text">• 提前了解各球道的障礙位置</p>
                                <p class="course-guide-text">• 保持耐心，享受高爾夫運動的樂趣</p>
                            </div>
                        </div>
                    </div>
                </div>
            `, 'bot');
        }
        
        // 顯示交通資訊
        function showTrafficInfo() {
            addMessage(`
                <div class="traffic-info-card">
                    <div class="traffic-header">
                        <h3 class="traffic-title">
                            <i class="fas fa-map-marker-alt"></i>
                            交通資訊
                        </h3>
                        <p class="traffic-subtitle">如何前往幸福高爾夫俱樂部</p>
                    </div>
                    
                    <div class="traffic-content">
                        <!-- 地址資訊 -->
                        <div class="traffic-section">
                            <div class="traffic-section-header">
                                <i class="fas fa-home"></i>
                                <h4>地址</h4>
                            </div>
                            <div class="traffic-section-content">
                                <p class="address-text">新北市林口區下福里71-2號</p>
                                <p class="address-text">聯絡電話 (02) 2606-2345</p>
                                <a href="https://www.google.com/maps/search/新北市林口區下福里71-2號" target="_blank" class="map-btn">
                                    <i class="fas fa-map"></i>
                                    打開 Google 地圖
                                </a>
                            </div>
                        </div>
                        
                        <!-- 大眾運輸 -->
                        <div class="traffic-section">
                            <div class="traffic-section-header">
                                <i class="fas fa-subway"></i>
                                <h4>大眾運輸</h4>
                            </div>
                            <div class="traffic-section-content">
                                <p class="traffic-text">桃園機場捷運 A10 山鼻站，轉乘計程車約 15 分（約 7 公里）</p>
                            </div>
                        </div>
                        
                        <!-- 自駕路線 -->
                        <div class="traffic-section">
                            <div class="traffic-section-header">
                                <i class="fas fa-car"></i>
                                <h4>自駕路線</h4>
                            </div>
                            <div class="traffic-section-content">
                                <p class="traffic-text">西部濱海公路 → 新北 106 縣道直行 1.6 公里 → 見「幸福高爾夫」指標右轉直行</p>
                            </div>
                        </div>
                    </div>
                </div>
            `, 'bot');
        }
        
        // 顯示餐廳總覽
        function showRestaurantOverview() {
            addMessage(`
                <div class="restaurant-overview">
                    <div class="restaurant-card">
                        <div class="restaurant-header">
                            <div class="restaurant-info">
                                <h3>福園餐廳  |  預約制</h3>
                                <p>精緻中式料理，提供合菜、桌宴、單點等多元選擇</p>
                            </div>
                        </div>
                        <div class="restaurant-actions">
                            <button class="restaurant-btn" onclick="showFuyuanMenu()">
                                <i class="fas fa-book-open"></i>
                                菜單
                            </button>
                            <button onclick="showReservation()" class="restaurant-btn primary">
                                <i class="fas fa-calendar-check"></i>
                                預約
                            </button>
                            <button class="restaurant-btn" onclick="showFuyuanIntro()">
                                <i class="fas fa-info-circle"></i>
                                簡介
                            </button>
                        </div>
                    </div>
                    
                    <div class="restaurant-card">
                        <div class="restaurant-header">
                            <div class="restaurant-info">
                                <h3>幸福咖啡吧</h3>
                                <p>咖啡、輕食、飲品，享受悠閒時光</p>
                            </div>
                        </div>
                        <div class="restaurant-actions">
                            <button class="restaurant-btn" onclick="showCoffeeMenu()">
                                <i class="fas fa-book-open"></i>
                                菜單
                            </button>
                            <button class="restaurant-btn" onclick="showCoffeeIntro()">
                                <i class="fas fa-info-circle"></i>
                                簡介
                            </button>
                        </div>
                    </div>
                </div>
            
            `, 'bot');
        }
        
        // 顯示福園餐廳菜單分類
        function showFuyuanMenu() {
            // 直接顯示福聚合菜菜單，跳過分類選擇
            setTimeout(() => {
                showMenuCategory('fuyuan', 'hechai');
            }, 100);
        }
        
        // 顯示幸福咖啡吧菜單
        function showCoffeeMenu() {
            const carouselId = `coffeeCarousel_${Date.now()}`;
            
            addMessage(`
                <div class="carousel-wrapper">
                    <div class="carousel-container" id="${carouselId}">
                        <div class="carousel-item coffee-menu">
                            <img src="https://hsingfu-golf.com.tw/wp-content/uploads/2025/08/%E4%B8%BB%E9%A3%9F-scaled.png" alt="幸福咖啡吧菜單-第1頁" class="carousel-image">
                        </div>
                        <div class="carousel-item coffee-menu">
                            <img src="https://hsingfu-golf.com.tw/wp-content/uploads/2025/08/%E9%85%92%E6%B0%B42-scaled.png" alt="幸福咖啡吧菜單-第2頁" class="carousel-image">
                        </div>
                    </div>
                    
                    <div class="carousel-nav">
                        <div class="carousel-arrow left-arrow" onclick="moveCarousel(-1, '${carouselId}')" tabindex="0">
                            <i class="fas fa-chevron-left"></i>
                        </div>
                        <div class="carousel-dots" id="dots_${carouselId}">
                            <!-- 輪播點將由 JavaScript 動態生成 -->
                        </div>
                        <div class="carousel-arrow right-arrow" onclick="moveCarousel(1, '${carouselId}')" tabindex="0">
                            <i class="fas fa-chevron-right"></i>
                        </div>
                    </div>
                </div>
                
                <!-- 菜單操作按鈕 -->
                <div class="menu-actions">
                    <button class="menu-btn" onclick="showRestaurantOverview()">
                        <i class="fas fa-arrow-left"></i>
                        返回餐廳總覽
                    </button>
                </div>
            `, 'bot');
            
            // 初始化輪播
            setTimeout(() => {
                initCarouselWithRetry(carouselId);
                
                // 添加滑鼠滾輪事件監聽
                const carousel = document.getElementById(carouselId);
                if (carousel) {
                    carousel.addEventListener('wheel', handleWheel, { passive: false });
                }
            }, 200);
        }
        
        // 檢測是否為觸控設備
        function isTouchDevice() {
            return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
        }
        
        // 圖片載入錯誤處理
        function handleImageError(img, fallbackText = '圖片載入失敗') {
            console.warn('圖片載入失敗:', img.src);
            img.classList.add('error');
            img.alt = fallbackText;
            img.title = `無法載入圖片: ${img.src}`;
            
            // 嘗試使用備用URL（如果有的話）
            const originalSrc = img.dataset.originalSrc || img.src;
            if (originalSrc && originalSrc !== img.src) {
                console.log('嘗試載入備用圖片:', originalSrc);
                img.src = originalSrc;
            }
        }
        
        // 圖片載入成功處理
        function handleImageLoad(img) {
            img.classList.remove('error');
            console.log('圖片載入成功:', img.src);
            
            // 強制設置圖片樣式確保可見
            img.style.display = 'block';
            img.style.visibility = 'visible';
            img.style.opacity = '1';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            
            // 確保容器樣式正確
            const container = img.closest('.carousel-item');
            if (container) {
                container.style.display = 'block';
                container.style.visibility = 'visible';
                container.style.opacity = '1';
            }
        }
        
        // 為所有圖片添加載入事件監聽器
        function addImageLoadListeners() {
            const images = document.querySelectorAll('.carousel-image, .restaurant-intro-image');
            images.forEach(img => {
                // 保存原始src
                if (!img.dataset.originalSrc) {
                    img.dataset.originalSrc = img.src;
                }
                
                // 添加載入事件監聽器
                img.addEventListener('error', () => handleImageError(img));
                img.addEventListener('load', () => handleImageLoad(img));
                
                // 檢查圖片是否已經載入
                if (img.complete && img.naturalHeight === 0) {
                    handleImageError(img);
                }
            });
        }
        
        // WordPress環境檢測
        function isWordPressEnvironment() {
            return window.location.href.includes('wp-admin') || 
                   window.location.href.includes('elementor') ||
                   document.querySelector('meta[name="generator"][content*="WordPress"]') ||
                   document.querySelector('link[href*="wp-content"]');
        }
        

        
        // WordPress環境檢測和基本修復
        function diagnoseWordPressIssues() {
            if (isWordPressEnvironment()) {
                console.log('檢測到WordPress環境，應用圖片顯示修復');
            }
        }
        
        // WordPress兼容性：修正圖片URL
        function fixImageUrlsForWordPress() {
            if (isWordPressEnvironment()) {
                console.log('正在修正WordPress環境下的圖片URL...');
                
                // 獲取當前網站的基礎URL
                const currentDomain = window.location.origin;
                const isSameDomain = currentDomain.includes('hsingfu-golf.com.tw');
                
                if (!isSameDomain) {
                    console.log('檢測到不同域名，可能需要使用相對路徑或CDN');
                    
                    // 嘗試使用相對路徑
                    const images = document.querySelectorAll('.carousel-image, .restaurant-intro-image');
                    images.forEach(img => {
                        const originalSrc = img.src;
                        if (originalSrc.includes('hsingfu-golf.com.tw')) {
                            // 提取路徑部分
                            const pathMatch = originalSrc.match(/\/wp-content\/uploads\/(.+)$/);
                            if (pathMatch) {
                                const relativePath = '/wp-content/uploads/' + pathMatch[1];
                                console.log('嘗試使用相對路徑:', relativePath);
                                
                                // 創建測試圖片
                                const testImg = new Image();
                                testImg.onload = () => {
                                    console.log('相對路徑成功，更新圖片URL');
                                    img.src = relativePath;
                                };
                                testImg.onerror = () => {
                                    console.log('相對路徑失敗，保持原始URL');
                                };
                                testImg.src = relativePath;
                            }
                        }
                    });
                }
            }
        }
        
        // 強制修復圖片顯示問題
        function forceFixImageDisplay() {
            const images = document.querySelectorAll('.carousel-image, .restaurant-intro-image');
            images.forEach((img) => {
                // 強制設置圖片樣式
                img.style.display = 'block';
                img.style.visibility = 'visible';
                img.style.opacity = '1';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                img.style.borderRadius = '16px';
                img.style.background = 'transparent';
                img.style.padding = '0';
                img.style.margin = '0';
                img.style.border = 'none';
                img.style.outline = 'none';
                img.style.boxShadow = 'none';
                
                // 確保圖片容器也有正確的樣式
                const container = img.closest('.carousel-item');
                if (container) {
                    container.style.display = 'block';
                    container.style.visibility = 'visible';
                    container.style.opacity = '1';
                    container.style.width = '300px';
                    container.style.height = 'auto';
                    container.style.minHeight = '200px';
                    container.style.background = 'transparent';
                    container.style.border = '1px solid #f0f0f0';
                    container.style.borderRadius = '16px';
                    container.style.overflow = 'hidden';
                    container.style.padding = '0';
                    container.style.margin = '0';
                }
            });
        }
        
        // 菜單按鈕左右滑動功能 (桌面端使用)
        function scrollMenuButtons(direction, buttonElement) {
            // 從按鈕元素向上找到最近的菜單按鈕容器
            let menuContainer = null;
            if (buttonElement) {
                // 從按鈕向上查找包含 .menu-bottom-buttons 的父元素
                let parent = buttonElement.closest('.message');
                if (parent) {
                    menuContainer = parent.querySelector('.menu-bottom-buttons');
                }
            }
            
            // 如果沒找到，回退到第一個找到的容器
            if (!menuContainer) {
                menuContainer = document.querySelector('.menu-bottom-buttons');
            }
            
            if (menuContainer) {
                // 檢查是否正在滾動中
                if (menuContainer.dataset.scrolling === 'true') {
                    return; // 如果正在滾動，則忽略新的滾動請求
                }
                
                const scrollAmount = 200; // 每次滑動200px
                
                // 標記開始滾動
                menuContainer.dataset.scrolling = 'true';
                
                if (direction === 'left') {
                    menuContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                } else {
                    menuContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                }
                
                // 滾動完成後重置標記
                setTimeout(() => {
                    menuContainer.dataset.scrolling = 'false';
                }, 500); // 500ms後重置，確保滾動動畫完成
            }
        }
        
        // 獲取分類顯示名稱的輔助函數
        function getCategoryDisplayName(category) {
            const categoryNames = {
                'winter': '冬季限定',
                'jiancan': '福園簡餐', 
                'dandian': '福園單點/酒水',
                'hechai': '福聚合菜(桌菜)',
                'zhuoyan': '福園桌宴(桌菜)',
                'xunyu': '福園鱘魚鍋',
                'wine': '精選酒品'
            };
            return categoryNames[category] || category;
        }
        
        // 顯示菜單分類
        function showMenuCategory(restaurant, category) {
            // 更新分類按鈕狀態
            const categories = document.querySelectorAll('.menu-category');
            categories.forEach(cat => cat.classList.remove('active'));
            
            // 安全地處理 event.target，如果 event 不存在則尋找對應的分類按鈕
            if (typeof event !== 'undefined' && event.target) {
                event.target.classList.add('active');
            } else {
                // 當沒有 event 時，根據 category 找到對應的按鈕並設為 active
                const targetButton = Array.from(categories).find(cat => {
                    return cat.textContent.includes(getCategoryDisplayName(category));
                });
                if (targetButton) {
                    targetButton.classList.add('active');
                }
            }
            
            let carouselContent = '';
            let totalSlides = 0;
            let categoryName = '';
            
            const carouselId = `menuCarousel_${category}_${Date.now()}`;
            
            switch(category) {
                case 'winter':
                    totalSlides = 1;
                    categoryName = '冬季限定';
                    carouselContent = `
                        <div class="carousel-item fuyuan-menu winter">
                            <img src="https://hsingfu-golf.com.tw/wp-content/uploads/2024/01/%E7%B8%AE-scaled.jpg" alt="冬季限定菜單" class="carousel-image">
                        </div>
                    `;
                    break;
                case 'jiancan':
                    totalSlides = 3;
                    categoryName = '福園簡餐';
                    carouselContent = `
                        <div class="carousel-item fuyuan-menu jiancan">
                            <img src="https://hsingfu-golf.com.tw/wp-content/uploads/2023/07/4-scaled.jpg" alt="福園簡餐-第1頁" class="carousel-image">
                        </div>
                        <div class="carousel-item fuyuan-menu jiancan">
                            <img src="https://hsingfu-golf.com.tw/wp-content/uploads/2023/07/3-scaled.jpg" alt="福園簡餐-第2頁" class="carousel-image">
                        </div>
                        <div class="carousel-item fuyuan-menu jiancan">
                            <img src="https://hsingfu-golf.com.tw/wp-content/uploads/2023/07/2-scaled.jpg" alt="福園簡餐-第3頁" class="carousel-image">
                        </div>
                    `;
                    break;
                case 'dandian':
                    totalSlides = 3;
                    categoryName = '福園單點/酒水';
                    carouselContent = `
                        <div class="carousel-item fuyuan-menu dandian">
                            <img src="https://hsingfu-golf.com.tw/wp-content/uploads/2025/08/6-1.jpg" alt="福園單點酒水-第1頁" class="carousel-image">
                        </div>
                        <div class="carousel-item fuyuan-menu dandian">
                            <img src="https://hsingfu-golf.com.tw/wp-content/uploads/2025/08/7-1.jpg" alt="福園單點酒水-第2頁" class="carousel-image">
                        </div>
                        <div class="carousel-item fuyuan-menu dandian">
                            <img src="https://hsingfu-golf.com.tw/wp-content/uploads/2025/05/20240731-scaled.png" alt="福園單點酒水-第3頁" class="carousel-image">
                        </div>
                    `;
                    break;
                case 'hechai':
                    totalSlides = 3;
                    categoryName = '福聚合菜';
                    carouselContent = `
                        <div class="carousel-item fuyuan-menu hechai">
                            <img src="https://hsingfu-golf.com.tw/wp-content/uploads/2025/07/6-1-scaled.png" alt="福聚合菜-第1頁" class="carousel-image">
                        </div>
                        <div class="carousel-item fuyuan-menu hechai">
                            <img src="https://hsingfu-golf.com.tw/wp-content/uploads/2025/07/7-1-scaled.png" alt="福聚合菜-第2頁" class="carousel-image">
                        </div>
                        <div class="carousel-item fuyuan-menu hechai">
                            <img src="https://hsingfu-golf.com.tw/wp-content/uploads/2025/07/8-scaled.png" alt="福聚合菜-第3頁" class="carousel-image">
                        </div>
                    `;
                    break;
                case 'zhuoyan':
                    totalSlides = 1;
                    categoryName = '福園桌宴';
                    carouselContent = `
                        <div class="carousel-item fuyuan-menu zhuoyan">
                            <img src="https://hsingfu-golf.com.tw/wp-content/uploads/2024/08/4.jpg" alt="福園桌宴菜單" class="carousel-image">
                        </div>
                    `;
                    break;
                case 'xunyu':
                    totalSlides = 1;
                    categoryName = '福園鱘魚鍋';
                    carouselContent = `
                        <div class="carousel-item fuyuan-menu xunyu">
                            <img src="https://hsingfu-golf.com.tw/wp-content/uploads/2024/08/Fuuu.jpeg" alt="福園鱘魚鍋菜單" class="carousel-image">
                        </div>
                    `;
                    break;
                case 'wine':
                    totalSlides = 2;
                    categoryName = '精選酒品';
                    carouselContent = `
                        <div class="carousel-item fuyuan-menu wine">
                            <img src="https://hsingfu-golf.com.tw/wp-content/uploads/2024/02/%E6%A5%B5%E5%93%81%E9%AB%98%E7%B2%B1112.12.26-scaled.jpg" alt="精選酒品-第1頁" class="carousel-image">
                        </div>
                        <div class="carousel-item fuyuan-menu wine">
                            <img src="https://hsingfu-golf.com.tw/wp-content/uploads/2024/02/%E8%8A%B1%E6%9D%B1%E6%B7%B1%E6%B5%B7%E9%AB%98%E7%B2%B1-scaled.jpg" alt="精選酒品-第2頁" class="carousel-image">
                        </div>
                    `;
                    break;
            }
            
            // 每次點擊分類按鈕都發送新的菜單卡片
            
            const response = `
                <div class="carousel-wrapper menu-carousel-wrapper">
                    <div class="carousel-container" id="${carouselId}">
                        ${carouselContent}
                    </div>
                    
                    <div class="carousel-nav">
                        <div class="carousel-arrow left-arrow" onclick="moveCarousel(-1, '${carouselId}')" tabindex="0">
                            <i class="fas fa-chevron-left"></i>
                        </div>
                        <div class="carousel-dots" id="dots_${carouselId}">
                            <!-- 輪播點將由 JavaScript 動態生成 -->
                        </div>
                        <div class="carousel-arrow right-arrow" onclick="moveCarousel(1, '${carouselId}')" tabindex="0">
                            <i class="fas fa-chevron-right"></i>
                        </div>
                    </div>
                </div>
                
                <!-- 菜單操作按鈕和分類按鈕 -->
                <div style="margin-top: 16px;">
                    <div class="menu-categories menu-bottom-buttons" style="position: relative; display: flex; gap: 8px; overflow-x: auto; padding: 8px 0; flex-wrap: nowrap; white-space: nowrap; scroll-behavior: auto; -webkit-overflow-scrolling: touch; touch-action: pan-x;">
                        <button onclick="showReservation()" class="menu-btn primary" style="flex-shrink: 0; white-space: nowrap;">
                            <i class="fas fa-calendar-check"></i>
                            專人預約
                        </button>
                        <div class="menu-category" onclick="showMenuCategory('fuyuan', 'winter')" style="flex-shrink: 0; white-space: nowrap;">冬季限定</div>
                        <div class="menu-category" onclick="showMenuCategory('fuyuan', 'jiancan')" style="flex-shrink: 0; white-space: nowrap;">福園簡餐</div>
                        <div class="menu-category" onclick="showMenuCategory('fuyuan', 'dandian')" style="flex-shrink: 0; white-space: nowrap;">福園單點/酒水</div>
                        <div class="menu-category" onclick="showMenuCategory('fuyuan', 'hechai')" style="flex-shrink: 0; white-space: nowrap;">福聚合菜(桌菜)</div>
                        <div class="menu-category" onclick="showMenuCategory('fuyuan', 'zhuoyan')" style="flex-shrink: 0; white-space: nowrap;">福園桌宴(桌菜)</div>
                        <div class="menu-category" onclick="showMenuCategory('fuyuan', 'xunyu')" style="flex-shrink: 0; white-space: nowrap;">福園鱘魚鍋</div>
                        <div class="menu-category" onclick="showMenuCategory('fuyuan', 'wine')" style="flex-shrink: 0; white-space: nowrap;">精選酒品</div>
                    </div>
                    
                    <!-- 左右箭頭按鈕 (僅在非觸控設備顯示) -->
                    <div class="desktop-controls" style="display: flex; justify-content: space-between; margin-top: 8px;">
                        <button class="menu-scroll-btn" onclick="scrollMenuButtons('left', this)" style="background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 20px; padding: 8px; cursor: pointer; color: #666; font-size: 12px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <div style="text-align: center; font-size: 12px; color: #666; opacity: 0.8; flex: 1; margin: 0 16px;">
                            <i class="fas fa-arrows-alt-h"></i> 左右滑動查看更多選項
                        </div>
                        <button class="menu-scroll-btn" onclick="scrollMenuButtons('right', this)" style="background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 20px; padding: 8px; cursor: pointer; color: #666; font-size: 12px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            `;
            
            addMessage(response, 'bot');
            
            // 初始化輪播
            setTimeout(() => {
                const carousel = document.getElementById(carouselId);
                if (carousel) {
                    // 初始化輪播狀態
                    carousel.dataset.currentSlide = '0';
                    initCarouselWithRetry(carouselId);
                    
                    // 添加滑鼠滾輪事件監聽
                    carousel.addEventListener('wheel', handleWheel, { passive: false });
                }
                
                // 為當前菜單卡片的菜單按鈕容器添加滑鼠滾輪事件 (僅非觸控設備)
                const currentMessage = document.querySelector('.message:last-child');
                if (currentMessage) {
                    const menuButtons = currentMessage.querySelector('.menu-bottom-buttons');
                    if (menuButtons && !isTouchDevice()) {
                        menuButtons.addEventListener('wheel', handleMenuWheel, { passive: false });
                    }
                }
            }, 200);
        }
        
        // 顯示福園餐廳簡介
        function showFuyuanIntro() {
            addMessage(`
                <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 16px;">
                    <h3 style="color: #2c3e50; margin-bottom: 12px;">福園餐廳</h3>
                    <div class="restaurant-intro-flex">
                        <div style="flex: 1;">
                            <p style="color: #666; line-height: 1.6; margin-bottom: 12px;">
福園餐廳提供中式佳餚，秉持在創新中不失傳統，充分發揮中餐的魅力！且進行大膽嘗試推陳出新，讓顧客品嘗美食當下能感受到福園的用心。
                            </p>
                            <p style="color: #666; line-height: 1.6; margin-bottom: 12px;">
                                <strong>特色服務：</strong><br>
                                • 精選新鮮食材，每日現做<br>
                                • 提供合菜、桌宴、單點等多種用餐選擇<br>
                                • 專業服務團隊，提供貼心服務<br>
                                • 適合家庭聚餐、商務宴請、團體活動
                            </p>
                            <p style="color: #666; line-height: 1.6; margin-bottom: 0;">
                                <strong>營業時間：</strong> 週一至週日 11:00-19:00<br>
                                <strong>預約專線：</strong> (02) 2606-2345
                            </p>
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <img class="restaurant-intro-image" src="https://hsingfu-golf.com.tw/wp-content/uploads/2025/09/%E8%B3%87%E7%94%A2-15-scaled.webp" alt="福園餐廳環境" style="width: 100%; height: 250px; object-fit: contain; border-radius: 12px;">
                        </div>
                    </div>
                </div>
            `, 'bot');
        }
        
        // 顯示幸福咖啡吧簡介
        function showCoffeeIntro() {
            addMessage(`
                <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 16px;">
                    <h3 style="color: #2c3e50; margin-bottom: 12px;">幸福咖啡吧</h3>
                    <div class="restaurant-intro-flex">
                        <div style="flex: 1;">
                            <p style="color: #666; line-height: 1.6; margin-bottom: 12px;">
無論擊球前補給或擊球後享用，我們為您準備了各式酒水與咖啡外，精選台灣經典小吃：鴨肉飯、刈包、牛肉麵，讓您兼顧輕食與飽足。
                            </p>
                            <p style="color: #666; line-height: 1.6; margin-bottom: 12px;">
                                <strong>特色服務：</strong><br>
                                • 新鮮製作的輕食、熱食、冷熱飲<br>
                                • 舒適的用餐環境，適合休息放鬆
                            </p>
                            <p style="color: #666; line-height: 1.6; margin-bottom: 0;">
                                <strong>營業時間：</strong> 週一至週日 07:00-15:30<br>
                                <strong>服務專線：</strong> (02) 2606-2345
                            </p>
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <img class="restaurant-intro-image" src="https://hsingfu-golf.com.tw/wp-content/uploads/2024/08/lobby.jpg" alt="幸福咖啡吧環境" style="width: 100%; height: 250px; object-fit: contain; border-radius: 12px;">
                        </div>
                    </div>
                </div>
            `, 'bot');
        }
        
        // 初始化聊天室
        window.onload = function() {
            console.log('頁面載入完成，開始初始化聊天室');
            init();
            console.log('聊天室初始化完成');
            
            // 添加鍵盤事件監聽
            document.addEventListener('keydown', handleKeyDown);
            
            // 添加視窗大小改變事件監聽
            window.addEventListener('resize', handleResize);
            
            // WordPress環境檢測和圖片修復
            diagnoseWordPressIssues();
            fixImageUrlsForWordPress();
            addImageLoadListeners();
            
            // 延遲執行強制修復，確保所有圖片都已載入
            setTimeout(() => {
                forceFixImageDisplay();
            }, 2000);
            
            // 監聽DOM變化，為動態添加的圖片添加監聽器
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach(function(node) {
                            if (node.nodeType === 1) { // Element node
                                const images = node.querySelectorAll ? node.querySelectorAll('.carousel-image, .restaurant-intro-image') : [];
                                images.forEach(img => {
                                    if (!img.dataset.originalSrc) {
                                        img.dataset.originalSrc = img.src;
                                        img.addEventListener('error', () => handleImageError(img));
                                        img.addEventListener('load', () => handleImageLoad(img));
                                    }
                                });
                            }
                        });
                    }
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        };
        
        // 處理鍵盤事件
        function handleKeyDown(event) {
            // 左右箭頭鍵控制輪播
            if (event.key === 'ArrowLeft') {
                const activeCarousel = document.querySelector('.carousel-container');
                if (activeCarousel) {
                    const carouselId = activeCarousel.id;
                    moveCarousel(-1, carouselId);
                    event.preventDefault();
                }
            } else if (event.key === 'ArrowRight') {
                const activeCarousel = document.querySelector('.carousel-container');
                if (activeCarousel) {
                    const carouselId = activeCarousel.id;
                    moveCarousel(1, carouselId);
                    event.preventDefault();
                }
            }
        }
        
        // 處理視窗大小改變
        function handleResize() {
            // 重新計算所有輪播的點數
            const carousels = document.querySelectorAll('.carousel-container');
            carousels.forEach(carousel => {
                const carouselId = carousel.id;
                if (carouselId) {
                    // 重置輪播狀態
                    currentSlide = 0;
                    // 重新創建輪播點和導航
                    createSmartDots(carouselId);
                    updateCarousel(carouselId);
                }
            });
        }
        
        // 處理滑鼠滾輪事件
        function handleWheel(event) {
            if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
                // 水平滾動
                const carousel = event.currentTarget;
                const carouselId = carousel.id;
                
                if (event.deltaX > 0) {
                    moveCarousel(1, carouselId);
                } else {
                    moveCarousel(-1, carouselId);
                }
                event.preventDefault();
            }
        }
        
        // 處理菜單按鈕的滑鼠滾輪事件 (僅桌面端使用)
        function handleMenuWheel(event) {
            // 檢查是否為觸控設備
            if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
                return; // 觸控設備不處理滾輪事件，讓原生觸控滾動工作
            }
            
            event.preventDefault();
            const menuContainer = event.currentTarget;
            
            // 檢查是否正在滾動中
            if (menuContainer.dataset.scrolling === 'true') {
                return; // 如果正在滾動，則忽略滾輪事件
            }
            
            const scrollAmount = 100; // 滾輪滾動量
            
            // 標記開始滾動
            menuContainer.dataset.scrolling = 'true';
            
            if (event.deltaY > 0) {
                // 向下滾動 = 向右滑動
                menuContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            } else {
                // 向上滾動 = 向左滑動
                menuContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            }
            
            // 滾動完成後重置標記
            setTimeout(() => {
                menuContainer.dataset.scrolling = 'false';
            }, 300); // 滾輪滾動較快，300ms後重置
        }
        
        // 全局優惠文章分類配置
        const GLOBAL_PROMOTION_CATEGORIES = {
            'guest': [11910, 13758, 13042],        // 來賓/球友優惠文章 ID
            'team': [14630],         // 球隊優惠文章 ID  
            'experience': [14020],   // 體驗營優惠文章 ID
            'dining': []        // 餐飲優惠文章 ID
        };

        // 優惠活動功能
        async function showPromotions(category = 'guest') {
            // 顯示載入狀態
            addMessage(`
                <div class="promotions-loading">
                    <div class="loading-spinner"></div>
                    <p>正在載入最新優惠活動...</p>
                </div>
            `, 'bot');
            
            try {
                // 從 WordPress REST API 獲取優惠文章
                const promotions = await fetchPromotions(category);
                
                // 檢查是否成功獲取到優惠文章
                if (promotions && Array.isArray(promotions) && promotions.length > 0) {
                    // 移除載入狀態
                    const loadingMessage = chatMessages.querySelector('.message:last-child');
                    if (loadingMessage) {
                        loadingMessage.remove();
                    }
                    
                    // 顯示優惠輪播
                    showPromotionsCarousel(promotions, category);
                } else {
                    // 移除載入狀態
                    const loadingMessage = chatMessages.querySelector('.message:last-child');
                    if (loadingMessage) {
                        loadingMessage.remove();
                    }
                    
                    // 檢查是否所有分類都沒有文章
                    const allCategories = ['guest', 'team', 'experience', 'dining'];
                    const hasAnyPromotions = allCategories.some(cat => {
                        return GLOBAL_PROMOTION_CATEGORIES[cat] && GLOBAL_PROMOTION_CATEGORIES[cat].length > 0;
                    });
                    
                    if (hasAnyPromotions) {
                        // 有部分分類有文章，顯示該分類暫無優惠
                        addMessage(`
                            <div class="promotion-empty-card">
                                <div class="promotion-empty-header">
                                    <i class="fas fa-gift"></i>
                                    <h3>優惠活動</h3>
                                </div>
                                <div class="promotion-empty-content">
                                    <p>該分類暫無優惠活動，請查看其他分類或關注最新消息。</p>
                                    <a href="https://line.me/R/ti/p/@HF520" target="_blank" class="promotion-empty-btn">
                                        <i class="fas fa-plus"></i>
                                        加入幸福LINE@
                                    </a>
                                </div>
                            </div>
                        `, 'bot');
                    } else {
                        // 所有分類都沒有文章，顯示即將推出訊息
                        addMessage(`
                            <div class="promotion-empty-card">
                                <div class="promotion-empty-header">
                                    <i class="fas fa-gift"></i>
                                    <h3>優惠活動即將推出</h3>
                                </div>
                                <div class="promotion-empty-content">
                                    <p>敬請加入幸福LINE@關注最新消息</p>
                                    <a href="https://line.me/R/ti/p/@HF520" target="_blank" class="promotion-empty-btn">
                                        <i class="fas fa-plus"></i>
                                        加入幸福LINE@
                                    </a>
                                </div>
                            </div>
                        `, 'bot');
                    }
                }
            } catch (error) {
                console.error('載入優惠活動時發生錯誤:', error);
                
                // 移除載入狀態
                const loadingMessage = chatMessages.querySelector('.message:last-child');
                if (loadingMessage) {
                    loadingMessage.remove();
                }
                
                // 顯示錯誤訊息
                addMessage(`
                    <div class="promotions-error">
                        <div class="error-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <h3>載入優惠活動失敗</h3>
                        <p>請稍後再試，或直接聯繫我們獲取最新優惠資訊。</p>
                        <div class="promotion-actions">
                            <button onclick="showReservation()" class="promotion-btn primary">
                                <i class="fas fa-phone"></i>聯繫我們
                            </button>
                        </div>
                    </div>
                `, 'bot');
            }
        }
        
        // 從 WordPress REST API 獲取優惠文章
        async function fetchPromotions(category = 'guest') {
            try {
                // 使用全局分類配置
                const promotionCategories = GLOBAL_PROMOTION_CATEGORIES;
                
                const promotionIds = promotionCategories[category] || [];
                
                // 檢查是否有文章 ID
                if (!promotionIds || promotionIds.length === 0) {
                    return { hasPromotions: false, category: category };
                }
                
                // 構建 API 請求 URL
                const baseUrl = window.location.origin; // 自動獲取當前 WordPress 網站的域名
                const apiUrl = `${baseUrl}/wp-json/wp/v2/posts?include=${promotionIds.join(',')}&_embed=true`;
                
                console.log(`正在請求${category}類別的優惠文章:`, apiUrl);
                
                const response = await fetch(apiUrl);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const posts = await response.json();
                console.log('獲取到的文章:', posts);
                
                // 處理文章數據
                const promotions = posts.map(post => {
                    // 清理 HTML 標籤和特殊字符
                    const cleanTitle = post.title.rendered.replace(/<[^>]*>/g, '').trim();
                    const cleanExcerpt = post.excerpt.rendered.replace(/<[^>]*>/g, '').trim();
                    const cleanContent = post.content.rendered.replace(/<[^>]*>/g, '').trim();
                    
                    return {
                        id: post.id,
                        title: cleanTitle,
                        excerpt: cleanExcerpt,
                        content: cleanContent,
                        link: post.link || '',
                        date: new Date(post.date).toLocaleDateString('zh-TW'),
                        featuredImage: post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0] 
                            ? post._embedded['wp:featuredmedia'][0].source_url 
                            : null
                    };
                });
                
                return promotions;
            } catch (error) {
                console.error('獲取優惠文章失敗:', error);
                throw error;
            }
        }
        
        // 顯示優惠輪播
        function showPromotionsCarousel(promotions, category = 'guest') {
            const carouselId = 'promotions-' + Date.now();
            
            // 驗證輸入數據
            if (!promotions || !Array.isArray(promotions) || promotions.length === 0) {
                console.error('無效的優惠數據:', promotions);
                addMessage('優惠活動載入失敗，請稍後再試。', 'bot');
                return;
            }
            
            // 清理和驗證數據
            const cleanPromotions = promotions.map(promo => ({
                id: promo.id,
                title: promo.title ? promo.title.replace(/"/g, '&quot;').replace(/'/g, '&#39;') : '',
                excerpt: promo.excerpt ? promo.excerpt.replace(/"/g, '&quot;').replace(/'/g, '&#39;') : '',
                content: promo.content ? promo.content.replace(/"/g, '&quot;').replace(/'/g, '&#39;') : '',
                link: promo.link || '',
                date: promo.date || '',
                featuredImage: promo.featuredImage || null
            }));
            
            try {
                const jsonData = JSON.stringify(cleanPromotions);
                const encodedData = encodeURIComponent(jsonData);
                console.log('優惠數據:', cleanPromotions);
                console.log('JSON 字符串:', jsonData);
                console.log('編碼後數據:', encodedData);
                
                addMessage(`
                    <promotion-carousel data-carousel-id="${carouselId}" data-promotions='${encodedData}' data-category='${category}'>
                    </promotion-carousel>
                `, 'bot');
            } catch (error) {
                console.error('JSON 序列化錯誤:', error);
                addMessage('優惠活動載入失敗，請稍後再試。', 'bot');
            }
        }
        
        // 舊版本函數（已棄用）
        function showPromotionsCarouselOld(promotions) {
            const carouselId = 'promotions-' + Date.now();
            
            addMessage(`
                <div class="promotions-carousel" id="${carouselId}">
                    <div class="promotions-header">
                        <h3 class="promotions-title">
                            <i class="fas fa-tags"></i>
                            最新優惠活動
                        </h3>
                        <p class="promotions-subtitle">限時優惠，錯過可惜！</p>
                    </div>
                    
                    <div class="promotions-container">
                        <div class="promotions-wrapper" style="transform: translateX(0px);">
                            ${promotions.map((promotion, index) => `
                                <div class="promotion-card ${index === 0 ? 'active' : ''}" data-index="${index}">
                                    <div class="promotion-image">
                                        ${promotion.featuredImage ? 
                                            `<img src="${promotion.featuredImage}" alt="${promotion.title}" onerror="handleImageError(this, '${promotion.title}')" onload="handleImageLoad(this)">` :
                                            `<div class="no-image">
                                                <i class="fas fa-image"></i>
                                                <p>無圖片</p>
                                            </div>`
                                        }
                                    </div>
                                    <div class="promotion-content">
                                        <h4 class="promotion-title">${promotion.title}</h4>
                                        <p class="promotion-excerpt">${promotion.excerpt}</p>
                                        <div class="promotion-meta">
                                            <span class="promotion-date">
                                                <i class="fas fa-calendar"></i>
                                                ${promotion.date}
                                            </span>
                                        </div>
                                        <div class="promotion-actions">
                                            <a href="${promotion.link}" target="_blank" class="promotion-btn primary">
                                                <i class="fas fa-external-link-alt"></i>
                                                查看詳情
                                            </a>
                                            <button onclick="showReservation()" class="promotion-btn secondary">
                                                <i class="fas fa-calendar-check"></i>
                                                立即預約
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        ${promotions.length > 1 ? `
                            <div class="promotions-navigation">
                                <button class="promotion-nav-btn prev" onclick="movePromotionCarousel('${carouselId}', 'prev')">
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                                <button class="promotion-nav-btn next" onclick="movePromotionCarousel('${carouselId}', 'next')">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                            
                            <div class="promotions-dots">
                                ${promotions.map((_, index) => `
                                    <button class="promotion-dot ${index === 0 ? 'active' : ''}" 
                                            onclick="goToPromotionSlide('${carouselId}', ${index})">
                                    </button>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `, 'bot');
            
            // 延遲初始化輪播，確保 DOM 完全載入
            setTimeout(() => {
                initPromotionCarousel(carouselId, promotions.length);
                // 額外延遲確保樣式完全應用
                setTimeout(() => {
                    forceApplyPromotionStyles(carouselId);
                }, 200);
            }, 100);
        }
        
        // 初始化優惠輪播 - 參考費用輪播的邏輯
        function initPromotionCarousel(carouselId, totalSlides) {
            const carousel = document.getElementById(carouselId);
            if (!carousel) return;
            
            const wrapper = carousel.querySelector('.promotions-wrapper');
            const cards = carousel.querySelectorAll('.promotion-card');
            const dots = carousel.querySelectorAll('.promotion-dot');
            
            if (!wrapper || cards.length === 0) return;
            
            // 設置初始狀態
            wrapper.dataset.currentSlide = '0';
            wrapper.dataset.totalSlides = totalSlides.toString();
            
            // 根據螢幕大小計算卡片寬度
            let cardWidth = 300; // 桌面版預設寬度
            if (window.innerWidth <= 480) {
                cardWidth = 220; // 手機版寬度
            } else if (window.innerWidth <= 768) {
                cardWidth = 260; // 平板版寬度
            }
            
            const gap = 16; // 卡片間距 16px
            const totalWidth = (cardWidth + gap) * totalSlides - gap; // 總寬度
            
            // 設置容器寬度
            wrapper.style.width = `${totalWidth}px`;
            
            // 設置每張卡片的位置 - 使用絕對定位，強制樣式
            cards.forEach((card, index) => {
                // 強制重置所有樣式
                card.style.cssText = '';
                
                // 設置基本樣式
                card.style.setProperty('position', 'absolute', 'important');
                card.style.setProperty('left', `${index * (cardWidth + gap)}px`, 'important');
                card.style.setProperty('width', `${cardWidth}px`, 'important');
                card.style.setProperty('height', '380px', 'important');
                card.style.setProperty('display', 'flex', 'important');
                card.style.setProperty('flex-direction', 'column', 'important');
                card.style.setProperty('background', 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 'important');
                card.style.setProperty('border-radius', '20px', 'important');
                card.style.setProperty('box-shadow', '0 10px 30px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05)', 'important');
                card.style.setProperty('overflow', 'hidden', 'important');
                card.style.setProperty('margin', '0', 'important');
                card.style.setProperty('transition', 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 'important');
                card.style.setProperty('border', '1px solid rgba(255, 255, 255, 0.8)', 'important');
                card.style.setProperty('backdrop-filter', 'blur(10px)', 'important');
                card.style.setProperty('box-sizing', 'border-box', 'important');
                card.style.setProperty('z-index', '1', 'important');
            });
            
            // 設置容器為相對定位
            wrapper.style.position = 'relative';
            wrapper.style.height = '380px';
            wrapper.style.overflow = 'hidden';
            
            console.log('優惠輪播初始化完成:', {
                carouselId,
                totalSlides,
                cardWidth,
                totalWidth,
                cardsCount: cards.length
            });
            
            // 延遲強制應用樣式，確保 WordPress 樣式被覆蓋
            setTimeout(() => {
                forceApplyPromotionStyles(carouselId);
            }, 100);
        }
        
        // 強制應用優惠卡片樣式
        function forceApplyPromotionStyles(carouselId) {
            const carousel = document.getElementById(carouselId);
            if (!carousel) return;
            
            const cards = carousel.querySelectorAll('.promotion-card');
            const images = carousel.querySelectorAll('.promotion-image');
            const contents = carousel.querySelectorAll('.promotion-content');
            const titles = carousel.querySelectorAll('.promotion-title');
            const excerpts = carousel.querySelectorAll('.promotion-excerpt');
            const metas = carousel.querySelectorAll('.promotion-meta');
            const dates = carousel.querySelectorAll('.promotion-date');
            const actions = carousel.querySelectorAll('.promotion-actions');
            const buttons = carousel.querySelectorAll('.promotion-btn');
            
            // 強制應用圖片樣式
            images.forEach(img => {
                img.style.setProperty('width', '100%', 'important');
                img.style.setProperty('height', '180px', 'important');
                img.style.setProperty('overflow', 'hidden', 'important');
                img.style.setProperty('position', 'relative', 'important');
                img.style.setProperty('flex-shrink', '0', 'important');
                img.style.setProperty('border-radius', '20px 20px 0 0', 'important');
                img.style.setProperty('background', 'linear-gradient(45deg, #f1f5f9, #e2e8f0)', 'important');
            });
            
            // 強制應用內容樣式
            contents.forEach(content => {
                content.style.setProperty('padding', '24px', 'important');
                content.style.setProperty('flex', '1', 'important');
                content.style.setProperty('display', 'flex', 'important');
                content.style.setProperty('flex-direction', 'column', 'important');
                content.style.setProperty('justify-content', 'space-between', 'important');
                content.style.setProperty('box-sizing', 'border-box', 'important');
                content.style.setProperty('background', 'transparent', 'important');
                content.style.setProperty('position', 'relative', 'important');
            });
            
            // 強制應用標題樣式
            titles.forEach(title => {
                title.style.setProperty('color', '#0f172a', 'important');
                title.style.setProperty('font-size', '18px', 'important');
                title.style.setProperty('font-weight', '800', 'important');
                title.style.setProperty('margin-bottom', '12px', 'important');
                title.style.setProperty('line-height', '1.3', 'important');
                title.style.setProperty('font-family', "'Noto Sans TC', sans-serif", 'important');
                title.style.setProperty('letter-spacing', '-0.02em', 'important');
            });
            
            // 強制應用摘要樣式
            excerpts.forEach(excerpt => {
                excerpt.style.setProperty('color', '#475569', 'important');
                excerpt.style.setProperty('font-size', '14px', 'important');
                excerpt.style.setProperty('line-height', '1.7', 'important');
                excerpt.style.setProperty('margin-bottom', '20px', 'important');
                excerpt.style.setProperty('flex', '1', 'important');
                excerpt.style.setProperty('font-family', "'Noto Sans TC', sans-serif", 'important');
                excerpt.style.setProperty('font-weight', '400', 'important');
            });
            
            // 強制應用按鈕樣式
            buttons.forEach(btn => {
                btn.style.setProperty('padding', '12px 20px', 'important');
                btn.style.setProperty('border', 'none', 'important');
                btn.style.setProperty('border-radius', '25px', 'important');
                btn.style.setProperty('font-size', '13px', 'important');
                btn.style.setProperty('font-weight', '700', 'important');
                btn.style.setProperty('display', 'inline-flex', 'important');
                btn.style.setProperty('align-items', 'center', 'important');
                btn.style.setProperty('gap', '8px', 'important');
                btn.style.setProperty('cursor', 'pointer', 'important');
                btn.style.setProperty('transition', 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 'important');
                btn.style.setProperty('flex', '1', 'important');
                btn.style.setProperty('justify-content', 'center', 'important');
                btn.style.setProperty('box-sizing', 'border-box', 'important');
                btn.style.setProperty('font-family', "'Noto Sans TC', sans-serif", 'important');
                btn.style.setProperty('min-height', '44px', 'important');
                btn.style.setProperty('position', 'relative', 'important');
                btn.style.setProperty('overflow', 'hidden', 'important');
            });
            
            console.log('強制樣式應用完成:', {
                cardsCount: cards.length,
                imagesCount: images.length,
                contentsCount: contents.length,
                titlesCount: titles.length,
                buttonsCount: buttons.length
            });
        }
        
        // 移動優惠輪播
        function movePromotionCarousel(carouselId, direction) {
            const carousel = document.getElementById(carouselId);
            if (!carousel) return;
            
            const wrapper = carousel.querySelector('.promotions-wrapper');
            if (!wrapper) return;
            
            const currentSlide = parseInt(wrapper.dataset.currentSlide || '0');
            const totalSlides = parseInt(wrapper.dataset.totalSlides || '1');
            
            let newSlide = currentSlide;
            if (direction === 'next') {
                newSlide = currentSlide < totalSlides - 1 ? currentSlide + 1 : 0;
            } else {
                newSlide = currentSlide > 0 ? currentSlide - 1 : totalSlides - 1;
            }
            
            goToPromotionSlide(carouselId, newSlide);
        }
        
        // 跳轉到指定優惠輪播頁面
        function goToPromotionSlide(carouselId, slideIndex) {
            const carousel = document.getElementById(carouselId);
            if (!carousel) return;
            
            const wrapper = carousel.querySelector('.promotions-wrapper');
            const cards = carousel.querySelectorAll('.promotion-card');
            const dots = carousel.querySelectorAll('.promotion-dot');
            
            if (!wrapper || cards.length === 0) return;
            
            const totalSlides = parseInt(wrapper.dataset.totalSlides || '1');
            const targetSlide = Math.max(0, Math.min(slideIndex, totalSlides - 1));
            
            // 根據螢幕大小計算卡片寬度
            let cardWidth = 300; // 桌面版預設寬度
            if (window.innerWidth <= 480) {
                cardWidth = 220; // 手機版寬度
            } else if (window.innerWidth <= 768) {
                cardWidth = 260; // 平板版寬度
            }
            
            const gap = 16; // 卡片間距 16px
            const moveDistance = targetSlide * (cardWidth + gap);
            
            // 更新位置 - 使用 translateX
            wrapper.style.transform = `translateX(-${moveDistance}px)`;
            wrapper.dataset.currentSlide = targetSlide.toString();
            
            // 更新卡片狀態
            cards.forEach((card, index) => {
                card.classList.toggle('active', index === targetSlide);
            });
            
            // 更新點點狀態
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === targetSlide);
            });
        }
