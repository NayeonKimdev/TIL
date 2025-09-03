// 전역 변수
let posts = JSON.parse(localStorage.getItem('dev_posts')) || [];
let currentFilter = 'all';
let contentBlocks = [];
let blockCounter = 0;
let selectedCategories = []; // 선택된 카테고리들

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
    // 샘플 데이터를 추가하지 않음 - 빈 배열로 시작
    posts = [];
    savePosts();
    console.log('빈 배열로 초기화 완료');
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
        selectedCategories = [];
        renderContentBlocks();
        renderCategoryTags();
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

// 코드 블록 추가
function addCodeBlock() {
    blockCounter++;
    const newBlock = {
        id: blockCounter,
        type: 'code',
        content: '',
        language: 'javascript'
    };
    
    contentBlocks.push(newBlock);
    renderContentBlocks();
    
    // 새로 추가된 코드 블록에 포커스
    setTimeout(() => {
        const textarea = document.querySelector(`#block-${blockCounter} textarea`);
        if (textarea) {
            textarea.focus();
        }
    }, 100);
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
    const blockType = block.type === 'text' ? '텍스트' : block.type === 'code' ? '코드' : '미디어';
    const blockIcon = block.type === 'text' ? 'fas fa-font' : block.type === 'code' ? 'fas fa-code' : 'fas fa-image';
    
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
    } else if (block.type === 'code') {
        blockContent = `
            <div class="code-block">
                <div class="code-header">
                    <select onchange="updateCodeLanguage(${block.id}, this.value)">
                        <option value="javascript" ${block.language === 'javascript' ? 'selected' : ''}>JavaScript</option>
                        <option value="html" ${block.language === 'html' ? 'selected' : ''}>HTML</option>
                        <option value="css" ${block.language === 'css' ? 'selected' : ''}>CSS</option>
                        <option value="python" ${block.language === 'python' ? 'selected' : ''}>Python</option>
                        <option value="java" ${block.language === 'java' ? 'selected' : ''}>Java</option>
                        <option value="cpp" ${block.language === 'cpp' ? 'selected' : ''}>C++</option>
                        <option value="sql" ${block.language === 'sql' ? 'selected' : ''}>SQL</option>
                        <option value="bash" ${block.language === 'bash' ? 'selected' : ''}>Bash</option>
                    </select>
                </div>
                <textarea 
                    id="block-${block.id}" 
                    placeholder="코드를 입력하세요..."
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

// 코드 언어 업데이트
function updateCodeLanguage(blockId, language) {
    const block = contentBlocks.find(b => b.id === blockId);
    if (block && block.type === 'code') {
        block.language = language;
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
    const categories = selectedCategories.length > 0 ? selectedCategories.join(', ') : '카테고리 없음';
    
    let blocksHTML = '';
    if (contentBlocks.length > 0) {
        blocksHTML = contentBlocks.map(block => {
            if (block.type === 'text') {
                return `<div class="preview-block">
                    <div class="preview-block-text">${block.content.replace(/\n/g, '<br>')}</div>
                </div>`;
            } else if (block.type === 'code') {
                return `<div class="preview-block">
                    <div class="preview-block-code">
                        <div class="code-language">${block.language || 'javascript'}</div>
                        <pre><code>${block.content}</code></pre>
                    </div>
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
        <div class="preview-category">${categories}</div>
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
        const hashtagsInput = formData.get('hashtags').trim();
        
        // 필수 필드 검증
        if (!title) {
            showNotification('제목을 입력해주세요.', 'error');
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
            categories: [...selectedCategories],
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

// 개별 포스트 삭제
function deletePost(postId) {
    if (confirm('이 글을 삭제하시겠습니까?')) {
        posts = posts.filter(post => post.id !== postId);
        savePosts();
        renderPosts();
        showNotification('글이 삭제되었습니다.', 'success');
    }
}

// 포스트 내용 토글
function togglePostContent(postId) {
    const post = document.querySelector(`[data-post-id="${postId}"]`);
    const fullContent = post.querySelector('.post-full-content');
    const preview = post.querySelector('.post-preview');
    const toggleIcon = document.getElementById(`toggle-icon-${postId}`);
    
    if (fullContent.style.display === 'none') {
        fullContent.style.display = 'block';
        preview.style.display = 'none';
        toggleIcon.classList.remove('fa-chevron-down');
        toggleIcon.classList.add('fa-chevron-up');
    } else {
        fullContent.style.display = 'none';
        preview.style.display = 'block';
        toggleIcon.classList.remove('fa-chevron-up');
        toggleIcon.classList.add('fa-chevron-down');
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
    
    if (posts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>아직 작성된 글이 없습니다</h3>
                <p>첫 번째 개발 상식을 작성해보세요!</p>
            </div>
        `;
        return;
    }
    
    const postsHTML = posts.map(post => createPostHTML(post)).join('');
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
    
    // 블록 기반 콘텐츠 렌더링 (축약된 버전)
    let contentPreview = '';
    if (post.blocks && post.blocks.length > 0) {
        const firstBlock = post.blocks[0];
        if (firstBlock.type === 'text') {
            contentPreview = firstBlock.content.substring(0, 100) + (firstBlock.content.length > 100 ? '...' : '');
        } else if (firstBlock.type === 'code') {
            contentPreview = '코드 블록';
        }
    } else {
        contentPreview = post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '');
    }
    
    // 카테고리 표시
    const categoriesHTML = post.categories && post.categories.length > 0 
        ? `
            <div class="post-categories">
                ${post.categories.map(category => `
                    <span class="post-category">${category}</span>
                `).join('')}
            </div>
        ` : '';
    
    // 전체 콘텐츠 (숨겨진 상태)
    let fullContentHTML = '';
    if (post.blocks && post.blocks.length > 0) {
        fullContentHTML = `
            <div class="post-full-content" style="display: none;">
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
                        } else if (block.type === 'code') {
                            return `<div class="post-block">
                                <div class="post-block-code">
                                    <div class="code-language">${block.language || 'javascript'}</div>
                                    <pre><code>${block.content}</code></pre>
                                </div>
                            </div>`;
                        }
                        return '';
                    }).join('')}
                </div>
            </div>
        `;
    } else {
        fullContentHTML = `<div class="post-full-content" style="display: none;"><div class="post-content">${post.content}</div></div>`;
    }
    
    return `
        <article class="post" data-post-id="${post.id}">
            <div class="post-header" onclick="togglePostContent(${post.id})" style="cursor: pointer;">
                ${categoriesHTML}
                <h2 class="post-title">${post.title}</h2>
                <div class="post-meta">
                    <div class="post-date">
                        <i class="fas fa-calendar"></i>
                        ${formatDate(post.date)}
                    </div>
                    <div class="post-actions">
                        <button class="post-delete-btn" onclick="event.stopPropagation(); deletePost(${post.id})" title="글 삭제">
                            <i class="fas fa-trash"></i>
                        </button>
                        <div class="post-toggle">
                            <i class="fas fa-chevron-down" id="toggle-icon-${post.id}"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="post-preview">
                <div class="post-content-preview">${contentPreview}</div>
            </div>
            ${fullContentHTML}
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

// 카테고리 추가
function addCategory() {
    const categoryInput = document.getElementById('category');
    const category = categoryInput.value.trim();
    
    if (!category) {
        showNotification('카테고리를 입력해주세요.', 'error');
        return;
    }
    
    if (selectedCategories.includes(category)) {
        showNotification('이미 추가된 카테고리입니다.', 'error');
        return;
    }
    
    selectedCategories.push(category);
    categoryInput.value = '';
    renderCategoryTags();
    showNotification(`카테고리 "${category}"가 추가되었습니다.`, 'success');
}

// 카테고리 태그 렌더링
function renderCategoryTags() {
    const container = document.getElementById('categoryTags');
    if (!container) return;
    
    if (selectedCategories.length === 0) {
        container.innerHTML = '<p class="no-categories">추가된 카테고리가 없습니다.</p>';
        return;
    }
    
    const tagsHTML = selectedCategories.map(category => `
        <span class="category-tag">
            ${category}
            <button type="button" class="remove-category-btn" onclick="removeCategory('${category}')">
                <i class="fas fa-times"></i>
            </button>
        </span>
    `).join('');
    
    container.innerHTML = tagsHTML;
}

// 카테고리 제거
function removeCategory(category) {
    selectedCategories = selectedCategories.filter(cat => cat !== category);
    renderCategoryTags();
    showNotification(`카테고리 "${category}"가 제거되었습니다.`, 'success');
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
