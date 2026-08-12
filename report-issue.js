(function() {
    'use strict';

    // ==========================================
    // 1. حقن أكواد التصميم (CSS) ديناميكياً
    // ==========================================
    const style = document.createElement('style');
    style.textContent = `
        .report-issue-btn {
            display: inline-block;
            background-color: #dc2626 !important;
            color: #ffffff !important;
            padding: 4px 10px;
            margin: 0 8px;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: bold;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transition: background 0.2s, transform 0.1s;
            vertical-align: middle;
            font-family: inherit;
        }
        .report-issue-btn:hover {
            background-color: #b91c1c !important;
            transform: scale(1.05);
        }
        
        .ri-modal-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.7);
            z-index: 10000;
            display: none;
            justify-content: center;
            align-items: center;
            direction: rtl;
        }
        .ri-modal-overlay.active { display: flex; }
        
        .ri-modal-card {
            background: #ffffff !important;
            color: #000000 !important;
            width: 90%;
            max-width: 450px;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            text-align: right;
        }
        .ri-modal-header {
            font-size: 1.2rem;
            font-weight: bold;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
        }
        .ri-close-btn {
            background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #000 !important;
        }
        
        .ri-option-btn {
            display: block;
            width: 100%;
            background: #f8f9fa !important;
            color: #000000 !important;
            border: 1px solid #ddd !important;
            padding: 12px;
            margin-bottom: 10px;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            text-align: right;
            transition: background 0.2s;
        }
        .ri-option-btn:hover { background: #e2e8f0 !important; }
        
        .ri-action-container {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            margin-top: 20px;
        }
        .ri-yes-btn, .ri-tg-btn {
            flex: 1;
            background: #2563eb !important;
            color: #ffffff !important;
            border: none; padding: 10px; border-radius: 8px;
            font-weight: bold; cursor: pointer; text-align: center;
            text-decoration: none;
        }
        .ri-yes-btn:hover, .ri-tg-btn:hover { background: #1d4ed8 !important; }
        .ri-cancel-btn {
            flex: 1;
            background: #e2e8f0 !important;
            color: #000000 !important;
            border: none; padding: 10px; border-radius: 8px;
            font-weight: bold; cursor: pointer;
        }
        .ri-cancel-btn:hover { background: #cbd5e1 !important; }
        
        .ri-success-text {
            color: #16a34a !important;
            font-weight: bold;
            line-height: 1.6;
            text-align: center;
            margin-bottom: 15px;
        }
    `;
    document.head.appendChild(style);

    // ==========================================
    // 2. بناء هياكل النوافذ المنبثقة
    // ==========================================
    const modalsHTML = `
        <div class="ri-modal-overlay" id="ri-options-modal">
            <div class="ri-modal-card">
                <div class="ri-modal-header">
                    <span>سبب الإبلاغ</span>
                    <button class="ri-close-btn" onclick="document.getElementById('ri-options-modal').classList.remove('active')">✕</button>
                </div>
                <div id="ri-options-container"></div>
            </div>
        </div>

        <div class="ri-modal-overlay" id="ri-confirm-modal">
            <div class="ri-modal-card">
                <div class="ri-modal-header">تأكيد الإبلاغ</div>
                <p style="font-size: 1.1rem; margin-bottom: 20px;">هل أنت متأكد من رغبتك بالإبلاغ عن هذا السؤال ؟</p>
                <div class="ri-action-container">
                    <button class="ri-yes-btn" id="ri-confirm-yes">نعم</button>
                    <button class="ri-cancel-btn" onclick="document.getElementById('ri-confirm-modal').classList.remove('active')">إلغاء</button>
                </div>
            </div>
        </div>

        <div class="ri-modal-overlay" id="ri-success-modal">
            <div class="ri-modal-card">
                <div class="ri-modal-header">تم النسخ بنجاح</div>
                <div class="ri-success-text">
                    تم نسخ تفاصيل السؤال بنجاح!<br>سيتم نقلك الآن إلى مجموعة التيليجرام.<br>يرجى <b>لصق النص</b> هناك وإرساله.
                </div>
                <div class="ri-action-container">
                    <a href="https://t.me/tagrubah28" target="_blank" class="ri-tg-btn" id="ri-go-tg-btn">الانتقال إلى المجموعة 🚀</a>
                    <button class="ri-cancel-btn" onclick="document.getElementById('ri-success-modal').classList.remove('active')">إغلاق</button>
                </div>
            </div>
        </div>
    `;
    const modalsContainer = document.createElement('div');
    modalsContainer.innerHTML = modalsHTML;
    document.body.appendChild(modalsContainer);

    // ==========================================
    // 3. المنطق البرمجي وبيانات السؤال
    // ==========================================
    let currentReportedQuestion = null;
    let selectedErrorType = "";

    const errorOptions = [
        "خطأ في السؤال",
        "لا يوجد جواب صحيح",
        "يوجد أكثر من جواب صحيح",
        "خطأ في الـ Explanation",
        "خطأ آخر"
    ];

    const optionsContainer = document.getElementById('ri-options-container');
    errorOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'ri-option-btn';
        btn.textContent = opt;
        btn.onclick = () => {
            selectedErrorType = opt;
            document.getElementById('ri-options-modal').classList.remove('active');
            document.getElementById('ri-confirm-modal').classList.add('active');
        };
        optionsContainer.appendChild(btn);
    });

    // دالة متطورة لتنظيف النص مع الحفاظ على الأسطر الجديدة للأسئلة الطويلة
    function getCleanText(rawText) {
        if (!rawText) return "";
        let text = rawText.replace(/<br\s*[\/]?>/gi, "\n");
        text = text.replace(/<\/p>/gi, "\n");
        text = text.replace(/<\/div>/gi, "\n");
        const temp = document.createElement('div');
        temp.innerHTML = text;
        return (temp.textContent || temp.innerText || "").trim();
    }

    document.getElementById('ri-confirm-yes').onclick = () => {
        if (!currentReportedQuestion) return;

        let errorDetailsPhrase = "";
        switch (selectedErrorType) {
            case "خطأ في السؤال": errorDetailsPhrase = "نَص السؤال"; break;
            case "لا يوجد جواب صحيح": errorDetailsPhrase = "الخيارات فلا يوجد فيها جواب صحيح"; break;
            case "يوجد أكثر من جواب صحيح": errorDetailsPhrase = "الخيارات فهناك أكثر من جواب صحيح"; break;
            case "خطأ في الـ Explanation": errorDetailsPhrase = "الـ Explanation"; break;
            case "خطأ آخر": errorDetailsPhrase = "(   )"; break;
        }

        let finalSubjectName = currentReportedQuestion._extractedSubject || "غير محدد";
        let finalLectureName = currentReportedQuestion._extractedLecture || "غير محدد";

        let rawQuestionText = currentReportedQuestion.question || 
                              currentReportedQuestion.text || 
                              currentReportedQuestion.qText || 
                              currentReportedQuestion.content || 
                              "غير متوفر";
        let finalQuestionText = getCleanText(rawQuestionText);

        let optionsText = "";
        if (currentReportedQuestion.options && Array.isArray(currentReportedQuestion.options)) {
            optionsText = currentReportedQuestion.options.map(opt => `\n- ${getCleanText(opt)}`).join('');
        }

        let finalCorrectAnswer = getCleanText(currentReportedQuestion.correctAnswer) || "غير متوفر";
        let finalExplanation = getCleanText(currentReportedQuestion.explanation) || "لا يوجد توضيح";

        const telegramText = `السلام عليكم
أنا الان أقوم بحل امتحان في مادة "${finalSubjectName}" وواجهت سؤال من محاضرة "${finalLectureName}" وأظن أن هناك خطأ في "${errorDetailsPhrase}" ، وهذا هو السؤال :
نَص السؤال :
${finalQuestionText}

الخيارات :${optionsText}

الجواب الصحيح :
${finalCorrectAnswer}

التوضيح :
${finalExplanation}

أرجو التأكد من ذلك ، وجزاكم الله خيرًا .`;

        navigator.clipboard.writeText(telegramText).then(() => {
            document.getElementById('ri-confirm-modal').classList.remove('active');
            document.getElementById('ri-success-modal').classList.add('active');
        }).catch(err => {
            alert("حدث خطأ أثناء نسخ النص، يرجى المحاولة مرة أخرى.");
        });
    };

    document.getElementById('ri-go-tg-btn').onclick = () => {
        document.getElementById('ri-success-modal').classList.remove('active');
    };

    // ==========================================
    // 4. مراقب الحقن الذكي واستخراج البيانات من زر الموقع
    // ==========================================
    function injectReportButtons() {
        const favBtns = document.querySelectorAll('button[onclick*="toggleFavorite"]');
        
        favBtns.forEach(favBtn => {
            const parentContainer = favBtn.parentNode;
            
            if (parentContainer && !parentContainer.querySelector('.report-issue-btn')) {
                const match = favBtn.getAttribute('onclick').match(/'([^']+)'/);
                
                if (match) {
                    const qId = match[1];
                    
                    const reportBtn = document.createElement('button');
                    reportBtn.className = 'report-issue-btn';
                    reportBtn.textContent = 'الإبلاغ عن خطأ !';
                    reportBtn.title = 'الإبلاغ عن خطأ في هذا السؤال';
                    
                    reportBtn.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation(); 
                        
                        currentReportedQuestion = null;

                        // سحب بيانات السؤال الأساسية
                        if (typeof state !== 'undefined') {
                            if (state.currentExam && state.currentExam.questions) {
                                currentReportedQuestion = state.currentExam.questions.find(q => q.id === qId);
                            }
                            if (!currentReportedQuestion && state.allQuestions) {
                                currentReportedQuestion = state.allQuestions.find(q => q.id === qId);
                            }
                        }
                        
                        if (!currentReportedQuestion) {
                            currentReportedQuestion = { id: qId };
                        }

                        // ==========================================
                        // الماسح الذكي للبحث عن زر الموقع في كامل المربع
                        // ==========================================
                        currentReportedQuestion._extractedSubject = "غير محدد";
                        currentReportedQuestion._extractedLecture = "غير محدد";
                        
                        let currentSearchElement = favBtn.parentElement;
                        let foundLocationBtn = false;
                        
                        // نرجع للخلف في هيكل الـ HTML (حتى 7 مستويات) لنغطي كامل مربع السؤال
                        for (let i = 0; i < 7; i++) {
                            if (!currentSearchElement || currentSearchElement === document.body) break;
                            
                            // نجلب كل الأزرار داخل هذا المستوى
                            const allBtnsInContainer = currentSearchElement.querySelectorAll('button');
                            
                            for (let btn of allBtnsInContainer) {
                                const onclickText = btn.getAttribute('onclick') || "";
                                
                                // نتأكد أن الزر ليس زر مفضلة أو علم أو زر الإبلاغ نفسه
                                if (onclickText && !onclickText.includes('toggleFavorite') && !onclickText.includes('toggleFlag') && !onclickText.includes('الإبلاغ')) {
                                    
                                    // نستخرج جميع النصوص الموجودة بين علامتي تنصيص
                                    const matches = [...onclickText.matchAll(/['"]([^'"]+)['"]/g)].map(m => m[1]);
                                    
                                    // نتجاهل الـ ID وأي نصوص فارغة
                                    const validMatches = matches.filter(m => m !== qId && m.trim().length > 1);
                                    
                                    // إذا وجدنا نصين على الأقل، فهما بالتأكيد المادة والمحاضرة
                                    if (validMatches.length >= 2) {
                                        currentReportedQuestion._extractedSubject = validMatches[0].trim();
                                        currentReportedQuestion._extractedLecture = validMatches[1].trim();
                                        foundLocationBtn = true;
                                        break; // نوقف البحث في الأزرار
                                    }
                                }
                            }
                            if (foundLocationBtn) break; // نوقف البحث في المستويات إذا وجدنا المطلوب
                            
                            currentSearchElement = currentSearchElement.parentElement; // ننتقل للمستوى الأعلى
                        }

                        // في حال فشل الماسح (نادرة)، نلجأ كحل أخير لبيانات السؤال الخفية
                        if (!foundLocationBtn) {
                            currentReportedQuestion._extractedSubject = currentReportedQuestion.folderName || currentReportedQuestion.subject || currentReportedQuestion.course || "غير محدد";
                            currentReportedQuestion._extractedLecture = currentReportedQuestion.txtFileName || currentReportedQuestion.fileName || currentReportedQuestion.source || currentReportedQuestion.lecture || "غير محدد";
                        }

                        document.getElementById('ri-options-modal').classList.add('active');
                    };

                    parentContainer.appendChild(reportBtn);
                }
            }
        });
    }

    const observer = new MutationObserver(() => {
        injectReportButtons();
    });
    
    document.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.body, { childList: true, subtree: true });
        injectReportButtons();
    });

})();
