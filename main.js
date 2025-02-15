// Import dependencies
const XLSX = window.XLSX;
const Cookies = window.Cookies;

let students = {};
let currentEvent = '';

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', async () => {
    const username = Cookies.get('username');
    if (!username) {
        window.location.href = 'login.html';
        return;
    }

    // قراءة ملفات الطلاب تلقائياً
    await loadClassFiles();
});

// قراءة ملفات الصفوف تلقائياً
async function loadClassFiles() {
    try {
        const classFiles = [
            './Data/Classes/الصف الأول.xlsx',
            './Data/Classes/الصف الثاني.xlsx',
            './Data/Classes/الصف الثالث.xlsx'
        ];

        for (const filePath of classFiles) {
            try {
                const response = await fetch(filePath);
                if (response.ok) {
                    const data = await response.json();
                    const className = filePath.split('/').pop().replace('.xlsx', '');
                    students[className] = data;
                }
            } catch (error) {
                console.error(`Error loading class file ${filePath}:`, error);
            }
        }

        // تحديث قائمة الصفوف
        updateClassSelect(Object.keys(students));
    } catch (error) {
        console.error('Error loading class files:', error);
    }
}

// تحديث قائمة الصفوف
function updateClassSelect(classNames) {
    const select = document.getElementById('classSelect');
    select.innerHTML = '<option value="">اختر الصف</option>';
    
    classNames.forEach(className => {
        const option = document.createElement('option');
        option.value = className;
        option.textContent = className;
        select.appendChild(option);
    });
}

// معالجة اختيار الصف
document.getElementById('classSelect')?.addEventListener('change', (e) => {
    const className = e.target.value;
    if (className) {
        updateStudentList(students[className]);
    }
});

// تحديث قائمة الطلاب
function updateStudentList(studentData) {
    const container = document.getElementById('studentList');
    container.innerHTML = '';
    
    studentData.forEach(student => {
        const div = document.createElement('div');
        div.className = 'flex items-center p-2 hover:bg-blue-50 rounded-lg transition-colors duration-200';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'student-checkbox ml-3';
        checkbox.value = student.id;
        
        const label = document.createElement('label');
        label.className = 'flex-1 cursor-pointer';
        label.textContent = `${student.name} - ${student.phone}`;
        
        div.appendChild(checkbox);
        div.appendChild(label);
        container.appendChild(div);
    });
}

// معالجة تحديد الكل
document.getElementById('selectAll')?.addEventListener('change', (e) => {
    const checkboxes = document.querySelectorAll('.student-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = e.target.checked;
    });
});

// تحديث متغير الحدث
window.updateEventVariable = function() {
    currentEvent = document.getElementById('eventInput').value;
};

// إدراج متغير في نص الرسالة
window.insertVariable = function(variable) {
    const textarea = document.getElementById('messageTemplate');
    const template = textarea.value;
    const cursorPos = textarea.selectionStart;
    
    const variableMap = {
        'studentName': '{{studentName}}',
        'teacherName': '{{teacherName}}',
        'className': '{{className}}',
        'date': '{{date}}',
        'event': '{{event}}',
        'time': '{{time}}'
    };
    
    const newText = template.slice(0, cursorPos) + 
                    variableMap[variable] + 
                    template.slice(cursorPos);
    
    textarea.value = newText;
    textarea.focus();
};

// إرسال الرسائل
window.sendMessages = async function() {
    const template = document.getElementById('messageTemplate').value;
    const className = document.getElementById('classSelect').value;
    const event = document.getElementById('eventInput').value;
    
    if (!event) {
        alert('الرجاء إدخال الحدث قبل إرسال الرسائل');
        return;
    }
    
    const selectedCheckboxes = document.querySelectorAll('.student-checkbox:checked');
    const selectedStudentIds = Array.from(selectedCheckboxes).map(cb => cb.value);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const studentId of selectedStudentIds) {
        const student = students[className].find(s => s.id === studentId);
        if (student) {
            const message = replaceVariables(template, {
                studentName: student.name,
                teacherName: Cookies.get('teacherName'),
                className: className,
                date: new Date().toLocaleDateString('ar-SA'),
                time: new Date().toLocaleTimeString('ar-SA'),
                event: event
            });
            
            try {
                await sendWhatsAppMessage(student.phone, message);
                successCount++;
            } catch (error) {
                console.error(`Error sending message to ${student.name}:`, error);
                failCount++;
            }
        }
    }
    
    alert(`تم إرسال ${successCount} رسالة بنجاح\nفشل إرسال ${failCount} رسالة`);
};

// استبدال المتغيرات في نص الرسالة
function replaceVariables(template, variables) {
    let message = template;
    for (const [key, value] of Object.entries(variables)) {
        message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return message;
}

// إرسال رسالة واتساب باستخدام Twilio
async function sendWhatsAppMessage(phone, message) {
    const accountSid = 'AC30f8388777afe643e27075357a0d0e0d';
    const authToken = '9da7ffe2cb2b28d9c6239d22572b5bc6';
    const templateSid = 'HXb5b62575e6e4ff6129ad7c8efe1f983e';
    
    try {
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'To': `whatsapp:+${phone}`,
                'From': 'whatsapp:+14155238886',
                'TemplateSid': templateSid,
                'ContentSid': templateSid,
                'ContentVariables': JSON.stringify({
                    "1": new Date().toLocaleDateString('ar-SA'),
                    "2": new Date().toLocaleTimeString('ar-SA', { hour: 'numeric', minute: 'numeric', hour12: true })
                }),
                'Body': message
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Twilio API error: ${errorData.message || response.statusText}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw error;
    }
}