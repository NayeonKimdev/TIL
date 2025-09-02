const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// 데이터 파일 경로
const dataFile = path.join(__dirname, 'data', 'posts.json');

// 데이터 디렉토리 생성
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// 초기 데이터 파일 생성
if (!fs.existsSync(dataFile)) {
    const initialData = [
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
    fs.writeFileSync(dataFile, JSON.stringify(initialData, null, 2));
}

// 데이터 읽기 함수
function readPosts() {
    try {
        const data = fs.readFileSync(dataFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('데이터 읽기 오류:', error);
        return [];
    }
}

// 데이터 쓰기 함수
function writePosts(posts) {
    try {
        fs.writeFileSync(dataFile, JSON.stringify(posts, null, 2));
        return true;
    } catch (error) {
        console.error('데이터 쓰기 오류:', error);
        return false;
    }
}

// 라우트 설정

// 메인 페이지
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 모든 포스트 조회
app.get('/api/posts', (req, res) => {
    try {
        const posts = readPosts();
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: '포스트 조회 중 오류가 발생했습니다.' });
    }
});

// 새 포스트 생성
app.post('/api/posts', (req, res) => {
    try {
        const { title, content, date, hashtags } = req.body;
        
        // 필수 필드 검증
        if (!title || !content || !date) {
            return res.status(400).json({ error: '제목, 내용, 날짜는 필수입니다.' });
        }
        
        const posts = readPosts();
        const newPost = {
            id: Date.now(),
            title: title.trim(),
            content: content.trim(),
            date: date,
            hashtags: hashtags || []
        };
        
        posts.unshift(newPost);
        
        if (writePosts(posts)) {
            res.status(201).json(newPost);
        } else {
            res.status(500).json({ error: '포스트 저장 중 오류가 발생했습니다.' });
        }
    } catch (error) {
        res.status(500).json({ error: '포스트 생성 중 오류가 발생했습니다.' });
    }
});

// 포스트 삭제
app.delete('/api/posts/:id', (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const posts = readPosts();
        const filteredPosts = posts.filter(post => post.id !== postId);
        
        if (posts.length === filteredPosts.length) {
            return res.status(404).json({ error: '해당 포스트를 찾을 수 없습니다.' });
        }
        
        if (writePosts(filteredPosts)) {
            res.json({ message: '포스트가 삭제되었습니다.' });
        } else {
            res.status(500).json({ error: '포스트 삭제 중 오류가 발생했습니다.' });
        }
    } catch (error) {
        res.status(500).json({ error: '포스트 삭제 중 오류가 발생했습니다.' });
    }
});

// 포스트 수정
app.put('/api/posts/:id', (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const { title, content, date, hashtags } = req.body;
        
        // 필수 필드 검증
        if (!title || !content || !date) {
            return res.status(400).json({ error: '제목, 내용, 날짜는 필수입니다.' });
        }
        
        const posts = readPosts();
        const postIndex = posts.findIndex(post => post.id === postId);
        
        if (postIndex === -1) {
            return res.status(404).json({ error: '해당 포스트를 찾을 수 없습니다.' });
        }
        
        posts[postIndex] = {
            ...posts[postIndex],
            title: title.trim(),
            content: content.trim(),
            date: date,
            hashtags: hashtags || []
        };
        
        if (writePosts(posts)) {
            res.json(posts[postIndex]);
        } else {
            res.status(500).json({ error: '포스트 수정 중 오류가 발생했습니다.' });
        }
    } catch (error) {
        res.status(500).json({ error: '포스트 수정 중 오류가 발생했습니다.' });
    }
});

// 해시태그로 포스트 검색
app.get('/api/posts/search', (req, res) => {
    try {
        const { hashtag } = req.query;
        
        if (!hashtag) {
            return res.status(400).json({ error: '검색할 해시태그를 입력해주세요.' });
        }
        
        const posts = readPosts();
        const filteredPosts = posts.filter(post => 
            post.hashtags && post.hashtags.some(tag => 
                tag.toLowerCase().includes(hashtag.toLowerCase())
            )
        );
        
        res.json(filteredPosts);
    } catch (error) {
        res.status(500).json({ error: '포스트 검색 중 오류가 발생했습니다.' });
    }
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`TIL 서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`http://localhost:${PORT} 에서 확인하세요.`);
});
