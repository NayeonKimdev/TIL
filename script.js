// 전역 변수
let posts = JSON.parse(localStorage.getItem('til_posts')) || [];

// DOM이 로드되면 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('TIL 앱 시작');
    initializeApp();
    setupEventListeners();
    renderPosts();
});

// 앱 초기화
function initializeApp() {
    console.log('앱 초기화');
    
    // 오늘 날짜를 기본값으로 설정
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    // 샘플 데이터가 없으면 추가
    if (posts.length === 0) {
        addSampleData();
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 폼 제출 이벤트
    const postForm = document.getElementById('postForm');
    if (postForm) {
        postForm.addEventListener('submit', handleFormSubmit);
    }
    
    // 모달 배경 클릭으로 닫기
    const modal = document.getElementById('postModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closePostModal();
            }
        });
    }
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePostModal();
        }
    });
}

// 샘플 데이터 추가
function addSampleData() {
    const samplePosts = [
        {
            id: 1,
            title: 'JavaScript 기본 문법',
            content: '오늘 JavaScript의 기본 문법을 학습했습니다. 변수 선언, 함수 정의, 조건문과 반복문에 대해 배웠습니다.',
            date: '2024-01-15',
            hashtags: ['javascript', '기초', '문법']
        },
        {
            id: 2,
            title: 'CSS Flexbox 레이아웃',
            content: 'CSS Flexbox를 사용하여 반응형 레이아웃을 만드는 방법을 학습했습니다. justify-content, align-items 속성의 활용법을 익혔습니다.',
            date: '2024-01-14',
            hashtags: ['css', 'flexbox', '레이아웃']
        }
    ];
    
    posts = samplePosts;
    savePosts();
    console.log('샘플 데이터 추가 완료');
}

// 모달 열기
function openPostModal() {
    const modal = document.getElementById('postModal');
    if (modal) {
        modal.style.display = 'block';
        // 폼 초기화
        const form = document.getElementById('postForm');
        if (form) {
            form.reset();
            // 날짜를 오늘로 설정
            const dateInput = document.getElementById('date');
            if (dateInput) {
                dateInput.value = new Date().toISOString().split('T')[0];
            }
        }
    }
}

// 모달 닫기
function closePostModal() {
    const modal = document.getElementById('postModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 폼 제출 처리
function handleFormSubmit(e) {
    e.preventDefault();
    console.log('폼 제출 처리 시작');
    
    try {
        const formData = new FormData(e.target);
        const title = formData.get('title').trim();
        const content = formData.get('content').trim();
        const date = formData.get('date');
        const hashtagsInput = formData.get('hashtags').trim();
        
        // 필수 필드 검증
        if (!title || !content || !date) {
            showNotification('제목, 내용, 날짜를 모두 입력해주세요.', 'error');
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
            date: date,
            hashtags: hashtags
        };
        
        console.log('새 포스트:', newPost);
        
        // 포스트 배열에 추가 (최신순)
        posts.unshift(newPost);
        
        // 로컬 스토리지에 저장
        savePosts();
        
        // 화면 업데이트
        renderPosts();
        
        // 모달 닫기
        closePostModal();
        
        // 성공 알림
        showNotification('글이 성공적으로 업로드되었습니다!', 'success');
        
    } catch (error) {
        console.error('폼 제출 처리 중 오류:', error);
        showNotification('글 업로드 중 오류가 발생했습니다.', 'error');
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
                <p>첫 번째 학습 내용을 작성해보세요!</p>
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
    
    return `
        <article class="post">
            <div class="post-header">
                <h3 class="post-title">${post.title}</h3>
                <div class="post-date">${formatDate(post.date)}</div>
            </div>
            <div class="post-content">${post.content}</div>
            ${hashtagsHTML}
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

// 로컬 스토리지에 저장
function savePosts() {
    try {
        localStorage.setItem('til_posts', JSON.stringify(posts));
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
    const bgColor = type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
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
