// DOM Elements
const themeToggleBtn = document.getElementById('theme-toggle');
const themeStatus = document.getElementById('theme-status');
const actionBtn = document.getElementById('btn');
const clickCounter = document.getElementById('click-counter');

// 1. Theme Toggle Logic with Persistence
const getSystemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
const getStoredTheme = () => localStorage.getItem('theme');
const setStoredTheme = (theme) => localStorage.setItem('theme', theme);

// Apply Theme
const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update labels
    if (theme === 'dark') {
        themeStatus.textContent = '다크 모드';
    } else {
        themeStatus.textContent = '라이트 모드';
    }
};

// Initial Theme Load
let currentTheme = getStoredTheme() || getSystemTheme();
applyTheme(currentTheme);

// Toggle Event
themeToggleBtn.addEventListener('click', () => {
    const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    setStoredTheme(nextTheme);
    
    // Play subtle audio/vibration feedback if supported
    if (navigator.vibrate) {
        navigator.vibrate(10);
    }
});

// 2. Interactive Counter Logic
let count = parseInt(localStorage.getItem('interactionCount')) || 0;
clickCounter.textContent = count;

actionBtn.addEventListener('click', () => {
    count++;
    clickCounter.textContent = count;
    localStorage.setItem('interactionCount', count);

    // Button micro-interaction: transient scaling
    actionBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        actionBtn.style.transform = 'none';
    }, 100);

    // Create custom particle burst effect for micro-animation
    createParticleBurst();
});

// Extra Micro-animation: Click particle burst
function createParticleBurst() {
    const rect = actionBtn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        document.body.appendChild(particle);
        
        const angle = Math.random() * Math.PI * 2;
        const velocity = 2 + Math.random() * 4;
        const destinationX = (Math.cos(angle) * velocity * 15);
        const destinationY = (Math.sin(angle) * velocity * 15);
        
        particle.style.position = 'fixed';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.width = '6px';
        particle.style.height = '6px';
        particle.style.borderRadius = '50%';
        particle.style.backgroundColor = 'var(--primary)';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        
        const animation = particle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${destinationX}px, ${destinationY}px) scale(0)`, opacity: 0 }
        ], {
            duration: 600 + Math.random() * 400,
            easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)'
        });
        
        animation.onfinish = () => particle.remove();
    }
}

// 3. Formspree Form Submission Logic
const inquiryForm = document.getElementById('inquiry-form');
const formStatus = document.getElementById('form-status');
const formSubmitBtn = document.getElementById('form-submit-btn');
const formSubmitBtnText = formSubmitBtn.querySelector('span');

inquiryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    // Set loading state
    formSubmitBtn.disabled = true;
    formSubmitBtnText.textContent = '전송 중...';
    formStatus.className = 'form-status';
    formStatus.style.display = 'none';

    const formData = new FormData(inquiryForm);
    
    try {
        const response = await fetch(inquiryForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            formStatus.textContent = '제휴 문의가 성공적으로 전송되었습니다! 🚀';
            formStatus.className = 'form-status success';
            inquiryForm.reset();
        } else {
            const data = await response.json();
            if (data.errors && data.errors.length > 0) {
                formStatus.textContent = data.errors.map(error => error.message).join(", ");
            } else {
                formStatus.textContent = '전송에 실패했습니다. 다시 시도해 주세요.';
            }
            formStatus.className = 'form-status error';
        }
    } catch (error) {
        formStatus.textContent = '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해 주세요.';
        formStatus.className = 'form-status error';
    } finally {
        formSubmitBtn.disabled = false;
        formSubmitBtnText.textContent = '문의 보내기';
    }
});

// 4. Disqus Comments Loader
const DISQUS_SHORTNAME = 'alsktv'; // Disqus shortname

(function() {
    if (!document.getElementById('disqus_thread')) return;
    
    window.disqus_config = function () {
        this.page.url = window.location.href;
        this.page.identifier = window.location.pathname || '/';
    };
    
    const d = document;
    const s = d.createElement('script');
    s.src = `https://${DISQUS_SHORTNAME}.disqus.com/embed.js`;
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
})();

// 5. Teachable Machine AI Image Classifier
const TM_MODEL_URL = "https://teachablemachine.withgoogle.com/models/V0L6hDWFn/";

let tmModel = null;
const modelStatus = document.getElementById('model-status');
const dropzone = document.getElementById('dropzone');
const imageUpload = document.getElementById('image-upload');
const dropzoneDefault = document.getElementById('dropzone-default');
const previewContainer = document.getElementById('preview-container');
const imagePreview = document.getElementById('image-preview');
const removeImgBtn = document.getElementById('remove-img-btn');
const classifierResults = document.getElementById('classifier-results');
const resultBars = document.getElementById('result-bars');

// Load the Teachable Machine Model
async function loadTeachableMachineModel() {
    try {
        const modelURL = TM_MODEL_URL + "model.json";
        const metadataURL = TM_MODEL_URL + "metadata.json";
        
        // Load the model and metadata
        tmModel = await tmImage.load(modelURL, metadataURL);
        
        modelStatus.textContent = "준비 완료";
        modelStatus.style.background = 'rgba(16, 185, 129, 0.15)';
        modelStatus.style.color = 'var(--accent)';
    } catch (error) {
        console.error("Model loading failed:", error);
        modelStatus.textContent = "로드 실패";
        modelStatus.style.background = 'rgba(239, 68, 68, 0.15)';
        modelStatus.style.color = '#ef4444';
    }
}

// Initialize Model Load
loadTeachableMachineModel();

// Dropzone Click Trigger
dropzone.addEventListener('click', (e) => {
    if (e.target === removeImgBtn || removeImgBtn.contains(e.target)) return;
    imageUpload.click();
});

// Drag and Drop Events
['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
    }, false);
});

dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
        handleImageFile(files[0]);
    }
});

imageUpload.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleImageFile(e.target.files[0]);
    }
});

// Remove Image Event
removeImgBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    resetClassifier();
});

// Handle File Processing
function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드할 수 있습니다.');
        return;
    }
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        imagePreview.src = reader.result;
        dropzoneDefault.style.display = 'none';
        previewContainer.style.display = 'flex';
        
        if (tmModel) {
            runPrediction();
        } else {
            alert('AI 모델이 아직 로드되지 않았습니다. 잠시 후 다시 시도해 주세요.');
        }
    };
}

// Run Teachable Machine Prediction
async function runPrediction() {
    classifierResults.style.display = 'block';
    resultBars.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">AI 분석 중...</p>';
    
    await new Promise((resolve) => {
        if (imagePreview.complete) {
            resolve();
        } else {
            imagePreview.onload = resolve;
        }
    });

    try {
        const predictions = await tmModel.predict(imagePreview);
        
        resultBars.innerHTML = '';
        
        predictions.forEach(prediction => {
            const percentage = (prediction.probability * 100).toFixed(1);
            
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.innerHTML = `
                <div class="result-label">
                    <span class="class-name">${prediction.className}</span>
                    <span class="class-percentage">${percentage}%</span>
                </div>
                <div class="progress-track">
                    <div class="progress-bar" style="width: 0%"></div>
                </div>
            `;
            
            resultBars.appendChild(resultItem);
            
            setTimeout(() => {
                const bar = resultItem.querySelector('.progress-bar');
                bar.style.width = `${percentage}%`;
            }, 50);
        });
        
    } catch (error) {
        console.error("Prediction failed:", error);
        resultBars.innerHTML = '<p style="text-align: center; color: #ef4444;">분석 실패: 모델 에러</p>';
    }
}

// Reset Classifier
function resetClassifier() {
    imageUpload.value = '';
    imagePreview.src = '';
    previewContainer.style.display = 'none';
    dropzoneDefault.style.display = 'flex';
    classifierResults.style.display = 'none';
    resultBars.innerHTML = '';
}