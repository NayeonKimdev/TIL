// 전역 변수
let posts = JSON.parse(localStorage.getItem('dev_posts')) || [];
let currentFilter = 'all';
let contentBlocks = [];
let blockCounter = 0;

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
            content: '클로저는 함수가 선언될 때의 렉시컬 환경을 기억하여, 함수가 스코프 밖에서 실행될 때도 그 스코프에 접근할 수 있게 해주는 개념입니다.',
            category: 'javascript',
            date: '2024-01-15',
            hashtags: ['javascript', 'closure', 'scope', 'lexical'],
            blocks: [
                {
                    id: 1,
                    type: 'text',
                    content: '클로저는 함수가 선언될 때의 렉시컬 환경을 기억하여, 함수가 스코프 밖에서 실행될 때도 그 스코프에 접근할 수 있게 해주는 개념입니다. 이를 통해 데이터 은닉과 상태 관리가 가능합니다.'
                },
                {
                    id: 2,
                    type: 'text',
                    content: '클로저의 주요 특징:\n1. 함수가 선언된 환경을 기억\n2. 외부 변수에 접근 가능\n3. 데이터 은닉과 캡슐화\n4. 상태 관리에 유용'
                }
            ]
        },
        {
            id: 2,
            title: 'CSS Grid vs Flexbox 언제 사용할까?',
            content: 'Flexbox는 1차원 레이아웃(행 또는 열)에 적합하고, Grid는 2차원 레이아웃(행과 열 동시)에 적합합니다.',
            category: 'css',
            date: '2024-01-14',
            hashtags: ['css', 'grid', 'flexbox', 'layout'],
            blocks: [
                {
                    id: 1,
                    type: 'text',
                    content: 'Flexbox는 1차원 레이아웃(행 또는 열)에 적합하고, Grid는 2차원 레이아웃(행과 열 동시)에 적합합니다. 복잡한 레이아웃은 Grid를, 간단한 정렬은 Flexbox를 사용하는 것이 좋습니다.'
                },
                {
                    id: 2,
                    type: 'text',
                    content: 'Flexbox 사용 시기:\n- 한 방향으로의 정렬\n- 간단한 레이아웃\n- 동적 콘텐츠\n\nGrid 사용 시기:\n- 복잡한 2차원 레이아웃\n- 고정된 레이아웃\n- 격자 형태의 배치'
                }
            ]
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
        // 콘텐츠 블록 초기화
        contentBlocks = [];
        blockCounter = 0;
        renderContentBlocks();
        // 편집 모드로 시작
        showEditMode();
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

// 편집 모드 표시
function showEditMode() {
    document.getElementById('editMode').style.display = 'block';
    document.getElementById('previewMode').style.display = 'none';
}

// 미리보기 모드 표시
function showPreviewMode() {
    document.getElementById('editMode').style.display = 'none';
    document.getElementById('previewMode').style.display = 'block';
    renderPreview();
}

// 미리보기 토글
function togglePreview() {
    const editMode = document.getElementById('editMode');
    const previewMode = document.getElementById('previewMode');
    
    if (editMode.style.display === 'none') {
        showEditMode();
    } else {
        showPreviewMode();
    }
}

// 텍스트 블록 추가
function addTextBlock() {
    blockCounter++;
    const newBlock = {
        id: blockCounter,
        type: 'text',
        content: ''
    };
    
    contentBlocks.push(newBlock);
    renderContentBlocks();
    
    // 새로 추가된 텍스트 블록에 포커스
    setTimeout(() => {
        const textarea = document.querySelector(`#block-${blockCounter} textarea`);
        if (textarea) {
            textarea.focus();
        }
    }, 100);
}

// 미디어 블록 추가
function addMediaBlock() {
    blockCounter++;
    const newBlock = {
        id: blockCounter,
        type: 'media',
        content: null
    };
    
    contentBlocks.push(newBlock);
    renderContentBlocks();
}

// 콘텐츠 블록 렌더링
function renderContentBlocks() {
    const container = document.getElementById('contentBlocks');
    if (!container) return;
    
    if (contentBlocks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>콘텐츠 블록을 추가해주세요</h3>
                <p>텍스트나 이미지를 추가하여 글을 구성하세요.</p>
            </div>
        `;
        return;
    }
    
    const blocksHTML = contentBlocks.map((block, index) => createBlockHTML(block, index)).join('');
    container.innerHTML = blocksHTML;
    
    // 드래그 앤 드롭 이벤트 설정
    setupDragAndDrop();
}

// 블록 HTML 생성
function createBlockHTML(block, index) {
    const blockType = block.type === 'text' ? '텍스트' : '미디어';
    const blockIcon = block.type === 'text' ? 'fas fa-font' : 'fas fa-image';
    
    let blockContent = '';
    
    if (block.type === 'text') {
        blockContent = `
            <div class="text-block">
                <textarea 
                    id="block-${block.id}" 
                    placeholder="텍스트를 입력하세요..."
                    oninput="updateBlockContent(${block.id}, this.value)"
                >${block.content || ''}</textarea>
            </div>
        `;
    } else if (block.type === 'media') {
        if (block.content) {
            blockContent = `
                <div class="media-block">
                    <div class="media-preview">
                        ${block.content.type === 'image' 
                            ? `<img src="${block.content.src}" alt="${block.content.name}">`
                            : `<video src="${block.content.src}" controls></video>`
                        }
                    </div>
                </div>
            `;
        } else {
            blockContent = `
                <div class="media-block">
                    <div class="media-upload-area" onclick="triggerMediaUpload(${block.id})">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>클릭하여 이미지나 비디오 추가</p>
                        <input type="file" id="media-input-${block.id}" accept="image/*,video/*" style="display: none;" onchange="handleMediaUpload(${block.id}, this)">
                    </div>
                </div>
            `;
        }
    }
    
    return `
        <div class="content-block" data-block-id="${block.id}" draggable="true">
            <div class="block-header">
                <div class="block-type">
                    <i class="${blockIcon}"></i>
                    ${blockType} 블록
                </div>
                <div class="block-actions">
                    <button class="block-action-btn" onclick="moveBlock(${index}, 'up')" ${index === 0 ? 'disabled' : ''}>
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button class="block-action-btn" onclick="moveBlock(${index}, 'down')" ${index === contentBlocks.length - 1 ? 'disabled' : ''}>
                        <i class="fas fa-arrow-down"></i>
                    </button>
                    <button class="block-action-btn delete" onclick="deleteBlock(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="block-content">
                ${blockContent}
            </div>
        </div>
    `;
}

// 블록 내용 업데이트
function updateBlockContent(blockId, content) {
    const block = contentBlocks.find(b => b.id === blockId);
    if (block) {
        block.content = content;
    }
}

// 미디어 업로드 트리거
function triggerMediaUpload(blockId) {
    document.getElementById(`media-input-${blockId}`).click();
}

// 미디어 업로드 처리
function handleMediaUpload(blockId, input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const mediaData = {
            src: e.target.result,
            type: file.type.startsWith('image/') ? 'image' : 'video',
            name: file.name
        };
        
        const block = contentBlocks.find(b => b.id === blockId);
        if (block) {
            block.content = mediaData;
            renderContentBlocks();
        }
    };
    
    reader.readAsDataURL(file);
}

// 블록 이동
function moveBlock(index, direction) {
    if (direction === 'up' && index > 0) {
        [contentBlocks[index], contentBlocks[index - 1]] = [contentBlocks[index - 1], contentBlocks[index]];
    } else if (direction === 'down' && index < contentBlocks.length - 1) {
        [contentBlocks[index], contentBlocks[index + 1]] = [contentBlocks[index + 1], contentBlocks[index]];
    }
    
    renderContentBlocks();
}

// 블록 삭제
function deleteBlock(index) {
    contentBlocks.splice(index, 1);
    renderContentBlocks();
}

// 드래그 앤 드롭 설정
function setupDragAndDrop() {
    const blocks = document.querySelectorAll('.content-block');
    
    blocks.forEach(block => {
        block.addEventListener('dragstart', handleDragStart);
        block.addEventListener('dragend', handleDragEnd);
        block.addEventListener('dragover', handleDragOver);
        block.addEventListener('drop', handleDrop);
    });
}

// 드래그 시작
function handleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.dataset.blockId);
}

// 드래그 종료
function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

// 드래그 오버
function handleDragOver(e) {
    e.preventDefault();
}

// 드롭
function handleDrop(e) {
    e.preventDefault();
    const draggedId = parseInt(e.dataTransfer.getData('text/plain'));
    const dropTarget = e.target.closest('.content-block');
    
    if (!dropTarget) return;
    
    const dropId = parseInt(dropTarget.dataset.blockId);
    const draggedIndex = contentBlocks.findIndex(b => b.id === draggedId);
    const dropIndex = contentBlocks.findIndex(b => b.id === dropId);
    
    if (draggedIndex !== -1 && dropIndex !== -1 && draggedIndex !== dropIndex) {
        const draggedBlock = contentBlocks.splice(draggedIndex, 1)[0];
        contentBlocks.splice(dropIndex, 0, draggedBlock);
        renderContentBlocks();
    }
}

// 미리보기 렌더링
function renderPreview() {
    const container = document.getElementById('previewContainer');
    if (!container) return;
    
    const title = document.getElementById('title').value || '제목 없음';
    const category = document.getElementById('category').value;
    const categoryName = getCategoryName(category);
    
    let blocksHTML = '';
    if (contentBlocks.length > 0) {
        blocksHTML = contentBlocks.map(block => {
            if (block.type === 'text') {
                return `<div class="preview-block">
                    <div class="preview-block-text">${block.content.replace(/\n/g, '<br>')}</div>
                </div>`;
            } else if (block.type === 'media' && block.content) {
                if (block.content.type === 'image') {
                    return `<div class="preview-block">
                        <div class="preview-block-media">
                            <img src="${block.content.src}" alt="${block.content.name}">
                        </div>
                    </div>`;
                } else {
                    return `<div class="preview-block">
                        <div class="preview-block-media">
                            <video src="${block.content.src}" controls></video>
                        </div>
                    </div>`;
                }
            }
            return '';
        }).join('');
    }
    
    container.innerHTML = `
        <div class="preview-title">${title}</div>
        <div class="preview-category">${categoryName}</div>
        <div class="preview-blocks">
            ${blocksHTML}
        </div>
    `;
}

// 글쓰기 폼 제출 처리
function handleWriteSubmit(e) {
    e.preventDefault();
    console.log('글쓰기 폼 제출 처리 시작');
    
    try {
        const formData = new FormData(e.target);
        const title = formData.get('title').trim();
        const category = formData.get('category');
        const hashtagsInput = formData.get('hashtags').trim();
        
        // 필수 필드 검증
        if (!title || !category) {
            showNotification('제목과 카테고리를 입력해주세요.', 'error');
            return;
        }
        
        if (contentBlocks.length === 0) {
            showNotification('최소 하나의 콘텐츠 블록을 추가해주세요.', 'error');
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
            content: contentBlocks.map(block => block.content).join('\n\n'), // 간단한 텍스트 요약
            category: category,
            date: new Date().toISOString().split('T')[0],
            hashtags: hashtags,
            blocks: [...contentBlocks]
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
    
    // 블록 기반 콘텐츠 렌더링
    let blocksHTML = '';
    if (post.blocks && post.blocks.length > 0) {
        blocksHTML = `
            <div class="post-blocks">
                ${post.blocks.map(block => {
                    if (block.type === 'text') {
                        return `<div class="post-block">
                            <div class="post-block-text">${block.content.replace(/\n/g, '<br>')}</div>
                        </div>`;
                    } else if (block.type === 'media' && block.content) {
                        if (block.content.type === 'image') {
                            return `<div class="post-block">
                                <div class="post-block-media">
                                    <img src="${block.content.src}" alt="${block.content.name}">
                                </div>
                            </div>`;
                        } else {
                            return `<div class="post-block">
                                <div class="post-block-media">
                                    <video src="${block.content.src}" controls></video>
                                </div>
                            </div>`;
                        }
                    }
                    return '';
                }).join('')}
            </div>
        `;
    } else {
        // 기존 콘텐츠 (하위 호환성)
        blocksHTML = `<div class="post-content">${post.content}</div>`;
    }
    
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
            ${blocksHTML}
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
