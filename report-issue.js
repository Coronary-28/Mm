(function() {
    'use strict';

    // ==========================================
    // 1. حقن أكواد التصميم (CSS) ديناميكياً
    // ==========================================
    const style = document.createElement('style');
    style.textContent = `
        /* زر الإبلاغ عن خطأ بجانب الأزرار الأخرى */
        .report-issue-btn {
            display: inline-block;
            background-color: #dc2626 !important; /* لون أحمر */
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
        
        /* تنسيقات النوافذ المنبثقة وثبات الألوان */
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
        
        /* أزرار خيارات الإبلاغ */
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
        
        /* أزرار التأكيد والانتقال */
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

        let subjectName = (typeof state !== 'undefined' && state.currentExam && state.currentExam.folderName) ? state.currentExam.folderName : "غير محدد";
        let lectureName = (typeof state !== 'undefined' && state.currentExam && state.currentExam.txtFileName) ? state.currentExam.txtFileName : (currentReportedQuestion.source || "غير محدد");

        let optionsText = "";
        if (currentReportedQuestion.options && Array.isArray(currentReportedQuestion.options)) {
            optionsText = currentReportedQuestion.options.map(opt => `\n- ${opt}`).join('');
        }

        const telegramText = `السلام عليكم
أنا الان أقوم بحل امتحان في مادة "${subjectName}" وواجهت سؤال من محاضرة "${lectureName}" وأظن أن هناك خطأ في "${errorDetailsPhrase}"

، وهذا هو السؤال :

نص السؤال :
${currentReportedQuestion.question || "غير متوفر"}

الخيارات :${optionsText}

الجواب الصحيح :
${currentReportedQuestion.correctAnswer || "غير متوفر"}

التوضيح :
${currentReportedQuestion.explanation || "لا يوجد توضيح"}`;

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
    // 4. مراقب الحقن الذكي (يعتمد على زر المفضلة)
    // ==========================================
    function injectReportButtons() {
        // نبحث عن كل أزرار المفضلة في الصفحة لأنها تظهر دائماً مع السؤال
        const favBtns = document.querySelectorAll('button[onclick*="toggleFavorite"]');
        
        favBtns.forEach(favBtn => {
            const parentContainer = favBtn.parentNode;
            
            // إذا لم نضف زر الإبلاغ في هذه الحاوية من قبل
            if (parentContainer && !parentContainer.querySelector('.report-issue-btn')) {
                
                // استخراج ID السؤال من وظيفة المفضلة: toggleFavorite('qId')
                const match = favBtn.getAttribute('onclick').match(/'([^']+)'/);
                
                if (match) {
                    const qId = match[1];
                    
                    const reportBtn = document.createElement('button');
                    reportBtn.className = 'report-issue-btn';
                    reportBtn.textContent = 'الإبلاغ عن خطأ !';
                    reportBtn.title = 'الإبلاغ عن خطأ في هذا السؤال';
                    
                    reportBtn.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation(); // منع تفعيل أزرار أخرى
                        
                        // محاولة إيجاد السؤال بناءً على الـ ID المستخرج
                        currentReportedQuestion = null;
                        if (typeof state !== 'undefined') {
                            // البحث في أسئلة الامتحان الحالي
                            if (state.currentExam && state.currentExam.questions) {
                                currentReportedQuestion = state.currentExam.questions.find(q => q.id === qId);
                            }
                            // البحث في كل الأسئلة (في حال كنا في وضع البحث)
                            if (!currentReportedQuestion && state.allQuestions) {
                                currentReportedQuestion = state.allQuestions.find(q => q.id === qId);
                            }
                        }
                        
                        // في حال لم يتم العثور على بيانات السؤال (حالة نادرة)
                        if (!currentReportedQuestion) {
                            currentReportedQuestion = { 
                                id: qId, 
                                question: "لم يتمكن النظام من جلب نص السؤال تلقائياً. (رقم السؤال: " + qId + ")" 
                            };
                        }
                        
                        document.getElementById('ri-options-modal').classList.add('active');
                    };

                    // إدراج زر الإبلاغ بجانب زر المفضلة مباشرة
                    parentContainer.appendChild(reportBtn);
                }
            }
        });
    }

    // مراقبة أي تغيير في الصفحة (مثل تحميل أسئلة جديدة أو فتح البحث)
    const observer = new MutationObserver(() => {
        injectReportButtons();
    });
    
    document.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.body, { childList: true, subtree: true });
        injectReportButtons();
    });

})();
