// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', () => {
    const username = Cookies.get('username');
    if (!username) {
        window.location.href = 'login.html';
        return;
    }
    
    // عرض معلومات المعلم
    displayTeacherInfo();
});

// عرض معلومات المعلم
function displayTeacherInfo() {
    document.getElementById('teacherName').textContent = Cookies.get('teacherName') || '';
    document.getElementById('teacherPhone').textContent = Cookies.get('teacherPhone') || '';
    document.getElementById('teacherPosition').textContent = Cookies.get('teacherPosition') || '';
    document.getElementById('teacherSpecialization').textContent = Cookies.get('teacherSpecialization') || '';
}

// تسجيل الخروج
function logout() {
    // حذف جميع الكوكيز
    Cookies.remove('username');
    Cookies.remove('password');
    Cookies.remove('teacherName');
    Cookies.remove('teacherPhone');
    Cookies.remove('teacherPosition');
    Cookies.remove('teacherSpecialization');
    
    window.location.href = 'login.html';
}

// معالجة ملفات Excel
function handleFiles(files) {
    if (files.length) {
        const file = files[0];
        const reader = new FileReader();
        
        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            const classNames = workbook.SheetNames;
            updateClassSelect(classNames);
            
            workbook.SheetNames.forEach(sheetName => {
                const worksheet = workbook.Sheets[sheetName];
                const sheetData = XLSX.utils.sheet_to_json(worksheet);
                students[sheetName] = sheetData;
            });
        };
        
        reader.readAsArrayBuffer(file);
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
document.getElementById('classSelect').addEventListener('change', (e) => {
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
document.getElementById('selectAll').addEventListener('change', (e) => {
    const checkboxes = document.querySelectorAll('.student-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = e.target.checked;
    });
});

// تحديث متغير الحدث
function updateEventVariable() {
    currentEvent = document.getElementById('eventInput').value;
}

// إدراج متغير في نص الرسالة
function insertVariable(variable) {
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
}

// إرسال الرسائل
async function sendMessages() {
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
}

// استبدال المتغيرات في نص الرسالة
function replaceVariables(template, variables) {
    let message = template;
    for (const [key, value] of Object.entries(variables)) {
        message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return message;
}

// إرسال رسالة واتساب
async function sendWhatsAppMessage(phone, message) {
    const accountSid = 'AC30f8388777afe643e27075357a0d0e0d';
    const authToken = '92f161ab047545492af766e3fee1a19d';
    
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
                'Body': message
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw error;
    }
}