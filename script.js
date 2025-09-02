// 전역 변수
let posts = JSON.parse(localStorage.getItem('til_posts')) || [];
let currentFilter = 'all';
let hashtags = [];
let imageDescriptions = {};
let uploadedImages = []; // 업로드된 이미지 배열
let ownerMode = JSON.parse(localStorage.getItem('til_owner_mode')) ?? false;

// DOM이 로드되면 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 로드됨');
    initializeApp();
    setupEventListeners();
    renderPosts();
    updateOwnerModeUI();
});

// 앱 초기화
function initializeApp() {
    console.log('앱 초기화 시작');
    
    // 오늘 날짜를 기본값으로 설정
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
        console.log('날짜 입력 필드 설정됨:', dateInput.value);
    }
    
    // 샘플 데이터가 없으면 추가
    console.log('현재 포스트 수:', posts.length);
    if (posts.length === 0) {
        console.log('샘플 데이터 추가');
        addSampleData();
    }
    
    console.log('앱 초기화 완료');
}

// 이벤트 리스너 설정
function setupEventListeners() {
    console.log('이벤트 리스너 설정 시작');
    
    // 폼 제출 이벤트
    const postForm = document.getElementById('postForm');
    if (postForm) {
        postForm.addEventListener('submit', handleFormSubmit);
        console.log('폼 제출 이벤트 리스너 추가됨');
    }
    
    // 이미지 미리보기 이벤트
    const imagesInput = document.getElementById('images');
    if (imagesInput) {
        imagesInput.addEventListener('change', handleImagePreview);
        console.log('이미지 입력 이벤트 리스너 추가됨');
    }
    
    // 필터 버튼 이벤트
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', handleFilterClick);
    });
    
    // 해시태그 입력 이벤트
    const hashtagInput = document.getElementById('hashtagInput');
    if (hashtagInput) {
        hashtagInput.addEventListener('keydown', handleHashtagInput);
        console.log('해시태그 입력 이벤트 리스너 추가됨');
    }

    // 소유자 모드 토글
    const ownerModeBtn = document.getElementById('ownerModeBtn');
    if (ownerModeBtn) {
        ownerModeBtn.addEventListener('click', toggleOwnerMode);
        console.log('소유자 모드 버튼 이벤트 리스너 추가됨');
    }
    
    console.log('이벤트 리스너 설정 완료');
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
    console.log('샘플 데이터 추가 완료');
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
    if (container) {
        container.innerHTML = hashtags.map(tag => `
            <span class="hashtag">
                ${tag}
                <button class="hashtag-remove" onclick="removeHashtag('${tag}')">&times;</button>
            </span>
        `).join('');
    }
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
    if (!form) {
        console.error('addPostForm을 찾을 수 없습니다');
        return;
    }
    
    const isVisible = form.style.display !== 'none';
    
    if (isVisible) {
        form.style.display = 'none';
        const postForm = document.getElementById('postForm');
        if (postForm) postForm.reset();
        
        const imagePreview = document.getElementById('imagePreview');
        if (imagePreview) imagePreview.innerHTML = '';
        
        hashtags = [];
        imageDescriptions = {};
        uploadedImages = [];
        renderHashtags();
    } else {
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
    }
}

// 폼 제출 처리
function handleFormSubmit(e) {
    e.preventDefault();
    e.stopPropagation(); // 이벤트 전파 중단
    console.log('폼 제출 시작');
    
    try {
        const formData = new FormData(e.target);
        const title = formData.get('title');
        const date = formData.get('date');
        const content = formData.get('content');

        console.log('폼 데이터:', { title, date, content });

        // 필수 필드 검증
        if (!title || !date || !content) {
            showNotification('제목, 날짜, 내용을 모두 입력해주세요.', 'info');
            return false; // 폼 제출 중단
        }

        // 데이터 정리
        const cleanTitle = title.trim();
        const cleanDate = date.trim();
        const cleanContent = content.trim();

        if (!cleanTitle || !cleanDate || !cleanContent) {
            showNotification('제목, 날짜, 내용을 모두 입력해주세요.', 'info');
            return false;
        }

        // 업로드된 이미지들로 포스트 저장
        const images = uploadedImages.map((img, index) => ({
            src: img.src,
            description: (imageDescriptions[index] || '').trim()
        }));

        console.log('이미지 데이터:', images);

        // 수정 모드인지 여부 확인
        const editingId = e.target.getAttribute('data-editing-id');
        if (editingId) {
            console.log('수정 모드:', editingId);
            const postIdx = posts.findIndex(p => String(p.id) === editingId);
            if (postIdx !== -1) {
                posts[postIdx] = {
                    ...posts[postIdx],
                    title: cleanTitle,
                    hashtags: [...hashtags],
                    date: cleanDate,
                    content: cleanContent,
                    images
                };
            }
            e.target.removeAttribute('data-editing-id');
            showNotification('수정이 완료되었습니다', 'success');
        } else {
            // 새 포스트 저장
            console.log('새 포스트 생성 모드');
            const newPost = {
                id: Date.now(),
                title: cleanTitle,
                hashtags: [...hashtags],
                date: cleanDate,
                content: cleanContent,
                images
            };
            
            console.log('새 포스트 객체:', newPost);
            
            // 포스트 배열이 없으면 초기화
            if (!Array.isArray(posts)) {
                console.log('posts 배열 초기화');
                posts = [];
            }
            
            posts.unshift(newPost);
            console.log('포스트 배열에 추가됨. 현재 포스트 수:', posts.length);
            
            showNotification('학습 내용이 성공적으로 저장되었습니다!', 'success');
        }

        // 공통 마무리
        console.log('저장 전 포스트 수:', posts.length);
        savePosts();
        console.log('로컬 스토리지에 저장됨');
        
        console.log('렌더링 시작');
        renderPosts();
        console.log('렌더링 완료');
        
        // 폼 초기화
        const postForm = document.getElementById('postForm');
        if (postForm) {
            postForm.reset();
            console.log('폼 리셋 완료');
        }
        
        const imagePreview = document.getElementById('imagePreview');
        if (imagePreview) {
            imagePreview.innerHTML = '';
            console.log('이미지 미리보기 초기화 완료');
        }
        
        hashtags = [];
        imageDescriptions = {};
        uploadedImages = [];
        renderHashtags();
        
        // 폼 숨기기
        toggleAddPost();
        
        // 디버깅: 저장된 포스트 수 확인
        console.log('최종 저장된 포스트 수:', posts.length);
        console.log('최신 포스트:', posts[0]);
        
        // 로컬 스토리지 확인
        const storedPosts = JSON.parse(localStorage.getItem('til_posts')) || [];
        console.log('로컬 스토리지의 포스트 수:', storedPosts.length);
        console.log('로컬 스토리지의 최신 포스트:', storedPosts[0]);
        
        // 페이지 스크롤을 맨 위로
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        return false; // 폼 제출 완전 중단
        
    } catch (error) {
        console.error('폼 제출 처리 중 오류:', error);
        console.error('오류 상세 정보:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        showNotification('폼 제출 중 오류가 발생했습니다: ' + error.message, 'error');
        return false;
    }
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
    if (!preview) return;
    
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
    const imagesInput = document.getElementById('images');
    if (imagesInput) imagesInput.value = '';
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
    console.log('=== renderPosts 시작 ===');
    console.log('현재 posts 배열:', posts);
    console.log('현재 필터:', currentFilter);
    
    const container = document.getElementById('postsContainer');
    console.log('컨테이너 요소:', container);
    
    if (!container) {
        console.error('postsContainer를 찾을 수 없습니다');
        return;
    }
    
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
            const allBtn = document.querySelector('[data-filter="all"]');
            const hashtagBtn = document.querySelector('[data-filter="hashtag"]');
            if (allBtn) allBtn.classList.add('active');
            if (hashtagBtn) hashtagBtn.classList.remove('active');
            filteredPosts = posts;
        }
    }
    
    console.log('필터링된 포스트:', filteredPosts);
    console.log('필터링된 포스트 수:', filteredPosts.length);
    
    if (filteredPosts.length === 0) {
        console.log('포스트가 없음 - 빈 상태 표시');
        container.innerHTML = `
            <div class="loading">
                ${currentFilter === 'all' ? '아직 저장된 학습 내용이 없습니다.' : '해당 해시태그의 학습 내용이 없습니다.'}
            </div>
        `;
        console.log('빈 상태 HTML 삽입 완료');
        return;
    }
    
    console.log('포스트 HTML 생성 시작');
    const postsHTML = filteredPosts.map(post => createPostHTML(post)).join('');
    console.log('생성된 HTML 길이:', postsHTML.length);
    console.log('생성된 HTML 미리보기:', postsHTML.substring(0, 200) + '...');
    
    container.innerHTML = postsHTML;
    console.log('컨테이너에 HTML 삽입 완료');
    
    // 생성된 포스트 요소들 확인
    const postElements = container.querySelectorAll('.post');
    console.log('생성된 포스트 요소 수:', postElements.length);
    
    // 이미지 클릭 이벤트 추가
    setupImageModal();
    console.log('이미지 모달 설정 완료');
    
    console.log('=== renderPosts 완료 ===');
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
    console.log('savePosts 호출됨');
    console.log('저장할 포스트:', posts);
    
    try {
        // 포스트 데이터 검증
        if (!Array.isArray(posts)) {
            console.error('posts가 배열이 아닙니다:', posts);
            posts = [];
        }
        
        // 각 포스트의 필수 필드 검증
        const validPosts = posts.filter(post => {
            if (!post || typeof post !== 'object') {
                console.error('잘못된 포스트 객체:', post);
                return false;
            }
            
            if (!post.id || !post.title || !post.date || !post.content) {
                console.error('필수 필드가 누락된 포스트:', post);
                return false;
            }
            
            return true;
        });
        
        console.log('검증된 포스트:', validPosts);
        
        const postsJSON = JSON.stringify(validPosts);
        console.log('JSON 문자열 길이:', postsJSON.length);
        
        // 로컬 스토리지 용량 확인
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (postsJSON.length > maxSize) {
            console.error('로컬 스토리지 용량 초과:', postsJSON.length, 'bytes');
            showNotification('저장할 데이터가 너무 큽니다. 일부 이미지를 제거해주세요.', 'error');
            return;
        }
        
        localStorage.setItem('til_posts', postsJSON);
        console.log('로컬 스토리지 저장 완료');
        
        // 저장 확인
        const savedPosts = localStorage.getItem('til_posts');
        console.log('저장 확인 - 로컬 스토리지에서 읽어온 데이터:', savedPosts);
        
        if (savedPosts) {
            const parsedPosts = JSON.parse(savedPosts);
            console.log('파싱된 저장된 포스트:', parsedPosts);
            
            // 저장된 데이터와 원본 데이터 비교
            if (JSON.stringify(parsedPosts) !== JSON.stringify(validPosts)) {
                console.error('저장된 데이터와 원본 데이터가 다릅니다');
                showNotification('데이터 저장 중 오류가 발생했습니다.', 'error');
            } else {
                console.log('데이터 저장 검증 완료');
            }
        }
        
        // posts 배열 업데이트
        posts = validPosts;
        
    } catch (error) {
        console.error('포스트 저장 중 오류:', error);
        console.error('오류 상세 정보:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        // 오류 유형별 처리
        if (error.name === 'QuotaExceededError') {
            showNotification('브라우저 저장 공간이 부족합니다. 일부 데이터를 삭제해주세요.', 'error');
        } else if (error.name === 'TypeError') {
            showNotification('데이터 형식 오류가 발생했습니다. 페이지를 새로고침해주세요.', 'error');
        } else {
            showNotification('포스트 저장 중 오류가 발생했습니다: ' + error.message, 'error');
        }
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
        if (form && form.style.display !== 'none') {
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
    
    // 기존 표시기 제거
    const existingIndicator = document.querySelector('.owner-mode-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    if (ownerMode) {
        btn.classList.add('owner-on');
        btn.textContent = '소유자 모드 ON';
        addSection.style.display = 'block';
        
        // 소유자 모드 표시기 추가
        const indicator = document.createElement('div');
        indicator.className = 'owner-mode-indicator';
        indicator.innerHTML = `
            <i class="fas fa-crown"></i>
            소유자 모드 활성화
        `;
        document.body.appendChild(indicator);
        
        showNotification('소유자 모드가 활성화되었습니다!', 'success');
    } else {
        btn.classList.remove('owner-on');
        btn.textContent = '소유자 모드';
        addSection.style.display = 'none';
        const form = document.getElementById('addPostForm');
        if (form && form.style.display !== 'none') toggleAddPost();
        
        showNotification('소유자 모드가 비활성화되었습니다.', 'info');
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
    const titleInput = document.getElementById('title');
    const dateInput = document.getElementById('date');
    const contentInput = document.getElementById('content');
    
    if (titleInput) titleInput.value = post.title;
    if (dateInput) dateInput.value = post.date;
    if (contentInput) contentInput.value = post.content;
    
    hashtags = [...post.hashtags];
    renderHashtags();
    
    // 이미지 채우기
    uploadedImages = post.images.map(img => ({ src: img.src }));
    imageDescriptions = {};
    post.images.forEach((img, idx) => imageDescriptions[idx] = img.description || '');
    renderImagePreview();
    
    // 편집 모드 표시
    const form = document.getElementById('postForm');
    if (form) form.setAttribute('data-editing-id', String(post.id));
    
    // 폼 열기
    const addForm = document.getElementById('addPostForm');
    if (addForm && addForm.style.display === 'none') toggleAddPost();
    if (addForm) addForm.scrollIntoView({ behavior: 'smooth' });
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
