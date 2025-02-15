// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', () => {
    const savedUsername = Cookies.get('username');
    const savedPassword = Cookies.get('password');
    
    if (savedUsername && savedPassword) {
        document.getElementById('username').value = savedUsername;
        document.getElementById('password').value = savedPassword;
        login();
    }
});

// تسجيل الدخول
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    
    if (!username || !password) {
        errorMessage.innerHTML = '<i class="fas fa-exclamation-circle ml-2"></i>الرجاء إدخال اسم المستخدم وكلمة المرور';
        errorMessage.classList.remove('hidden');
        return;
    }
    
    try {
        // محاولة قراءة ملف المعلمين
        const response = await fetch('/Data/teachers.xlsx');
        if (!response.ok) {
            throw new Error('فشل في تحميل بيانات المعلمين');
        }

        const teachers = await response.json();
        
        // التحقق من وجود بيانات المعلمين
        if (!teachers || !teachers.length) {
            throw new Error('لا توجد بيانات للمعلمين');
        }

        // التحقق من بيانات تسجيل الدخول
        const teacher = teachers.find(t => 
            t.username.toLowerCase() === username.toLowerCase() && 
            t.password === password
        );
        
        if (teacher) {
            // حفظ بيانات المعلم في الكوكيز
            Cookies.set('username', username, { expires: 7 });
            Cookies.set('password', password, { expires: 7 });
            Cookies.set('teacherName', teacher.name, { expires: 7 });
            Cookies.set('teacherPhone', teacher.phone, { expires: 7 });
            Cookies.set('teacherPosition', teacher.job, { expires: 7 });
            Cookies.set('teacherSpecialization', teacher.major, { expires: 7 });
            
            window.location.href = 'dashboard.html';
        } else {
            errorMessage.innerHTML = '<i class="fas fa-exclamation-circle ml-2"></i>بيانات تسجيل الدخول غير صحيحة';
            errorMessage.classList.remove('hidden');
            
            // حذف الكوكيز في حالة فشل تسجيل الدخول
            Cookies.remove('username');
            Cookies.remove('password');
            Cookies.remove('teacherName');
            Cookies.remove('teacherPhone');
            Cookies.remove('teacherPosition');
            Cookies.remove('teacherSpecialization');
        }
    } catch (error) {
        console.error('Error during login:', error);
        errorMessage.innerHTML = `<i class="fas fa-exclamation-circle ml-2"></i>${error.message || 'حدث خطأ أثناء تسجيل الدخول. الرجاء المحاولة مرة أخرى.'}`;
        errorMessage.classList.remove('hidden');
    }
}