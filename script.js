// 전역 변수
let posts = JSON.parse(localStorage.getItem('til_posts')) || [];
let currentFilter = 'all';
let hashtags = [];
let imageDescriptions = {};
let uploadedImages = []; // 업로드된 이미지 배열
let ownerMode = JSON.parse(localStorage.getItem('til_owner_mode')) ?? false;

// DOM이 로드되면 실행
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    renderPosts();
    updateOwnerModeUI();
});

// 앱 초기화
function initializeApp() {
    // 오늘 날짜를 기본값으로 설정
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
    
    // 샘플 데이터가 없으면 추가
    if (posts.length === 0) {
        addSampleData();
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 폼 제출 이벤트
    document.getElementById('postForm').addEventListener('submit', handleFormSubmit);
    
    // 이미지 미리보기 이벤트
    document.getElementById('images').addEventListener('change', handleImagePreview);
    
    // 필터 버튼 이벤트
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', handleFilterClick);
    });
    
    // 해시태그 입력 이벤트
    document.getElementById('hashtagInput').addEventListener('keydown', handleHashtagInput);

    // 소유자 모드 토글
    document.getElementById('ownerModeBtn').addEventListener('click', toggleOwnerMode);
}

// 샘플 데이터 추가 (Video 카드만 유지)
function addSampleData() {
    const samplePosts = [
        {
            id: 1,
            title: 'Video 카드 예시',
            hashtags: ['video', 'example', 'sample'],
            date: '2024-01-15',
            content: '이것은 Video 카드의 예시입니다. 실제 학습 내용으로 교체해주세요.',
            images: [
                {
                    src: 'https://via.placeholder.com/400x300/8a2be2/ffffff?text=Video+Example',
                    description: 'Video 카드 예시 이미지입니다.'
                }
            ]
        }
    ];
    
    posts = samplePosts;
    savePosts();
}

// 해시태그 입력 처리
function handleHashtagInput(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const input = e.target;
        const hashtag = input.value.trim();
        
        if (hashtag && !hashtags.includes(hashtag)) {
            hashtags.push(hashtag);
            renderHashtags();
            input.value = '';
        }
    }
}

// 해시태그 렌더링
function renderHashtags() {
    const container = document.getElementById('hashtagContainer');
    container.innerHTML = hashtags.map(tag => `
        <span class="hashtag">
            ${tag}
            <button class="hashtag-remove" onclick="removeHashtag('${tag}')">&times;</button>
        </span>
    `).join('');
}

// 해시태그 제거
function removeHashtag(tag) {
    hashtags = hashtags.filter(t => t !== tag);
    renderHashtags();
}

// 폼 토글 함수
function toggleAddPost() {
    if (!ownerMode) {
        showNotification('소유자 모드에서만 등록할 수 있습니다', 'info');
        return;
    }

    const form = document.getElementById('addPostForm');
    const isVisible = form.style.display !== 'none';
    
    if (isVisible) {
        form.style.display = 'none';
        document.getElementById('postForm').reset();
        document.getElementById('imagePreview').innerHTML = '';
        hashtags = [];
        imageDescriptions = {};
        uploadedImages = []; // 이미지 배열 초기화
        renderHashtags();
    } else {
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
    }
}

// 폼 제출 처리
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const title = formData.get('title');
    const date = formData.get('date');
    const content = formData.get('content');

    // 업로드된 이미지들로 포스트 저장
    const images = uploadedImages.map((img, index) => ({
        src: img.src,
        description: imageDescriptions[index] || ''
    }));

    // 수정 모드인지 여부 확인
    const editingId = e.target.getAttribute('data-editing-id');
    if (editingId) {
        const postIdx = posts.findIndex(p => String(p.id) === editingId);
        if (postIdx !== -1) {
            posts[postIdx] = {
                ...posts[postIdx],
                title,
                hashtags: [...hashtags],
                date,
                content,
                images
            };
        }
        e.target.removeAttribute('data-editing-id');
        showNotification('수정이 완료되었습니다', 'success');
    } else {
        savePost(title, date, content, images);
        return;
    }

    // 공통 마무리
    savePosts();
    renderPosts();
    document.getElementById('postForm').reset();
    document.getElementById('imagePreview').innerHTML = '';
    hashtags = [];
    imageDescriptions = {};
    uploadedImages = [];
    renderHashtags();
    toggleAddPost();
}

// 포스트 저장
function savePost(title, date, content, images) {
    const newPost = {
        id: Date.now(),
        title,
        hashtags: [...hashtags],
        date,
        content,
        images
    };
    
    posts.unshift(newPost);
    savePosts();
    renderPosts();
    
    // 폼 초기화 및 숨기기
    document.getElementById('postForm').reset();
    document.getElementById('imagePreview').innerHTML = '';
    hashtags = [];
    imageDescriptions = {};
    uploadedImages = []; // 이미지 배열 초기화
    renderHashtags();
    toggleAddPost();
    
    // 성공 메시지
    showNotification('학습 내용이 성공적으로 저장되었습니다!', 'success');
}

// 이미지 미리보기 처리
function handleImagePreview(e) {
    const files = e.target.files;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = {
                src: e.target.result,
                file: file,
                index: uploadedImages.length
            };
            uploadedImages.push(imageData);
            renderImagePreview();
        };
        reader.readAsDataURL(file);
    }
}

// 이미지 미리보기 렌더링
function renderImagePreview() {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';
    
    uploadedImages.forEach((imageData, index) => {
        const imageItem = document.createElement('div');
        imageItem.className = 'image-preview-item';
        imageItem.draggable = true;
        imageItem.dataset.index = index;
        
        imageItem.innerHTML = `
            <div class="image-order">${index + 1}</div>
            <button class="image-delete-btn" onclick="deleteImage(${index})">&times;</button>
            <img src="${imageData.src}" alt="업로드된 이미지 ${index + 1}">
            <div class="drag-hint">드래그하여 순서 변경</div>
            <div class="image-description-input">
                <textarea 
                    placeholder="이 이미지에 대한 설명을 입력하세요..."
                    onchange="updateImageDescription(${index}, this.value)"
                >${imageDescriptions[index] || ''}</textarea>
            </div>
        `;
        
        // 드래그 앤 드롭 이벤트 추가
        setupDragAndDrop(imageItem, index);
        
        preview.appendChild(imageItem);
    });
}

// 드래그 앤 드롭 설정
function setupDragAndDrop(element, index) {
    element.addEventListener('dragstart', function(e) {
        this.classList.add('dragging');
        e.dataTransfer.setData('text/plain', index);
    });
    
    element.addEventListener('dragend', function() {
        this.classList.remove('dragging');
    });
    
    element.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    });
    
    element.addEventListener('dragleave', function() {
        this.classList.remove('drag-over');
    });
    
    element.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        
        const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
        const dropIndex = parseInt(this.dataset.index);
        
        if (draggedIndex !== dropIndex) {
            reorderImages(draggedIndex, dropIndex);
        }
    });
}

// 이미지 순서 변경
function reorderImages(fromIndex, toIndex) {
    // 배열에서 이미지 이동
    const [movedImage] = uploadedImages.splice(fromIndex, 1);
    uploadedImages.splice(toIndex, 0, movedImage);
    
    // 설명도 함께 이동
    const movedDescription = imageDescriptions[fromIndex];
    delete imageDescriptions[fromIndex];
    
    // 인덱스 재정렬
    const newDescriptions = {};
    Object.keys(imageDescriptions).forEach(key => {
        const oldIndex = parseInt(key);
        let newIndex = oldIndex;
        
        if (oldIndex >= fromIndex && oldIndex < toIndex) {
            newIndex = oldIndex + 1;
        } else if (oldIndex > toIndex && oldIndex <= fromIndex) {
            newIndex = oldIndex - 1;
        }
        
        newDescriptions[newIndex] = imageDescriptions[key];
    });
    
    if (movedDescription) {
        newDescriptions[toIndex] = movedDescription;
    }
    
    imageDescriptions = newDescriptions;
    
    // 미리보기 다시 렌더링
    renderImagePreview();
}

// 이미지 삭제
function deleteImage(index) {
    // 확인 메시지
    if (!confirm('이 이미지를 삭제하시겠습니까?')) {
        return;
    }
    
    // 배열에서 이미지 제거
    uploadedImages.splice(index, 1);
    
    // 설명도 함께 제거
    delete imageDescriptions[index];
    
    // 인덱스 재정렬
    const newDescriptions = {};
    Object.keys(imageDescriptions).forEach(key => {
        const oldIndex = parseInt(key);
        if (oldIndex > index) {
            newDescriptions[oldIndex - 1] = imageDescriptions[key];
        } else if (oldIndex < index) {
            newDescriptions[oldIndex] = imageDescriptions[key];
        }
    });
    imageDescriptions = newDescriptions;
    
    // 미리보기 다시 렌더링
    renderImagePreview();
    
    // 파일 입력 초기화
    document.getElementById('images').value = '';
}

// 이미지 설명 업데이트
function updateImageDescription(index, description) {
    imageDescriptions[index] = description;
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

// 포스트 렌더링
function renderPosts() {
    const container = document.getElementById('postsContainer');
    
    // 필터링된 포스트 가져오기
    let filteredPosts = posts;
    
    if (currentFilter === 'hashtag') {
        // 해시태그 검색 모드
        const searchTerm = prompt('검색할 해시태그를 입력하세요:');
        if (searchTerm) {
            filteredPosts = posts.filter(post => 
                post.hashtags.some(tag => 
                    tag.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        } else {
            currentFilter = 'all';
            document.querySelector('[data-filter="all"]').classList.add('active');
            document.querySelector('[data-filter="hashtag"]').classList.remove('active');
            filteredPosts = posts;
        }
    }
    
    if (filteredPosts.length === 0) {
        container.innerHTML = `
            <div class="loading">
                ${currentFilter === 'all' ? '아직 저장된 학습 내용이 없습니다.' : '해당 해시태그의 학습 내용이 없습니다.'}
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredPosts.map(post => createPostHTML(post)).join('');
    
    // 이미지 클릭 이벤트 추가
    setupImageModal();
}

// 포스트 HTML 생성
function createPostHTML(post) {
    const hashtagsHTML = post.hashtags.length > 0 
        ? `
            <div class="post-hashtags">
                ${post.hashtags.map(tag => `
                    <span class="post-hashtag">#${tag}</span>
                `).join('')}
            </div>
        ` : '';

    const actionsHTML = ownerMode ? `
        <div class="post-actions">
            <button class="btn btn-edit" onclick="startEditPost(${post.id})">수정</button>
            <button class="btn btn-delete" onclick="deletePost(${post.id})">삭제</button>
        </div>
    ` : '';
    
    const imagesHTML = post.images.length > 0 
        ? `
            <div class="post-images">
                ${post.images.map((img, index) => `
                    <img src="${img.src}" alt="학습 이미지 ${index + 1}" class="post-image" 
                         data-index="${index}" data-description="${img.description || ''}">
                `).join('')}
            </div>
        ` : '';
    
    return `
        <article class="post">
            <div class="post-header">
                <h2 class="post-title">${post.title}</h2>
                <div class="post-meta">
                    <span class="post-date">${formatDate(post.date)}</span>
                </div>
                ${hashtagsHTML}
                ${actionsHTML}
            </div>
            <div class="post-content">
                <p class="post-description">${post.content}</p>
                ${imagesHTML}
            </div>
        </article>
    `;
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

// 이미지 모달 설정
function setupImageModal() {
    const images = document.querySelectorAll('.post-image');
    
    images.forEach(img => {
        img.addEventListener('click', function() {
            const description = this.dataset.description;
            showImageModal(this.src, description);
        });
    });
}

// 이미지 모달 표시
function showImageModal(imageSrc, description) {
    // 기존 모달 제거
    const existingModal = document.querySelector('.modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // 새 모달 생성
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    const descriptionHTML = description 
        ? `<div class="modal-description">${description}</div>` 
        : '';
    
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="closeImageModal()">&times;</button>
            <img src="${imageSrc}" alt="확대된 이미지" class="modal-image">
            ${descriptionHTML}
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 모달 표시
    setTimeout(() => {
        modal.style.display = 'block';
    }, 10);
    
    // 배경 클릭으로 닫기
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeImageModal();
        }
    });
}

// 이미지 모달 닫기
function closeImageModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.style.display = 'none';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// 포스트 저장 (로컬 스토리지)
function savePosts() {
    localStorage.setItem('til_posts', JSON.stringify(posts));
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
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#32cd32' : '#8a2be2'};
        color: #1a1a2e;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        z-index: 3000;
        animation: slideIn 0.3s ease-out;
        font-weight: 600;
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

// 키보드 단축키
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + N: 새 포스트 추가
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        toggleAddPost();
    }
    
    // ESC: 모달 닫기
    if (e.key === 'Escape') {
        closeImageModal();
        const form = document.getElementById('addPostForm');
        if (form.style.display !== 'none') {
            toggleAddPost();
        }
    }
});

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

// ========== 소유자 모드 ==========
function toggleOwnerMode() {
    // 간단 비밀번호 프롬프트 (프론트엔드 보호)
    if (!ownerMode) {
        const pwd = prompt('소유자 비밀번호를 입력하세요 (브라우저에만 저장됩니다)');
        if (!pwd) return;
        // 해시 대체 간단 저장
        localStorage.setItem('til_owner_pwd', btoa(pwd));
        ownerMode = true;
    } else {
        ownerMode = false;
    }
    localStorage.setItem('til_owner_mode', JSON.stringify(ownerMode));
    updateOwnerModeUI();
    renderPosts();
}

function updateOwnerModeUI() {
    const btn = document.getElementById('ownerModeBtn');
    const addSection = document.getElementById('addPostSection');
    if (!btn || !addSection) return;
    
    if (ownerMode) {
        btn.classList.add('owner-on');
        addSection.style.display = 'block';
    } else {
        btn.classList.remove('owner-on');
        addSection.style.display = 'none';
        const form = document.getElementById('addPostForm');
        if (form && form.style.display !== 'none') toggleAddPost();
    }
}

// ========== 글 수정/삭제 ==========
function startEditPost(postId) {
    if (!ownerMode) {
        showNotification('소유자 모드에서만 수정할 수 있습니다', 'info');
        return;
    }
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    // 폼에 값 채우기
    document.getElementById('title').value = post.title;
    document.getElementById('date').value = post.date;
    document.getElementById('content').value = post.content;
    hashtags = [...post.hashtags];
    renderHashtags();
    
    // 이미지 채우기
    uploadedImages = post.images.map(img => ({ src: img.src }));
    imageDescriptions = {};
    post.images.forEach((img, idx) => imageDescriptions[idx] = img.description || '');
    renderImagePreview();
    
    // 편집 모드 표시
    const form = document.getElementById('postForm');
    form.setAttribute('data-editing-id', String(post.id));
    
    // 폼 열기
    const addForm = document.getElementById('addPostForm');
    if (addForm.style.display === 'none') toggleAddPost();
    addForm.scrollIntoView({ behavior: 'smooth' });
}

function deletePost(postId) {
    if (!ownerMode) {
        showNotification('소유자 모드에서만 삭제할 수 있습니다', 'info');
        return;
    }
    
    if (!confirm('이 글을 삭제하시겠습니까?')) return;
    posts = posts.filter(p => p.id !== postId);
    savePosts();
    renderPosts();
    showNotification('삭제가 완료되었습니다', 'success');
}
