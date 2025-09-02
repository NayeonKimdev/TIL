// 전역 변수
let posts = JSON.parse(localStorage.getItem('dev_posts')) || [];
let currentFilter = 'all';
let uploadedMedia = [];

// DOM이 로드되면 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dev Knowledge Base 시작');
    initializeApp();
    setupEventListeners();
    renderPosts();
});

// 앱 초기화
function initializeApp() {
    console.log('앱 초기화');
    
    // 샘플 데이터가 없으면 추가
    if (posts.length === 0) {
        addSampleData();
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 카테고리 필터 버튼
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', handleFilterClick);
    });
    
    // 글쓰기 폼 제출
    const writeForm = document.getElementById('writeForm');
    if (writeForm) {
        writeForm.addEventListener('submit', handleWriteSubmit);
    }
    
    // 미디어 업로드
    const mediaInput = document.getElementById('media');
    if (mediaInput) {
        mediaInput.addEventListener('change', handleMediaUpload);
    }
    
    // 모달 배경 클릭으로 닫기
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

// 샘플 데이터 추가
function addSampleData() {
    const samplePosts = [
        {
            id: 1,
            title: 'JavaScript의 클로저(Closure) 개념',
            content: '클로저는 함수가 선언될 때의 렉시컬 환경을 기억하여, 함수가 스코프 밖에서 실행될 때도 그 스코프에 접근할 수 있게 해주는 개념입니다. 이를 통해 데이터 은닉과 상태 관리가 가능합니다.',
            category: 'javascript',
            date: '2024-01-15',
            hashtags: ['javascript', 'closure', 'scope', 'lexical'],
            media: []
        },
        {
            id: 2,
            title: 'CSS Grid vs Flexbox 언제 사용할까?',
            content: 'Flexbox는 1차원 레이아웃(행 또는 열)에 적합하고, Grid는 2차원 레이아웃(행과 열 동시)에 적합합니다. 복잡한 레이아웃은 Grid를, 간단한 정렬은 Flexbox를 사용하는 것이 좋습니다.',
            category: 'css',
            date: '2024-01-14',
            hashtags: ['css', 'grid', 'flexbox', 'layout'],
            media: []
        },
        {
            id: 3,
            title: 'React Hooks의 기본 규칙',
            content: '1. 최상위에서만 Hook을 호출하세요. 2. React 함수 컴포넌트에서만 Hook을 호출하세요. 3. 조건문이나 반복문 안에서 Hook을 호출하지 마세요. 이 규칙들을 지켜야 Hook이 올바르게 작동합니다.',
            category: 'react',
            date: '2024-01-13',
            hashtags: ['react', 'hooks', 'rules', 'components'],
            media: []
        }
    ];
    
    posts = samplePosts;
    savePosts();
    console.log('샘플 데이터 추가 완료');
}

// 필터 클릭 처리
function handleFilterClick(e) {
    const filter = e.target.dataset.filter;
    
    // 활성 버튼 변경
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // 필터 적용
    currentFilter = filter;
    renderPosts();
}

// 글쓰기 모달 열기
function openWriteModal() {
    const modal = document.getElementById('writeModal');
    if (modal) {
        modal.style.display = 'block';
        // 폼 초기화
        const form = document.getElementById('writeForm');
        if (form) {
            form.reset();
        }
        // 미디어 초기화
        uploadedMedia = [];
        renderMediaPreview();
    }
}

// 글쓰기 모달 닫기
function closeWriteModal() {
    const modal = document.getElementById('writeModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 검색 모달 열기
function openSearchModal() {
    const modal = document.getElementById('searchModal');
    if (modal) {
        modal.style.display = 'block';
        // 검색 입력 필드 포커스
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
        }
    }
}

// 검색 모달 닫기
function closeSearchModal() {
    const modal = document.getElementById('searchModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 모든 모달 닫기
function closeAllModals() {
    closeWriteModal();
    closeSearchModal();
}

// 미디어 업로드 처리
function handleMediaUpload(e) {
    const files = e.target.files;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const mediaData = {
                id: Date.now() + i,
                src: e.target.result,
                type: file.type.startsWith('image/') ? 'image' : 'video',
                name: file.name
            };
            
            uploadedMedia.push(mediaData);
            renderMediaPreview();
        };
        
        reader.readAsDataURL(file);
    }
}

// 미디어 미리보기 렌더링
function renderMediaPreview() {
    const preview = document.getElementById('mediaPreview');
    if (!preview) return;
    
    preview.innerHTML = '';
    
    uploadedMedia.forEach(media => {
        const mediaItem = document.createElement('div');
        mediaItem.className = 'media-item';
        
        if (media.type === 'image') {
            mediaItem.innerHTML = `
                <img src="${media.src}" alt="${media.name}">
                <button class="remove-btn" onclick="removeMedia(${media.id})">
                    <i class="fas fa-times"></i>
                </button>
            `;
        } else {
            mediaItem.innerHTML = `
                <video src="${media.src}" controls></video>
                <button class="remove-btn" onclick="removeMedia(${media.id})">
                    <i class="fas fa-times"></i>
                </button>
            `;
        }
        
        preview.appendChild(mediaItem);
    });
}

// 미디어 제거
function removeMedia(mediaId) {
    uploadedMedia = uploadedMedia.filter(media => media.id !== mediaId);
    renderMediaPreview();
}

// 글쓰기 폼 제출 처리
function handleWriteSubmit(e) {
    e.preventDefault();
    console.log('글쓰기 폼 제출 처리 시작');
    
    try {
        const formData = new FormData(e.target);
        const title = formData.get('title').trim();
        const content = formData.get('content').trim();
        const category = formData.get('category');
        const hashtagsInput = formData.get('hashtags').trim();
        
        // 필수 필드 검증
        if (!title || !content || !category) {
            showNotification('제목, 내용, 카테고리를 모두 입력해주세요.', 'error');
            return;
        }
        
        // 해시태그 처리
        const hashtags = hashtagsInput 
            ? hashtagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
            : [];
        
        // 새 포스트 생성
        const newPost = {
            id: Date.now(),
            title: title,
            content: content,
            category: category,
            date: new Date().toISOString().split('T')[0],
            hashtags: hashtags,
            media: [...uploadedMedia]
        };
        
        console.log('새 포스트:', newPost);
        
        // 포스트 배열에 추가 (최신순)
        posts.unshift(newPost);
        
        // 로컬 스토리지에 저장
        savePosts();
        
        // 화면 업데이트
        renderPosts();
        
        // 모달 닫기
        closeWriteModal();
        
        // 성공 알림
        showNotification('글이 성공적으로 발행되었습니다!', 'success');
        
    } catch (error) {
        console.error('글쓰기 처리 중 오류:', error);
        showNotification('글 발행 중 오류가 발생했습니다.', 'error');
    }
}

// 검색 수행
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchCategory = document.getElementById('searchCategory');
    const searchResults = document.getElementById('searchResults');
    
    if (!searchInput || !searchResults) return;
    
    const query = searchInput.value.trim().toLowerCase();
    const category = searchCategory.value;
    
    if (!query && !category) {
        showNotification('검색어나 카테고리를 입력해주세요.', 'info');
        return;
    }
    
    // 검색 필터링
    let filteredPosts = posts;
    
    if (category) {
        filteredPosts = filteredPosts.filter(post => post.category === category);
    }
    
    if (query) {
        filteredPosts = filteredPosts.filter(post => 
            post.title.toLowerCase().includes(query) ||
            post.content.toLowerCase().includes(query) ||
            post.hashtags.some(tag => tag.toLowerCase().includes(query))
        );
    }
    
    // 검색 결과 렌더링
    if (filteredPosts.length === 0) {
        searchResults.innerHTML = `
            <div class="empty-state">
                <h3>검색 결과가 없습니다</h3>
                <p>다른 검색어나 카테고리를 시도해보세요.</p>
            </div>
        `;
    } else {
        const resultsHTML = filteredPosts.map(post => `
            <div class="search-result-item" onclick="viewPost(${post.id})">
                <div class="search-result-title">${post.title}</div>
                <div class="search-result-category">${getCategoryName(post.category)}</div>
                <div class="search-result-content">${post.content.substring(0, 100)}...</div>
            </div>
        `).join('');
        
        searchResults.innerHTML = resultsHTML;
    }
}

// 포스트 보기
function viewPost(postId) {
    // 검색 모달 닫기
    closeSearchModal();
    
    // 해당 포스트로 스크롤
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    if (postElement) {
        postElement.scrollIntoView({ behavior: 'smooth' });
    }
}

// 포스트 렌더링
function renderPosts() {
    console.log('포스트 렌더링 시작');
    
    const container = document.getElementById('postsContainer');
    if (!container) {
        console.error('postsContainer를 찾을 수 없습니다');
        return;
    }
    
    // 필터링된 포스트 가져오기
    let filteredPosts = posts;
    if (currentFilter !== 'all') {
        filteredPosts = posts.filter(post => post.category === currentFilter);
    }
    
    if (filteredPosts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>${currentFilter === 'all' ? '아직 작성된 글이 없습니다' : '해당 카테고리의 글이 없습니다'}</h3>
                <p>첫 번째 개발 상식을 작성해보세요!</p>
            </div>
        `;
        return;
    }
    
    const postsHTML = filteredPosts.map(post => createPostHTML(post)).join('');
    container.innerHTML = postsHTML;
    
    console.log('포스트 렌더링 완료');
}

// 포스트 HTML 생성
function createPostHTML(post) {
    const hashtagsHTML = post.hashtags && post.hashtags.length > 0 
        ? `
            <div class="post-hashtags">
                ${post.hashtags.map(tag => `
                    <span class="post-hashtag">#${tag}</span>
                `).join('')}
            </div>
        ` : '';
    
    const mediaHTML = post.media && post.media.length > 0 
        ? `
            <div class="post-media">
                ${post.media.map(media => {
                    if (media.type === 'image') {
                        return `<img src="${media.src}" alt="${media.name}">`;
                    } else {
                        return `<video src="${media.src}" controls></video>`;
                    }
                }).join('')}
            </div>
        ` : '';
    
    return `
        <article class="post" data-post-id="${post.id}">
            <div class="post-header">
                <div class="post-category">${getCategoryName(post.category)}</div>
                <h2 class="post-title">${post.title}</h2>
                <div class="post-meta">
                    <div class="post-date">
                        <i class="fas fa-calendar"></i>
                        ${formatDate(post.date)}
                    </div>
                </div>
            </div>
            <div class="post-content">${post.content}</div>
            ${mediaHTML}
            ${hashtagsHTML}
        </article>
    `;
}

// 카테고리 이름 가져오기
function getCategoryName(category) {
    const categoryNames = {
        'javascript': 'JavaScript',
        'css': 'CSS',
        'html': 'HTML',
        'react': 'React',
        'nodejs': 'Node.js',
        'database': 'Database',
        'algorithm': 'Algorithm',
        'other': '기타'
    };
    return categoryNames[category] || category;
}

// 날짜 포맷팅
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// 로컬 스토리지에 저장
function savePosts() {
    try {
        localStorage.setItem('dev_posts', JSON.stringify(posts));
        console.log('포스트 저장 완료');
    } catch (error) {
        console.error('포스트 저장 중 오류:', error);
        showNotification('저장 중 오류가 발생했습니다.', 'error');
    }
}

// 알림 표시
function showNotification(message, type = 'info') {
    // 기존 알림 제거
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 새 알림 생성
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // 스타일 추가
    const bgColor = type === 'success' ? '#00d4ff' : type === 'error' ? '#ff4757' : '#3742fa';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: ${type === 'success' ? '#000' : '#fff'};
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 2000;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // 3초 후 자동 제거
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
