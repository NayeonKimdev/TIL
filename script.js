// 전역 변수
let posts = JSON.parse(localStorage.getItem('til_posts')) || [];
let currentFilter = 'all';

// DOM이 로드되면 실행
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    renderPosts();
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
}

// 샘플 데이터 추가
function addSampleData() {
    const samplePosts = [
        {
            id: 1,
            title: 'React Hooks 완벽 가이드',
            category: 'frontend',
            date: '2024-01-15',
            content: '오늘 React Hooks에 대해 깊이 있게 학습했습니다. useState, useEffect, useContext, useReducer 등 다양한 훅들의 사용법과 실제 프로젝트에서의 활용 방법을 배웠습니다. 특히 커스텀 훅을 만드는 방법과 훅의 규칙에 대해 중점적으로 공부했습니다.',
            images: [
                'https://via.placeholder.com/400x300/667eea/ffffff?text=React+Hooks',
                'https://via.placeholder.com/400x300/764ba2/ffffff?text=useState+Example',
                'https://via.placeholder.com/400x300/667eea/ffffff?text=useEffect+Example'
            ]
        },
        {
            id: 2,
            title: 'Node.js Express 서버 구축',
            category: 'backend',
            date: '2024-01-14',
            content: 'Node.js와 Express를 사용해서 RESTful API 서버를 구축하는 방법을 학습했습니다. 미들웨어 설정, 라우팅, 에러 핸들링, 데이터베이스 연결 등 백엔드 개발의 핵심 개념들을 실습을 통해 익혔습니다.',
            images: [
                'https://via.placeholder.com/400x300/764ba2/ffffff?text=Node.js+Server',
                'https://via.placeholder.com/400x300/667eea/ffffff?text=Express+API'
            ]
        },
        {
            id: 3,
            title: '이진 탐색 트리 구현',
            category: 'algorithm',
            date: '2024-01-13',
            content: '이진 탐색 트리(Binary Search Tree)의 개념과 구현 방법을 학습했습니다. 삽입, 삭제, 검색 연산의 시간 복잡도와 균형 잡힌 트리의 중요성에 대해 이해했습니다.',
            images: [
                'https://via.placeholder.com/400x300/667eea/ffffff?text=Binary+Search+Tree',
                'https://via.placeholder.com/400x300/764ba2/ffffff?text=Tree+Traversal'
            ]
        }
    ];
    
    posts = samplePosts;
    savePosts();
}

// 폼 토글 함수
function toggleAddPost() {
    const form = document.getElementById('addPostForm');
    const isVisible = form.style.display !== 'none';
    
    if (isVisible) {
        form.style.display = 'none';
        document.getElementById('postForm').reset();
        document.getElementById('imagePreview').innerHTML = '';
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
    const category = formData.get('category');
    const date = formData.get('date');
    const content = formData.get('content');
    
    // 이미지 파일 처리
    const imageFiles = document.getElementById('images').files;
    const images = [];
    
    for (let file of imageFiles) {
        const reader = new FileReader();
        reader.onload = function(e) {
            images.push(e.target.result);
            
            // 모든 이미지가 로드되면 포스트 저장
            if (images.length === imageFiles.length) {
                savePost(title, category, date, content, images);
            }
        };
        reader.readAsDataURL(file);
    }
    
    // 이미지가 없는 경우 바로 저장
    if (imageFiles.length === 0) {
        savePost(title, category, date, content, images);
    }
}

// 포스트 저장
function savePost(title, category, date, content, images) {
    const newPost = {
        id: Date.now(),
        title,
        category,
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
    toggleAddPost();
    
    // 성공 메시지
    showNotification('학습 내용이 성공적으로 저장되었습니다!', 'success');
}

// 이미지 미리보기 처리
function handleImagePreview(e) {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';
    
    const files = e.target.files;
    
    for (let file of files) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = file.name;
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    }
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
    const filteredPosts = currentFilter === 'all' 
        ? posts 
        : posts.filter(post => post.category === currentFilter);
    
    if (filteredPosts.length === 0) {
        container.innerHTML = `
            <div class="loading">
                ${currentFilter === 'all' ? '아직 저장된 학습 내용이 없습니다.' : '해당 카테고리의 학습 내용이 없습니다.'}
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
    const categoryNames = {
        frontend: '프론트엔드',
        backend: '백엔드',
        algorithm: '알고리즘',
        other: '기타'
    };
    
    const imagesHTML = post.images.length > 0 
        ? `
            <div class="post-images">
                ${post.images.map((img, index) => `
                    <img src="${img}" alt="학습 이미지 ${index + 1}" class="post-image" data-index="${index}">
                `).join('')}
            </div>
        ` : '';
    
    return `
        <article class="post" data-category="${post.category}">
            <div class="post-header">
                <h2 class="post-title">${post.title}</h2>
                <div class="post-meta">
                    <span class="post-category">${categoryNames[post.category]}</span>
                    <span class="post-date">${formatDate(post.date)}</span>
                </div>
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
            showImageModal(this.src);
        });
    });
}

// 이미지 모달 표시
function showImageModal(imageSrc) {
    // 기존 모달 제거
    const existingModal = document.querySelector('.modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // 새 모달 생성
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="closeImageModal()">&times;</button>
            <img src="${imageSrc}" alt="확대된 이미지" class="modal-image">
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
        background: ${type === 'success' ? '#28a745' : '#007bff'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 3000;
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
